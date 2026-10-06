# Practical Penetration Testing Plan: Postman & PowerShell Tooling
**Target Application:** Apartment Management Platform (AMP-DEV-001)  
**Target Environments:** Super Admin Web (`http://localhost:3000`) & Central Backend REST API (`http://localhost:4000`)  
**Methodology Standard:** OWASP Web Security Testing Guide (WSTG v4.2) & OWASP API Security Top 10 (2023)  
**Testing Modalities:** Manual & Tool-Assisted Penetration Testing via **Postman** and **PowerShell**  
**Document Status:** Working Test Plan (Planned execution; not yet executed under this protocol)  

---

## 1. Purpose
The purpose of this document is to establish a rigorous, practical, and repeatable test plan for conducting **manual and tool-assisted penetration testing** on the Apartment Management Platform using standard engineering tools already available in enterprise environments: **Postman** and **Windows PowerShell**.

While automated test suites verify functional code branches, tool-assisted testing via Postman and PowerShell provides:
* Fine-grained control over raw HTTP request headers, cookies, and HTTP verbs.
* Immediate visibility into response status codes, latency, and transport headers.
* The ability to manipulate serialized JSON payloads, boundary markers, and query parameters dynamically.
* Verification of client-side vs. server-side security controls without relying on frontend browser abstractions.

---

## 2. Authorized Scope
All testing is strictly limited to authorized development/staging instances running on local host interfaces:
* **Admin Web Frontend:** `http://localhost:3000` (Next.js Application)
* **Backend REST API:** `http://localhost:4000` (Node.js / Express 5 API Gateway)
* **Target Roles & Accounts:**
  - `SUPER_ADMIN`: `admin@community.local` (Platform Administrator)
  - `RESIDENT_TENANT`: `preetham@community.local` (Flat 402, Tower A)
  - `RESIDENT_OWNER`: `vikramaditya@community.local` (Flat 205, Tower B)

**Out of Scope:**
* Any production databases, third-party payment gateways, external SMTP relays, or remote hosting providers.
* Denial-of-Service attacks, resource exhaustion, or physical security.

---

## 3. Testing Methodology
This test plan aligns with the **OWASP Web Security Testing Guide (WSTG v4.2)** and **OWASP API Security Top 10 (2023)**, organizing test cases into structured security categories:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   OWASP-ALIGNED PENETRATION TEST STAGES                │
├───────────────────┬────────────────────────────────────────────────────┤
│ WSTG-INFO         │ Information Gathering & Service Fingerprinting     │
│ WSTG-CONF         │ Configuration & Security Header Verification       │
│ WSTG-ATHN         │ Authentication & Session Management Testing        │
│ WSTG-ATHZ         │ Role-Based Authorization & Privilege Escalation    │
│ WSTG-INPV         │ Input Validation, SQL Injection, and XSS Fuzzing   │
│ WSTG-APIT / BOLA  │ Broken Object-Level Authorization (IDOR) Probing   │
│ WSTG-BUSL         │ Business Logic & Rate-Limiting Verification        │
│ WSTG-ERRH         │ Error Handling & Information Disclosure Review     │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 4. Postman Testing Approach
Postman will be utilized for **interactive request tampering, payload fuzzing, and automated response assertion scripting**:

1. **Environment Configuration:**
   - Define variables: `baseUrl` (`http://localhost:4000`), `webUrl` (`http://localhost:3000`), `adminToken`, `tenantToken`, `ownerToken`.
2. **Collection Organization:**
   - Structure folders by OWASP category: `01_Authentication`, `02_RBAC_Privilege_Escalation`, `03_BOLA_IDOR`, `04_Input_Validation`, `05_Security_Headers`.
3. **Pre-Request Scripts & Tests Tabs:**
   - Use Postman's `pm.test()` assertions to inspect status codes, response times, and header keys:
     ```javascript
     pm.test("Status code is 403 Forbidden", function () {
         pm.response.to.have.status(403);
     });
     pm.test("Anti-Clickjacking header is present", function () {
         pm.response.to.have.header("X-Frame-Options");
     });
     ```
4. **Collection Runner / Newman CLI:**
   - Enable rapid batch regression testing and HTML evidence reporting via Newman.

---

## 5. PowerShell Testing Approach
PowerShell provides native, dependency-free HTTP probing capabilities directly from the command line:

1. **`Invoke-RestMethod`:**
   - Best for parsing structured JSON API responses directly into PowerShell objects.
2. **`Invoke-WebRequest`:**
   - Best for inspecting raw HTTP transport headers, status codes, and non-JSON content:
     ```powershell
     $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET
     $response.Headers["X-Content-Type-Options"]
     ```
3. **Controlled Looping & Throttling:**
   - Script rapid bursts to evaluate rate limiters (`1..15 | ForEach-Object { ... }`).
4. **Header and Token Injection:**
   - Create custom header hashtables (`@{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }`).

---

## 6. Authentication Tests (WSTG-ATHN)
* **Objective:** Verify that authentication cannot be bypassed and tokens are strictly enforced.
* **Probes to Execute:**
  1. **ATHN-P01 (Unauthenticated Probe):** Send `GET /api/admin/overview` with zero `Authorization` header.
  2. **ATHN-P02 (Empty Token):** Send `Authorization: Bearer ` with empty token value.
  3. **ATHN-P03 (Non-Bearer Scheme):** Send `Authorization: Basic YWRtaW46cGFzc3dvcmQ=`.
  4. **ATHN-P04 (Malformed JWT):** Send `Authorization: Bearer aaaaa.bbbbb.ccccc`.
  5. **ATHN-P05 (Tampered Signature):** Alter last 6 characters of a valid JWT token.
  6. **ATHN-P06 (User Enumeration):** Submit invalid email vs. valid email with incorrect password and compare response text/latency.

---

## 7. Authorization & RBAC Tests (WSTG-ATHZ)
* **Objective:** Ensure lower-privileged resident accounts cannot trigger administrative actions.
* **Probes to Execute:**
  1. **ATHZ-P01 (Tenant -> Admin Dashboard):** Tenant token calls `GET /api/admin/overview`.
  2. **ATHZ-P02 (Tenant -> Resident Directory):** Tenant token calls `GET /api/admin/residents`.
  3. **ATHZ-P03 (Tenant -> Audit Logs):** Tenant token calls `GET /api/admin/audit-logs`.
  4. **ATHZ-P04 (Tenant -> Notice Broadcast):** Tenant token sends `POST /api/admin/notices`.
  5. **ATHZ-P05 (Owner -> Admin Audit):** Owner token calls `GET /api/admin/audit-logs`.
  6. **ATHZ-P06 (Owner -> Unit Status Mutation):** Owner token sends `PATCH /api/admin/units/:id/status`.

---

## 8. BOLA / IDOR Tests (WSTG-APIT)
* **Objective:** Ensure residents cannot access or manipulate other flats' records by tampering with resource IDs.
* **Probes to Execute:**
  1. **IDOR-P01 (Cross-Unit Tenancy Probing):** Tenant in Flat 402 calls `GET /api/tenant/unit/u1111111-2222-3333-4444-555555555552` (Flat 101).
  2. **IDOR-P02 (Cross-Unit Block Probing):** Tenant in Flat 402 calls `GET /api/tenant/unit/u1111111-2222-3333-4444-555555555553` (Tower B Flat 304).
  3. **IDOR-P03 (Document Tier Probing):** Tenant token calls `GET /api/documents` to check for leakage of `OWNERS_ONLY` documents.
  4. **IDOR-P04 (Foreign Visitor Pass Mutation):** Tenant token attempts `PATCH /api/visitors/visitor-foreign-001/status`.
  5. **IDOR-P05 (Foreign Dues Mutation):** Tenant token attempts `POST /api/dues/due-foreign-001/record-payment`.

---

## 9. Input Validation Tests (WSTG-INPV)
* **Objective:** Stress API input schemas using unexpected types, boundary violations, and malformed structures.
* **Probes to Execute:**
  1. **INPV-P01 (Malformed Email):** Submit `"email": "invalid@@domain..com"` on login.
  2. **INPV-P02 (Empty Payload):** Submit empty JSON `{}` on login.
  3. **INPV-P03 (Oversized Password):** Submit 300-character string in password field (Bcrypt DoS test).
  4. **INPV-P04 (Unexpected Fields):** Inject `"isAdmin": true` or `"role": "SUPER_ADMIN"` into `POST /api/visitors`.
  5. **INPV-P05 (Invalid Enum):** Submit `"status": "EXPLOITED"` on visitor update.
  6. **INPV-P06 (Malformed Datetime):** Submit `"startTime": "2026-99-99T99:99:99Z"` on booking creation.
  7. **INPV-P07 (Path Traversal in Parameter):** Request `GET /api/tenant/unit/..%2F..%2Fetc%2Fpasswd`.

---

## 10. SQL Injection Tests (WSTG-INPV-SQLI)
* **Objective:** Confirm parameterized SQL queries prevent execution of injected SQL fragments.
* **Probes to Execute:**
  1. **SQLI-P01 (Auth Bypass):** Submit `' OR '1'='1' --` in login email parameter.
  2. **SQLI-P02 (Password Field Comment):** Submit `Password123!' OR 1=1#` in password field.
  3. **SQLI-P03 (Search Filter Probe):** Submit `GET /api/admin/residents?search=' OR 1=1 --`.
  4. **SQLI-P04 (Parameter Injected UNION):** Submit `GET /api/admin/units/' UNION SELECT 1,2,3 --/household`.

---

## 11. Cross-Site Scripting (XSS) Tests (WSTG-INPV-XSS)
* **Objective:** Ensure user-controlled fields cannot execute arbitrary client-side scripts.
* **Probes to Execute:**
  1. **XSS-P01 (Visitor Name):** Submit `<script>alert("XSS")</script>TestGuest` in `POST /api/visitors`.
  2. **XSS-P02 (Maintenance Title):** Submit `<img src=x onerror=alert(1)> Faucet Leak` in `POST /api/maintenance`.
  3. **XSS-P03 (Comment Body):** Submit `<svg onload=alert(document.domain)>` in `POST /api/maintenance/:id/comments`.
  4. **XSS-P04 (DOM Verification):** Inspect Next.js Admin Web rendering to ensure JSX escapes tags as text entities.

---

## 12. Rate-Limit Tests (WSTG-BUSL)
* **Objective:** Verify brute-force defenses on authentication routes.
* **Probes to Execute:**
  1. **RATE-P01 (Sequential Burst):** Dispatch 15 rapid consecutive failed login requests from a single IP using a PowerShell loop.
  2. **RATE-P02 (Header Verification):** Inspect responses for `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining`.

---

## 13. CORS & Security Header Tests (WSTG-CONF)
* **Objective:** Inspect defensive HTTP response headers across both server ports.
* **Probes to Execute:**
  1. **CONF-P01 (API Headers):** Query `http://localhost:4000/api/health` and verify:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Content-Security-Policy`
     - Absence of `X-Powered-By`
  2. **CONF-P02 (Admin Web Headers):** Query `http://localhost:3000/` and verify:
     - `X-Frame-Options: DENY`
     - Absence of `X-Powered-By: Next.js`
  3. **CONF-P03 (Unauthorized CORS):** Send request with `Origin: http://unauthorized-attacker.com`.
  4. **CONF-P04 (Authorized CORS):** Send request with `Origin: http://localhost:3000`.

---

## 14. File-Upload Security Tests (WSTG-INPV-FILE)
* **Objective:** Verify server-side file inspection and path sanitization.
* **Probes to Execute:**
  1. **FILE-P01 (Disallowed Extension):** Upload executable script (`shell.php`).
  2. **FILE-P02 (Oversized Payload):** Upload dummy 6MB image buffer exceeding the 5MB ceiling.
  3. **FILE-P03 (MIME Mismatch / Magic-Byte Check):** Send text/html payload declaring `Content-Type: image/jpeg`.
  4. **FILE-P04 (Path Traversal in Filename):** Submit multipart filename `../../../../etc/passwd.jpg`.

---

## 15. Error Handling & Information Disclosure Tests (WSTG-ERRH)
* **Objective:** Confirm errors do not reveal stack traces, system paths, or secret tokens.
* **Probes to Execute:**
  1. **ERR-P01 (Malformed JSON):** Send truncated JSON string `{ "email": "test"` to login.
  2. **ERR-P02 (Unmapped Route):** Send `GET /api/nonexistent-route-xyz` and check response for stack traces.
  3. **ERR-P03 (Secret Disclosure):** Check `/api/health` output for database connection strings or JWT secrets.
  4. **ERR-P04 (Hash Exposure):** Inspect login/me responses to confirm absence of `passwordHash`.

---

## 16. Evidence to Capture
For every executed test, capture the following artifacts into a structured log:
1. **Timestamp:** ISO-8601 execution time.
2. **Method & URL:** Exact HTTP verb and destination URI.
3. **Request Headers:** Redacted headers (e.g., `Authorization: Bearer [REDACTED]`).
4. **Request Body:** Exact JSON or multipart body submitted.
5. **Response Status:** Exact HTTP status code and status text (e.g., `403 Forbidden`).
6. **Response Headers:** Full header block.
7. **Response Body:** Redacted response snippet.

---

## 17. PASS / FAIL Criteria

| Status | Definition |
| :--- | :--- |
| **PASS** | The application strictly enforces the expected defensive control (e.g., returns 401 on missing auth, 403 on RBAC violation, 400 on bad schema, 429 on rate limit). |
| **FAIL** | The application permits unauthorized data access, mutates foreign data, executes injected SQL/script, or returns unhandled 500 exceptions with stack traces. |
| **BLOCKED** | The test cannot be evaluated due to an infrastructure outage or dependency failure. |
| **N/A** | The target endpoint or parameter does not exist in the scoped application. |

---

## 18. Safety & Non-Destructive Testing Rules
1. **No Data Alteration:** Do not delete or overwrite existing seed database records during testing.
2. **No DoS Flooding:** Rate limit testing must use strictly controlled loops (maximum 15 requests), not volumetric stress tools.
3. **Harmless Payloads Only:** Use benign injection strings (`' OR 1=1 --`, `<script>alert(1)</script>`); never use weaponized reverse shells or DROP commands.
4. **Credential Protection:** Never log plain text passwords, valid secret keys, or real personal identifiable information.
