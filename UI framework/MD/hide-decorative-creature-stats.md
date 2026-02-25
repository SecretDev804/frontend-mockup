# Hide Stats on Decorative Creatures

## Feature Overview

**Status:** ✅ Implemented — 2026-02-19

---

## Background

From client feedback (Slack):

> "Can we take the stats off of decorative creatures on the portal?
> It might confuse users… let me know ty! :D"

**Interpretation:** Hide the numerical stats (Munchiez %, delivery progress, lifecycle
milestones) that are irrelevant for decorative creatures — NOT remove decorative creatures
from the page. Decorative creatures have frozen/static stats, so displaying Munchiez bars
or delivery countdowns is misleading to users.

---

## What Changed

### Creatures List Page — `/creatures`

- The entire mini-stats row (Age + Munchiez) is **hidden for decorative creatures**
- **Munchiez %** is also hidden for dead non-decorative creatures (irrelevant once deceased)
- Dead non-decorative creatures show Age only
- Alive non-decorative creatures show Age + Munchiez (unchanged)
- The footer text (e.g. "Forever Beautiful — Stats frozen", "Died: starvation") was already correct; no change

### Creature Detail Page — `/creatures/[id]`

Three changes applied:

1. **Munchiez bar** — The Munchiez label, percentage value, and progress bar are hidden
   for decorative creatures in the left profile card

2. **Lifecycle steps** — Decorative creatures now show a two-step summary:
   - *Birth* — with birth date
   - *Stats Frozen* — with a contextual message:
     - Eternalz: "Eternal Life — this creature never ages or requires food"
     - All other decoratives: "This is a decorative creature — its stats do not change over time"
   - Normal creatures continue to show all four lifecycle milestones unchanged
     (Birth → First Delivery → Maturity → End of Life)

3. **Deliveries tab** — Hidden entirely for decorative creatures. Tab bar shows only
   **Stats** and **Breeding** for decorative creatures; all three tabs for normal creatures.

---

## Files Modified

| File | Change |
|------|--------|
| `app/(dashboard)/creatures/CreaturesContent.tsx` | Hide Munchiez span on decorative creature cards |
| `app/(dashboard)/creatures/[id]/CreatureDetailContent.tsx` | Hide Munchiez bar; replace lifecycle steps; hide Deliveries tab |

## Files NOT Changed

| File | Reason |
|------|--------|
| `components/creatures/CollectionCard.tsx` | Already correctly hides Munchiez for `is_decorative` |
| `app/(dashboard)/collection/CollectionContent.tsx` | No raw stat values; delegates to CollectionCard |

---

## Verification

1. `/creatures` list:
   - Decorative creature card → **no mini-stats row** at all (no Age, no Munchiez)
   - Dead non-decorative card → shows **Age only**, no Munchiez %
   - Alive non-decorative card → shows **Age + Munchiez %** (unchanged)
2. `/creatures/[id]` for a decorative creature:
   - Profile card: no Munchiez row or progress bar
   - Stats tab: shows **Birth** + **Stats Frozen** steps only
   - Tab bar: only **Stats** and **Breeding** tabs visible
3. `/creatures/[id]` for a normal alive creature — all stats, all three tabs, and full
   lifecycle steps remain unchanged

---

## Implementation Date

2026-02-19

## Implemented By

Thomas (Tien) via Claude Code
