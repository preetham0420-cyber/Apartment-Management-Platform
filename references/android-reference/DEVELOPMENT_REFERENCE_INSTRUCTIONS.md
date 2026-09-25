# Apartment Management Platform - Reference Implementation Instructions

The supplied source and reference APK are intended to support development of the Apartment Management Platform.

## Initial review
Before implementing new modules, review the complete reference application and note the current screens, workflows, user roles, navigation, and demonstration interactions.

Review at minimum:
- Dashboard and overview
- Residents and homes
- Maintenance requests
- Visitors and gate operations
- Payments and accounts
- Security/CCTV presentation
- Notices and meetings
- Chat/messaging concepts
- Amenities
- Staff and vendors
- Documents
- Reports
- Role-based interface behavior

## Source review
The principal reference UI is located at:
`app/src/main/assets/index.html`

The Android wrapper is located under:
`app/src/main/java/in/communityportal/residentialportal/`

The project may be opened in Android Studio for inspection and local testing.

## Implementation expectations
- Treat demonstration/static values only as reference data.
- Do not copy hard-coded resident/user records into the actual application.
- Build approved functions using reusable components and clear service/API boundaries.
- Enforce authorization on the backend rather than relying only on hidden UI controls.
- Keep secrets and environment-specific configuration outside source control.
- Maintain separate development/staging data and avoid production data during implementation.
- Follow the company Git workflow and submit work through the assigned repository/branches.

## Target architecture
The final platform should be developed as:
- Android/iOS mobile application for residents/tenants
- Super Admin web console
- Backend API services
- Database and migrations

The reference Android application should be used to understand the existing UI/workflow concepts, not as a constraint on the final architecture.

## Expected first deliverable
After reviewing the reference application, provide a concise technical note covering:
1. Features identified in the reference application.
2. Features proposed for the resident/tenant mobile app.
3. Functions proposed for the Super Admin web console.
4. Missing or unclear workflows.
5. Suggested usability or technical improvements.
6. Any questions requiring approval before implementation.
