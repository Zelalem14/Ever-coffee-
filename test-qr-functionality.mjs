import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { strict as assert } from 'node:assert';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5050';

function decodePngQr(pngBuffer) {
  const png = PNG.sync.read(pngBuffer);
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  if (!code) {
    throw new Error('Failed to decode QR code from PNG buffer (unreadable or damaged)');
  }
  return {
    data: code.data,
    width: png.width,
    height: png.height
  };
}

async function runQrTests() {
  console.log('====================================================');
  console.log('🧪 Starting Clean Menu QR Code Functionality Test');
  console.log('====================================================\n');

  // Test 1: Network Info Endpoint
  console.log('1️⃣ Testing GET /api/network-info...');
  const netRes = await fetch(`${BASE_URL}/api/network-info`);
  assert.equal(netRes.status, 200, 'Network info should return 200');
  const netData = await netRes.json();
  assert(netData.ip, 'Network info must provide IP address');
  assert(netData.wifi_url, 'Network info must provide wifi_url');
  assert(netData.public_url, 'Network info must provide public_url');
  console.log(`   ✅ Network info confirmed: IP=${netData.ip}, Wi-Fi=${netData.wifi_url}\n`);

  // Test 2: Digital Menu QR Code Generation & Decoding
  console.log('2️⃣ Testing Digital Menu QR Code Generation (GET /api/qr)...');
  const qrRes = await fetch(`${BASE_URL}/api/qr`);
  assert.equal(qrRes.status, 200, 'QR endpoint should return 200');
  assert.equal(qrRes.headers.get('content-type'), 'image/png', 'Must return image/png');
  const pngBuffer = Buffer.from(await qrRes.arrayBuffer());
  const decodedMenu = decodePngQr(pngBuffer);
  console.log(`   Decoded Menu QR Content: "${decodedMenu.data}"`);
  console.log(`   Image Dimensions: ${decodedMenu.width}x${decodedMenu.height}`);
  assert(decodedMenu.data.includes(netData.ip) || decodedMenu.data.includes('localhost'),
    'Decoded QR code must contain the digital menu URL');
  console.log('   ✅ Menu QR code is valid, scannable, and correctly decoded!\n');

  // Test 3: Custom Production URL QR Code (e.g. Vercel deployment URL)
  console.log('3️⃣ Testing Custom Production URL QR Code (Vercel / Cloud URL)...');
  const customUrl = 'https://ever-coffee.vercel.app';
  const customQrRes = await fetch(`${BASE_URL}/api/qr?url=${encodeURIComponent(customUrl)}`);
  assert.equal(customQrRes.status, 200);
  const customPng = Buffer.from(await customQrRes.arrayBuffer());
  const decodedCustom = decodePngQr(customPng);
  console.log(`   Decoded Custom QR Content: "${decodedCustom.data}"`);
  assert.equal(decodedCustom.data, customUrl, 'Decoded QR must exactly match target URL');
  console.log('   ✅ Custom production URL QR code is 100% valid and verified!\n');

  // Test 4: High Resolution (1024x1024) for Crystal Clear Printing & Scanning
  console.log('4️⃣ Testing High Resolution Output (width=1024)...');
  const highRes = await fetch(`${BASE_URL}/api/qr?width=1024&url=${encodeURIComponent(customUrl)}`);
  assert.equal(highRes.status, 200);
  const highPng = Buffer.from(await highRes.arrayBuffer());
  const decodedHigh = decodePngQr(highPng);
  console.log(`   High-res dimensions: ${decodedHigh.width}x${decodedHigh.height}`);
  assert.equal(decodedHigh.width, 1024, 'Width must be exactly 1024px');
  assert.equal(decodedHigh.height, 1024, 'Height must be exactly 1024px');
  assert.equal(decodedHigh.data, customUrl, 'Decoded high-res QR must match URL');
  console.log('   ✅ High-resolution 1024x1024 QR code generated and decoded flawlessly!\n');

  // Test 5: Direct PNG Download with Content-Disposition Header
  console.log('5️⃣ Testing Direct PNG Download (download=1)...');
  const dlRes = await fetch(`${BASE_URL}/api/qr?download=1&filename=ever-coffee-house-menu-qr`);
  assert.equal(dlRes.status, 200);
  const dispHeader = dlRes.headers.get('content-disposition');
  console.log(`   Content-Disposition received: "${dispHeader}"`);
  assert(dispHeader && dispHeader.includes('attachment') && dispHeader.includes('ever-coffee-house-menu-qr.png'),
    'Must set attachment Content-Disposition with menu filename');
  console.log('   ✅ Direct download header verified!\n');

  // Test 6: Data URL / JSON Format Endpoint
  console.log('6️⃣ Testing JSON & Data URL format (format=dataurl)...');
  const dataUrlRes = await fetch(`${BASE_URL}/api/qr?format=dataurl&url=${encodeURIComponent(customUrl)}`);
  assert.equal(dataUrlRes.status, 200);
  const dataUrlJson = await dataUrlRes.json();
  assert.equal(dataUrlJson.success, true);
  assert(dataUrlJson.dataUrl.startsWith('data:image/png;base64,'), 'Must return base64 PNG data URL');
  console.log(`   Data URL received (length: ${dataUrlJson.dataUrl.length} characters)`);
  console.log('   ✅ JSON / Data URL format working perfectly!\n');

  // Test 7: Verify Item QR Code is Completely Removed
  console.log('7️⃣ Verifying Item QR Code is completely removed from all components...');
  const modalPath = path.join(__dirname, 'client/src/components/MobileQrModal.jsx');
  const productDetailPath = path.join(__dirname, 'client/src/components/ProductDetailModal.jsx');
  const adminTablePath = path.join(__dirname, 'client/src/components/admin/AdminProductsTable.jsx');
  const menuContextPath = path.join(__dirname, 'client/src/context/MenuContext.jsx');

  const modalSrc = fs.readFileSync(modalPath, 'utf8');
  const detailSrc = fs.readFileSync(productDetailPath, 'utf8');
  const adminSrc = fs.readFileSync(adminTablePath, 'utf8');
  const contextSrc = fs.readFileSync(menuContextPath, 'utf8');

  assert(!modalSrc.includes('targetType'), 'MobileQrModal must NOT have targetType switcher');
  assert(!modalSrc.includes('selectedProductId'), 'MobileQrModal must NOT have selectedProductId');
  assert(!modalSrc.includes('Specific Item'), 'MobileQrModal must NOT have "Specific Item" text');
  assert(!detailSrc.includes('Item QR Code'), 'ProductDetailModal must NOT have "Item QR Code" button');
  assert(!adminSrc.includes('qrTargetProductId'), 'AdminProductsTable must NOT have qrTargetProductId');
  assert(!adminSrc.includes('Item QR Code'), 'AdminProductsTable must NOT reference Item QR Code');
  assert(!contextSrc.includes('qrTargetProductId'), 'MenuContext must NOT have qrTargetProductId');

  console.log('   ✅ Zero references to Item QR Code found! Feature successfully removed.\n');

  // Test 8: Client-side In-App Camera Scanner Component Verification
  console.log('8️⃣ Verifying Client QrScanner implementation...');
  const scannerPath = path.join(__dirname, 'client/src/components/QrScanner.jsx');
  assert(fs.existsSync(scannerPath), 'QrScanner.jsx must exist');
  const scannerSrc = fs.readFileSync(scannerPath, 'utf8');
  assert(scannerSrc.includes('Html5Qrcode'), 'QrScanner must use Html5Qrcode');
  assert(scannerSrc.includes('facingMode') || scannerSrc.includes('getCameras'),
    'QrScanner must support mobile cameras');
  assert(scannerSrc.includes('scanFile'), 'QrScanner must support scanning from photo/image files');
  assert(scannerSrc.includes('Permission') || scannerSrc.includes('permissionDenied'),
    'QrScanner must handle camera permission denial gracefully');

  console.log('   ✅ Camera scanner and mobile permission handling verified!\n');

  console.log('====================================================');
  console.log('🎉 ALL 8 TESTS PASSED! CLEAN QR SYSTEM VERIFIED! 🎉');
  console.log('====================================================');
}

runQrTests().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
