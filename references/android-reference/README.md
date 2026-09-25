# Apartment Management Reference Source

## Purpose
This package provides editable Android reference source for the Apartment Management Platform. It is intended to help the development team review the current reference interface, understand the available workflows, and use the application as a functional/visual reference while implementing the approved platform architecture.

This reference application is not the final production architecture. The target platform remains a resident/tenant mobile application, a Super Admin web console, backend APIs, and a database.

## Main editable UI file
`app/src/main/assets/index.html`

Most visible screens, demonstration data, interface styling, and client-side interactions in this reference application are contained in this file.

## Open in Android Studio
1. Extract this source package.
2. Open the extracted folder in Android Studio.
3. Allow Gradle sync to complete.
4. Use an Android emulator or a connected Android test device.
5. Run the `app` configuration.

## Reference web UI
A browser-review copy is also available under:
`reference-web-ui/index.html`

It may be opened through a simple local HTTP server for UI inspection.

## Development guidance
Use this source to study the current feature grouping, navigation, terminology, role concepts, and user workflows. Implement approved functionality in the maintainable mobile + web + backend + database architecture defined in the project execution guide.

Do not place real resident information, production credentials, API secrets, or database passwords in this reference source.
