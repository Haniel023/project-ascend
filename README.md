<div align="center">

# Project Ascend

**A fitness tracker disguised as an RPG — and an RPG that only levels up when you actually train.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-SQLite-C5F74F?style=flat-square)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-333333?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-142_tests-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square)

</div>

---

## What is this?

Most fitness apps log sets. Most RPGs hand out XP for showing up. Project Ascend refuses to let those be the same thing.

Every rep you log runs through an **anti-gaming XP engine** that only rewards genuine, balanced training — spam one muscle group and returns diminish fast; neglect the rest of your body and your XP multiplier collapses with it. Level up, and the game doesn't just paint a bigger number: it *pushes your training itself* to get harder, generates weekly bosses out of your own program, and wraps daily sessions in a themed dungeon run — all while the numbers underneath stay honest.

No pay-to-win. No grinding for currency. No permanent power creep. Progress here is a mirror, not a shortcut.

## Highlights

**Core training loop**
- Custom workout plans with flexible day-splitting (Push/Pull/Legs — not tied to calendar weekdays)
- Progressive overload suggestions triggered automatically on rank-up
- Personal-record (1RM) tracking with per-exercise progress charts
- Full body-stat history, boss history, and lifetime workout analytics

**The anti-gaming XP engine**
- `rawXp × diminishing (per muscle group/day) × coverage (7-day balance window) × recovery × equipment`, capped daily, baked into an append-only ledger at write time — never retroactively recalculated
- XP genuinely requires *balanced* training, not just volume

**Recovery System**
- A 6-tap daily check-in (sleep, hydration, energy, soreness, stress, mood) computes a 0-100 recovery score
- That score becomes a real XP multiplier (0.9x-1.1x) on the very next workout — encouraging, never punishing

**Dungeon Runs**
- A themed daily bundle generated from your own plan: story flavor, difficulty (= your current rank), an XP estimate, and a rotating focus on whichever muscle group you've trained least recently
- Entirely a *wrapper* — completing a dungeon logs through the exact same pipeline as a normal workout

**Weekly Bosses & Achievements**
- A boss generated from your split each week, defeated by hitting a required set count in its focus muscle groups
- Milestone achievements across streaks, rank, volume, and balance

**Equipment**
- 30 hand-written items across 6 slots and 5 rarities, earned only from dungeons, boss defeats, and achievements
- Small, capped bonuses (+/-1-7% XP, +15% hard ceiling per category) — equipment nudges the numbers, it never replaces the work
- Time-boxed by design: equip a Common-Epic item and its bonus expires in 7 days; **Mythic drops are the one permanent exception**

**Quality of life**
- Full account settings, JSON data export, opt-in browser notifications, an evening "you haven't logged yet" nudge
- Installable PWA with offline fallback

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack, Server Actions) |
| Language | TypeScript, strict mode |
| Database | SQLite via [`@libsql/client`](https://github.com/tursodatabase/libsql-client-ts) — portable to Postgres later |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Auth.js v5](https://authjs.dev) (Credentials provider, JWT sessions) |
| UI | Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com) |
| Animation | [Motion](https://motion.dev) |
| Charts | [Recharts](https://recharts.org) |
| Forms & validation | React Hook Form + [Zod](https://zod.dev) |
| Testing | [Vitest](https://vitest.dev) — 142 tests over the pure game-logic layer |

## Getting started

### Prerequisites
- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/Haniel023/project-ascend.git
cd project-ascend
npm install
```

Create a `.env.local` from the example and fill in the two values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Local SQLite file, e.g. `file:./drizzle-data/ascend.db` |
| `AUTH_SECRET` | Any random string — generate one with `npx auth secret` |

Then set up the database and start the app:

```bash
npm run db:migrate   # apply the schema
npm run db:seed      # seed exercises, quests, achievements, equipment
npm run dev           # http://localhost:3000
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm test` | Run the full Vitest suite |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a new Drizzle migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |
| `npm run db:seed` | Seed catalog data (exercises, quests, achievements, equipment) |

## Project structure

```
src/
├── app/                      # Next.js App Router
│   ├── (app)/                #   authenticated routes (dashboard, log, plans, equipment, ...)
│   ├── (auth)/                #   login / signup
│   └── api/                  #   route handlers (data export)
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── rpg/                   # game-flavored UI (XP bars, boss cards, dungeon cards, ...)
│   └── pwa/                   # service worker / notification opt-in
├── server/
│   ├── db/                    # Drizzle schema, migrations, seed data
│   ├── game/                  # framework-free pure game logic (XP formulas, recovery,
│   │                          #   dungeons, equipment, bosses) + its own Vitest suite
│   ├── actions/                # Server Actions (mutations)
│   ├── queries/                # read-only data fetchers for pages
│   ├── validation/             # Zod schemas
│   └── auth/                   # Auth.js config + session verification (the real access gate)
└── proxy.ts                    # optimistic auth redirect (Next 16's renamed middleware)
```

The `server/game/` layer is deliberately kept free of DB and framework imports — every formula that decides how much XP a set is worth, how a recovery score is computed, or how equipment bonuses stack is a plain, independently-testable function.

## Roadmap

| Phase | Feature | Status |
|---|---|---|
| 0 | Settings, body-stat history, PR tracking, boss history | Shipped |
| 1 | Recovery System | Shipped |
| 1.5 | Notifications & reminders (opt-in, in-app) | Shipped |
| 2 | Dungeon Runs | Shipped |
| 3 | Equipment | Shipped |
| 4 | Skill Tree | Planned |
| 5 | Character Customization | Planned |
| 6 | Milestone Animations | Planned |
| 7 | Dynamic Home Screen | Planned |
| 8 | Lifetime Statistics | Planned |
| 9 | Prestige System | Planned |

## Design principles

A few rules this project holds itself to, carried through every feature above:

- **Balance over volume.** XP requires genuinely spreading training across muscle groups — no single lift can be farmed for outsized reward.
- **No permanent power creep.** Any bonus that boosts XP is small, capped, and — with the sole exception of Mythic-tier equipment — time-limited.
- **Numbers stay honest.** Every XP grant is written once to an append-only ledger, multipliers baked in at the moment they're earned, never retroactively recalculated.
- **The game never blocks the workout.** Recovery, dungeons, and quests all layer *on top of* logging a set — none of them can prevent it.
