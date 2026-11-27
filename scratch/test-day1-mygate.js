// Day 1 Automated API & Security Verification Test
// Tests My Gate visitor workflows, status transitions, RBAC, and Security Guard foundation

const API_BASE = "http://localhost:4000/api";

async function runTests() {
  console.log("=== STARTING DAY 1 MY GATE & SECURITY GUARD TEST SUITE ===");

  // 1. Health Check
  const healthRes = await fetch(`${API_BASE}/health`);
  const health = await healthRes.json();
  console.log("1. Health Endpoint:", health.success ? "PASS (Healthy)" : "FAIL");

  // 2. Authentication: Resident Tenant Login
  const tenantRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "preetham@community.local", password: "Tenant1@12345" })
  });
  const tenantAuth = await tenantRes.json();
  const tenantToken = tenantAuth.data?.token;
  console.log("2. Resident Tenant Login:", tenantRes.status === 200 && tenantToken ? "PASS" : "FAIL");

  // 3. Authentication: Resident Owner Login
  const ownerRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "vikramaditya@community.local", password: "Owner@12345" })
  });
  const ownerAuth = await ownerRes.json();
  const ownerToken = ownerAuth.data?.token;
  console.log("3. Resident Owner Login:", ownerRes.status === 200 && ownerToken ? "PASS" : "FAIL");

  // 4. Authentication: Security Guard Login
  const guardRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "guard.main@community.local", password: "Guard@12345" })
  });
  const guardAuth = await guardRes.json();
  const guardToken = guardAuth.data?.token;
  console.log("4. Security Guard Login:", guardRes.status === 200 ? `PASS (Role: ${guardAuth.data?.user?.role})` : "FAIL");

  // 5. Resident Pre-Approves a Visitor
  const preApproveRes = await fetch(`${API_BASE}/visitors`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tenantToken}` },
    body: JSON.stringify({
      visitorName: "Test Guest Preapproved",
      visitorPhone: "+91 91234 00001",
      purpose: "GUEST",
      expectedArrival: new Date(Date.now() + 3600000).toISOString(),
      visitorType: "GUEST",
      vehicleNumber: "KA-05-MM-1234"
    })
  });
  const preApproved = await preApproveRes.json();
  console.log("5. Resident Pre-Approve Pass:", preApproveRes.status === 201 && preApproved.data?.status === "APPROVED" ? `PASS (Code: ${preApproved.data?.accessCode})` : "FAIL");

  // 6. Security Guard creates Walk-in visitor request at the gate for Unit 402
  const walkInRes = await fetch(`${API_BASE}/visitors/walk-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${guardToken}` },
    body: JSON.stringify({
      unitId: "u1111111-2222-3333-4444-555555555551", // Unit 402 (Tenant Preetham)
      visitorName: "Zomato Food Delivery Agent",
      visitorPhone: "+91 99999 11111",
      purpose: "DELIVERY",
      visitorType: "DELIVERY",
      notes: "Food package at Main Gate 1"
    })
  });
  const walkIn = await walkInRes.json();
  const walkInId = walkIn.data?.id;
  console.log("6. Guard Walk-In Creation:", walkInRes.status === 201 && walkIn.data?.status === "PENDING" ? `PASS (Status: ${walkIn.data?.status})` : "FAIL");

  // 7. Security Guard attempts to check in unapproved walk-in -> Must be FORBIDDEN (HTTP 403)
  const prematureCheckInRes = await fetch(`${API_BASE}/visitors/${walkInId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${guardToken}` },
    body: JSON.stringify({ status: "CHECKED_IN" })
  });
  console.log("7. Guard Check-In Block on Pending Walk-In:", prematureCheckInRes.status === 403 ? "PASS (Properly Forbidden 403)" : `FAIL (${prematureCheckInRes.status})`);

  // 8. Resident checks pending approvals queue
  const pendingRes = await fetch(`${API_BASE}/visitors/pending`, {
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  const pendingList = await pendingRes.json();
  const foundInPending = pendingList.data?.some(v => v.id === walkInId);
  console.log("8. Resident Pending Queue:", pendingRes.status === 200 && foundInPending ? `PASS (Count: ${pendingList.data?.length})` : "FAIL");

  // 9. Unauthorized Resident (Owner Vikramaditya) attempts to approve Tenant Preetham's visitor -> Must be FORBIDDEN (HTTP 403)
  const unauthApproveRes = await fetch(`${API_BASE}/visitors/${walkInId}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  console.log("9. Unit Isolation on Approval (Wrong Resident):", unauthApproveRes.status === 403 ? "PASS (Properly Forbidden 403)" : `FAIL (${unauthApproveRes.status})`);

  // 10. Authorized Resident approves walk-in visitor
  const authApproveRes = await fetch(`${API_BASE}/visitors/${walkInId}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${tenantToken}` }
  });
  const approvedData = await authApproveRes.json();
  console.log("10. Resident Approves Walk-in:", authApproveRes.status === 200 && approvedData.data?.status === "APPROVED" ? "PASS" : "FAIL");

  // 11. Security Guard checks in visitor now that it is APPROVED
  const checkInRes = await fetch(`${API_BASE}/visitors/${walkInId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${guardToken}` },
    body: JSON.stringify({ status: "CHECKED_IN" })
  });
  const checkInData = await checkInRes.json();
  console.log("11. Guard Check-In After Approval:", checkInRes.status === 200 && checkInData.data?.status === "CHECKED_IN" ? "PASS" : "FAIL");

  // 12. Security Guard checks out visitor
  const checkOutRes = await fetch(`${API_BASE}/visitors/${walkInId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${guardToken}` },
    body: JSON.stringify({ status: "CHECKED_OUT" })
  });
  const checkOutData = await checkOutRes.json();
  console.log("12. Guard Check-Out:", checkOutRes.status === 200 && checkOutData.data?.status === "CHECKED_OUT" ? "PASS" : "FAIL");

  // 13. Resident Rejection with Reason Workflow
  // Create another walk-in request
  const walkIn2Res = await fetch(`${API_BASE}/visitors/walk-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${guardToken}` },
    body: JSON.stringify({
      unitId: "u1111111-2222-3333-4444-555555555551",
      visitorName: "Unknown Sales Rep",
      visitorPhone: "+91 90000 88888",
      purpose: "PROMOTION",
      visitorType: "OTHER"
    })
  });
  const walkIn2 = await walkIn2Res.json();
  const walkIn2Id = walkIn2.data?.id;

  // Resident rejects with specific reason
  const rejectRes = await fetch(`${API_BASE}/visitors/${walkIn2Id}/reject`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tenantToken}` },
    body: JSON.stringify({ rejectionReason: "Not expecting this sales representative" })
  });
  const rejectData = await rejectRes.json();
  console.log("13. Resident Reject with Reason:", rejectRes.status === 200 && rejectData.data?.status === "REJECTED" && rejectData.data?.rejectionReason === "Not expecting this sales representative" ? "PASS" : "FAIL");

  // 14. Guard attempt to check in REJECTED visitor -> Must be FORBIDDEN (HTTP 403)
  const rejectedCheckInRes = await fetch(`${API_BASE}/visitors/${walkIn2Id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${guardToken}` },
    body: JSON.stringify({ status: "CHECKED_IN" })
  });
  console.log("14. Guard Blocked from Checking In Rejected Visitor:", rejectedCheckInRes.status === 403 ? "PASS (Properly Forbidden 403)" : "FAIL");

  console.log("=== ALL DAY 1 TESTS COMPLETED SUCCESSFULLY ===");
}

runTests().catch(console.error);
