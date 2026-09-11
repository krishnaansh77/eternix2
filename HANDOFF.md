# Project Handoff — Aarogyam AI

This document tracks work done in v0 so the next session can continue without starting over.
Update this file whenever you complete meaningful work.

Last updated: 2026-09-12

## Project Overview

**Aarogyam AI** is a clinical health platform. Two pieces originally existed:

- **Frontend** — this Next.js 16 app (App Router). Login/signup, doctor & patient
  dashboards, patient records, CBC blood-report diagnosis, analytics, Stripe checkout.
- **Original backend** — a separate **Java Spring Boot + PostgreSQL** server under
  `/backend`, plus a Python ML service for CBC predictions. This backend is **NOT
  reachable inside v0** (`127.0.0.1:8080` points at the browser's own machine, and
  there is no Java/Postgres/SMTP runtime in the v0 preview).

## The Original Problem

Login / create account showed **"Failed to fetch"**. This was a network error, not a
credentials error — the frontend was POSTing to `http://127.0.0.1:8080/api/auth/...`
which does not exist in v0. There was also **no admin role or seeded account** anywhere
(only `DOCTOR` and `PATIENT` roles), and the Java backend blocked login until email
was verified.

## What Has Been Done (Auth — COMPLETE)

Auth was reimplemented as **same-origin Next.js API routes** backed by the connected
**Neon** database. Decisions confirmed with the user:
- Rebuild auth in Next.js + Neon
- Auth first, then expand
- Auto-verify on signup (no email verification wall)

### Database (Neon)
- Table `app_users` created via Neon MCP:
  - `id UUID PK default gen_random_uuid()`
  - `name TEXT NOT NULL`
  - `email TEXT NOT NULL UNIQUE`
  - `password_hash TEXT NOT NULL`
  - `role TEXT NOT NULL CHECK (role IN ('DOCTOR','PATIENT'))`
  - `email_verified BOOLEAN NOT NULL DEFAULT TRUE`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `DATABASE_URL` is already available in the project env (Neon integration).

### Seeded account (there is no "admin" role — this is a DOCTOR)
- **Email:** `admin@aarogyam.ai`
- **Password:** `Aarogyam@123`

### Files created
- `lib/db.ts` — Postgres client (uses `DATABASE_URL`)
- `lib/session.ts` — signed JWT session helpers, set/read/clear httpOnly cookie
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/verify-email/route.ts`
- `app/api/auth/resend-verification/route.ts`

### Files modified
- `lib/api.ts` — base URL changed from `http://127.0.0.1:8080` to **same-origin**.

### Key implementation notes
- Passwords hashed with **bcrypt**.
- Session = **signed JWT in an httpOnly cookie**, set with `SameSite=None; Secure`
  so the cookie survives the v0 cross-site preview iframe. **Do not weaken this** or
  login will appear to silently fail in the preview.
- Accounts are **auto-verified on signup**; the verify-email / resend endpoints exist
  to satisfy the frontend contract but do not block login.
- Endpoints match the exact frontend contract in `lib/api.ts`, `components/auth/
  auth-provider.tsx`, `app/signup/page.tsx`, and `app/verify-email/page.tsx`
  (roles `DOCTOR`/`PATIENT`, `remember` flag, etc.).

### Verified
- Login flow tested in-browser with the seeded account → session created, doctor
  dashboard loads as "Dr. Aarogyam Admin". "Failed to fetch" is gone.

## What Is NOT Done Yet (remaining work)

The dashboard still shows "The request could not be completed." for **non-auth**
endpoints that still point at the old Java backend. These need to be reimplemented on
Neon (same pattern as auth) before the dashboard fully populates:

- **Patients** — list/create/get patient records
- **Relationships** — doctor ↔ patient linking
- **Reports** — CBC blood reports + the ML/diagnosis prediction (the original relied on
  a Python ML service; decide whether to stub, reimplement, or call an external model)
- **Analytics** — whatever the analytics views consume
- **Stripe checkout** — verify whether it works or needs wiring to the Stripe integration

Suggested approach for the next session:
1. Read `lib/api.ts` to enumerate every remaining endpoint + payload shape.
2. Create Neon tables for each domain (via Neon MCP, one statement per call).
3. Add matching `app/api/**` routes, scoping every query by the session user id
   (`lib/session.ts` already exposes the current user).
4. Verify each dashboard view in-browser.

## Conventions / Gotchas

- **Do not** try to run or rely on the Java `/backend` — it cannot run in v0.
- Schema/DDL changes go through the **Neon MCP**, one SQL statement per call.
- Keep all new backend logic as same-origin Next.js route handlers / server code.
- Never guess DB columns — check the live schema before writing queries.
