---
trigger: always_on
---

Project: Momnt, a verified photography platform for Pakistan (final year project).
Stack: Next.js (App Router) + TypeScript, Tailwind, shadcn/ui, Supabase (Postgres, Auth, Storage, RLS), Resend for email, deployed on Vercel.

Rules:
1. The frontend UI is built by my partner. Do NOT restyle or restructure existing components. Only connect them to real data, minimal changes.
2. Backend code goes in: lib/ (supabase clients, helpers, validators), app/api/ (route handlers), server actions next to the feature, supabase/migrations/ (all SQL).
3. Every database change is a new numbered SQL migration file. Never edit old migrations.
4. Every table gets Row Level Security enabled with explicit policies. No table is ever left open.
5. Never expose the service role key to the client. Use it only in server code.
6. Validate all inputs with zod on the server. Never trust client-calculated values.
7. Use generated Supabase types (supabase gen types typescript) in lib/database.types.ts.
8. Never commit .env files. Keep .env.example up to date with variable names only.
9. Roles: client, agency, photographer, vendor, admin. Admin accounts are created manually.
10. Before big changes, show a plan. After changes, list files changed and how to test.