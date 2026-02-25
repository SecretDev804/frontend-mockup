# VOREST (Virtual Forest) — Complete System Architecture

**Created:** February 23, 2026
**Updated:** February 25, 2026 (Implementation status added from Day 1+2 audit)
**Based on:** `Reference/2.23 discussion.txt` (Julian Ferreyra & Minkka Sirvel)
**Status:** Day 1+2 IMPLEMENTED — Day 3 pending (30-day inactivity, vbucks transactions)

---

## Context

The Goobiez project is a virtual pet game running in **Second Life (SL)** and a **Next.js web portal**, backed by **AWS Lambda + DynamoDB**. Per the **2.23 discussion** between Julian Ferreyra and Minkka Sirvel, a new feature called **Vorest (Virtual Forest)** is needed — a web-based ecosystem where creatures can live virtually, separate from Second Life. Creatures age, breed, eat, and die identically to in-world behavior, but exist purely in the portal. This is the **largest remaining feature** (marked HIGH complexity in the implementation roadmap).

### Requirements Summary (from `Reference/2.23 discussion.txt`)
1. Creatures live virtually in the web portal — same lifecycle as SL (age, hunger, breeding, death)
2. **Separate food systems** — Vorest food only works in Vorest, SL food only works in SL
3. **Creature transfer** — SL → Vorest via creature menu, Vorest → SL via Portal Rezzer dock
4. **Breeding isolation** — Vorest creatures breed only with Vorest, SL only with SL
5. **Dual currency** — GBP + Vbucks (purchased in-world with L$, spendable on web)
6. **30-day inactivity timeout** — SL inventory creatures marked "lost" after 30 days, owner gets 25% GBP refund
7. **Portal Rezzer** — separate LSL object for retrieving Vorest creatures back to SL

### Key Decisions (from gap analysis)
- **Boosters**: All 3 included in Vorest (Resurrect, Forever, Eternalz) — per Minkka's requirement
- **Decoratives**: Blocked from Vorest entirely
- **Breeding retrieval**: Blocked during active breeding — must cancel first
- **Migration**: Full 30-day grace from deployment date for all existing creatures

---

## 1. DATA LAYER (DynamoDB)

### 1.1 Modifications to Existing Tables

#### `goobiez-creatures` — Add Fields

**No separate Vorest creatures table.** Same table, new `location` field to track realm.

| Field | Type | Description | Impl Status |
|---|---|---|---|
| `location` | String | `'sl'` \| `'vorest'` \| `'sl_inventory'` \| `'lost'` — default `'sl'` | LIVE — read/written by 7+ Lambdas |
| `vorest_entered_at` | String | ISO timestamp when creature entered Vorest (null if not in Vorest) | LIVE — written by sendToVorest, cleared by retrieveFromVorest |
| `vorest_last_tick_at` | String | ISO timestamp of last Vorest tick processing (null if not in Vorest) | LIVE — written/read by processVorestStats, sendToVorest, retrieveFromVorest |
| `sl_last_heartbeat_at` | String | ISO timestamp of last SL heartbeat (for 30-day inactivity tracking) | LIVE (write only) — written by 3 Lambdas; 30-day read logic is Day 3 |
| `lost_at` | String | ISO timestamp when marked 'lost' (null otherwise) | DAY 3 — requires processInactivityTimeout Lambda |
| `lost_refund_points` | Number | GBP refund awarded on lost marking (null otherwise) | DAY 3 — requires processInactivityTimeout Lambda |

**Location state machine:**
```
sl ──────────────> vorest       [LIVE] (sendToVorest Lambda)
vorest ──────────> sl           [LIVE] (retrieveFromVorest Lambda)
sl ──────────────> sl_inventory [LIVE] (processCreatureStats — 10min heartbeat timeout)
sl_inventory ────> sl           [LIVE] (implicit — SL heartbeat resumes on rez)
sl_inventory ────> vorest       [LIVE] (sendToVorest accepts sl_inventory)
sl_inventory ────> lost         [DAY 3] (processInactivityTimeout — not yet implemented)
```

**Time accumulation by location:**
| Location | Time Source |
|---|---|
| `sl` | LSL heartbeat → `total_active_seconds` via `getCreatureStats` |
| `vorest` | `processVorestStats` scheduled Lambda advances `total_active_seconds` by wall-clock delta |
| `sl_inventory` | Paused — no accumulation |
| `lost` | Frozen — creature is dead |

#### `goobiez-users` — Add Fields

| Field | Type | Description | Impl Status |
|---|---|---|---|
| `vbucks` | Number | Vbucks balance, default 0 | LIVE — read by fetchVbucksBalance, decremented by purchaseVorestFood/Booster |
| `vbucks_total_purchased` | Number | Lifetime Vbucks purchased (audit) | DAY 3 — requires vbucks purchase Lambda (LSL→vbucks exchange) |

#### `goobiez-config` — Add Config Keys (16 total)

| config_key | value | Description | Impl Status |
|---|---|---|---|
| `vorest_enabled` | `true` | Feature toggle | SEEDED — toggle not enforced (always-on for MVP) |
| `vorest_food_total_feedings` | `12` | Feedings per Vorest food purchase | LIVE |
| `vorest_food_munchiez_per_feeding` | `30` | Munchiez restored per feeding | LIVE |
| `vorest_food_price_vbucks` | `50` | Vbucks cost per Vorest food | LIVE |
| `vorest_food_price_gbp` | `500` | GBP cost per Vorest food | LIVE |
| `vorest_tick_interval_minutes` | `5` | Scheduled tick frequency | SEEDED — schedule via EventBridge, not dynamic |
| `sl_inactivity_threshold_days` | `30` | Days before marking creature lost | SEEDED — Day 3 (processInactivityTimeout) |
| `sl_inactivity_refund_percent` | `25` | GBP refund % for lost creatures | SEEDED — Day 3 (processInactivityTimeout) |
| `vbucks_per_linden` | `1` | L$ to Vbucks conversion rate | SEEDED — Day 3 (LSL vbucks purchase) |
| `vorest_breeding_enabled` | `true` | Vorest breeding toggle | SEEDED — toggle not enforced (always-on for MVP) |
| `vorest_resurrect_price_vbucks` | `200` | Vbucks cost for Resurrect booster | LIVE |
| `vorest_resurrect_price_gbp` | `2000` | GBP cost for Resurrect booster | LIVE |
| `vorest_forever_price_vbucks` | `300` | Vbucks cost for Forever booster | LIVE |
| `vorest_forever_price_gbp` | `3000` | GBP cost for Forever booster | LIVE |
| `vorest_eternalz_price_vbucks` | `150` | Vbucks cost for Eternalz potion | LIVE |
| `vorest_eternalz_price_gbp` | `1500` | GBP cost for Eternalz potion | LIVE |

### 1.2 New Tables (4 total)

#### `goobiez-vorest-food` (NEW) — **Status: LIVE**

Separate from SL food (`goobiez-food`) — SL food has `sl_object_key`, `sl_region`, position data that don't apply to Vorest.
All fields written/read by purchaseVorestFood, consumeVorestFood, listVorestFood.

```
Partition key: food_id (String, UUID)

Fields:
  owner_key              String    SL avatar key
  name                   String    "Vorest Munchiez"
  total_feedings         Number    from config
  remaining_feedings     Number    decremented on feed
  munchiez_per_feeding   Number    from config
  is_depleted            Boolean   true when remaining_feedings <= 0
  total_feedings_given   Number    audit counter
  purchased_with         String    'vbucks' | 'gbp'
  purchase_price         Number    price at purchase time
  created_at             String    ISO timestamp
  updated_at             String    ISO timestamp
  last_feeding_at        String    ISO timestamp (nullable)
```

#### `goobiez-vbucks-transactions` (NEW) — **Status: DAY 3**

Mirrors `goobiez-points-transactions` pattern from `pointsHelper.mjs`.
Table schema defined but no Lambda writes to it yet. fetchVbucksBalance returns hardcoded empty transactions. Requires vbucks purchase Lambda + transaction recording in purchase Lambdas.

```
Partition key: transaction_id (String, UUID)

GSI: user_id-created_at-index (PK: user_id, SK: created_at)

Fields:
  transaction_id    String    UUID
  user_id           String    user ID
  user_uuid         String    owner_key (SL avatar key)
  type              String    'purchased' | 'spent'
  amount            Number    positive integer
  balance_after     Number    Vbucks balance after transaction
  source            String    'sl_purchase' | 'vorest_food_purchase' | 'vorest_booster_purchase' | 'admin'
  source_details    Map       {linden_amount, food_id, booster_id, etc.}
  created_at        String    ISO timestamp
```

#### `goobiez-creature-transfers` (NEW) — **Status: LIVE**

Audit log for all SL↔Vorest creature movements. Written by sendToVorest + retrieveFromVorest. Write-only audit log (no query Lambda).

```
Partition key: transfer_id (String, UUID)

GSI: creature_id-index (PK: creature_id)
GSI: owner_key-index (PK: owner_key)

Fields:
  transfer_id                        String    UUID
  creature_id                        String    creature being transferred
  owner_key                          String    owner at time of transfer
  direction                          String    'sl_to_vorest' | 'vorest_to_sl'
  status                             String    'completed' | 'pending_rez' | 'failed'
  sl_object_key                      String    (nullable) SL object key
  initiated_from                     String    'sl_menu' | 'web_portal' | 'portal_rezzer'
  total_active_seconds_at_transfer   Number    snapshot for audit
  created_at                         String    ISO timestamp
  completed_at                       String    ISO timestamp (nullable)
```

#### `goobiez-vorest-boosters` (NEW) — **Status: LIVE**

Separate from SL `goobiez-boosters` (which has `sl_object_key`, `sl_region`).
All fields written/read by purchaseVorestBooster, applyVorestBooster, listVorestBoosters.

```
Partition key: booster_id (String, UUID)

Fields:
  booster_id          String    UUID
  owner_key           String    SL avatar key
  booster_type        String    'resurrect' | 'forever' | 'eternalz'
  is_used             Boolean   false when purchased, true after applied
  purchased_with      String    'vbucks' | 'gbp'
  purchase_price      Number    price at purchase time
  applied_to          String    creature_id (nullable, set on use)
  created_at          String    ISO timestamp
  used_at             String    ISO timestamp (nullable)
```

---

## 2. IMPLEMENTATION STATUS (as of February 25, 2026)

### Day 1+2: COMPLETE

| Category | Count | Status |
|---|---|---|
| Backend Lambdas | 13 deployed | ALL OPERATIONAL |
| API Gateway Routes | 11 routes | ALL WIRED |
| DynamoDB Tables | 3 new tables created | vorest-food, vorest-boosters, creature-transfers |
| Frontend Pages | 6 pages + VorestContext | ALL FUNCTIONAL |
| Config Keys | 10 of 16 active | 6 seeded for Day 3 |

**Lambdas Deployed:**
sendToVorest, retrieveFromVorest, processVorestStats, backfillVorestMigration, listVorestCreatures, listVorestFood, listVorestBoosters, fetchVbucksBalance, purchaseVorestFood, purchaseVorestBooster, consumeVorestFood, applyVorestBooster, startVorestBreeding

**Frontend Pages:**
/vorest (dashboard), /vorest/creatures (list), /vorest/creatures/[id] (detail+feed+breed+actions), /vorest/shop (food+boosters), /vorest/transfer (send/retrieve), /vorest/breeding (redirect)

### Day 3: PENDING

| Item | Description | Dependencies |
|---|---|---|
| `processInactivityTimeout` Lambda | Scan sl_inventory creatures, check 30-day threshold, mark lost, award refund | `sl_inactivity_threshold_days`, `sl_inactivity_refund_percent` config keys |
| `goobiez-vbucks-transactions` table | DynamoDB table exists in architecture but no Lambda writes to it | Requires vbucks purchase Lambda |
| Vbucks purchase Lambda | LSL→vbucks exchange endpoint | `vbucks_per_linden` config key, LSL script |
| `vbucks_total_purchased` field | Lifetime audit counter on goobiez-users | Requires vbucks purchase Lambda |
| `vorest_enabled` toggle | Runtime feature gate | Low priority — feature is always-on |
| `vorest_breeding_enabled` toggle | Runtime breeding gate | Low priority — breeding is always-on |
| Portal Rezzer LSL script | In-world SL object for retrieving creatures | LSL development (not web backend) |

### Bugs Found & Fixed (Feb 25, 2026)

1. **applyVorestBooster.js:92** — Negative `fedSeconds` when resurrecting young creatures. Fixed with `Math.max(0, ...)`.
2. **VorestCreatureDetailContent.tsx** — Uncleaned setTimeout for retrieve redirect. Fixed with `retrieveTimerRef` + useEffect cleanup.
