# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A grade-lookup web app: students log in to see their own scores/GPA; instructors
upload an Excel file to update grades and view distribution dashboards. Vite
React SPA + Netlify Functions + Netlify Blobs, deployable to Netlify with no
separate database.

## Commands

```bash
npm install
npm run dev        # netlify dev — serves SPA + Functions + local Blobs (needs Netlify CLI)
npm run dev:vite   # frontend only; /api/* calls will 404
npm run build      # tsc -b && vite build → dist/
npm run typecheck  # type-checks BOTH the app and netlify/functions
npm run preview
```

There is no test runner configured. Backend logic (auth tokens, the Excel upload
parser, login/me/data flows) is verified by bundling the function `.ts` with
esbuild against a stubbed `@netlify/blobs` and the real `Tong_ket_diem_thi.xlsx`
— see the git history / scratchpad for the harness pattern if you need to re-run
it. `netlify dev` is the way to exercise the real stack end-to-end.

## Architecture

**Two halves that share no code** — the frontend (`src/`, alias `@/`) and the
functions (`netlify/functions/`, relative imports, Node runtime). Grade logic is
intentionally duplicated conceptually: the letter-grade scale lives only in
`src/lib/grades.ts` (client-side; GPA is pre-computed in the data and never
recalculated).

**Data flow.** The source of truth is a single JSON blob (`grades/dataset`) in
Netlify Blobs. On read, if the blob is absent the functions fall back to
`netlify/functions/_data/seed.json` — a normalized dump of the original Excel —
so the app works immediately after deploy, before any upload. Instructor upload
parses the `.xlsx` and overwrites the blob (`netlify/functions/_lib/store.ts`).

**Auth.** Stateless HMAC-signed tokens (`netlify/functions/_lib/auth.ts`), 12h
TTL, signed with `AUTH_SECRET`. Login (`login.ts`) issues a token; every
protected function re-verifies the bearer token and checks `role`. Privacy is
enforced server-side: `me.ts` returns only the caller's own record (student
token carries `studentId`); `data.ts` (full dataset) and `upload.ts` require an
`instructor` token. The frontend stores the session in localStorage
(`src/lib/api.ts`) and guards routes with `ProtectedRoute` + `AuthContext`.

**Excel parsing** (`upload.ts`) is header-driven: it finds the row containing
"Mã sinh viên", then maps columns by *normalized* header name (diacritics/case
stripped) via `COLUMN_MAP`. Adding/renaming a grade column means updating both
`COLUMN_MAP` here and the display in `src/lib/grades.ts` (`GRADE_WEIGHTS`) +
`src/lib/types.ts`.

**Credentials.** Instructor: `INSTRUCTOR_USER`/`INSTRUCTOR_PASS` env
(default `VKH100880`/`VKH100880`). Student: `studentId` + `dob` (YYYYMMDD)
matched against the dataset.

**Routing** (`src/main.tsx`): `/login`, `/sinh-vien` (student, guarded),
`/giang-vien` (instructor, guarded). SPA fallback + `/api/*` → functions rewrite
are in `netlify.toml`.

## Regenerating the seed

`seed.json` was generated from `Tong_ket_diem_thi.xlsx` with openpyxl (Python).
The field mapping must stay identical to `StoredStudent` in `store.ts` and the
`upload.ts` parser output, otherwise seed vs. uploaded data diverge in shape.

## UI

Read `STYLE.MD` at project root before generating or editing any UI code — it is
the binding design/stack contract (React 18 + Vite, Tailwind semantic tokens,
vendored shadcn/ui in `src/components/ui/`, Vietnamese UI, light+dark). Never
hardcode colors, use `next/*` APIs, or use `alert()/confirm()`.
