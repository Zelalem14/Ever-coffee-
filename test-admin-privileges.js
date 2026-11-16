import { strict as assert } from 'node:assert';

const base = 'http://localhost:5050';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE ADMIN PRIVILEGES & FIX SUITE');
  console.log('====================================================');

  // 1. Health & Headers
  const healthRes = await fetch(`${base}/api/health`);
  assert.equal(healthRes.status, 200, 'Health check should return 200');
  const healthData = await healthRes.json();
  assert.equal(healthData.status, 'ok', 'Status should be ok');
  console.log('✓ [1/10] Server Health & API Status: PASSED');

  // 2. Unhandled /api Route ALWAYS Returns Valid JSON
  const invalidRes = await fetch(`${base}/api/does-not-exist`);
  assert.equal(invalidRes.status, 404, 'Invalid route returns 404');
  const invalidType = invalidRes.headers.get('content-type') || '';
  assert(invalidType.includes('application/json'), 'API 404 MUST return application/json');
  const invalidJson = await invalidRes.json();
  assert(invalidJson.error, 'Invalid endpoint JSON has error field');
  console.log('✓ [2/10] JSON Safety for Unhandled API Routes: PASSED ->', invalidJson.error);

  // 3. Admin Login with Standard Credentials
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  assert.equal(loginRes.status, 200, 'Admin login should succeed');
  const loginData = await loginRes.json();
  assert(loginData.token, 'Must return JWT token');
  assert.equal(loginData.user.username, 'admin');
  console.log('✓ [3/10] Initial Admin Login (admin / admin123): PASSED');

  let adminToken = loginData.token;
  let authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  // 4. Change Credentials - Guardrail Validation Checks
  // 4a. Missing current password
  const noCurrRes = await fetch(`${base}/api/auth/change-credentials`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ newUsername: 'superadmin' })
  });
  assert.equal(noCurrRes.status, 400, 'Must require current password');
  console.log('✓ [4a/10] Rejects credential change without current password: PASSED');

  // 4b. Wrong current password
  const wrongCurrRes = await fetch(`${base}/api/auth/change-credentials`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      currentPassword: 'wrongpassword!',
      newPassword: 'ValidNewPass123',
      confirmPassword: 'ValidNewPass123'
    })
  });
  assert.equal(wrongCurrRes.status, 401, 'Must reject incorrect current password with 401');
  console.log('✓ [4b/10] Rejects incorrect current password: PASSED');

  // 4c. Mismatched confirmation password
  const mismatchRes = await fetch(`${base}/api/auth/change-credentials`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      currentPassword: 'admin123',
      newPassword: 'ValidNewPass123',
      confirmPassword: 'DifferentPassword123'
    })
  });
  assert.equal(mismatchRes.status, 400, 'Must reject mismatched passwords');
  console.log('✓ [4c/10] Rejects mismatched confirmation password: PASSED');

  // 4d. Password too short (< 6 chars)
  const shortPwRes = await fetch(`${base}/api/auth/change-credentials`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      currentPassword: 'admin123',
      newPassword: '123',
      confirmPassword: '123'
    })
  });
  assert.equal(shortPwRes.status, 400, 'Must reject short password');
  console.log('✓ [4d/10] Rejects passwords under 6 characters: PASSED');

  // 5. Successfully Change Admin Username AND Password
  const changeRes = await fetch(`${base}/api/auth/change-credentials`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      currentPassword: 'admin123',
      newUsername: 'zelalem_admin',
      newPassword: 'SecurePassword@2026',
      confirmPassword: 'SecurePassword@2026'
    })
  });
  assert.equal(changeRes.status, 200, 'Change credentials should succeed');
  const changeData = await changeRes.json();
  assert.equal(changeData.user.username, 'zelalem_admin');
  assert(changeData.token, 'Must return new refreshed JWT token');
  console.log('✓ [5/10] Successfully Changed Admin Credentials to zelalem_admin: PASSED');

  // 6. Verify Old Credentials No Longer Work
  const oldLoginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  assert.equal(oldLoginRes.status, 401, 'Old credentials must be rejected');
  console.log('✓ [6/10] Old Credentials Invalidation Verified (admin / admin123 rejected): PASSED');

  // 7. Verify Login with NEW Credentials
  const newLoginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'zelalem_admin', password: 'SecurePassword@2026' })
  });
  assert.equal(newLoginRes.status, 200, 'New credentials login must succeed');
  const newLoginData = await newLoginRes.json();
  assert.equal(newLoginData.user.username, 'zelalem_admin');
  console.log('✓ [7/10] Login with New Credentials Verified: PASSED');

  // Update token for subsequent operations
  adminToken = newLoginData.token;
  authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  // 8. Restore Credentials back to admin / admin123
  const restoreRes = await fetch(`${base}/api/auth/change-credentials`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      currentPassword: 'SecurePassword@2026',
      newUsername: 'admin',
      newPassword: 'admin123',
      confirmPassword: 'admin123'
    })
  });
  assert.equal(restoreRes.status, 200, 'Restoring original credentials should succeed');
  const restoreData = await restoreRes.json();
  assert.equal(restoreData.user.username, 'admin');
  adminToken = restoreData.token;
  authHeaders['Authorization'] = `Bearer ${adminToken}`;
  console.log('✓ [8/10] Reset Credentials back to standard admin / admin123: PASSED');

  // 9. Full Menu Items CRUD & Image Management
  const catRes = await fetch(`${base}/api/categories`);
  const cats = await catRes.json();

  // Create Product
  const newProdRes = await fetch(`${base}/api/products`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      category_id: cats[0].id,
      name: 'Yirgacheffe Specialty Pour-Over',
      price_etb: 85,
      description: 'Single-origin washed floral coffee with bergamot notes',
      description_am: 'ልዩ የይርጋጨፌ ሻይ ቡና',
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      is_available: 1
    })
  });
  assert.equal(newProdRes.status, 201, 'Create product returns 201');
  const createdProd = await newProdRes.json();
  assert.equal(createdProd.name, 'Yirgacheffe Specialty Pour-Over');

  // Update Product
  const updateProdRes = await fetch(`${base}/api/products/${createdProd.id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Yirgacheffe Specialty Pour-Over V60',
      price_etb: 95
    })
  });
  assert.equal(updateProdRes.status, 200, 'Update product returns 200');

  // Toggle availability
  const toggleRes = await fetch(`${base}/api/products/${createdProd.id}/toggle-availability`, {
    method: 'PATCH',
    headers: authHeaders
  });
  assert.equal(toggleRes.status, 200, 'Toggle product availability returns 200');
  const toggled = await toggleRes.json();
  assert.equal(toggled.is_available, 0);

  // Delete Product
  const delProdRes = await fetch(`${base}/api/products/${createdProd.id}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  assert.equal(delProdRes.status, 200, 'Delete product returns 200');
  console.log('✓ [9/10] Complete Menu CRUD (Create, Update, Toggle Stock, Delete): PASSED');

  // 10. Audit Trail Check
  const auditRes = await fetch(`${base}/api/logs`, { headers: authHeaders });
  assert.equal(auditRes.status, 200, 'Fetch audit logs returns 200');
  const auditData = await auditRes.json();
  const actions = auditData.logs.map(l => l.action);
  assert(actions.includes('CREDENTIALS_UPDATED'), 'Audit logs must record CREDENTIALS_UPDATED');
  console.log(`✓ [10/10] Audit Logging Verified (${auditData.pagination.total} events recorded): PASSED`);

  console.log('\n====================================================');
  console.log('🎉 ALL 10 TESTS PASSED! FULL ADMIN PRIVILEGES VERIFIED 🎉');
  console.log('====================================================\n');
}

runTestSuite().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
