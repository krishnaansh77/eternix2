# Project Handoff — Aarogyam AI

This document tracks work done in v0 so the next session can continue without starting over.
Update this file whenever you complete meaningful work.

Last updated: 2026-09-12

## Current Status

Auth and the first Neon-backed dashboard data layer are operational. The seeded doctor account remains:
- Email: `admin@aarogyam.ai`
- Password: `Aarogyam@123`
- Role: `DOCTOR` (there is no separate ADMIN role)

## Completed in this task

- Created Neon `app_users` table for application accounts.
- Added same-origin patient/doctor user routes:
  - `GET /api/users/patients` returns active patients connected to the signed-in doctor.
  - `GET /api/users/doctors` returns doctors for the signed-in patient.
  - `GET /api/users/:id` returns self or an actively connected user only.
- Added relationship request/decision routes backed by Neon:
  - `GET/POST /api/relationships/requests`
  - `PATCH /api/relationships/:id`
- Added session authorization checks and parameterized SQL queries.
- Fixed the patient modal compile issue by importing the existing `useMemo` dependency.
- Fixed preview database connectivity by preferring the provisioned Neon `POSTGRES_PRISMA_URL`/`POSTGRES_URL` variables over a stale localhost `DATABASE_URL`.
- Seeded and verified the doctor login account in Neon: `admin@aarogyam.ai` / `Aarogyam@123`.

## Database tables

- `app_users`
- `app_profiles`
- `app_relationships`

## Remaining dashboard work

- Verify the patient dashboard and doctor dashboard in-browser.
- Reimplement CBC report history/prediction endpoints and analytics against Neon or a safe server-side fallback.
- Verify Stripe checkout wiring.

## Conventions

- Do not rely on the Java backend at `127.0.0.1:8080` in v0.
- Keep API routes same-origin and use `getSession()`.
- Keep all SQL parameterized and scope user data by the session user id.
- Apply Neon DDL one statement per Neon MCP call.
