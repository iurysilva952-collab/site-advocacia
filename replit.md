# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Full-stack law firm website and internal management system.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + Framer Motion + Recharts
- **Session**: express-session (cookie-based auth)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### law-firm (React + Vite, preview path: /)
Full law firm website with:
- **Public site**: Landing page, blog, WhatsApp button, testimonials, team, practice areas
- **Admin area**: Dashboard, client management, case/process management with timeline, blog management, lawyer workload, notifications
- Admin login: admin@silva.com / admin123

### api-server (Express 5, preview path: /api)
REST API with routes for: auth, lawyers, clients, cases, timeline events, blog posts, notifications, dashboard stats.

## Database Schema

Tables: lawyers, clients, cases, timeline_events, blog_posts, notifications

## Admin Credentials
- Email: admin@silva.com
- Password: admin123

## Important Notes
After codegen, fix lib/api-zod/src/index.ts to only export from ./generated/api (codegen generates duplicate exports).
