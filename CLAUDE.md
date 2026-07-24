# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js development server at `http://localhost:3000`.
- `npm run build` — create a production build. This project uses `next.config.ts` with `output: 'standalone'`.
- `npm run start` — run the built production server.
- `npm run lint` — run ESLint.

There is no test script in `package.json` yet. Do not claim tests passed unless a test runner has been added or you ran a concrete verification command. For type/build verification, use `npm run build`; for lint verification, use `npm run lint`.

## Project overview

This is a Next.js App Router application for employee device checking. It uses React 19, Next.js 16, TypeScript strict mode, Tailwind CSS 4, Radix UI primitives, Sonner toasts, Recharts, React Hook Form, Mongoose/MongoDB, and Consul-backed configuration.

The app is organized around these flows:

- Dashboard and reports: client pages fetch statistics and report data from `/api/statistics` and `/api/device-checks/last-check-report`.
- Device checks: `/form` creates checks; `/data-pengecekan` and detail pages read/update check records.
- Employees: `/karyawan` pages manage employee records and imports.
- Auth: `/login` authenticates against an external attendance API, syncs an app user, and stores a session cookie.

## Architecture

- `src/app/` contains App Router pages and API route handlers. Most UI pages are client components using service wrappers from `src/lib/services/`.
- `src/app/api/**/route.ts` contains server route handlers. Protected handlers call `requirePermission(request, '<permission>')` before database work.
- `middleware.ts` protects non-public pages, redirects unauthenticated users to `/login?next=...&reason=auth`, skips static assets/presentation paths, and lets API routes handle auth themselves.
- `src/lib/auth/` contains auth config, external auth calls, session encode/decode, permission mapping, guards, and app-user sync.
- `src/models/` contains Mongoose models: `Employee`, `DeviceCheck`, `DropdownOption`, and `AppUser`.
- `src/lib/mongodb.ts` gets `MONGODB_URI` from Consul via `src/lib/consul.ts`, falls back to the environment, validates the URI prefix, and caches the Mongoose connection globally.
- `src/lib/services/` contains browser-facing fetch wrappers and TypeScript interfaces for employees, device checks, and dropdown options.
- `src/components/layout/` contains shared shell and page surface primitives; `src/components/ui/` contains reusable Radix/Tailwind UI primitives.
- `src/contexts/LanguageContext.tsx` provides `en`/`id` translation lookup from `src/lib/translations.ts` and persists language in localStorage.
- `src/lib/utils/` contains normalization, logo, PDF, and report export helpers.

## Data model notes

- `DeviceCheck` stores an `employeeSnapshot` beside `employeeId` so historical checks retain employee identity fields.
- `DeviceCheck` auto-increments `version` per employee in a pre-save hook.
- `DeviceCheck` post-save/delete hooks update `Employee.totalDeviceChecks` and `Employee.lastCheckDate`.
- Employee names are normalized into `fullName` in the `Employee` pre-save hook.
- Dropdown suggestions are persisted through `DropdownOption` usage counts when checks are created.

## Auth and permissions

Roles are `admin`, `pic`, and `viewer`.

- `admin`: dashboard, checks view/create/edit/delete, reports, employees view/manage, docs.
- `pic`: dashboard, checks view/create/edit, reports, employees view, docs.
- `viewer`: dashboard, checks view, reports, employees view, docs.

Navigation visibility in `AppShell` mirrors these broad role capabilities, while API handlers enforce exact permissions with `requirePermission`.

Session cookie name is `device_checking_session`; default TTL is 8 hours. Auth config comes from environment variables in `src/lib/auth/config.ts`.

## Configuration

Runtime configuration can come from Consul or environment variables.

Important variables used by the code:

- `MONGODB_URI`
- `CONSUL_HOST`
- `CONSUL_PORT`
- `CONSUL_TOKEN`
- `EXTERNAL_AUTH_BASE_URL`
- `EXTERNAL_AUTH_LOGIN_PATH`
- `EXTERNAL_AUTH_PROFILE_PATH`
- `APP_SESSION_SECRET`
- `APP_AUTH_DEFAULT_ROLE`
- `APP_AUTH_AUTO_SYNC`

Do not read or print `.env*` files. If credentials are needed, ask the user.

## Repository workflow notes

Project-local task files exist:

- `todo.md`
- `log.md`
- `tasks/lessons.md`

When following this repository's established workflow, read `todo.md` and `tasks/lessons.md` before implementation, preserve old todo entries, and append execution summaries to `log.md` using the existing format.
