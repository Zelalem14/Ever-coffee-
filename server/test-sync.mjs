import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'http://localhost:5050';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting End-to-End Admin & Customer Sync Test');
  console.log('====================================================\n');

  // 1. Admin Authentication
  console.log('1️⃣ Authenticating as admin...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }

  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('   ✅ Admin successfully logged in! Token acquired.\n');

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Cache-Control Header Check
  console.log('2️⃣ Verifying API Cache-Control Headers for instant synchronization...');
  const initialGet = await fetch(`${BASE_URL}/api/products?_t=${Date.now()}`);
  const cacheHeader = initialGet.headers.get('cache-control');
  console.log(`   Cache-Control received: "${cacheHeader}"`);
  if (!cacheHeader || !cacheHeader.includes('no-store')) {
    throw new Error(`Expected Cache-Control: no-store header, received: ${cacheHeader}`);
  }
  const initialProducts = await initialGet.json();
  console.log(`   ✅ Cache-Control confirmed! Initial database product count: ${initialProducts.length}\n`);

  // Fetch real categories
  const catRes = await fetch(`${BASE_URL}/api/categories?_t=${Date.now()}`);
  const categories = await catRes.json();
  if (!categories || categories.length === 0) {
    throw new Error('No categories found in database');
  }
  const targetCategory = categories[0];
  console.log(`   Using category: "${targetCategory.name}" (ID: ${targetCategory.id})\n`);

  // 3. Admin Adds a New Menu Item
  console.log('3️⃣ [CREATE] Admin creates new menu item "Sync Test Special Roastery"...');
  const createPayload = {
    name: 'Sync Test Special Roastery',
    category_id: targetCategory.id,
    price_etb: 55,
    description: 'Freshly roasted single origin coffee for synchronization testing.',
    description_am: 'የማመሳከሪያ ሙከራ ልዩ ቡና',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    is_available: 1
  };

  const createRes = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(createPayload)
  });

  if (!createRes.ok) {
    throw new Error(`Create product failed: ${createRes.status} ${await createRes.text()}`);
  }

  const createdItem = await createRes.json();
  const testId = createdItem.id;
  console.log(`   ✅ Created successfully with ID: ${testId}, Name: "${createdItem.name}", Price: ${createdItem.price_etb} ETB\n`);

  // Verify Customer View immediately reflects creation
  console.log('   🔎 Verifying Customer Page GET /api/products contains new item...');
  const customerViewAfterCreate = await (await fetch(`${BASE_URL}/api/products?_t=${Date.now()}`)).json();
  const foundInCustomer1 = customerViewAfterCreate.find(p => p.id === testId);
  if (!foundInCustomer1) {
    throw new Error('❌ Customer menu failed to display new item immediately!');
  }
  console.log(`   ✅ Customer page immediately shows: "${foundInCustomer1.name}" (${foundInCustomer1.price_etb} ETB)\n`);

  // 4. Admin Edits Product Name and Price
  console.log('4️⃣ [UPDATE] Admin updates name to "Sync Test Premium Reserve" and price to 75 ETB...');
  const updateRes = await fetch(`${BASE_URL}/api/products/${testId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Sync Test Premium Reserve',
      price_etb: 75,
      category_id: targetCategory.id,
      description: 'Updated description for live customer synchronization test.',
      is_available: 1
    })
  });

  if (!updateRes.ok) {
    throw new Error(`Update product failed: ${updateRes.status} ${await updateRes.text()}`);
  }

  const updatedItem = await updateRes.json();
  console.log(`   ✅ Update confirmed by backend: "${updatedItem.name}" at ${updatedItem.price_etb} ETB\n`);

  // Verify Customer View reflects update immediately
  console.log('   🔎 Verifying Customer Page GET /api/products shows updated name & price...');
  const customerViewAfterUpdate = await (await fetch(`${BASE_URL}/api/products?_t=${Date.now()}`)).json();
  const foundInCustomer2 = customerViewAfterUpdate.find(p => p.id === testId);
  if (!foundInCustomer2 || foundInCustomer2.name !== 'Sync Test Premium Reserve' || foundInCustomer2.price_etb !== 75) {
    throw new Error(`❌ Customer menu did not reflect update: ${JSON.stringify(foundInCustomer2)}`);
  }
  console.log(`   ✅ Customer page immediately reflects updated item: "${foundInCustomer2.name}" (${foundInCustomer2.price_etb} ETB)\n`);

  // 5. Admin Uploads New Image and Replaces Photo
  console.log('5️⃣ [IMAGE UPLOAD & REPLACE] Admin uploads replacement photo...');
  // Create a minimal 1x1 PNG buffer with valid magic bytes
  const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  
  const boundary = '----WebKitFormBoundarySyncTest' + Date.now();
  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="image"; filename="synctest.png"\r\n`,
    `Content-Type: image/png\r\n\r\n`,
    tinyPng,
    `\r\n--${boundary}--\r\n`
  ];
  const multipartBody = Buffer.concat(bodyParts.map(p => typeof p === 'string' ? Buffer.from(p) : p));

  const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!uploadRes.ok) {
    throw new Error(`Image upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  }

  const uploadData = await uploadRes.json();
  const newUploadedUrl = uploadData.url;
  console.log(`   ✅ New photo uploaded to: ${newUploadedUrl}`);

  // Now update the product with this new image URL
  console.log('   Updating product image_url to the new photo...');
  const imgUpdateRes = await fetch(`${BASE_URL}/api/products/${testId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      image_url: newUploadedUrl
    })
  });

  if (!imgUpdateRes.ok) {
    throw new Error(`Updating product image failed: ${imgUpdateRes.status}`);
  }

  const imgUpdatedProduct = await imgUpdateRes.json();
  console.log(`   ✅ Product image URL successfully updated to: ${imgUpdatedProduct.image_url}`);

  // Verify Customer View reflects new image URL
  console.log('   🔎 Verifying Customer Page GET /api/products returns updated photo URL...');
  const customerViewAfterImg = await (await fetch(`${BASE_URL}/api/products?_t=${Date.now()}`)).json();
  const foundInCustomer3 = customerViewAfterImg.find(p => p.id === testId);
  if (!foundInCustomer3 || foundInCustomer3.image_url !== newUploadedUrl) {
    throw new Error(`❌ Customer menu did not reflect image update! Found: ${foundInCustomer3?.image_url}`);
  }
  console.log(`   ✅ Customer page immediately shows new image: ${foundInCustomer3.image_url}\n`);

  // Verify static serving of newly uploaded image
  console.log('   🔎 Verifying static file serving of the uploaded image...');
  const fileCheckRes = await fetch(`${BASE_URL}${newUploadedUrl}`);
  if (!fileCheckRes.ok) {
    throw new Error(`Failed to load uploaded image: ${fileCheckRes.status}`);
  }
  console.log(`   ✅ Uploaded image serves with HTTP ${fileCheckRes.status} (${fileCheckRes.headers.get('content-type')})\n`);

  // 6. Admin Deletes Menu Item
  console.log('6️⃣ [DELETE] Admin deletes menu item...');
  const deleteRes = await fetch(`${BASE_URL}/api/products/${testId}`, {
    method: 'DELETE',
    headers: authHeaders
  });

  if (!deleteRes.ok) {
    throw new Error(`Delete failed: ${deleteRes.status} ${await deleteRes.text()}`);
  }

  const deleteData = await deleteRes.json();
  console.log(`   ✅ Backend confirmed deletion: ${JSON.stringify(deleteData)}\n`);

  // 7. Verify Customer Page Immediately Disappears
  console.log('7️⃣ 🔎 Verifying item immediately disappeared from Customer Page GET /api/products...');
  const customerViewAfterDelete = await (await fetch(`${BASE_URL}/api/products?_t=${Date.now()}`)).json();
  const foundInCustomer4 = customerViewAfterDelete.find(p => p.id === testId);
  if (foundInCustomer4) {
    throw new Error(`❌ Deleted item still appears on customer page! ${JSON.stringify(foundInCustomer4)}`);
  }
  console.log(`   ✅ Item "${createdItem.name}" is completely gone from customer menu!\n`);

  // 8. Re-query / Refresh Persistence Verification
  console.log('8️⃣ 🔎 Verifying persistence across repeated queries and simulated page reloads...');
  for (let i = 1; i <= 3; i++) {
    const reloadCheck = await (await fetch(`${BASE_URL}/api/products?_t=${Date.now() + i}`)).json();
    if (reloadCheck.some(p => p.id === testId)) {
      throw new Error(`❌ Deleted item resurrected on simulated reload #${i}!`);
    }
  }
  console.log('   ✅ Item remains permanently deleted after multiple refreshes!\n');

  console.log('====================================================');
  console.log('🎉 ALL SYNCHRONIZATION TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
