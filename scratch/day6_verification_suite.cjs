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

async function runDay6TestSuite() {
  console.log("===============================================================");
  console.log(" DAY 6 PERMISSIONS, VALIDATION & INTEGRATION TEST SUITE");
  console.log("===============================================================\n");

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

  // --- REQ 1: Comprehensive Zod Boundary Validation ---
  console.log("--- 1. Comprehensive Zod Boundary Validation ---");

  // Test 1: Empty body on login
  try {
    const res = await makeRequest("POST", "/auth/login", {});
    const passed = res.status === 400 && res.body.error?.code === "VALIDATION_ERROR";
    record(
      "Zod Body Validation: Missing required fields rejected with 400 VALIDATION_ERROR",
      "Validation",
      passed,
      "HTTP 400 VALIDATION_ERROR",
      `HTTP ${res.status} ${res.body.error?.code}`,
      JSON.stringify(res.body.error?.details || [])
    );
  } catch (err) {
    record("Zod Body Validation: Missing required fields", "Validation", false, "HTTP 400", err.message);
  }

  // Test 2: Malformed email format
  try {
    const res = await makeRequest("POST", "/auth/login", {
      email: "not-an-email",
      password: "SomePassword123!"
    });
    const passed = res.status === 400 && res.body.error?.code === "VALIDATION_ERROR";
    record(
      "Zod Body Validation: Malformed email rejected with 400 VALIDATION_ERROR",
      "Validation",
      passed,
      "HTTP 400 VALIDATION_ERROR",
      `HTTP ${res.status} ${res.body.error?.code}`
    );
  } catch (err) {
    record("Zod Body Validation: Malformed email", "Validation", false, "HTTP 400", err.message);
  }

  // Test 3: Unexpected / extraneous fields (.strict() enforcement)
  try {
    const res = await makeRequest("POST", "/auth/login", {
      email: "preetham@community.local",
      password: "Tenant1@12345",
      role: "SUPER_ADMIN",
      isElevated: true,
      privileges: ["ALL"]
    });
    const passed = res.status === 400 && res.body.error?.code === "VALIDATION_ERROR";
    record(
      "Zod Strict Boundary: Extraneous injected fields rejected with 400 VALIDATION_ERROR",
      "Validation",
      passed,
      "HTTP 400 VALIDATION_ERROR",
      `HTTP ${res.status} ${res.body.error?.code}`,
      JSON.stringify(res.body.error?.details || [])
    );
  } catch (err) {
    record("Zod Strict Boundary: Extraneous injected fields", "Validation", false, "HTTP 400", err.message);
  }

  // Test 4: Information leak check on validation error
  try {
    const rawPass = "SecretPasswordDoNotEcho999!";
    const res = await makeRequest("POST", "/auth/login", {
      email: "invalid-format",
      password: rawPass
    });
    const serialized = JSON.stringify(res.body);
    const passed = !serialized.includes(rawPass);
    record(
      "Zod Error Sanitization: Sensitive input/passwords never leaked in validation response",
      "Validation",
      passed,
      "Response does NOT contain raw password",
      passed ? "Password sanitized / omitted" : "LEAKED: Password found in response"
    );
  } catch (err) {
    record("Zod Error Sanitization", "Validation", false, "Sanitized", err.message);
  }

  // --- REQ 3: Authentication & Token Boundaries ---
  console.log("\n--- 3. API Integration & Permission Testing (Auth Boundaries) ---");

  // Test 5: Missing token on protected endpoint -> 401
  try {
    const res = await makeRequest("GET", "/tenant/me");
    const passed = res.status === 401 && res.body.error?.code === "UNAUTHORIZED";
    record(
      "Auth Boundary: Missing Authorization header rejected with 401 UNAUTHORIZED",
      "Authentication",
      passed,
      "HTTP 401 UNAUTHORIZED",
      `HTTP ${res.status} ${res.body.error?.code}`
    );
  } catch (err) {
    record("Auth Boundary: Missing Authorization header", "Authentication", false, "HTTP 401", err.message);
  }

  // Test 6: Tampered JWT signature -> 401
  try {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTAxIiwicm9sZSI6IlNVUEVSX0FETUlOIn0.tamperedSignatureX999";
    const res = await makeRequest("GET", "/tenant/me", null, fakeToken);
    const passed = res.status === 401 && res.body.error?.code === "UNAUTHORIZED";
    record(
      "Auth Boundary: Tampered JWT signature rejected with 401 UNAUTHORIZED",
      "Authentication",
      passed,
      "HTTP 401 UNAUTHORIZED",
      `HTTP ${res.status} ${res.body.error?.code}`
    );
  } catch (err) {
    record("Auth Boundary: Tampered JWT signature", "Authentication", false, "HTTP 401", err.message);
  }

  // Test 7: Malformed token header -> 401
  try {
    const res = await makeRequest("GET", "/tenant/me", null, "not-even-a-jwt");
    const passed = res.status === 401 && res.body.error?.code === "UNAUTHORIZED";
    record(
      "Auth Boundary: Malformed token string rejected with 401 UNAUTHORIZED",
      "Authentication",
      passed,
      "HTTP 401 UNAUTHORIZED",
      `HTTP ${res.status} ${res.body.error?.code}`
    );
  } catch (err) {
    record("Auth Boundary: Malformed token string", "Authentication", false, "HTTP 401", err.message);
  }

  // Test 8: Valid Tenant Login
  try {
    const res = await makeRequest("POST", "/auth/login", {
      email: "preetham@community.local",
      password: "Tenant1@12345"
    });
    const passed = res.status === 200 && res.body.data?.token && res.body.data?.user?.role === "RESIDENT_TENANT";
    if (passed) tenantToken = res.body.data.token;
    record(
      "Tenant Login: Valid resident credentials authenticate successfully",
      "Authentication",
      passed,
      "HTTP 200 with JWT and RESIDENT_TENANT role",
      `HTTP ${res.status} Role: ${res.body.data?.user?.role}`
    );
  } catch (err) {
    record("Tenant Login: Valid resident credentials", "Authentication", false, "HTTP 200", err.message);
  }

  // Test 9: Valid Super Admin Login
  try {
    const res = await makeRequest("POST", "/auth/login", {
      email: "admin@community.local",
      password: "Admin@12345"
    });
    const passed = res.status === 200 && res.body.data?.token && res.body.data?.user?.role === "SUPER_ADMIN";
    if (passed) adminToken = res.body.data.token;
    record(
      "Admin Login: Valid super admin credentials authenticate successfully",
      "Authentication",
      passed,
      "HTTP 200 with JWT and SUPER_ADMIN role",
      `HTTP ${res.status} Role: ${res.body.data?.user?.role}`
    );
  } catch (err) {
    record("Admin Login: Valid super admin credentials", "Authentication", false, "HTTP 200", err.message);
  }

  // Test 10: Route parameter validation with valid token - excessively long unitId
  try {
    const excessiveId = "a".repeat(100);
    const res = await makeRequest("GET", `/tenant/unit/${excessiveId}`, null, tenantToken);
    const passed = res.status === 400 && res.body.error?.code === "VALIDATION_ERROR";
    record(
      "Zod Route Param Validation: Oversized unitId parameter rejected with 400 VALIDATION_ERROR",
      "Validation",
      passed,
      "HTTP 400 VALIDATION_ERROR",
      `HTTP ${res.status} ${res.body.error?.code}`,
      JSON.stringify(res.body.error?.details || [])
    );
  } catch (err) {
    record("Zod Route Param Validation: Oversized unitId", "Validation", false, "HTTP 400", err.message);
  }

  // --- REQ 2: Server-Side Ownership Checks & IDOR Protection ---
  console.log("\n--- 2. Server-Side Ownership Checks & IDOR Prevention ---");

  const myAssignedUnitId = "u1111111-2222-3333-4444-555555555551";
  const otherUnitId1 = "u1111111-2222-3333-4444-555555555552";
  const otherUnitId2 = "u1111111-2222-3333-4444-555555555553";
  const nonexistentUnitId = "u9999999-9999-9999-9999-999999999999";

  // Test 11: Tenant accesses their OWN assigned unit -> 200 OK
  try {
    const res = await makeRequest("GET", `/tenant/unit/${myAssignedUnitId}`, null, tenantToken);
    const passed = res.status === 200 && res.body.data?.unit?.id === myAssignedUnitId;
    record(
      "Ownership Check: Tenant successfully retrieves their own assigned unit data",
      "Ownership",
      passed,
      "HTTP 200 with unit details",
      `HTTP ${res.status} Unit: ${res.body.data?.unit?.unitNumber} (${res.body.data?.unit?.id})`
    );
  } catch (err) {
    record("Ownership Check: Tenant own assigned unit", "Ownership", false, "HTTP 200", err.message);
  }

  // Test 12: IDOR Attack Scenario 1 - Tenant tampers unitId to view neighbor's unit (5552) -> 403 Forbidden
  try {
    const res = await makeRequest("GET", `/tenant/unit/${otherUnitId1}`, null, tenantToken);
    const passed = res.status === 403 && res.body.error?.code === "FORBIDDEN";
    record(
      "IDOR Prevention: Tenant accessing neighbor's unit (5552) rejected with 403 FORBIDDEN",
      "Ownership",
      passed,
      "HTTP 403 FORBIDDEN",
      `HTTP ${res.status} ${res.body.error?.code}: ${res.body.error?.message}`
    );
  } catch (err) {
    record("IDOR Prevention: Neighbor unit 5552", "Ownership", false, "HTTP 403", err.message);
  }

  // Test 13: IDOR Attack Scenario 2 - Tenant tampers unitId to view another unit (5553) -> 403 Forbidden
  try {
    const res = await makeRequest("GET", `/tenant/unit/${otherUnitId2}`, null, tenantToken);
    const passed = res.status === 403 && res.body.error?.code === "FORBIDDEN";
    record(
      "IDOR Prevention: Tenant accessing third unit (5553) rejected with 403 FORBIDDEN",
      "Ownership",
      passed,
      "HTTP 403 FORBIDDEN",
      `HTTP ${res.status} ${res.body.error?.code}: ${res.body.error?.message}`
    );
  } catch (err) {
    record("IDOR Prevention: Unit 5553", "Ownership", false, "HTTP 403", err.message);
  }

  // Test 14: Nonexistent unit identifier requested by Tenant -> 403 Forbidden (ownership check stops unauthorized probing)
  try {
    const res = await makeRequest("GET", `/tenant/unit/${nonexistentUnitId}`, null, tenantToken);
    const passed = res.status === 403 && res.body.error?.code === "FORBIDDEN";
    record(
      "Ownership Boundary: Tenant probing nonexistent unitId blocked with 403 FORBIDDEN",
      "Ownership",
      passed,
      "HTTP 403 FORBIDDEN",
      `HTTP ${res.status} ${res.body.error?.code}`
    );
  } catch (err) {
    record("Ownership Boundary: Nonexistent unitId", "Ownership", false, "HTTP 403", err.message);
  }

  // --- REQ 3 (Continued): Role Isolation & Permission Boundaries ---
  console.log("\n--- 3. Role Boundaries (SUPER_ADMIN vs RESIDENT_TENANT) ---");

  // Test 15: Tenant accesses Admin endpoint -> 403 Forbidden
  try {
    const res = await makeRequest("GET", "/admin/overview", null, tenantToken);
    const passed = res.status === 403 && res.body.error?.code === "FORBIDDEN";
    record(
      "Role Isolation: Resident accessing /api/admin/overview rejected with 403 FORBIDDEN",
      "Role Boundary",
      passed,
      "HTTP 403 FORBIDDEN",
      `HTTP ${res.status} ${res.body.error?.code}`
    );
  } catch (err) {
    record("Role Isolation: Resident to admin route", "Role Boundary", false, "HTTP 403", err.message);
  }

  // Test 16: Super Admin accesses Admin endpoint -> 200 OK
  try {
    const res = await makeRequest("GET", "/admin/overview", null, adminToken);
    const passed = res.status === 200 && Boolean(res.body.data?.systemMetrics);
    record(
      "Admin Access: Super Admin accesses /api/admin/overview successfully",
      "Role Boundary",
      passed,
      "HTTP 200 with platform stats",
      `HTTP ${res.status} Properties: ${res.body.data?.systemMetrics?.totalProperties}, Units: ${res.body.data?.systemMetrics?.totalUnits}`
    );
  } catch (err) {
    record("Admin Access: Super Admin overview", "Role Boundary", false, "HTTP 200", err.message);
  }

  // Test 17: Super Admin accesses tenant unit route -> 200 OK (Super Admin global audit privilege)
  try {
    const res = await makeRequest("GET", `/tenant/unit/${myAssignedUnitId}`, null, adminToken);
    const passed = res.status === 200 && res.body.data?.unit?.id === myAssignedUnitId;
    record(
      "Admin Hierarchy: Super Admin can inspect unit via tenant route",
      "Role Boundary",
      passed,
      "HTTP 200 with unit details",
      `HTTP ${res.status} Unit: ${res.body.data?.unit?.unitNumber}`
    );
  } catch (err) {
    record("Admin Hierarchy: Super Admin inspects unit", "Role Boundary", false, "HTTP 200", err.message);
  }

  // Test 18: Super Admin inspects nonexistent unit -> 404 NOT_FOUND
  try {
    const res = await makeRequest("GET", `/tenant/unit/${nonexistentUnitId}`, null, adminToken);
    const passed = res.status === 404 && res.body.error?.code === "NOT_FOUND";
    record(
      "Resource Lookup: Super Admin querying nonexistent unit returns 404 NOT_FOUND",
      "Resource Lookup",
      passed,
      "HTTP 404 NOT_FOUND",
      `HTTP ${res.status} ${res.body.error?.code}`
    );
  } catch (err) {
    record("Resource Lookup: Nonexistent unit by admin", "Resource Lookup", false, "HTTP 404", err.message);
  }

  // Test 19: Strict 401 vs 403 behavior verification
  const test401 = results.filter((r) => r.expected.includes("401")).every((r) => r.passed);
  const test403 = results.filter((r) => r.expected.includes("403")).every((r) => r.passed);
  record(
    "HTTP Status Differentiation: Strict 401 (Unauthenticated) vs 403 (Unauthorized/Forbidden)",
    "Status Code Standard",
    test401 && test403,
    "Strict 401 for all auth failures and 403 for all authorization/ownership failures",
    `401 Checks: ${test401 ? "ALL PASS" : "FAIL"} | 403 Checks: ${test403 ? "ALL PASS" : "FAIL"}`
  );

  console.log("\n===============================================================");
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  console.log(` SUMMARY: ${passedCount}/${total} TESTS PASSED (${Math.round((passedCount / total) * 100)}%)`);
  console.log("===============================================================");
  return { total, passedCount, results };
}

runDay6TestSuite().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
