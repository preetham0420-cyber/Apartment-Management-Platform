const http = require('http');

const API_BASE = 'http://localhost:4000/api';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: raw ? JSON.parse(raw) : null });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function login(email, password) {
  return request(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email, password }
  });
}

async function run() {
  console.log('================================================================');
  console.log(' VERIFYING 4 PERSONAL DEMO ACCOUNTS & UNIT ALLOCATIONS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` [PASS] ${message}`);
      passed++;
    } else {
      console.error(` [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Preetham
  console.log('--- Account 1: Preetham (preetham@community.local) ---');
  const pRes = await login('preetham@community.local', 'Tenant1@12345');
  assert(pRes.status === 200, 'Preetham authenticates with HTTP 200');
  const pToken = pRes.data?.data?.token;
  const pUser = pRes.data?.data?.user;
  const pUnit = pRes.data?.data?.unit;
  assert(pUser?.fullName === 'Preetham (Resident Tenant)', `Name is "${pUser?.fullName}"`);
  assert(pUser?.role === 'RESIDENT_TENANT', `Role is ${pUser?.role}`);
  assert(pUnit?.unitNumber === '402' && pUnit?.block === 'Tower A' && pUnit?.floor === 4, `Unit is Flat ${pUnit?.unitNumber} (${pUnit?.block}, Floor ${pUnit?.floor})`);
  assert(pUnit?.assignmentType === 'TENANT', `Assignment is ${pUnit?.assignmentType}`);

  const pMe = await request(`${API_BASE}/tenant/me`, { headers: { Authorization: `Bearer ${pToken}` } });
  assert(pMe.status === 200 && pMe.data?.data?.unit?.unitNumber === '402', '/tenant/me returns Flat 402');
  const pHome = await request(`${API_BASE}/resident/home`, { headers: { Authorization: `Bearer ${pToken}` } });
  assert(pHome.status === 200 && pHome.data?.data?.resident?.email === 'preetham@community.local', '/resident/home returns resident email preetham@community.local');

  // 2. Ananya Sharma
  console.log('\n--- Account 2: Ananya Sharma (ananya.sharma@community.local) ---');
  const aRes = await login('ananya.sharma@community.local', 'Tenant2@12345');
  assert(aRes.status === 200, 'Ananya Sharma authenticates with HTTP 200');
  const aToken = aRes.data?.data?.token;
  const aUser = aRes.data?.data?.user;
  const aUnit = aRes.data?.data?.unit;
  assert(aUser?.fullName === 'Ananya Sharma (Resident Tenant)', `Name is "${aUser?.fullName}"`);
  assert(aUser?.role === 'RESIDENT_TENANT', `Role is ${aUser?.role}`);
  assert(aUnit?.unitNumber === '101' && aUnit?.block === 'Tower A' && aUnit?.floor === 1, `Unit is Flat ${aUnit?.unitNumber} (${aUnit?.block}, Floor ${aUnit?.floor})`);
  assert(aUnit?.assignmentType === 'TENANT', `Assignment is ${aUnit?.assignmentType}`);

  const aMe = await request(`${API_BASE}/tenant/me`, { headers: { Authorization: `Bearer ${aToken}` } });
  assert(aMe.status === 200 && aMe.data?.data?.unit?.unitNumber === '101', '/tenant/me returns Flat 101');
  const aHome = await request(`${API_BASE}/resident/home`, { headers: { Authorization: `Bearer ${aToken}` } });
  assert(aHome.status === 200 && aHome.data?.data?.resident?.email === 'ananya.sharma@community.local', '/resident/home returns resident email ananya.sharma@community.local');

  // 3. Rahul Verma
  console.log('\n--- Account 3: Rahul Verma (rahul.verma@community.local) ---');
  const rRes = await login('rahul.verma@community.local', 'Tenant3@12345');
  assert(rRes.status === 200, 'Rahul Verma authenticates with HTTP 200');
  const rToken = rRes.data?.data?.token;
  const rUser = rRes.data?.data?.user;
  const rUnit = rRes.data?.data?.unit;
  assert(rUser?.fullName === 'Rahul Verma (Resident Tenant)', `Name is "${rUser?.fullName}"`);
  assert(rUser?.role === 'RESIDENT_TENANT', `Role is ${rUser?.role}`);
  assert(rUnit?.unitNumber === '304' && rUnit?.block === 'Tower B' && rUnit?.floor === 3, `Unit is Flat ${rUnit?.unitNumber} (${rUnit?.block}, Floor ${rUnit?.floor})`);
  assert(rUnit?.assignmentType === 'TENANT', `Assignment is ${rUnit?.assignmentType}`);

  const rMe = await request(`${API_BASE}/tenant/me`, { headers: { Authorization: `Bearer ${rToken}` } });
  assert(rMe.status === 200 && rMe.data?.data?.unit?.unitNumber === '304', '/tenant/me returns Flat 304');
  const rHome = await request(`${API_BASE}/resident/home`, { headers: { Authorization: `Bearer ${rToken}` } });
  assert(rHome.status === 200 && rHome.data?.data?.resident?.email === 'rahul.verma@community.local', '/resident/home returns resident email rahul.verma@community.local');

  // 4. Vikramaditya (Owner)
  console.log('\n--- Account 4: Vikramaditya (vikramaditya@community.local) ---');
  const vRes = await login('vikramaditya@community.local', 'Owner@12345');
  assert(vRes.status === 200, 'Vikramaditya authenticates with HTTP 200');
  const vToken = vRes.data?.data?.token;
  const vUser = vRes.data?.data?.user;
  const vUnit = vRes.data?.data?.unit;
  assert(vUser?.fullName === 'Vikramaditya (Resident Owner)', `Name is "${vUser?.fullName}"`);
  assert(vUser?.role === 'RESIDENT_OWNER', `Role is ${vUser?.role}`);
  assert(vUnit?.unitNumber === '205' && vUnit?.block === 'Tower B' && vUnit?.floor === 2, `Unit is Flat ${vUnit?.unitNumber} (${vUnit?.block}, Floor ${vUnit?.floor})`);
  assert(vUnit?.assignmentType === 'OWNER', `Assignment is ${vUnit?.assignmentType}`);

  const vMe = await request(`${API_BASE}/tenant/me`, { headers: { Authorization: `Bearer ${vToken}` } });
  assert(vMe.status === 200 && vMe.data?.data?.unit?.unitNumber === '205', '/tenant/me returns Flat 205');
  const vHome = await request(`${API_BASE}/resident/home`, { headers: { Authorization: `Bearer ${vToken}` } });
  assert(vHome.status === 200 && vHome.data?.data?.resident?.email === 'vikramaditya@community.local', '/resident/home returns resident email vikramaditya@community.local');

  // Vikramaditya RBAC check: blocked from admin endpoints
  const vAdmin = await request(`${API_BASE}/admin/dashboard`, { headers: { Authorization: `Bearer ${vToken}` } });
  assert(vAdmin.status === 403, `Owner is rejected from admin endpoint with HTTP 403 (actual: ${vAdmin.status})`);

  // 5. Verify Old Emails are REJECTED (Do not leave old emails active)
  console.log('\n--- Rejection Check: Verify Old Generic Emails Fail Authentication ---');
  const oldEmails = [
    { email: 'tenant1@community.local', pass: 'Tenant1@12345' },
    { email: 'tenant2@community.local', pass: 'Tenant2@12345' },
    { email: 'tenant3@community.local', pass: 'Tenant3@12345' },
    { email: 'owner@community.local', pass: 'Owner@12345' },
    { email: 'tenant@community.local', pass: 'Tenant@12345' }
  ];

  for (const old of oldEmails) {
    const res = await login(old.email, old.pass);
    assert(res.status === 401, `Old email "${old.email}" is rejected with HTTP 401 Unauthorized (actual: ${res.status})`);
  }

  console.log('\n================================================================');
  console.log(` FINAL SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
