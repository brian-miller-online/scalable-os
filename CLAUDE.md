@AGENTS.md

# OwnerScore — Project CLAUDE.md

## What This Is
Standalone business operating system for 1-15 person service businesses. Weekly scorecard + priorities + huddle.

## Tech Stack
- Next.js 16 (App Router, Server Components + Server Actions)
- Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- Tailwind CSS + shadcn/ui
- Vercel (hosting)

## Supabase
- Project ref: `gjteceldqvlstohcirnu`
- URL: `https://gjteceldqvlstohcirnu.supabase.co`
- 8 tables: tenants, tenant_members, scorecard_metrics, scorecard_entries, weekly_priorities, meetings, events, trade_defaults
- RLS on all tables — tenant isolation via `user_tenant_ids()` SECURITY DEFINER function

## Key Patterns
- `proxy.ts` in `src/app/` handles auth (Next.js 16 pattern, NOT middleware.ts)
- Week starts on Monday. Use `src/utils/week.ts` for all week_start calculations.
- All dates use IANA timezone strings. Never raw `new Date()` for user-local time.
- Per-field auto-save on scorecard (no submit button)
- Mobile-first: 44px minimum touch targets

## API Keys
- Dedicated keys for this app only (not shared with ZehrNotebook, AI Bookkeeper, etc.)
- Keys in Vercel env vars, not Windows global env

## Routes
- `/scorecard` — Weekly Numbers (primary screen)
- `/priorities` — My Top 3
- `/huddle` — Weekly Huddle
- `/settings` — Team management, metric config
- `/onboarding` — 3-step new user flow
- `/login`, `/signup` — Auth pages
