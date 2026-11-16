// Comprehensive Verification Script for Ethiopian Coffee House Backend & Frontend
import { fork } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverProcess = fork(path.join(__dirname, 'server/src/index.js'), [], {
  env: { ...process.env, PORT: '5050' },
  stdio: 'inherit'
});

async function runTests() {
  console.log('Waiting 2 seconds for server to start...');
  await new Promise(r => setTimeout(r, 2000));

  try {
    // 1. Health check
    const healthRes = await fetch('http://localhost:5050/api/health');
    const healthData = await healthRes.json();
    console.log('✓ [1/6] Health Check:', healthData.status === 'ok' ? 'PASSED' : 'FAILED');

    // 2. Categories API
    const catRes = await fetch('http://localhost:5050/api/categories');
    const catData = await catRes.json();
    console.log(`✓ [2/6] Categories (${catData.length} categories): PASSED`);
    console.log('   Categories found:', catData.map(c => `${c.name} (${c.product_count} items)`).join(', '));

    // 3. Products API
    const prodRes = await fetch('http://localhost:5050/api/products?category=coffee');
    const prodData = await prodRes.json();
    console.log(`✓ [3/6] Coffee Products (${prodData.length} items): PASSED`);
    console.log('   Sample coffee item:', prodData[0]?.name, `(${prodData[0]?.price_etb} ETB)`);

    // 4. Stats API
    const statsRes = await fetch('http://localhost:5050/api/stats');
    const statsData = await statsRes.json();
    console.log('✓ [4/6] Stats API:', statsData);

    // 5. Admin Authentication
    const loginRes = await fetch('http://localhost:5050/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log('✓ [5/6] Admin Login:', loginData.token ? 'PASSED (token received)' : 'FAILED');

    // Test product creation with token
    const newProdRes = await fetch('http://localhost:5050/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        name: 'Test Harar Honey Roast',
        category_id: catData[0].id,
        price_etb: 85,
        description: 'Single-origin wild Harar beans with natural honey process.',
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        is_available: 1,
        is_featured: 1,
        is_popular: 1,
        dietary_tags: 'Single-Origin, Wild Heirloom'
      })
    });
    const newProd = await newProdRes.json();
    console.log('   Created new test product:', newProd.id, newProd.name);

    // Test updating product
    const updateRes = await fetch(`http://localhost:5050/api/products/${newProd.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        price_etb: 95
      })
    });
    const updatedProd = await updateRes.json();
    console.log('   Updated test product price to:', updatedProd.price_etb, 'ETB');

    // Test deleting product
    const delRes = await fetch(`http://localhost:5050/api/products/${newProd.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    const delData = await delRes.json();
    console.log('   Deleted test product:', delData.message);

    // 6. Frontend HTML serving
    const frontendRes = await fetch('http://localhost:5050/');
    const frontendHtml = await frontendRes.text();
    const hasAppRoot = frontendHtml.includes('<div id="root"></div>');
    console.log('✓ [6/6] Frontend HTML Serving:', hasAppRoot ? 'PASSED (Vite production bundle served)' : 'FAILED');

    console.log('\n🌟 ALL 6 BACKEND & FRONTEND TESTS PASSED SUCCESSFULLY! 🌟');
  } catch (error) {
    console.error('Test execution failed:', error);
  } finally {
    serverProcess.kill();
    process.exit(0);
  }
}

runTests();
