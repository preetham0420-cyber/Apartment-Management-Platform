# Apartment Management Platform: REST API Documentation

**Base URL**: `http://localhost:4000/api`  
**Specification**: RESTful JSON over HTTP  
**Authentication**: Bearer JWT token in HTTP `Authorization` header (`Bearer <token>`)

---

## 1. Global Response Standards

### Standard Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-05T04:00:00.000Z",
    "version": "0.1.0-alpha"
  }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed on incoming request parameters.",
    "details": [
      {
        "field": "email",
        "message": "Email is required",
        "code": "invalid_type"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-05T04:00:00.000Z",
    "path": "/api/auth/login"
  }
}
```

### Common HTTP Status Codes
| Code | Enum | Description |
| :--- | :--- | :--- |
| `200` | `OK` | Request succeeded; response contains payload. |
| `201` | `CREATED` | Resource created successfully. |
| `400` | `BAD_REQUEST` | Zod validation error, malformed JSON, or scheduling conflict. |
| `401` | `UNAUTHORIZED` | Missing, expired, or invalid JWT signature. |
| `403` | `FORBIDDEN` | Insufficient role permissions or IDOR violation (cross-unit access). |
| `404` | `NOT_FOUND` | Target resource does not exist. |
| `429` | `RATE_LIMIT_EXCEEDED` | Sliding-window threshold exceeded on authentication endpoint. |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server fault; sanitized error message returned. |

---

## 2. Authentication & Session Endpoints

### 2.1 Authenticate User
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Rate Limit**: 10 reqs/5min (Production), 200 reqs/5min (Development)
- **Request Body**:
```json
{
  "email": "preetham@community.local",
  "password": "Tenant1@12345"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-resident-tenant-00000002",
      "email": "preetham@community.local",
      "fullName": "Preetham (Resident Tenant)",
      "role": "RESIDENT_TENANT",
      "phoneNumber": "+91 91234 56789",
      "isActive": true
    },
    "unit": {
      "id": "u1111111-2222-3333-4444-555555555551",
      "propertyId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "propertyName": "Greenfield Heights",
      "unitNumber": "402",
      "block": "Tower A",
      "floor": 4,
      "assignmentType": "TENANT"
    }
  }
}
```

### 2.2 Refresh Access Token
- **Method**: `POST`
- **Path**: `/api/auth/refresh`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Fresh signed JWT token.

### 2.3 Logout & Invalidate Session
- **Method**: `POST`
- **Path**: `/api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: `{"sessionTerminated": true}`.

### 2.4 Self-Service Resident Onboarding Application
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Public**: Yes
- **Request Body**:
```json
{
  "fullName": "Deepak Kumar",
  "email": "deepak@applicant.local",
  "password": "Password@12345",
  "phoneNumber": "+91 94444 55566",
  "unitNumber": "402",
  "block": "Tower A",
  "applicantRole": "RESIDENT_TENANT"
}
```
- **Response (201 CREATED)**: Account created with `status: "PENDING_APPROVAL"`. Account cannot log in until Super Admin approval.

---

## 3. Resident Endpoints

All resident endpoints require `Authorization: Bearer <token>` with `RESIDENT_TENANT` or `RESIDENT_OWNER` role.

### 3.1 Resident Home Dashboard
- **Method**: `GET`
- **Path**: `/api/resident/home`
- **Response (200 OK)**: Consolidated payload containing flat info, assigned parking slot, outstanding dues count, recent visitor passes, and maintenance tickets.

### 3.2 Resident Profile
- **Method**: `GET` / `PATCH`
- **Path**: `/api/resident/profile`
- **PATCH Body**: Editable contact fields (`phoneNumber`).

### 3.3 Household Members
- **Method**: `GET` / `POST` / `DELETE`
- **Path**: `/api/resident/household`
- **POST Body**:
```json
{
  "fullName": "Pooja Hegde",
  "relationship": "SPOUSE",
  "phoneNumber": "+91 92222 33333",
  "emergencyContact": true
}
```
- **DELETE Path**: `/api/resident/household/:id` (IDOR guarded: 403 Forbidden if not resident's own flat).

### 3.4 Vehicles & Parking
- **Method**: `GET` / `POST` / `DELETE`
- **Path**: `/api/resident/vehicles`
- **POST Body**:
```json
{
  "registrationNumber": "KA-01-MJ-8899",
  "vehicleType": "FOUR_WHEELER",
  "makeModel": "Honda City",
  "isElectric": false
}
```
- **Path**: `/api/resident/parking` (`GET`) returns allocated parking bay details (`P-A-402`, EV charger flag).

### 3.5 Residents Directory
- **Method**: `GET`
- **Path**: `/api/resident/directory`
- **Response (200 OK)**: Filtered list of society residents with masked contact details and flat numbers. Includes `isSelf: true` flag for the requesting resident.

### 3.6 Lease & Tenancy Record
- **Method**: `GET`
- **Path**: `/api/resident/lease`
- **Response (200 OK)**: Tenancy verification record, lease agreement ID, valid date range, and unit number.

### 3.7 CCTV & Gate Security Desk
- **Method**: `GET`
- **Path**: `/api/resident/security`
- **Response (200 OK)**: Operational status of Main Gate, Rear Gate, Clubhouse Barrier, and security guard intercom extensions.

### 3.8 Personal Dues & Ledger
- **Method**: `GET`
- **Path**: `/api/dues`
- **Response (200 OK)**: List of recurring maintenance and water bills for the resident's allocated flat.
- **Path**: `POST /api/dues/:id/record-payment` — Records payment settlement.

### 3.9 Notifications Inbox
- **Method**: `GET`
- **Path**: `/api/resident/notifications`
- **Path**: `PATCH /api/resident/notifications/:id/read` — Marks notification as read.

---

## 4. Visitor Management Endpoints

- **`GET /api/visitors`**: List passes generated for the resident's flat.
- **`POST /api/visitors`**: Create new pre-approved gate pass.
  - Body: `{"visitorName": "Zomato Delivery", "visitorPhone": "+91 98888 12345", "purpose": "DELIVERY", "expectedArrival": "2026-10-05T12:00:00Z"}`
  - Returns: Dynamic 6-digit access passcode and QR payload.
- **`PATCH /api/visitors/:id/status`**: Check-in / Check-out status toggle (`CHECKED_IN`, `CHECKED_OUT`, `EXPIRED`).

---

## 5. Maintenance Ticketing Endpoints

- **`GET /api/maintenance`**: List maintenance tickets for the resident.
- **`POST /api/maintenance`**: Create new ticket.
  - Body: `{"category": "PLUMBING", "title": "Kitchen faucet leaking", "description": "Continuous drip under sink", "priority": "HIGH"}`
- **`POST /api/maintenance/:id/comments`**: Add resident comment.
- **`POST /api/maintenance/:id/attachments`**: Upload defect photograph.
  - Content-Type: `multipart/form-data` or base64 JSON.
  - Validation: Magic byte signature check (PNG: `89 50 4E 47`, JPEG: `FF D8 FF`, PDF: `25 50 44 46`), 5MB size limit.
- **`PATCH /api/maintenance/:id`**: Update or cancel ticket.

---

## 6. Amenities & Booking Endpoints

- **`GET /api/amenities`**: Fetch all society amenities (Clubhouse Banquet Hall, Swimming Pool, Tennis Court).
- **`GET /api/amenities/:id/bookings`**: Fetch booking schedule for a facility on a specific date.
- **`POST /api/amenities/:id/book`**: Reserve an amenity slot.
  - Body: `{"bookingDate": "2026-10-10", "startTime": "18:00", "endTime": "21:00", "purpose": "Birthday Party"}`
  - Conflict Check: Returns `400 BAD_REQUEST` ("This time slot is already reserved") if overlapping booking exists.
- **`GET /api/amenity-bookings`**: List bookings created by the authenticated resident.
- **`DELETE /api/amenity-bookings/:id`**: Cancel booking and release slot for other residents.

---

## 7. Documents & Compliance Endpoints

- **`GET /api/documents`**: Role-filtered document repository.
  - If `RESIDENT_TENANT`: returns only `access_level: 'ALL_RESIDENTS'`.
  - If `RESIDENT_OWNER`: returns `ALL_RESIDENTS` and `OWNERS_ONLY`.
  - If `SUPER_ADMIN`: returns all documents (`ALL_RESIDENTS`, `OWNERS_ONLY`, `ADMIN_ONLY`).
- **`POST /api/admin/documents`**: Upload/register document (Admin only).
- **`DELETE /api/admin/documents/:id`**: Delete document (Admin only).

---

## 8. Super Admin Management Endpoints

All endpoints require `Authorization: Bearer <token>` and `role: "SUPER_ADMIN"`. Access by residents returns `403 FORBIDDEN`.

### 8.1 Executive Dashboard
- **`GET /api/admin/dashboard`**: Aggregated KPIs (totalResidents, totalUnits, pendingMaintenance, pendingDuesCount, activeVisitors, activeNotices, amenityBookingsCount).

### 8.2 Properties & Configuration
- **`GET /api/admin/properties`**: List properties and building statistics.
- **`PATCH /api/admin/properties/:id`**: Update property settings (`emergencyPhone`, `rulesSummary`, `paymentInstructions`). Writes to `audit_logs`.

### 8.3 Units & Residential Inventory
- **`GET /api/admin/units`**: List all flats with floor, area, block, occupancy status (`OCCUPIED`, `VACANT`, `UNDER_MAINTENANCE`), and assigned resident email/name.
- **`PATCH /api/admin/units/:id/status`**: Toggle flat occupancy status.

### 8.4 Resident Accounts & Onboarding Queue
- **`GET /api/admin/residents`**: List resident accounts.
- **`PATCH /api/admin/residents/:id/status`**: Activate or deactivate resident access.
- **`GET /api/admin/onboarding`**: View pending resident registration requests.
- **`POST /api/admin/onboarding/:id/approve`**: Approve resident and activate account.
- **`POST /api/admin/onboarding/:id/reject`**: Reject applicant.

### 8.5 Operations & Audit
- **`GET /api/admin/maintenance`**: Overview of all community tickets with staff assignment.
- **`GET /api/admin/visitors`**: Society visitor registry.
- **`GET /api/admin/dues`**: Society billing ledger.
- **`GET /api/admin/amenities/bookings`**: Complete amenity reservation roster.
- **`POST /api/admin/notices`**: Broadcast notice to community (`LOW`, `NORMAL`, `URGENT`).
- **`GET /api/admin/audit-logs`**: Immutable compliance audit trail.
- **`GET /api/admin/reports/operational`**: Analytics reports (financial collections, maintenance SLA, visitor traffic, occupancy distribution).
