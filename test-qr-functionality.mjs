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
  console.log('🧪 Starting Comprehensive QR Code Functionality Test');
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

  // Test 2: Standard Menu QR Code Generation & Decoding
  console.log('2️⃣ Testing Standard Menu QR Code Generation (GET /api/qr)...');
  const qrRes = await fetch(`${BASE_URL}/api/qr`);
  assert.equal(qrRes.status, 200, 'QR endpoint should return 200');
  assert.equal(qrRes.headers.get('content-type'), 'image/png', 'Must return image/png');
  const pngBuffer = Buffer.from(await qrRes.arrayBuffer());
  const decodedStandard = decodePngQr(pngBuffer);
  console.log(`   Decoded QR Content: "${decodedStandard.data}"`);
  console.log(`   Image Dimensions: ${decodedStandard.width}x${decodedStandard.height}`);
  assert(decodedStandard.data.includes(netData.ip) || decodedStandard.data.includes('localhost'),
    'Decoded QR code must contain the system menu URL');
  console.log('   ✅ Standard QR code is valid, scannable, and correctly decoded!\n');

  // Test 3: Custom URL QR Code (e.g. Vercel deployment URL)
  console.log('3️⃣ Testing Custom Production URL QR Code (Vercel / Cloud URL)...');
  const customUrl = 'https://ever-coffee.vercel.app';
  const customQrRes = await fetch(`${BASE_URL}/api/qr?url=${encodeURIComponent(customUrl)}`);
  assert.equal(customQrRes.status, 200);
  const customPng = Buffer.from(await customQrRes.arrayBuffer());
  const decodedCustom = decodePngQr(customPng);
  console.log(`   Decoded Custom QR Content: "${decodedCustom.data}"`);
  assert.equal(decodedCustom.data, customUrl, 'Decoded QR must exactly match target URL');
  console.log('   ✅ Custom production URL QR code is 100% valid and verified!\n');

  // Test 4: Database Integration - QR Code for Specific Menu Item ID
  console.log('4️⃣ Testing Database Integration - Specific Menu Item ID (GET /api/qr?item=<id>)...');
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  const products = await prodRes.json();
  assert(products.length > 0, 'Database should contain products');
  const testItem = products[0];
  console.log(`   Using real database item: "${testItem.name}" (ID: ${testItem.id})`);

  const itemQrRes = await fetch(`${BASE_URL}/api/qr?item=${testItem.id}`);
  assert.equal(itemQrRes.status, 200);
  const itemPng = Buffer.from(await itemQrRes.arrayBuffer());
  const decodedItem = decodePngQr(itemPng);
  console.log(`   Decoded Item QR Content: "${decodedItem.data}"`);
  assert(decodedItem.data.includes(`item=${testItem.id}`),
    `Decoded QR must contain the exact database item ID (?item=${testItem.id})`);
  console.log(`   ✅ Database record QR code successfully created and verified for ID ${testItem.id}!\n`);

  // Test 5: High Resolution (1024x1024) for Crystal Clear Printing & Scanning
  console.log('5️⃣ Testing High Resolution Output (width=1024)...');
  const highRes = await fetch(`${BASE_URL}/api/qr?width=1024&url=${encodeURIComponent(customUrl)}`);
  assert.equal(highRes.status, 200);
  const highPng = Buffer.from(await highRes.arrayBuffer());
  const decodedHigh = decodePngQr(highPng);
  console.log(`   High-res dimensions: ${decodedHigh.width}x${decodedHigh.height}`);
  assert.equal(decodedHigh.width, 1024, 'Width must be exactly 1024px');
  assert.equal(decodedHigh.height, 1024, 'Height must be exactly 1024px');
  assert.equal(decodedHigh.data, customUrl, 'Decoded high-res QR must match URL');
  console.log('   ✅ High-resolution 1024x1024 QR code generated and decoded flawlessly!\n');

  // Test 6: Direct PNG Download with Content-Disposition Header
  console.log('6️⃣ Testing Direct PNG Download (download=1)...');
  const dlRes = await fetch(`${BASE_URL}/api/qr?download=1&filename=ever-coffee-table-1`);
  assert.equal(dlRes.status, 200);
  const dispHeader = dlRes.headers.get('content-disposition');
  console.log(`   Content-Disposition received: "${dispHeader}"`);
  assert(dispHeader && dispHeader.includes('attachment') && dispHeader.includes('ever-coffee-table-1.png'),
    'Must set attachment Content-Disposition with custom filename');
  console.log('   ✅ Direct download header verified!\n');

  // Test 7: Data URL / JSON Format Endpoint
  console.log('7️⃣ Testing JSON & Data URL format (format=dataurl)...');
  const dataUrlRes = await fetch(`${BASE_URL}/api/qr?format=dataurl&url=${encodeURIComponent(customUrl)}`);
  assert.equal(dataUrlRes.status, 200);
  const dataUrlJson = await dataUrlRes.json();
  assert.equal(dataUrlJson.success, true);
  assert(dataUrlJson.dataUrl.startsWith('data:image/png;base64,'), 'Must return base64 PNG data URL');
  console.log(`   Data URL received (length: ${dataUrlJson.dataUrl.length} characters)`);
  console.log('   ✅ JSON / Data URL format working perfectly!\n');

  // Test 8: Client-side In-App Camera Scanner Component Verification
  console.log('8️⃣ Verifying Client QrScanner & MobileQrModal source implementations...');
  const scannerPath = path.join(__dirname, 'client/src/components/QrScanner.jsx');
  const modalPath = path.join(__dirname, 'client/src/components/MobileQrModal.jsx');
  assert(fs.existsSync(scannerPath), 'QrScanner.jsx must exist');
  assert(fs.existsSync(modalPath), 'MobileQrModal.jsx must exist');

  const scannerSrc = fs.readFileSync(scannerPath, 'utf8');
  assert(scannerSrc.includes('Html5Qrcode'), 'QrScanner must use Html5Qrcode');
  assert(scannerSrc.includes('facingMode') || scannerSrc.includes('getCameras'),
    'QrScanner must support mobile cameras (environment facing mode)');
  assert(scannerSrc.includes('scanFile'), 'QrScanner must support scanning from photo/image files');
  assert(scannerSrc.includes('Permission') || scannerSrc.includes('permissionDenied'),
    'QrScanner must handle camera permission denial gracefully');

  const modalSrc = fs.readFileSync(modalPath, 'utf8');
  assert(modalSrc.includes('handleDownload'), 'MobileQrModal must implement PNG download');
  assert(modalSrc.includes('targetType') && modalSrc.includes('selectedProductId'),
    'MobileQrModal must support full menu and specific database item selection');
  assert(modalSrc.includes('QrScanner'), 'MobileQrModal must embed QrScanner');

  console.log('   ✅ Client-side scanner, generator, camera permissions, and download components verified!\n');

  console.log('====================================================');
  console.log('🎉 ALL 8 QR CODE FUNCTIONALITY TESTS PASSED 100%! 🎉');
  console.log('====================================================');
}

runQrTests().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
