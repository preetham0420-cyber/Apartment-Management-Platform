const http = require("http");

const BASE_URL = "http://localhost:4000/api";

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const postData = body ? JSON.stringify(body) : null;
    if (postData) {
      headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: headers
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json
          });
        });
      }
    );

    req.on("error", (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runCoreFeaturesAudit() {
  console.log("==================================================================");
  console.log(" CORE FUNCTIONAL VERTICALS INTEGRATION & RBAC AUDIT SUITE");
  console.log("==================================================================\n");

  const results = [];
  let tenantToken = null;
  let adminToken = null;

  function record(name, category, passed, expected, actual, details = "") {
    results.push({ name, category, passed, expected, actual, details });
    const tag = passed ? "[PASS]" : "[FAIL]";
    console.log(`${tag} ${name}`);
    if (!passed || details) {
      console.log(`       Expected: ${expected}`);
      console.log(`       Actual:   ${actual}`);
      if (details) console.log(`       Details:  ${details}`);
    }
  }

  // --- 1. Authenticate Personas ---
  console.log("--- 1. Authenticate Test Personas ---");
  try {
    const resTenant = await makeRequest("POST", "/auth/login", {
      email: "preetham@community.local",
      password: "Tenant1@12345"
    });
    tenantToken = resTenant.body.data?.token;
    record("Authenticate Resident Tenant", "Auth", resTenant.status === 200 && Boolean(tenantToken), "200 OK", `HTTP ${resTenant.status}`);

    const resAdmin = await makeRequest("POST", "/auth/login", {
      email: "admin@community.local",
      password: "Admin@12345"
    });
    adminToken = resAdmin.body.data?.token;
    record("Authenticate Super Admin", "Auth", resAdmin.status === 200 && Boolean(adminToken), "200 OK", `HTTP ${resAdmin.status}`);
  } catch (err) {
    record("Authentication Failure", "Auth", false, "200 OK", err.message);
  }

  // --- 2. Auth Refresh ---
  console.log("\n--- 2. Auth Refresh Contract ---");
  try {
    const res = await makeRequest("POST", "/auth/refresh", null, tenantToken);
    const passed = res.status === 200 && Boolean(res.body.data?.token);
    record("POST /api/auth/refresh issues fresh token", "Auth", passed, "200 OK with token", `HTTP ${res.status}`);
  } catch (err) {
    record("POST /api/auth/refresh", "Auth", false, "200 OK", err.message);
  }

  // --- 3. Resident Home & Profile ---
  console.log("\n--- 3. Resident Vertical (Home & Profile) ---");
  try {
    const resHome = await makeRequest("GET", "/resident/home", null, tenantToken);
    const passedHome = resHome.status === 200 && Boolean(resHome.body.data?.resident) && Boolean(resHome.body.data?.unit);
    record("GET /api/resident/home aggregates resident dashboard", "Resident", passedHome, "200 OK with resident & unit data", `HTTP ${resHome.status} Unit: ${resHome.body.data?.unit?.unitNumber}`);

    const resProf = await makeRequest("GET", "/resident/profile", null, tenantToken);
    const passedProf = resProf.status === 200 && Boolean(resProf.body.data?.email);
    record("GET /api/resident/profile returns profile", "Resident", passedProf, "200 OK", `HTTP ${resProf.status}`);

    const newPhone = "+91 91234 99999";
    const resPatch = await makeRequest("PATCH", "/resident/profile", { phoneNumber: newPhone }, tenantToken);
    const passedPatch = resPatch.status === 200 && resPatch.body.data?.phoneNumber === newPhone;
    record("PATCH /api/resident/profile updates allowed fields", "Resident", passedPatch, "200 OK with updated phone", `HTTP ${resPatch.status} Phone: ${resPatch.body.data?.phoneNumber}`);
  } catch (err) {
    record("Resident Home/Profile", "Resident", false, "200 OK", err.message);
  }

  // --- 4. Visitors Vertical ---
  console.log("\n--- 4. Visitors Vertical ---");
  let createdVisitorId = null;
  try {
    const resList = await makeRequest("GET", "/visitors", null, tenantToken);
    const passedList = resList.status === 200 && Array.isArray(resList.body.data);
    record("GET /api/visitors returns visitor list", "Visitors", passedList, "200 OK array", `HTTP ${resList.status} count: ${resList.body.data?.length}`);

    const arrival = new Date(Date.now() + 3 * 3600 * 1000).toISOString();
    const resCreate = await makeRequest("POST", "/visitors", {
      visitorName: "Sunil Kumar (Guest)",
      visitorPhone: "+91 98765 11223",
      purpose: "GUEST",
      expectedArrival: arrival
    }, tenantToken);
    const passedCreate = resCreate.status === 201 && Boolean(resCreate.body.data?.accessCode);
    if (passedCreate) createdVisitorId = resCreate.body.data.id;
    record("POST /api/visitors creates pre-approved pass", "Visitors", passedCreate, "201 Created with accessCode", `HTTP ${resCreate.status} Code: ${resCreate.body.data?.accessCode}`);

    if (createdVisitorId) {
      const resStatus = await makeRequest("PATCH", `/visitors/${createdVisitorId}/status`, { status: "CHECKED_IN" }, tenantToken);
      const passedStatus = resStatus.status === 200 && resStatus.body.data?.status === "CHECKED_IN";
      record("PATCH /api/visitors/:id/status updates visitor status", "Visitors", passedStatus, "200 OK with status CHECKED_IN", `HTTP ${resStatus.status} Status: ${resStatus.body.data?.status}`);
    }
  } catch (err) {
    record("Visitors Vertical", "Visitors", false, "200 OK", err.message);
  }

  // --- 5. Maintenance Vertical ---
  console.log("\n--- 5. Maintenance Vertical ---");
  let createdRequestId = null;
  try {
    const resList = await makeRequest("GET", "/maintenance", null, tenantToken);
    const passedList = resList.status === 200 && Array.isArray(resList.body.data);
    record("GET /api/maintenance returns ticket list", "Maintenance", passedList, "200 OK array", `HTTP ${resList.status} count: ${resList.body.data?.length}`);

    const resCreate = await makeRequest("POST", "/maintenance", {
      category: "ELECTRICAL",
      title: "Living Room Light Flickering",
      description: "Main ceiling tube light blinks continuously when switched on.",
      priority: "MEDIUM"
    }, tenantToken);
    const passedCreate = resCreate.status === 201 && Boolean(resCreate.body.data?.id);
    if (passedCreate) createdRequestId = resCreate.body.data.id;
    record("POST /api/maintenance creates service ticket", "Maintenance", passedCreate, "201 Created", `HTTP ${resCreate.status} ID: ${createdRequestId}`);

    if (createdRequestId) {
      const resComment = await makeRequest("POST", `/maintenance/${createdRequestId}/comments`, {
        comment: "Please inspect in the evening after 6 PM if possible."
      }, tenantToken);
      const passedComment = resComment.status === 201 && Boolean(resComment.body.data?.id);
      record("POST /api/maintenance/:id/comments adds ticket comment", "Maintenance", passedComment, "201 Created", `HTTP ${resComment.status}`);

      const resCancel = await makeRequest("PATCH", `/maintenance/${createdRequestId}`, { status: "CANCELLED" }, tenantToken);
      const passedCancel = resCancel.status === 200 && resCancel.body.data?.status === "CANCELLED";
      record("PATCH /api/maintenance/:id allows resident to cancel ticket", "Maintenance", passedCancel, "200 OK with status CANCELLED", `HTTP ${resCancel.status}`);
    }
  } catch (err) {
    record("Maintenance Vertical", "Maintenance", false, "200 OK", err.message);
  }

  // --- 6. Dues Vertical ---
  console.log("\n--- 6. Dues Vertical ---");
  try {
    const resList = await makeRequest("GET", "/dues", null, tenantToken);
    const passedList = resList.status === 200 && Array.isArray(resList.body.data);
    record("GET /api/dues returns invoice dues", "Dues", passedList, "200 OK array", `HTTP ${resList.status} count: ${resList.body.data?.length}`);

    if (passedList && resList.body.data.length > 0) {
      const firstDue = resList.body.data[0];
      const resPay = await makeRequest("POST", `/dues/${firstDue.id}/record-payment`, {
        paymentReference: "UPI-TEST-REC-001"
      }, tenantToken);
      const passedPay = resPay.status === 200 && resPay.body.data?.status === "PAID";
      record("POST /api/dues/:id/record-payment records payment", "Dues", passedPay, "200 OK with status PAID", `HTTP ${resPay.status} Status: ${resPay.body.data?.status}`);
    }
  } catch (err) {
    record("Dues Vertical", "Dues", false, "200 OK", err.message);
  }

  // --- 7. Amenities Vertical ---
  console.log("\n--- 7. Amenities Vertical ---");
  let createdBookingId = null;
  try {
    const resAmen = await makeRequest("GET", "/amenities", null, tenantToken);
    const passedAmen = resAmen.status === 200 && Array.isArray(resAmen.body.data);
    record("GET /api/amenities returns catalog", "Amenities", passedAmen, "200 OK array", `HTTP ${resAmen.status} facilities: ${resAmen.body.data?.length}`);

    if (passedAmen && resAmen.body.data.length > 0) {
      const amenity = resAmen.body.data[0];
      const startTime = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const endTime = new Date(Date.now() + 26 * 3600 * 1000).toISOString();
      const resBook = await makeRequest("POST", `/amenities/${amenity.id}/bookings`, {
        startTime,
        endTime
      }, tenantToken);
      const passedBook = resBook.status === 201 && Boolean(resBook.body.data?.id);
      if (passedBook) createdBookingId = resBook.body.data.id;
      record("POST /api/amenities/:id/bookings reserves slot", "Amenities", passedBook, "201 Created", `HTTP ${resBook.status} Booking ID: ${createdBookingId}`);

      if (createdBookingId) {
        const resCancel = await makeRequest("DELETE", `/bookings/${createdBookingId}`, null, tenantToken);
        const passedCancel = resCancel.status === 200 && resCancel.body.data?.status === "CANCELLED";
        record("DELETE /api/bookings/:id cancels reservation", "Amenities", passedCancel, "200 OK with status CANCELLED", `HTTP ${resCancel.status}`);
      }
    }
  } catch (err) {
    record("Amenities Vertical", "Amenities", false, "200 OK", err.message);
  }

  // --- 8. Admin Verticals & RBAC ---
  console.log("\n--- 8. Admin Verticals & Role Isolation ---");
  try {
    const resDash = await makeRequest("GET", "/admin/dashboard", null, adminToken);
    const passedDash = resDash.status === 200 && Boolean(resDash.body.data?.systemMetrics);
    record("GET /api/admin/dashboard returns executive metrics", "Admin", passedDash, "200 OK with systemMetrics", `HTTP ${resDash.status}`);

    const resResidents = await makeRequest("GET", "/admin/residents", null, adminToken);
    const passedResidents = resResidents.status === 200 && Array.isArray(resResidents.body.data);
    record("GET /api/admin/residents returns directory", "Admin", passedResidents, "200 OK array", `HTTP ${resResidents.status} count: ${resResidents.body.data?.length}`);

    if (passedResidents && resResidents.body.data.length > 0) {
      const targetUser = resResidents.body.data[0];
      const resStatus = await makeRequest("PATCH", `/admin/residents/${targetUser.id}/status`, { isActive: true }, adminToken);
      record("PATCH /api/admin/residents/:id/status toggles account", "Admin", resStatus.status === 200, "200 OK", `HTTP ${resStatus.status}`);
    }

    const resMaint = await makeRequest("GET", "/admin/maintenance", null, adminToken);
    record("GET /api/admin/maintenance returns all community tickets", "Admin", resMaint.status === 200, "200 OK", `HTTP ${resMaint.status} count: ${resMaint.body.data?.length}`);

    const resNotice = await makeRequest("POST", "/admin/notices", {
      title: "Annual Water Tank Cleaning",
      content: "All overhead tanks will be cleaned on Sunday between 8 AM - 2 PM.",
      priority: "NORMAL",
      category: "MAINTENANCE"
    }, adminToken);
    record("POST /api/admin/notices broadcasts community notice", "Admin", resNotice.status === 201, "201 Created", `HTTP ${resNotice.status}`);

    const resAudit = await makeRequest("GET", "/admin/audit-logs", null, adminToken);
    record("GET /api/admin/audit-logs retrieves security audit trail", "Admin", resAudit.status === 200 && Array.isArray(resAudit.body.data), "200 OK", `HTTP ${resAudit.status} log count: ${resAudit.body.data?.length}`);

    // RBAC: Resident denied access to admin endpoints
    const resRbac1 = await makeRequest("GET", "/admin/dashboard", null, tenantToken);
    record("RBAC Isolation: Resident blocked from /api/admin/dashboard", "RBAC", resRbac1.status === 403, "HTTP 403 FORBIDDEN", `HTTP ${resRbac1.status} ${resRbac1.body.error?.code}`);

    const resRbac2 = await makeRequest("POST", "/admin/notices", { title: "Illegal notice", content: "Should fail" }, tenantToken);
    record("RBAC Isolation: Resident blocked from /api/admin/notices", "RBAC", resRbac2.status === 403, "HTTP 403 FORBIDDEN", `HTTP ${resRbac2.status} ${resRbac2.body.error?.code}`);
  } catch (err) {
    record("Admin Verticals", "Admin", false, "200 OK", err.message);
  }

  console.log("\n==================================================================");
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  console.log(` SUMMARY: ${passedCount}/${total} VERIFICATION CHECKS PASSED (${Math.round((passedCount / total) * 100)}%)`);
  console.log("==================================================================");
}

runCoreFeaturesAudit().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
