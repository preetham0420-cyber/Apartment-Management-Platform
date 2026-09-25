# Apartment Management Application - Reference APK Instructions

## Purpose

The provided APK is a reference application for the Apartment Management Platform. It is intended to help review the expected user experience, screen organization, workflows, navigation patterns, role concepts, and feature coverage before development begins.

The APK should be treated as a functional and visual reference only. It is not the final production architecture and should not be used as the direct technical foundation for the complete product.

## Step 1 - Install the reference APK

1. Copy `Apartment_Management_Reference.apk` to an Android device.
2. Open the APK on the device.
3. If Android blocks installation, allow installation from the selected file manager or browser when prompted.
4. Complete installation and launch the application.
5. Review the application on a normal Android device before beginning implementation work.

## Step 2 - Review the complete application

Review every available screen, menu, role, and workflow. Pay particular attention to:

- Dashboard and summary information
- Residents and homes
- Tenant/rental workflows
- Maintenance requests
- Payments and accounts
- Visitor and gate operations
- CCTV and security concepts
- Amenities
- Notices and meetings
- Chat and communication
- Staff and vendor management
- Documents
- Reports
- Role-based screen differences
- Navigation and mobile usability

The purpose of this review is to understand the expected product behavior and identify the features that should be carried into the new implementation.

## Step 3 - Prepare a feature review before coding

Before implementation begins, prepare a short review containing:

1. Features that should be retained.
2. Features that require improvement or redesign.
3. Features that belong in the resident/tenant mobile application.
4. Features that should be restricted to the Super Admin web console.
5. Missing workflows or features that should be proposed.
6. Mobile usability improvements.
7. Areas currently represented as demonstration/static behavior that will require real backend/API implementation.

Major functional additions or architectural changes should be proposed for review before implementation.

## Step 4 - Follow the approved target architecture

The final Apartment Management Platform should be implemented as separate, maintainable application components:

- Android/iOS mobile application for residents and tenants
- Web-based Super Admin console
- Backend API services
- Database

The reference APK should be used to understand product behavior and workflow only. Do not reproduce the complete application as a single embedded WebView solution.

## Step 5 - Mobile application implementation

The mobile application should be developed using the approved mobile framework and should support both Android and iOS from a maintainable shared codebase.

During implementation:

- Build reusable screens and components.
- Separate UI, application state, API communication, and business logic.
- Do not hard-code operational data that should come from the backend.
- Implement loading, empty, success, and error states.
- Ensure navigation works correctly on physical mobile devices.
- Keep role-based behavior aligned with backend authorization.

## Step 6 - Super Admin web console

Administrative functions intended for the owner/Super Admin should be implemented in the web console rather than exposing unnecessary administrative controls in the resident application.

The web console should ultimately manage the approved administrative areas such as users, residents, homes/units, operational records, notices, complaints, reports, and configuration as defined by the project requirements.

## Step 7 - Backend and database integration

Static or demonstration data visible in the reference APK should not be treated as production data.

The final application should retrieve and persist operational information through authenticated backend APIs and the approved database.

The backend must be responsible for:

- Authentication
- Authorization and role permissions
- Input validation
- Data persistence
- Business rules
- Audit-relevant operations
- Controlled error responses

Frontend visibility must not be used as the security boundary.

## Step 8 - Development workflow

Use the assigned company Git repository and follow the approved branch and review process.

Recommended flow:

`feature branch -> local development -> testing -> commit -> push -> pull request -> review`

Do not commit passwords, API keys, database credentials, production data, or real `.env` files.

## Step 9 - Testing expectations

At minimum, verify:

- Application startup
- Navigation across all implemented screens
- Role-based access
- Authentication behavior
- API success and failure handling
- Form validation
- Backend authorization
- Database persistence
- Responsive/mobile layout
- Android device behavior
- Regression of previously completed modules

An installable Android test build should be produced at the appropriate development milestone.

## Step 10 - Progress reporting

Each progress update should contain:

- Work completed
- Modules/files changed
- Features implemented
- Tests performed
- Issues identified
- Issues resolved
- Open blockers
- Git branch/commits
- Next planned work
- Support required

## Initial deliverable

Before major implementation begins, provide:

1. Confirmation that the reference APK was installed and reviewed.
2. A feature/workflow review based on the APK.
3. A proposed implementation breakdown for mobile, Super Admin web, backend, and database.
4. Any questions, assumptions, or improvement proposals requiring approval.

Once the initial review is approved, proceed with implementation according to the project execution guide and assigned development plan.
