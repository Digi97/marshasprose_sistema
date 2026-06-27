# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Create React App (CRA) single-page app for "Marsha's Prose" — a Costa Rican accounting / electronic invoicing system (facturación electrónica, presupuestos, gastos, clientes/proveedores, integración con Hacienda). There is no backend in this repo; the app is a pure REST client talking to a separate API.

## Commands

- `npm start` — run the dev server (CRA, port 3000).
- `npm run build` — production build to `build/`.
- `npm test` — Jest in CRA watch mode. For a single non-watch run: `CI=true npm test`. For a single file/test name: `npm test -- src/App.test.js` or `npm test -- -t "test name"`.
- There is no separate lint script; ESLint runs as part of `start`/`build` via the `eslintConfig` block in [package.json](package.json) (`react-app`, `react-app/jest`). `_old.eslintrc.json` is legacy/unused — the active config is the one in `package.json`.

## Architecture

### Entry and routing
- [src/index.js](src/index.js) bootstraps i18next (resources are two static JSON files, [src/assets/lang/english.json](src/assets/lang/english.json) and `spanish.json`, language auto-detected) and renders [src/App.js](src/App.js).
- `App.js` is the top-level router. Public routes: `/`, `/otp`, `/recovery`, `/change-password`. Everything under `/home/*` is gated: if `sessionStorage.sessionId` is absent it redirects to `/`, otherwise it mounts [src/Admin.js](src/Admin.js) (the authenticated shell).
- `Admin.js` renders the Sidebar/Navbar/Footer chrome and a nested `<Routes>` for screens. Nav-visible module routes come from [src/routes.js](src/routes.js); a long second batch of routes (all the `Settings/Maintenance/*` catalog screens, `BudgetDetail`, `BudgetPerYear`, `Profile`) is hardcoded directly in `Admin.js` and is **not** filtered by permission at the route level — only the sidebar entries built from `routes.js` are permission-filtered. Keep this asymmetry in mind: hiding a nav item does not block direct navigation to its route.

### Auth flow
- Login (`screen/components/Auth/Login.js`) posts credentials, then AES-encrypts (`crypto-js`, key `"@marsh_contable"`) the returned user payload into `sessionStorage.user`, stores `sessionStorage.sessionId`, and redirects to `/otp`.
- OTP (`screen/components/Auth/OTP.js`) decrypts the stored user, posts the 6-digit code, sets `sessionStorage.otp_valid`, and redirects to `/home/`.
- `routes.js` decrypts `sessionStorage.user` again to read `user.permisos` (an array of numeric permission ids) and filters the sidebar against `ROUTE_PERMISSIONS`, whose ids mirror [src/permission.json](src/permission.json).

### API layer
- [src/screen/components/services/api.js](src/screen/components/services/api.js) exports the hardcoded API base `url` (a LAN IP, with alternates commented out) — there's no `.env`-based environment switching; swapping environments means editing this file.
- [src/AppUtil/AppUtil.js](src/AppUtil/AppUtil.js) is the shared Axios client: `getAPI`/`postAPI`/`putAPI`/`deleteAPI` all attach an `X-Session-Id` header read from `sessionStorage` at module load time, and on a 401 they set `sessionStorage.expired` and hard-redirect to `/`. It also holds the form-validation helpers used everywhere (`isEmail`, `isValidPassword`, `isValidText` — allows accented Spanish text, `isNumberEntero`, `isNumeric`, `formatNumber`, `fileToBase64`).

### Screen conventions
- Most screens are React **class** components wrapped in i18next's `withTranslation()`.
- The ~18 files under `screen/components/Settings/Maintenance/` (currency, tax_type, payment_method, cabys_code, etc.) are near-identical CRUD catalog screens: a `datatables.net-react` `DataTable` listing rows, a `react-bootstrap` `Modal`+`Form` for create/edit, save via `AppUtil.postAPI`/`putAPI`, and an action column rendered through [src/screen/components/common/ActionButtons.js](src/screen/components/common/ActionButtons.js). When adding a new catalog/maintenance type, copy one of these files as the template rather than building from scratch.
- User feedback uses two parallel mechanisms: [common/SweetAlert.js](src/screen/components/common/SweetAlert.js) (a `sweetalert2-react-content` wrapper, used for most success/error popups, styled to render above Bootstrap modals) and [common/Toast.js](src/screen/components/common/Toast.js) (a `react-bootstrap` toast, used by a few screens like `Settings.js`).
- [src/screen/components/common/useDarkMode.js](src/screen/components/common/useDarkMode.js) is a hook toggling `data-bs-theme` + `localStorage`, consumed in both `App.js` and `Admin.js`.

### Imports
- [jsconfig.json](jsconfig.json) sets `baseUrl: src`, so absolute imports like `"screen/components/services/api"` or `"AppUtil/AppUtil"` work alongside ordinary relative imports (`../../../AppUtil/AppUtil.js`) — both styles are used interchangeably across the codebase. The `"common"` path alias in `jsconfig.json` points at a `screen/components/common/index.js` barrel file that does not currently exist — treat it as stale/aspirational, not a working alias.

### Domain vocabulary
Code and i18n keys mix Spanish domain terms throughout (most state/props are Spanish even when surrounding code is English): `factura` (invoice), `gasto` (expense), `presupuesto`/`gestion` (budget), `cliente`/`proveedor` (customer/provider), `empresa` (company settings), `cabys_code` (Costa Rica's CAByS product/service catalog used for e-invoicing), `hacienda` (Costa Rica's tax authority — see the Hacienda credentials and `.p12` invoice-signing key upload in `Settings.js`).
