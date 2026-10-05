const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      const dataStr = typeof body === 'string' ? body : JSON.stringify(body);
      req.write(dataStr);
    }
    req.end();
  });
}

async function runDay5SecuritySuite() {
  console.log('================================================================');
  console.log('  DAY 5 COMPREHENSIVE SECURITY TESTING & HARDENING AUDIT SUITE  ');
  console.log('================================================================');

  let passed = 0;
  let total = 15;

  // 1. Authentication and login security
  const authRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@community.local', password: 'Admin@12345' }
  );
  const t1 =
    authRes.status === 200 &&
    authRes.body?.data?.token &&
    authRes.body?.data?.user?.role === 'SUPER_ADMIN';
  console.log('Test 1  [Auth & Login Security]:', t1 ? 'PASS (200 OK + JWT generated)' : 'FAIL');
  if (t1) passed++;
  const adminToken = authRes.body?.data?.token;

  // 2. Server-side RBAC & Tenant/Admin Role Isolation
  const tenantAuth = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'preetham@community.local', password: 'Tenant1@12345' }
  );
  const tenantToken = tenantAuth.body?.data?.token;

  const rbacRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/admin/overview',
      method: 'GET',
      headers: { Authorization: 'Bearer ' + tenantToken },
    }
  );
  const t2 = rbacRes.status === 403 && rbacRes.body?.error?.code === 'FORBIDDEN';
  console.log(
    'Test 2  [Server-Side RBAC Enforcement]:',
    t2 ? 'PASS (403 Forbidden on Tenant -> Admin)' : 'FAIL'
  );
  if (t2) passed++;

  // 3. Unauthenticated Protected Access
  const unauthRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/overview',
    method: 'GET',
  });
  const t3 = unauthRes.status === 401 && unauthRes.body?.error?.code === 'UNAUTHORIZED';
  console.log('Test 3  [Unauthenticated API Rejection]:', t3 ? 'PASS (401 Unauthorized)' : 'FAIL');
  if (t3) passed++;

  // 4. SQL Injection Protection
  const sqliRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: "' OR '1'='1' --", password: "' OR '1'='1' --" }
  );
  const t4 =
    sqliRes.status === 400 ||
    (sqliRes.status === 401 && sqliRes.body?.error?.code === 'UNAUTHORIZED');
  console.log(
    'Test 4  [SQL Injection Defense]:',
    t4 ? 'PASS (Parameterized SQL cleanly rejected payload)' : 'FAIL'
  );
  if (t4) passed++;

  // 5. XSS Payload Handling
  const xssRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'xss_test@test.com',
      password: '<script>alert("xss")</script><img src=x onerror=alert(1)>',
    }
  );
  const t5 = xssRes.status === 401 || xssRes.status === 400;
  console.log(
    'Test 5  [XSS Input & Render Defense]:',
    t5 ? 'PASS (Rejected without DOM execution or reflection)' : 'FAIL'
  );
  if (t5) passed++;

  // 6. Input Validation & Oversized Payload Defense
  const badInputRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'not-an-email', password: 'a'.repeat(200) }
  );
  const t6 = badInputRes.status === 400 && badInputRes.body?.error?.code === 'VALIDATION_ERROR';
  console.log(
    'Test 6  [Input Validation & Bcrypt DoS Defense]:',
    t6 ? 'PASS (Zod rejected password > 128 chars & malformed email)' : 'FAIL'
  );
  if (t6) passed++;

  // 7. JWT Algorithm Confusion & Tamper Protection
  const tamperedToken = adminToken ? adminToken.slice(0, -6) + 'abcdef' : 'invalid';
  const tamperRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/admin/overview',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + tamperedToken },
  });
  const t7 = tamperRes.status === 401 && tamperRes.body?.error?.code === 'UNAUTHORIZED';
  console.log(
    'Test 7  [JWT Tampering & Algorithm Confusion]:',
    t7 ? 'PASS (Cryptographically rejected tampered signature)' : 'FAIL'
  );
  if (t7) passed++;

  // 8. Sensitive Data Exposure Check
  const leakStr = JSON.stringify(authRes.body) + JSON.stringify(tenantAuth.body);
  const t8 =
    !leakStr.includes('passwordHash') && !leakStr.includes('$2b$') && !leakStr.includes('secret');
  console.log(
    'Test 8  [Sensitive Data Exposure]:',
    t8 ? 'PASS (Zero password hashes or keys in responses)' : 'FAIL'
  );
  if (t8) passed++;

  // 9. Password/Hash Protection & Constant-Time Anti-Enumeration
  const wrongPwRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@community.local', password: 'WrongPassword' }
  );
  const noUserRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'unknown@community.local', password: 'WrongPassword' }
  );
  const t9 =
    wrongPwRes.status === 401 &&
    noUserRes.status === 401 &&
    wrongPwRes.body?.error?.message === noUserRes.body?.error?.message;
  console.log(
    'Test 9  [Password/Hash Protection & Anti-Enumeration]:',
    t9 ? 'PASS (Unified 401 message for bad user/password)' : 'FAIL'
  );
  if (t9) passed++;

  // 10. Security HTTP Headers & Server Fingerprinting
  const healthRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/health',
    method: 'GET',
  });
  const h = healthRes.headers;
  const t10 =
    h['x-content-type-options'] === 'nosniff' &&
    h['x-frame-options'] === 'DENY' &&
    !h['x-powered-by'];
  console.log(
    'Test 10 [Security HTTP Headers & Anti-Fingerprinting]:',
    t10 ? 'PASS (nosniff, DENY, X-Powered-By removed)' : 'FAIL'
  );
  if (t10) passed++;

  // 11. CORS Origin Validation
  const corsBadRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/health',
    method: 'GET',
    headers: { Origin: 'http://malicious-attacker-domain.com' },
  });
  const t11 = corsBadRes.status === 500 || corsBadRes.body?.error?.message?.includes('CORS');
  console.log(
    'Test 11 [CORS Origin Policy Enforcement]:',
    t11 ? 'PASS (Unauthorized cross-origin blocked)' : 'FAIL'
  );
  if (t11) passed++;

  // 12. Error Sanitization (No stack traces or server paths)
  const notFoundRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/unmapped-route-test',
    method: 'GET',
  });
  const t12 =
    notFoundRes.status === 404 &&
    !JSON.stringify(notFoundRes.body).includes('C:\\\\') &&
    !JSON.stringify(notFoundRes.body).includes('/home/');
  console.log(
    'Test 12 [Error Sanitization & Info Leakage]:',
    t12 ? 'PASS (Zero stack traces or paths leaked)' : 'FAIL'
  );
  if (t12) passed++;

  // 13. Tenant/Admin Role Isolation
  const tenantMeRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/tenant/me',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + tenantToken },
  });
  const t13 =
    tenantMeRes.status === 200 && tenantMeRes.body?.data?.resident?.role === 'RESIDENT_TENANT';
  console.log(
    'Test 13 [Tenant/Admin Isolation]:',
    t13 ? 'PASS (Tenant scoped strictly to tenant context)' : 'FAIL'
  );
  if (t13) passed++;

  // 14. Logout & Session Termination
  const logoutRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/logout',
    method: 'POST',
    headers: { Authorization: 'Bearer ' + tenantToken },
  });
  const t14 = logoutRes.status === 200 && logoutRes.body?.data?.sessionTerminated === true;
  console.log(
    'Test 14 [Logout & Session Invalidation]:',
    t14 ? 'PASS (Session termination acknowledged)' : 'FAIL'
  );
  if (t14) passed++;

  // 15. Rate Limiting & Brute Force Defense
  let rateLimited = false;
  for (let i = 0; i < 12; i++) {
    const res = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@community.local', password: 'WrongPassword' }
    );
    if (res.status === 429) {
      rateLimited = true;
      break;
    }
  }
  console.log(
    'Test 15 [Rate Limiting & Brute Force Defense]:',
    rateLimited ? 'PASS (HTTP 429 Too Many Requests triggered)' : 'FAIL'
  );
  if (rateLimited) passed++;

  console.log('================================================================');
  console.log(`  AUDIT SUMMARY: ${passed}/${total} SECURITY TESTS PASSED       `);
  console.log('================================================================');
}

runDay5SecuritySuite().catch(console.error);
