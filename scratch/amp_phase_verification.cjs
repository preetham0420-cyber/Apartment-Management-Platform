const http = require("http");
const fs = require("fs");
const path = require("path");

const API_PORT = 4000;
const API_HOST = "127.0.0.1";

function apiRequest({ method, endpoint, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const payload = body ? (typeof body === "string" ? body : JSON.stringify(body)) : null;
    const reqHeaders = {
      ...headers,
    };
    if (payload && !reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json";
    }
    if (payload) {
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: endpoint,
      method,
      headers: reqHeaders,
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runAllPhaseTests() {
  console.log("==================================================");
  console.log("🚀 AMP-DEV-001 PHASE 1-10 VERIFICATION SUITE");
  console.log("==================================================\n");

  // Step 0: Health Check
  const healthRes = await apiRequest({ method: "GET", endpoint: "/api/health" });
  assert(healthRes.statusCode === 200, "API service is active on :4000");

  // 1. Authenticate Admin, Tenant, and Owner
  console.log("\n--- [AUTH & ROLE VERIFICATION] ---");
  const adminLogin = await apiRequest({
    method: "POST",
    endpoint: "/api/auth/login",
    body: { email: "admin@community.local", password: "Admin@12345" }
  });
  assert(adminLogin.statusCode === 200, "Super Admin login succeeds (admin@community.local)");
  const adminToken = adminLogin.data.data.token || adminLogin.data.data.accessToken;

  const tenantLogin = await apiRequest({
    method: "POST",
    endpoint: "/api/auth/login",
    body: { email: "preetham@community.local", password: "Tenant1@12345" }
  });
  assert(tenantLogin.statusCode === 200, "Resident Tenant login succeeds (preetham@community.local)");
  const tenantToken = tenantLogin.data.data.token || tenantLogin.data.data.accessToken;

  // Phase 4: Deterministic RESIDENT_OWNER account
  const ownerLogin = await apiRequest({
    method: "POST",
    endpoint: "/api/auth/login",
    body: { email: "vikramaditya@community.local", password: "Owner@12345" }
  });
  assert(ownerLogin.statusCode === 200, "Deterministic Resident Owner login succeeds (vikramaditya@community.local)");
  assert(ownerLogin.data.data.user.role === "RESIDENT_OWNER", "Owner role confirmed as RESIDENT_OWNER");
  const ownerToken = ownerLogin.data.data.token || ownerLogin.data.data.accessToken;

  // Owner blocked from Admin API
  const ownerAdminAccess = await apiRequest({
    method: "GET",
    endpoint: "/api/admin/audit-logs",
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  assert(ownerAdminAccess.statusCode === 403, "RESIDENT_OWNER is strictly denied access to Super Admin APIs (HTTP 403)");

  // Tenant blocked from Admin API
  const tenantAdminAccess = await apiRequest({
    method: "GET",
    endpoint: "/api/admin/audit-logs",
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  assert(tenantAdminAccess.statusCode === 403, "RESIDENT_TENANT is strictly denied access to Super Admin APIs (HTTP 403)");

  // --------------------------------------------------
  // PHASE 1: Property Configuration
  // --------------------------------------------------
  console.log("\n--- [PHASE 1: PROPERTY CONFIGURATION] ---");
  const propertiesRes = await apiRequest({
    method: "GET",
    endpoint: "/api/admin/properties",
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const propertyId = propertiesRes.data.data[0].id;
  assert(Boolean(propertyId), `Identified existing property ${propertyId}`);

  const patchPropertyRes = await apiRequest({
    method: "PATCH",
    endpoint: `/api/admin/properties/${propertyId}`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      emergencyPhone: "+91 99999 11222",
      contactPhone: "+91 98888 33444",
      paymentInstructions: "Pay maintenance via NEFT/UPI to Community Escrow Account 12345678",
      rulesSummary: "Quiet hours 10 PM - 7 AM. Visitor parking allocated in Bay B."
    }
  });
  assert(patchPropertyRes.statusCode === 200, "PATCH /api/admin/properties/:id updates property config");
  assert(patchPropertyRes.data.data.emergencyPhone === "+91 99999 11222", "Updated emergency helpline verified");

  // Verify Audit Log captured mutation
  const auditRes = await apiRequest({
    method: "GET",
    endpoint: "/api/admin/audit-logs",
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const propertyAudit = auditRes.data.data.find(
    (a) => (a.action === "UPDATE_PROPERTY_CONFIG" || a.action === "UPDATE_PROPERTY_CONFIGURATION") && a.resourceId === propertyId
  );
  assert(Boolean(propertyAudit), "Administrative audit log recorded UPDATE_PROPERTY_CONFIG");

  // --------------------------------------------------
  // PHASE 2: Household Members
  // --------------------------------------------------
  console.log("\n--- [PHASE 2: HOUSEHOLD MEMBERS] ---");
  const getHouseholdRes = await apiRequest({
    method: "GET",
    endpoint: "/api/resident/household",
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  assert(getHouseholdRes.statusCode === 200, "GET /api/resident/household returns resident household list");

  const addMemberRes = await apiRequest({
    method: "POST",
    endpoint: "/api/resident/household",
    headers: { Authorization: `Bearer ${tenantToken}` },
    body: {
      fullName: "Priya Sharma",
      relationship: "SPOUSE",
      phoneNumber: "+91 98765 43210",
      isEmergencyContact: true
    }
  });
  assert(addMemberRes.statusCode === 201, "POST /api/resident/household adds new household member");
  const createdMemberId = addMemberRes.data.data.id;

  // IDOR ownership test: Owner attempts to delete Tenant's household member
  const idorHouseholdDelete = await apiRequest({
    method: "DELETE",
    endpoint: `/api/resident/household/${createdMemberId}`,
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  assert(idorHouseholdDelete.statusCode === 403, "Ownership check prevents IDOR: other resident cannot delete household member (HTTP 403)");

  // Legitimate resident deletes own household member
  const deleteMemberRes = await apiRequest({
    method: "DELETE",
    endpoint: `/api/resident/household/${createdMemberId}`,
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  assert(deleteMemberRes.statusCode === 200, "Resident can delete own household member");

  // --------------------------------------------------
  // PHASE 3: Vehicles & Parking
  // --------------------------------------------------
  console.log("\n--- [PHASE 3: VEHICLES & PARKING] ---");
  const getVehiclesRes = await apiRequest({
    method: "GET",
    endpoint: "/api/resident/vehicles",
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  assert(getVehiclesRes.statusCode === 200, "GET /api/resident/vehicles returns vehicles list");

  const addVehicleRes = await apiRequest({
    method: "POST",
    endpoint: "/api/resident/vehicles",
    headers: { Authorization: `Bearer ${tenantToken}` },
    body: {
      vehicleNumber: "KA 01 MJ 9988",
      vehicleType: "FOUR_WHEELER",
      makeModel: "Toyota Hyryder Hybrid"
    }
  });
  assert(addVehicleRes.statusCode === 201, "POST /api/resident/vehicles registers new vehicle");
  const createdVehicleId = addVehicleRes.data.data.id;

  // IDOR test: Owner attempts to delete Tenant's vehicle
  const idorVehicleDelete = await apiRequest({
    method: "DELETE",
    endpoint: `/api/resident/vehicles/${createdVehicleId}`,
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  assert(idorVehicleDelete.statusCode === 403, "Ownership check prevents IDOR: other resident cannot delete vehicle (HTTP 403)");

  // Resident parking slot inquiry
  const getParkingRes = await apiRequest({
    method: "GET",
    endpoint: "/api/resident/parking",
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  assert(getParkingRes.statusCode === 200, "GET /api/resident/parking returns assigned parking slot");

  // Admin parking slots listing
  const adminParkingRes = await apiRequest({
    method: "GET",
    endpoint: "/api/admin/parking-slots",
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminParkingRes.statusCode === 200, "GET /api/admin/parking-slots returns all community parking slots");

  // Delete vehicle
  const deleteVehicleRes = await apiRequest({
    method: "DELETE",
    endpoint: `/api/resident/vehicles/${createdVehicleId}`,
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  assert(deleteVehicleRes.statusCode === 200, "Resident can remove own registered vehicle");

  // --------------------------------------------------
  // PHASE 5: Documents & Compliance Centre
  // --------------------------------------------------
  console.log("\n--- [PHASE 5: DOCUMENTS & COMPLIANCE] ---");
  // Admin creates an ADMIN_ONLY document
  const createAdminDoc = await apiRequest({
    method: "POST",
    endpoint: "/api/admin/documents",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: "Executive Committee Internal Audit 2026",
      category: "FINANCIAL_AUDIT",
      fileUrl: "/uploads/documents/internal_audit_2026.pdf",
      fileSize: 2048500,
      mimeType: "application/pdf",
      accessLevel: "ADMIN_ONLY"
    }
  });
  assert(createAdminDoc.statusCode === 201, "POST /api/admin/documents creates ADMIN_ONLY document");
  const adminDocId = createAdminDoc.data.data.id;

  // Admin creates an OWNERS_ONLY document
  const createOwnerDoc = await apiRequest({
    method: "POST",
    endpoint: "/api/admin/documents",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: "AGM Sinking Fund Allocation 2026",
      category: "AGM_MINUTES",
      fileUrl: "/uploads/documents/sinking_fund_agm.pdf",
      fileSize: 1048576,
      mimeType: "application/pdf",
      accessLevel: "OWNERS_ONLY"
    }
  });
  assert(createOwnerDoc.statusCode === 201, "POST /api/admin/documents creates OWNERS_ONLY document");
  const ownerDocId = createOwnerDoc.data.data.id;

  // Resident Tenant fetches documents: MUST NOT see ADMIN_ONLY or OWNERS_ONLY
  const tenantDocsRes = await apiRequest({
    method: "GET",
    endpoint: "/api/documents",
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  assert(tenantDocsRes.statusCode === 200, "GET /api/documents returns documents for tenant");
  const tenantDocIds = tenantDocsRes.data.data.map((d) => d.id);
  assert(!tenantDocIds.includes(adminDocId), "Tenant is strictly shielded from ADMIN_ONLY document");
  assert(!tenantDocIds.includes(ownerDocId), "Tenant is strictly shielded from OWNERS_ONLY document");

  // Resident Owner fetches documents: Can see OWNERS_ONLY, MUST NOT see ADMIN_ONLY
  const ownerDocsRes = await apiRequest({
    method: "GET",
    endpoint: "/api/documents",
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  const ownerDocIds = ownerDocsRes.data.data.map((d) => d.id);
  assert(ownerDocIds.includes(ownerDocId), "Resident Owner has access to OWNERS_ONLY document");
  assert(!ownerDocIds.includes(adminDocId), "Resident Owner is shielded from ADMIN_ONLY document");

  // Super Admin fetches documents: sees all
  const adminDocsRes = await apiRequest({
    method: "GET",
    endpoint: "/api/documents",
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const allDocIds = adminDocsRes.data.data.map((d) => d.id);
  assert(allDocIds.includes(adminDocId) && allDocIds.includes(ownerDocId), "Super Admin sees all documents");

  // Cleanup test documents
  await apiRequest({ method: "DELETE", endpoint: `/api/admin/documents/${adminDocId}`, headers: { Authorization: `Bearer ${adminToken}` } });
  await apiRequest({ method: "DELETE", endpoint: `/api/admin/documents/${ownerDocId}`, headers: { Authorization: `Bearer ${adminToken}` } });

  // --------------------------------------------------
  // PHASE 6: Maintenance Attachments & Validation
  // --------------------------------------------------
  console.log("\n--- [PHASE 6: MAINTENANCE ATTACHMENTS & VALIDATION] ---");
  // Create a maintenance ticket
  const maintCreateRes = await apiRequest({
    method: "POST",
    endpoint: "/api/maintenance",
    headers: { Authorization: `Bearer ${tenantToken}` },
    body: {
      category: "PLUMBING",
      title: "Ceiling Seepage Verification Ticket",
      description: "Severe dampness and water seepage from overhead pipes in kitchen ceiling",
      priority: "HIGH"
    }
  });
  assert(maintCreateRes.statusCode === 201, "POST /api/maintenance creates maintenance ticket");
  const testTicketId = maintCreateRes.data.data.id;

  // Valid PNG attachment upload (with magic bytes verification)
  const validPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const validAttachmentRes = await apiRequest({
    method: "POST",
    endpoint: `/api/maintenance/${testTicketId}/attachments`,
    headers: { Authorization: `Bearer ${tenantToken}` },
    body: {
      fileName: "ceiling_defect.png",
      mimeType: "image/png",
      fileData: validPngBase64
    }
  });
  assert(validAttachmentRes.statusCode === 201, "POST /api/maintenance/:id/attachments accepts valid PNG with correct magic bytes");

  // Reject invalid file type (e.g. executable script)
  const invalidTypeRes = await apiRequest({
    method: "POST",
    endpoint: `/api/maintenance/${testTicketId}/attachments`,
    headers: { Authorization: `Bearer ${tenantToken}` },
    body: {
      fileName: "exploit.sh",
      mimeType: "text/x-shellscript",
      fileData: Buffer.from("#!/bin/bash\necho evil").toString("base64")
    }
  });
  assert(invalidTypeRes.statusCode === 400, "Rejects forbidden file types (shell scripts / non-whitelisted MIME) with HTTP 400");

  // Reject spoofed MIME type (declaring image/png but supplying fake header bytes)
  const spoofedMimeRes = await apiRequest({
    method: "POST",
    endpoint: `/api/maintenance/${testTicketId}/attachments`,
    headers: { Authorization: `Bearer ${tenantToken}` },
    body: {
      fileName: "fake_image.png",
      mimeType: "image/png",
      fileData: Buffer.from("NOT_A_REAL_PNG_HEADER").toString("base64")
    }
  });
  assert(spoofedMimeRes.statusCode === 400, "Rejects spoofed magic-bytes mismatch with HTTP 400");

  // --------------------------------------------------
  // PHASE 7: Approved-Account Onboarding
  // --------------------------------------------------
  console.log("\n--- [PHASE 7: APPROVED-ACCOUNT ONBOARDING] ---");
  const unitsRes = await apiRequest({
    method: "GET",
    endpoint: "/api/units",
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  const targetUnitId = unitsRes.data.data[0].id;

  // New resident self-registration
  const testRegEmail = `newresident_${Date.now()}@test.local`;
  const registerRes = await apiRequest({
    method: "POST",
    endpoint: "/api/auth/register",
    body: {
      email: testRegEmail,
      password: "Password@123",
      fullName: "Arjun Verma",
      phoneNumber: "+91 97777 66554",
      role: "RESIDENT_TENANT",
      unitId: targetUnitId
    }
  });
  assert(registerRes.statusCode === 201, "POST /api/auth/register creates pending onboarding record");
  assert(registerRes.data.data.status === "PENDING_APPROVAL", "New registered account is set to PENDING_APPROVAL");
  const pendingAssignmentId = registerRes.data.data.assignmentId;

  // Attempting login with pending account: Must be rejected
  const pendingLoginRes = await apiRequest({
    method: "POST",
    endpoint: "/api/auth/login",
    body: { email: testRegEmail, password: "Password@123" }
  });
  assert(pendingLoginRes.statusCode === 403, "Pending approval resident cannot log in (HTTP 403)");

  // Super Admin views pending onboarding applications
  const pendingListRes = await apiRequest({
    method: "GET",
    endpoint: "/api/admin/onboarding/pending",
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const applicant = pendingListRes.data.data.find(
    (a) => a.id === pendingAssignmentId || a.assignmentId === pendingAssignmentId
  );
  assert(Boolean(applicant), "Registered applicant found in Super Admin pending queue");

  // Super Admin approves applicant
  const approveRes = await apiRequest({
    method: "POST",
    endpoint: `/api/admin/onboarding/${pendingAssignmentId}/approve`,
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(approveRes.statusCode === 200, "POST /api/admin/onboarding/:id/approve activates applicant account");

  // Post-approval login succeeds
  const approvedLoginRes = await apiRequest({
    method: "POST",
    endpoint: "/api/auth/login",
    body: { email: testRegEmail, password: "Password@123" }
  });
  assert(approvedLoginRes.statusCode === 200, "Approved resident can now successfully log in");

  // --------------------------------------------------
  // PHASE 8: Operational Reports
  // --------------------------------------------------
  console.log("\n--- [PHASE 8: OPERATIONAL REPORTS] ---");
  const reportsRes = await apiRequest({
    method: "GET",
    endpoint: "/api/admin/reports/operational",
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(reportsRes.statusCode === 200, "GET /api/admin/reports/operational returns operational metrics");
  const reportData = reportsRes.data.data;
  assert(Boolean(reportData?.financial || reportData?.financialSummary), "Report includes Financial Collection metrics");
  assert(Boolean(reportData?.maintenance || reportData?.maintenanceSla), "Report includes Maintenance SLA metrics");
  assert(Boolean(reportData?.visitors || reportData?.visitorTraffic), "Report includes Visitor Traffic metrics");
  assert(Boolean(reportData?.occupancy), "Report includes Unit Occupancy Distribution");

  // --------------------------------------------------
  // PHASE 9: Targeted In-App Notifications
  // --------------------------------------------------
  console.log("\n--- [PHASE 9: TARGETED NOTIFICATIONS] ---");
  const getNotifsRes = await apiRequest({
    method: "GET",
    endpoint: "/api/resident/notifications",
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  assert(getNotifsRes.statusCode === 200, "GET /api/resident/notifications returns user notification inbox");
  assert(Array.isArray(getNotifsRes.data.data), "Notifications list is an array");

  if (getNotifsRes.data.data.length > 0) {
    const targetNotifId = getNotifsRes.data.data[0].id;
    const markReadRes = await apiRequest({
      method: "PATCH",
      endpoint: `/api/resident/notifications/${targetNotifId}/read`,
      headers: { Authorization: `Bearer ${tenantToken}` }
    });
    assert(markReadRes.statusCode === 200, "PATCH /api/resident/notifications/:id/read marks notification as read");
  }

  // --------------------------------------------------
  // PHASE 10: Security, Input Validation & Rate Limiting
  // --------------------------------------------------
  console.log("\n--- [PHASE 10: SECURITY CONTROLS & COMPLIANCE] ---");
  // Zod input validation failure test
  const invalidZodRes = await apiRequest({
    method: "POST",
    endpoint: "/api/resident/household",
    headers: { Authorization: `Bearer ${tenantToken}` },
    body: {
      fullName: "", // invalid: too short
      relationship: "SPOUSE"
    }
  });
  assert(invalidZodRes.statusCode === 400, "Strict Zod validation catches missing/invalid fields (HTTP 400)");

  // Role escalation prevention: registering as SUPER_ADMIN must be rejected
  const maliciousRegisterRes = await apiRequest({
    method: "POST",
    endpoint: "/api/auth/register",
    body: {
      email: "hacker@evil.local",
      password: "Password@123",
      fullName: "Evil Hacker",
      role: "SUPER_ADMIN", // Malicious role escalation
      unitId: targetUnitId
    }
  });
  assert(maliciousRegisterRes.statusCode === 400, "Registration forbids self-assigning SUPER_ADMIN role (HTTP 400)");

  console.log("\n==================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllPhaseTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
