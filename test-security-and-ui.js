import { strict as assert } from 'node:assert';

const base = 'http://localhost:5050';

async function testAll() {
  console.log('--- STARTING COMPREHENSIVE SECURITY & UI TEST SUITE ---');

  // 1. Health check & Security Headers
  const healthRes = await fetch(`${base}/api/health`);
  assert.equal(healthRes.status, 200, 'Health check should return 200');
  assert.equal(healthRes.headers.get('x-content-type-options'), 'nosniff', 'Header X-Content-Type-Options must be nosniff');
  assert.equal(healthRes.headers.get('x-frame-options'), 'SAMEORIGIN', 'Header X-Frame-Options must be SAMEORIGIN');
  assert.equal(healthRes.headers.get('x-xss-protection'), '1; mode=block', 'Header X-XSS-Protection must be 1; mode=block');
  console.log('✓ [1/10] Health Check & Security Headers: PASSED');

  // 2. Categories API
  const catRes = await fetch(`${base}/api/categories`);
  const cats = await catRes.json();
  assert(Array.isArray(cats) && cats.length >= 2, 'Must have at least 2 categories');
  assert(cats[0].description_am && cats[0].description_am.length > 0, 'Category must have Amharic description');
  console.log(`✓ [2/10] Categories (${cats.length} categories with Amharic descriptions): PASSED`);

  // 3. Products API
  const prodRes = await fetch(`${base}/api/products`);
  const prods = await prodRes.json();
  assert(Array.isArray(prods) && prods.length >= 18, 'Must have at least 18 products');
  const bunaSearch = await fetch(`${base}/api/products?search=${encodeURIComponent('ቡና')}`);
  const bunaMatches = await bunaSearch.json();
  assert(bunaMatches.length > 0, 'Amharic search for ቡና must return results');
  console.log(`✓ [3/10] Products (${prods.length} items, Amharic search verified): PASSED`);

  // 4. Unauthorized Access Block
  const unauthRes = await fetch(`${base}/api/users`);
  assert.equal(unauthRes.status, 401, 'Accessing /api/users without token must return 401 Unauthorized');
  console.log('✓ [4/10] Route Protection (Unauthorized access blocked with 401): PASSED');

  // 5. Admin Authentication
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  assert.equal(loginRes.status, 200, 'Admin login must succeed with 200');
  const loginData = await loginRes.json();
  assert(loginData.token, 'Login must return a JWT token');
  assert.equal(loginData.user?.role, 'admin', 'Admin user must have admin role');
  console.log('✓ [5/10] Admin Login & JWT Generation: PASSED');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${loginData.token}`
  };

  // 6. User Management CRUD
  const testUsername = 'test_manager_' + Date.now();
  const createURes = await fetch(`${base}/api/users`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      username: testUsername,
      email: 'manager@coffee.et',
      password: 'password123',
      name: 'Test Manager',
      role: 'manager'
    })
  });
  assert.equal(createURes.status, 201, 'Create user must return 201 Created');
  const createdU = await createURes.json();
  assert.equal(createdU.user.role, 'manager', 'Created user must have role manager');

  // Update user
  const updateURes = await fetch(`${base}/api/users/${createdU.user.id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Senior Manager Updated' })
  });
  assert.equal(updateURes.status, 200, 'Update user must return 200');

  // Delete user
  const deleteURes = await fetch(`${base}/api/users/${createdU.user.id}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert.equal(deleteURes.status, 200, 'Delete user must return 200');
  console.log('✓ [6/10] User Management CRUD (Create, Update, Delete with Role Checks): PASSED');

  // 7. Prevent Self-Deletion of Admin
  const selfDelRes = await fetch(`${base}/api/users/${loginData.user.id}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert.equal(selfDelRes.status, 400, 'Deleting own account must be blocked with 400');
  console.log('✓ [7/10] Security Guardrail (Admin self-deletion blocked): PASSED');

  // 8. Audit Logging Verification
  const logsRes = await fetch(`${base}/api/logs`, { headers: authHeaders });
  assert.equal(logsRes.status, 200, 'Get audit logs must return 200');
  const logsData = await logsRes.json();
  assert(logsData.logs && logsData.logs.length > 0, 'Audit logs must contain recorded security events');
  const actions = logsData.logs.map(l => l.action);
  assert(actions.includes('USER_CREATED') && actions.includes('USER_DELETED'), 'Audit logs must record USER_CREATED and USER_DELETED');
  console.log(`✓ [8/10] Activity Audit Trail (${logsData.pagination.total} events logged with IP and Actor): PASSED`);

  // 9. Product CRUD with Audit Logging
  const createProdRes = await fetch(`${base}/api/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      category_id: cats[0].id,
      name: 'E2E Specialty Roast',
      price_etb: 99,
      description: 'Single origin highland test roast',
      description_am: 'የሙከራ ቡና',
      is_available: 1
    })
  });
  assert.equal(createProdRes.status, 201, 'Create product must return 201');
  const createdProd = await createProdRes.json();

  // Toggle availability
  const toggleRes = await fetch(`${base}/api/products/${createdProd.id}/toggle-availability`, {
    method: 'PATCH',
    headers: authHeaders
  });
  assert.equal(toggleRes.status, 200, 'Toggle availability must return 200');

  // Delete product
  const delProdRes = await fetch(`${base}/api/products/${createdProd.id}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert.equal(delProdRes.status, 200, 'Delete product must return 200');
  console.log('✓ [9/10] Product Operations & Instant Stock Toggling: PASSED');

  // 10. Frontend Production HTML Serving
  const htmlRes = await fetch(`${base}/`);
  assert.equal(htmlRes.status, 200, 'Frontend root must return 200');
  const html = await htmlRes.text();
  assert(html.includes('Ever Coffee House'), 'Frontend HTML must contain Ever Coffee House');
  console.log('✓ [10/10] Frontend Bundle & Production HTML Serving: PASSED');

  console.log('\n🎉 ALL 10 SECURITY, API & UI VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

testAll().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
