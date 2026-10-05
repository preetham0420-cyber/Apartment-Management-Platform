const http = require('http');

const API_BASE = 'http://localhost:4000/api';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request(`${API_BASE}/auth/login`, { method: 'POST' }, { email, password });
  return res;
}

async function runTests() {
  console.log('================================================================');
  console.log(' TENANT 2 & TENANT 3 ACCOUNTS, RBAC & ISOLATION VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message} ${details ? '--> ' + details : ''}`);
      failed++;
    }
  }

  try {
    // --- 1. Login Verification for Ananya Sharma (Tenant 2) ---
    console.log('--- 1. Login Verification: Ananya Sharma ---');
    const t2Res = await login('ananya.sharma@community.local', 'Tenant2@12345');
    assert(t2Res.status === 200, 'ananya.sharma@community.local authenticates successfully (HTTP 200)');
    const t2Token = t2Res.data.data?.token;
    const t2User = t2Res.data.data?.user;
    const t2Unit = t2Res.data.data?.unit;
    assert(!!t2Token, 'Tenant 2 receives signed JWT token');
    assert(t2User?.role === 'RESIDENT_TENANT', `Tenant 2 role is RESIDENT_TENANT (actual: ${t2User?.role})`);
    assert(t2User?.isActive === true, 'Tenant 2 account status is ACTIVE / APPROVED');
    assert(t2Unit?.unitNumber === '101' && t2Unit?.block === 'Tower A', `Tenant 2 unit assigned to 101 Tower A (actual: ${t2Unit?.unitNumber} ${t2Unit?.block})`);
    assert(t2Unit?.assignmentType === 'TENANT', 'Tenant 2 assignmentType is TENANT');

    // --- 2. Login Verification for Rahul Verma (Tenant 3) ---
    console.log('\n--- 2. Login Verification: Rahul Verma ---');
    const t3Res = await login('rahul.verma@community.local', 'Tenant3@12345');
    assert(t3Res.status === 200, 'rahul.verma@community.local authenticates successfully (HTTP 200)');
    const t3Token = t3Res.data.data?.token;
    const t3User = t3Res.data.data?.user;
    const t3Unit = t3Res.data.data?.unit;
    assert(!!t3Token, 'Tenant 3 receives signed JWT token');
    assert(t3User?.role === 'RESIDENT_TENANT', `Tenant 3 role is RESIDENT_TENANT (actual: ${t3User?.role})`);
    assert(t3User?.isActive === true, 'Tenant 3 account status is ACTIVE / APPROVED');
    assert(t3Unit?.unitNumber === '304' && t3Unit?.block === 'Tower B', `Tenant 3 unit assigned to 304 Tower B (actual: ${t3Unit?.unitNumber} ${t3Unit?.block})`);
    assert(t3Unit?.assignmentType === 'TENANT', 'Tenant 3 assignmentType is TENANT');

    // --- 3. Login Verification for Existing Accounts (Preservation Check) ---
    console.log('\n--- 3. Preservation Check: Existing Accounts ---');
    const adminRes = await login('admin@community.local', 'Admin@12345');
    assert(adminRes.status === 200, 'admin@community.local login preserved');
    const adminToken = adminRes.data.data?.token;

    const t1Res = await login('preetham@community.local', 'Tenant1@12345');
    assert(t1Res.status === 200, 'preetham@community.local login preserved');
    const t1Token = t1Res.data.data?.token;

    const ownerRes = await login('vikramaditya@community.local', 'Owner@12345');
    assert(ownerRes.status === 200, 'vikramaditya@community.local login preserved');

    // --- 4. Profile & /api/tenant/me Verification ---
    console.log('\n--- 4. Profile & Unit Self-Inspection (/api/tenant/me) ---');
    const t2Me = await request(`${API_BASE}/tenant/me`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2Me.status === 200, 'Tenant 2 can fetch own unit via /api/tenant/me');
    assert(t2Me.data.data?.unit?.unitNumber === '101', `Tenant 2 /me returns unit 101 (actual: ${t2Me.data.data?.unit?.unitNumber})`);

    const t3Me = await request(`${API_BASE}/tenant/me`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3Me.status === 200, 'Tenant 3 can fetch own unit via /api/tenant/me');
    assert(t3Me.data.data?.unit?.unitNumber === '304', `Tenant 3 /me returns unit 304 (actual: ${t3Me.data.data?.unit?.unitNumber})`);

    // --- 5. Resident Dashboard (/api/resident/home) ---
    console.log('\n--- 5. Resident Dashboard (/api/resident/home) ---');
    const t2Home = await request(`${API_BASE}/resident/home`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2Home.status === 200, 'Tenant 2 receives resident home dashboard (200 OK)');
    assert(t2Home.data.data?.resident?.email === 'ananya.sharma@community.local', `Tenant 2 dashboard resident email matches (actual: ${t2Home.data.data?.resident?.email})`);

    const t3Home = await request(`${API_BASE}/resident/home`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3Home.status === 200, 'Tenant 3 receives resident home dashboard (200 OK)');
    assert(t3Home.data.data?.resident?.email === 'rahul.verma@community.local', `Tenant 3 dashboard resident email matches (actual: ${t3Home.data.data?.resident?.email})`);

    // --- 6. Tenant Community Services Endpoints ---
    console.log('\n--- 6. Tenant Community Services Access ---');
    // Directory
    const t2Dir = await request(`${API_BASE}/resident/directory`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2Dir.status === 200, 'Tenant 2 can access Residents Directory');
    const selfEntryT2 = t2Dir.data.data?.find(u => u.isSelf);
    assert(selfEntryT2?.unitNumber === '101', `Tenant 2 identified correctly as isSelf in unit 101`);

    const t3Dir = await request(`${API_BASE}/resident/directory`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3Dir.status === 200, 'Tenant 3 can access Residents Directory');
    const selfEntryT3 = t3Dir.data.data?.find(u => u.isSelf);
    assert(selfEntryT3?.unitNumber === '304', `Tenant 3 identified correctly as isSelf in unit 304`);

    // Lease & Tenancy
    const t2Lease = await request(`${API_BASE}/resident/lease`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2Lease.status === 200, 'Tenant 2 can access Lease Agreement');
    assert(t2Lease.data.data?.unitNumber === '101', `Tenant 2 lease agreement corresponds to unit 101`);

    const t3Lease = await request(`${API_BASE}/resident/lease`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3Lease.status === 200, 'Tenant 3 can access Lease Agreement');
    assert(t3Lease.data.data?.unitNumber === '304', `Tenant 3 lease agreement corresponds to unit 304`);

    // Dues & Ledger
    const t2Dues = await request(`${API_BASE}/dues`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2Dues.status === 200 && Array.isArray(t2Dues.data.data), 'Tenant 2 can retrieve personal dues ledger');
    assert(t2Dues.data.data?.some(d => d.unitNumber === '101'), 'Tenant 2 dues reflect unit 101');

    const t3Dues = await request(`${API_BASE}/dues`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3Dues.status === 200 && Array.isArray(t3Dues.data.data), 'Tenant 3 can retrieve personal dues ledger');
    assert(t3Dues.data.data?.some(d => d.unitNumber === '304'), 'Tenant 3 dues reflect unit 304');

    // Amenities
    const t2Amen = await request(`${API_BASE}/amenities`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2Amen.status === 200 && t2Amen.data.data?.length > 0, 'Tenant 2 can view shared amenities catalog');

    // Security & Notices
    const t2Sec = await request(`${API_BASE}/resident/security`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2Sec.status === 200 && t2Sec.data.data?.gateStatus === 'OPERATIONAL', 'Tenant 2 can view CCTV & Security Desk status');

    const t2Notices = await request(`${API_BASE}/resident/notices`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2Notices.status === 200 && Array.isArray(t2Notices.data.data), 'Tenant 2 can view community circulars');

    // --- 7. Server-Side RBAC Enforcement: Rejection of Admin Access ---
    console.log('\n--- 7. Server-Side RBAC: Block Tenant from Admin APIs ---');
    const t2AdminDash = await request(`${API_BASE}/admin/dashboard`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2AdminDash.status === 403, `Tenant 2 blocked with 403 on /api/admin/dashboard (actual: ${t2AdminDash.status})`);

    const t2AdminResidents = await request(`${API_BASE}/admin/residents`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2AdminResidents.status === 403, `Tenant 2 blocked with 403 on /api/admin/residents (actual: ${t2AdminResidents.status})`);

    const t2AdminAudit = await request(`${API_BASE}/admin/audit-logs`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2AdminAudit.status === 403, `Tenant 2 blocked with 403 on /api/admin/audit-logs (actual: ${t2AdminAudit.status})`);

    const t3AdminDash = await request(`${API_BASE}/admin/dashboard`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3AdminDash.status === 403, `Tenant 3 blocked with 403 on /api/admin/dashboard (actual: ${t3AdminDash.status})`);

    const t3AdminResidents = await request(`${API_BASE}/admin/residents`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3AdminResidents.status === 403, `Tenant 3 blocked with 403 on /api/admin/residents (actual: ${t3AdminResidents.status})`);

    const t3AdminAudit = await request(`${API_BASE}/admin/audit-logs`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3AdminAudit.status === 403, `Tenant 3 blocked with 403 on /api/admin/audit-logs (actual: ${t3AdminAudit.status})`);

    // --- 8. Server-Side Ownership Check & IDOR Prevention ---
    console.log('\n--- 8. Resource Ownership & IDOR Protection ---');
    // Tenant 2 assigned to unit u1111111-2222-3333-4444-555555555552 (101)
    // Tenant 1 unit: u1111111-2222-3333-4444-555555555551 (402)
    // Tenant 3 unit: u1111111-2222-3333-4444-555555555554 (304)

    const t2ProbeT1 = await request(`${API_BASE}/tenant/unit/u1111111-2222-3333-4444-555555555551`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2ProbeT1.status === 403, `IDOR Guard: Tenant 2 probing Tenant 1 unit rejected with 403 FORBIDDEN (actual: ${t2ProbeT1.status})`);

    const t2ProbeT3 = await request(`${API_BASE}/tenant/unit/u1111111-2222-3333-4444-555555555554`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2ProbeT3.status === 403, `IDOR Guard: Tenant 2 probing Tenant 3 unit rejected with 403 FORBIDDEN (actual: ${t2ProbeT3.status})`);

    const t3ProbeT1 = await request(`${API_BASE}/tenant/unit/u1111111-2222-3333-4444-555555555551`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3ProbeT1.status === 403, `IDOR Guard: Tenant 3 probing Tenant 1 unit rejected with 403 FORBIDDEN (actual: ${t3ProbeT1.status})`);

    const t3ProbeT2 = await request(`${API_BASE}/tenant/unit/u1111111-2222-3333-4444-555555555552`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3ProbeT2.status === 403, `IDOR Guard: Tenant 3 probing Tenant 2 unit rejected with 403 FORBIDDEN (actual: ${t3ProbeT2.status})`);

    // Legitimate owner/tenant access to their own assigned unit
    const t2AccessOwn = await request(`${API_BASE}/tenant/unit/u1111111-2222-3333-4444-555555555552`, { headers: { Authorization: `Bearer ${t2Token}` } });
    assert(t2AccessOwn.status === 200, 'Tenant 2 accessing own unit 101 allowed with 200 OK');

    const t3AccessOwn = await request(`${API_BASE}/tenant/unit/u1111111-2222-3333-4444-555555555554`, { headers: { Authorization: `Bearer ${t3Token}` } });
    assert(t3AccessOwn.status === 200, 'Tenant 3 accessing own unit 304 allowed with 200 OK');

  } catch (err) {
    console.error('UNEXPECTED EXCEPTION:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
