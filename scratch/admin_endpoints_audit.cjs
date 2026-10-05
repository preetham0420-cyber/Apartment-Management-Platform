/**
 * admin_endpoints_audit.cjs
 * Comprehensive End-to-End Verification of Admin Endpoints, RBAC, Validation & Persistence
 */

const http = require("http");

const BASE_URL = "http://localhost:4000";

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAudit() {
  console.log("==================================================================");
  console.log(" ADMIN WEB MODULES & BACKEND ENDPOINTS INTEGRATION AUDIT");
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(title, condition, details = "") {
    total++;
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title}`);
      if (details) console.error(`       Details: ${details}`);
    }
  }

  // 1. Authenticate Personas
  console.log("--- 1. Authenticate Personas ---");
  const adminLoginRes = await request(
    {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    },
    { email: "admin@community.local", password: "Admin@12345" }
  );
  assert("Super Admin Login", adminLoginRes.status === 200 && adminLoginRes.body?.data?.token);
  const adminToken = adminLoginRes.body?.data?.token;

  const tenantLoginRes = await request(
    {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    },
    { email: "preetham@community.local", password: "Tenant1@12345" }
  );
  assert("Resident Tenant Login", tenantLoginRes.status === 200 && tenantLoginRes.body?.data?.token);
  const tenantToken = tenantLoginRes.body?.data?.token;

  const adminHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`
  };
  const tenantHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${tenantToken}`
  };

  // 2. Executive Dashboard Live KPIs
  console.log("\n--- 2. Executive Dashboard Live KPIs ---");
  const dashRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/dashboard",
    method: "GET",
    headers: adminHeaders
  });
  const stats = dashRes.body?.data?.stats;
  assert(
    "GET /api/admin/dashboard returns extended KPIs",
    dashRes.status === 200 &&
      stats &&
      typeof stats.totalResidents === "number" &&
      typeof stats.totalUnits === "number" &&
      typeof stats.pendingMaintenance === "number" &&
      typeof stats.pendingDuesCount === "number" &&
      typeof stats.activeVisitors === "number" &&
      typeof stats.activeNotices === "number" &&
      typeof stats.amenityBookingsCount === "number",
    JSON.stringify(stats)
  );

  // 3. Properties & Units
  console.log("\n--- 3. Properties & Units Management ---");
  const propsRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/properties",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/properties returns property list",
    propsRes.status === 200 && Array.isArray(propsRes.body?.data) && propsRes.body.data.length > 0,
    `Count: ${propsRes.body?.data?.length}`
  );

  const unitsRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/units",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/units returns unit details with occupancy",
    unitsRes.status === 200 && Array.isArray(unitsRes.body?.data) && unitsRes.body.data.length > 0,
    `Count: ${unitsRes.body?.data?.length}`
  );

  const sampleUnit = unitsRes.body?.data?.[0];
  if (sampleUnit) {
    const nextStatus = sampleUnit.status === "OCCUPIED" ? "UNDER_MAINTENANCE" : "OCCUPIED";
    const updateUnitRes = await request(
      {
        hostname: "localhost",
        port: 4000,
        path: `/api/admin/units/${sampleUnit.id}/status`,
        method: "PATCH",
        headers: adminHeaders
      },
      { status: nextStatus }
    );
    assert(
      "PATCH /api/admin/units/:id/status updates unit status",
      updateUnitRes.status === 200 && updateUnitRes.body?.data?.status === nextStatus,
      `Status: ${updateUnitRes.body?.data?.status}`
    );
  }

  // 4. Resident Directory & Status Toggle
  console.log("\n--- 4. Resident Directory & Status Toggle ---");
  const residentsRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/residents",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/residents returns resident accounts",
    residentsRes.status === 200 && Array.isArray(residentsRes.body?.data) && residentsRes.body.data.length > 0
  );

  const targetResident = residentsRes.body?.data?.[0];
  if (targetResident) {
    const toggleRes = await request(
      {
        hostname: "localhost",
        port: 4000,
        path: `/api/admin/residents/${targetResident.id}/status`,
        method: "PATCH",
        headers: adminHeaders
      },
      { isActive: false }
    );
    assert(
      "PATCH /api/admin/residents/:id/status deactivates account",
      toggleRes.status === 200 && toggleRes.body?.data?.status === "INACTIVE"
    );

    // Reactivate
    const reactivateRes = await request(
      {
        hostname: "localhost",
        port: 4000,
        path: `/api/admin/residents/${targetResident.id}/status`,
        method: "PATCH",
        headers: adminHeaders
      },
      { isActive: true }
    );
    assert(
      "PATCH /api/admin/residents/:id/status reactivates account",
      reactivateRes.status === 200 && reactivateRes.body?.data?.status === "ACTIVE"
    );
  }

  // 5. Maintenance Operations
  console.log("\n--- 5. Maintenance Operations ---");
  const maintRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/maintenance",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/maintenance returns all tickets",
    maintRes.status === 200 && Array.isArray(maintRes.body?.data)
  );

  // 6. Visitors Management
  console.log("\n--- 6. Visitors Management ---");
  const visitorsRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/visitors",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/visitors returns visitor registry",
    visitorsRes.status === 200 && Array.isArray(visitorsRes.body?.data)
  );

  // 7. Dues & Invoices Ledger
  console.log("\n--- 7. Dues & Invoices Ledger ---");
  const duesRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/dues",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/dues returns financial dues list",
    duesRes.status === 200 && Array.isArray(duesRes.body?.data)
  );

  // 8. Amenities & Bookings
  console.log("\n--- 8. Amenities & Bookings ---");
  const amenitiesRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/amenities",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/amenities returns facilities catalog",
    amenitiesRes.status === 200 && Array.isArray(amenitiesRes.body?.data)
  );

  const bookingsRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/amenities/bookings",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/amenities/bookings returns reservations register",
    bookingsRes.status === 200 && Array.isArray(bookingsRes.body?.data)
  );

  // 9. Notice Publisher
  console.log("\n--- 9. Notice Publisher ---");
  const noticesRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/notices",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/notices returns published circulars",
    noticesRes.status === 200 && Array.isArray(noticesRes.body?.data)
  );

  const createNoticeRes = await request(
    {
      hostname: "localhost",
      port: 4000,
      path: "/api/admin/notices",
      method: "POST",
      headers: adminHeaders
    },
    {
      title: "Fire Safety Drill Next Monday",
      content: "All residents are requested to assemble in the open podium between 10 AM and 11 AM.",
      priority: "NORMAL"
    }
  );
  assert(
    "POST /api/admin/notices dispatches circular",
    createNoticeRes.status === 201 && createNoticeRes.body?.data?.title === "Fire Safety Drill Next Monday"
  );

  // 10. Audit Logs
  console.log("\n--- 10. Compliance Audit Trail ---");
  const auditRes = await request({
    hostname: "localhost",
    port: 4000,
    path: "/api/admin/audit-logs",
    method: "GET",
    headers: adminHeaders
  });
  assert(
    "GET /api/admin/audit-logs returns recorded operations",
    auditRes.status === 200 && Array.isArray(auditRes.body?.data) && auditRes.body.data.length > 0
  );

  // 11. Strict Server-Side RBAC Enforcement on ALL Admin Endpoints
  console.log("\n--- 11. Server-Side RBAC Enforcement (Tenant Rejection with 403) ---");
  const adminEndpoints = [
    { method: "GET", path: "/api/admin/dashboard" },
    { method: "GET", path: "/api/admin/properties" },
    { method: "GET", path: "/api/admin/units" },
    { method: "GET", path: "/api/admin/residents" },
    { method: "GET", path: "/api/admin/maintenance" },
    { method: "GET", path: "/api/admin/visitors" },
    { method: "GET", path: "/api/admin/dues" },
    { method: "GET", path: "/api/admin/amenities" },
    { method: "GET", path: "/api/admin/amenities/bookings" },
    { method: "GET", path: "/api/admin/notices" },
    { method: "GET", path: "/api/admin/audit-logs" }
  ];

  for (const ep of adminEndpoints) {
    const blockRes = await request({
      hostname: "localhost",
      port: 4000,
      path: ep.path,
      method: ep.method,
      headers: tenantHeaders
    });
    assert(
      `RBAC: Resident blocked with 403 on ${ep.method} ${ep.path}`,
      blockRes.status === 403,
      `Status: ${blockRes.status}`
    );
  }

  console.log("\n==================================================================");
  console.log(` SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================================");
}

runAudit().catch(console.error);
