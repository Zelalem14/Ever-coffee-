import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { seedDatabase, getUploadedImage } from './db.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import uploadRoutes from './routes/upload.js';
import statsRoutes from './routes/stats.js';
import settingsRoutes from './routes/settings.js';
import userRoutes from './routes/users.js';
import logRoutes from './routes/logs.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5050;

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Disable caching for all API routes to ensure instant synchronization
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Serve static uploads with automatic SQLite restoration for permanent persistence
const uploadsPath = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.get('/uploads/:filename', (req, res, next) => {
  const filename = path.basename(req.params.filename);
  const diskPath = path.join(uploadsPath, filename);

  // 1. If available on disk, serve directly
  if (fs.existsSync(diskPath)) {
    return res.sendFile(diskPath);
  }

  // 2. If missing from disk (e.g. server restart, container redeploy), restore from SQLite
  try {
    const record = getUploadedImage(filename);
    if (record && record.data_base64) {
      const buffer = Buffer.from(record.data_base64, 'base64');
      try {
        fs.writeFileSync(diskPath, buffer);
      } catch (writeErr) {
        // Safe to ignore in read-only filesystems
      }
      res.setHeader('Content-Type', record.mime_type || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
      return res.send(buffer);
    }
  } catch (err) {
    console.error('Failed to restore image from database:', err.message);
  }

  return res.status(404).json({ error: 'Image not found' });
});

app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ever Coffee House Digital Menu Backend',
    timestamp: new Date().toISOString()
  });
});

// Seed endpoint (re-seed or restore default menu items)
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase(true);
    res.json({ message: 'Database successfully restored and seeded for Ever Coffee House!' });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database: ' + error.message });
  }
});

export function getNetworkIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Network info endpoint for dynamic Wi-Fi IP and QR
app.get('/api/network-info', (req, res) => {
  const ip = getNetworkIp();
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = forwardedHost || req.headers.host;
  
  let publicUrl = '';
  if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    const proto = forwardedProto || (req.secure ? 'https' : 'http');
    publicUrl = `${proto}://${host}`;
  }

  res.json({
    ip,
    port: PORT,
    wifi_url: `http://${ip}:${PORT}`,
    local_url: `http://localhost:${PORT}`,
    public_url: publicUrl || `http://${ip}:${PORT}`
  });
});

// Dynamic QR code generator supporting custom URLs, menu item IDs, high resolution, and PNG downloads
app.get('/api/qr', async (req, res) => {
  try {
    // 1. Determine target URL / content
    let targetUrl = req.query.url || req.query.text || req.query.data;

    if (!targetUrl) {
      // Determine base URL dynamically from request headers or network IP
      const forwardedProto = req.headers['x-forwarded-proto'];
      const forwardedHost = req.headers['x-forwarded-host'];
      const host = forwardedHost || req.headers.host;

      let baseUrl = '';
      if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
        const proto = forwardedProto || (req.secure ? 'https' : 'http');
        baseUrl = `${proto}://${host}`;
      } else {
        const ip = getNetworkIp();
        baseUrl = `http://${ip}:${PORT}`;
      }

      // Check if a specific menu item ID was requested
      if (req.query.item || req.query.productId) {
        const itemId = encodeURIComponent(req.query.item || req.query.productId);
        targetUrl = `${baseUrl}/?item=${itemId}`;
      } else {
        targetUrl = baseUrl;
      }
    }

    // 2. Formatting & Resolution options
    const width = Math.min(Math.max(parseInt(req.query.width, 10) || 512, 128), 2048);
    const margin = parseInt(req.query.margin, 10) >= 0 ? parseInt(req.query.margin, 10) : 2;
    const darkColor = req.query.dark || '#2C1810';
    const lightColor = req.query.light || '#FFFFFF';
    const isDownload = req.query.download === '1' || req.query.download === 'true';
    const isDataUrl = req.query.format === 'dataurl' || req.query.format === 'json';

    const QRCode = (await import('qrcode')).default;

    const qrOptions = {
      width,
      margin,
      errorCorrectionLevel: 'H',
      color: { dark: darkColor, light: lightColor }
    };

    if (isDataUrl) {
      const dataUrl = await QRCode.toDataURL(targetUrl, qrOptions);
      return res.json({
        success: true,
        targetUrl,
        dataUrl,
        width
      });
    }

    if (isDownload) {
      const filename = req.query.filename 
        ? `${req.query.filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`
        : 'ever-coffee-house-qr.png';
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    await QRCode.toFileStream(res, targetUrl, qrOptions);
  } catch (err) {
    console.error('Failed to generate dynamic QR:', err);
    res.status(500).json({ error: 'Failed to generate QR code', message: err.message });
  }
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);

// Catch-all 404 for unhandled /api endpoints - GUARANTEES VALID JSON
app.use('/api', (req, res) => {
  res.status(404).json({
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Serve client dist in production if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler - ALWAYS RETURNS VALID JSON
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;
