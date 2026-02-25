# Collection Page & Alive Default Filter

## Feature Overview

**Status:** ✅ Implemented — 2026-02-19

---

## Background

From client discussion (Slack):

> "How difficult would it be to add something similar to a collection list to the portal?
> I am thinking would be best to have each thing listed and it would allow them to check off
> whether they own it or not. Does this makes sense? Possibly just a list they can choose from
> to put on a list of their collections? and so they can show it off as well? Just a thought.
>
> Also on the portal can you have it default to 'alive' creatures when we view the creatures?"

Developer response (Thomas/Tien):

> "It is good idea to add collection list. I'd add a page where users can browse all available
> creatures/items and mark what they own. We'd store that in the backend so they can show off
> their collection on their profile. I'll need a full list of collectible creatures/items to
> build this out.
>
> Regarding the alive creatures, I will make as default."

---

## Feature 1: Default Alive Filter

### Goal

When users navigate to the **My Creatures** page, it should default to showing only **alive**
creatures rather than all creatures.

### Requirements

- The creatures page must load with `is_alive: true` filter active by default
- Users can manually change the filter to view dead / all creatures at any time
- Must not break existing filter, sort, or pagination behaviour

### Implementation

- **File:** `contexts/CreatureContext.tsx`
- **Change:** Initialize `filters` state with `{ is_alive: true }` instead of `{}`
- The `CreatureFilters` component reflects this as "Alive" selected in the Status dropdown on
  first render

---

## Feature 2: Collection Page

### Goal

A dedicated `/collection` page where users can browse **all** their creatures (alive and
deceased) organised by type, mark favourites for a personal **Showcase**, and eventually share
their public collection on their profile.

### Requirements

1. Browse all owned creatures (alive + dead) in one paginated grid
2. Filter by creature type — tabs: All, Goobiez, Fuggiez, Friend, Family, Stranger, Babiez, Forever
3. Filter by status — All / Alive / Dead chips
4. **Showcase** — star any creature to pin it at the top of the view; stars persist across
   sessions
5. Summary stats banner: Total · Alive · Beyond · Showcased
6. **Share Collection** button (placeholder — pending public profile backend feature)
7. Each card links to the full creature detail page
8. Page is auth-protected (requires logged-in session)

### Technical Approach

| Concern | Decision |
|---------|----------|
| Route | `/collection` (dashboard route group) |
| Data fetch | Independent `useCollectionCreatures` hook — does **not** share `CreatureContext` to avoid filter-state collision with My Creatures page |
| Filter scope | Fetches all creatures with **no** status filter (`is_alive` unset), sorted by `creature_type asc`, `pageSize: 100` |
| Type / status filtering | Client-side from the fetched list |
| Showcase persistence | `localStorage` key `goobiez_collection_featured` (array of creature_id strings) — designed to swap to a backend API when ready |
| Pagination | Not added initially (100 creature fetch covers most accounts); add if needed |

### Files Created

| File | Purpose |
|------|---------|
| `hooks/useCollectionCreatures.ts` | Custom hook — fetches all user creatures sorted by type |
| `components/creatures/CollectionCard.tsx` | Compact card for collection grid with star toggle |
| `app/(dashboard)/collection/page.tsx` | Next.js route (server component + metadata) |
| `app/(dashboard)/collection/CollectionContent.tsx` | Main client component |

### Files Modified

| File | Change |
|------|--------|
| `contexts/CreatureContext.tsx` | Default filter → `{ is_alive: true }` |
| `middleware.ts` | Added `/collection` to protected prefixes and matcher |
| `components/layout/DashboardSidebar.tsx` | Added "Collection" nav item (Library icon) |

### Future Work

- Backend API for persisting showcase selections (`POST /collection/feature`)
- Public-facing shareable collection profile URL
- Master species catalog (Pokédex-style) — all possible species with owned vs not-owned
  tracking once client provides the full creature/item list
- Collection completion percentage per type

---

## Implementation Status

| Task | Status |
|------|--------|
| MD requirements saved | ✅ Done |
| Default alive filter | ✅ Done |
| /collection added to middleware | ✅ Done |
| Collection nav item in sidebar | ✅ Done |
| useCollectionCreatures hook | ✅ Done |
| CollectionCard component | ✅ Done |
| Collection page + content | ✅ Done |

---

## Implementation Date

2026-02-19

## Implemented By

Thomas (Tien) via Claude Code
