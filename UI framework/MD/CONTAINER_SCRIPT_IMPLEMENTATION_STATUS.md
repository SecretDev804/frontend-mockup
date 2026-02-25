# Goobiez Project - Implementation Status

**Last Updated:** February 25, 2026 (updated)

---

## COMPLETED FEATURES (28 total)

| # | Feature | Backend (Lambda) | Frontend (LSL) | Status |
|---|---------|-----------------|----------------|--------|
| 1 | User Registration & Verification | registerUser, createVerificationCode, verifySlLink, getUserStatus | registerUser.lsl, verify.lsl | DONE |
| 2 | Creature Registration & Stats | registerCreature, getCreatureStats, getCreatureList | creature_core.lsl | DONE |
| 3 | Creature Rename + Prim Name Update | renameCreature | creature_core.lsl | DONE |
| 4 | Creature Stats Processing (Hourly) | processCreatureStats | - | DONE |
| 5 | Death & Great Beyond (Creatures) | sendToGreatBeyond | creature_core.lsl, creature_menu.lsl | DONE |
| 6 | Food System (Register, Consume, Update, List) | registerFood, consumeFood, updateFood, getFoodList | food.lsl, creature_feeding.lsl | DONE |
| 7 | Food Refill (Dual L$/GBP Payment) | refillFood | food.lsl | DONE |
| 8 | Food to Great Beyond | sendFoodToBeyond | food.lsl | DONE |
| 9 | Resurrection Booster | resurrectCreature, registerBooster | resurrectBooster.lsl, creatureBooster.lsl | DONE |
| 10 | Forever Booster | applyForeverBooster, registerBooster | foreverBooster.lsl, creatureBooster.lsl | DONE |
| 11 | Eternalz Potion | applyEternalz, registerBooster | eternalzPotion.lsl, creatureBooster.lsl | DONE |
| 12 | Booster Hybrid Scan+Touch Method | - | creatureBooster.lsl, creature_menu.lsl | DONE |
| 13 | Auto-Breeding (Proximity 10%) | autoBreeding | creature_breeding.lsl | DONE |
| 14 | Pedestal Breeding (75%) | startBreeding, checkBreedingCompletion, cancelBreeding, getBreedingSessions | heartPedestal.lsl | DONE |
| 15 | Pedestal Management | getPedestalStatus, getPedestalList | heartPedestal.lsl | DONE |
| 16 | Mailbox System (Create, Get, Claim) | createMailbox, getMailbox, claimMailboxItem | mailbox.lsl | DONE |
| 17 | Mailbox Buttons (Support/Portal/EULA) | - | mailbox.lsl | DONE |
| 18 | Mailbox Glow & Capacity (20 items) | - | mailbox.lsl | DONE |
| 19 | Babiez/Carriage System | breedingHelper.mjs | babiez_carriage.lsl | DONE |
| 20 | Memorial System (5% Headstone/Casket) | memorialHelper.mjs | Memorial_headstone.lsl, Memorial_casket.lsl | DONE |
| 21 | Delivery System (Weighted Random Drops) | deliveryHelper.mjs | - | DONE |
| 22 | Points Transaction Logging & History | pointsHelper.mjs, getPointsHistory | - | DONE |
| 23 | Hovertext Display (Per-creature) | - | creature_core.lsl | DONE |
| 24 | Config System (47+ params) | initConfig, getConfig | - | DONE |
| 25 | Container Scripts for GB Points | registerContainer, sendContainerToBeyond | container.lsl, babiez_carriage.lsl | DONE |
| 26 | Token/Coin Conversion to GBP | convertToken | coin.lsl | DONE |
| 27 | Hovertext Toggle Device | - | (already in creature_core.lsl) | DONE |
| 28 | Asset ID / Anti-Copybot | registerAsset, verifyAsset | asset_verify.lsl | DONE |

---

## REMAINING FEATURES (10 total)

### Priority 1: Core Gameplay (1 feature)

#### SLox Unboxing System
- **Requirement:** Box with 12 rotating items (90-day cycle). Click to get 1 random item.
- **Needs:** LSL (`slox.lsl`)

### Priority 2: Economy & Store (3 features)

#### HUT Factory System
- **Requirement:** Factory where players spend 5000 GBP to create decorative creatures.
- **Needs:** Lambda (`createHutCreature.js`), LSL (`hutFactory.lsl`)
- **Config ready:** `hut_creature_cost=5000`, `gb_points_hut=1000`

#### Store/Vendor System
- **Requirement:** In-world L$ vendor for LE creatures, food, boosters.
- **Needs:** LSL (`store_vendor.lsl`), possibly Lambda for purchase logging

#### LE Bonus Drop System
- **Requirement:** Separate 2-5% LE bonus chance AFTER normal delivery (can get both items).
- **Needs:** Extend `deliveryHelper.mjs` with secondary roll

### Priority 3: Advanced Features (6 features)

#### Portal System (Web + SL)
- **Requirement:** Web portal to view/manage creatures. Portal Rezzer in SL for retrieval.
- **Needs:** Lambda (store/retrieve/list), LSL (`portal_rezzer.lsl`), Web frontend
- **Complexity:** HIGH (largest remaining feature)

#### Society of Shadows (Subscription)
- **Requirement:** Monthly L$ subscription for exclusive creatures.
- **Needs:** Lambda (subscription management), LSL (vendor), DynamoDB table

#### Admin Panel / Gift System
- **Requirement:** Admin can send items to all/selected/single players.
- **Needs:** Lambda (`adminSendItem.js`), Web admin dashboard

#### Monthly Item Rotation System
- **Requirement:** New creatures/items every month. Admin toggles items on/off.
- **Needs:** Item catalog management, admin tools

#### Creature Transfer/Ownership
- **Requirement:** Backend updates owner when creature is given to another player.
- **Status:** May already work via `registerCreature.js` re-registration on rez. Needs verification.

#### Monthly Memorial Design Changes
- **Requirement:** Headstone/Casket designs change monthly (1 per creature type).
- **Needs:** Design swap mechanism via admin config

---

## BACKEND INVENTORY

### Lambda Functions: 39 total
| Category | Functions |
|----------|----------|
| User & Auth (4) | registerUser, createVerificationCode, verifySlLink, getUserStatus |
| Creature (5) | registerCreature, renameCreature, getCreatureStats, getCreatureList, processCreatureStats |
| Breeding (6) | startBreeding, autoBreeding, checkBreedingCompletion, cancelBreeding, getBreedingSessions, registerBooster |
| Death & Afterlife (5) | sendToGreatBeyond, sendFoodToBeyond, resurrectCreature, applyForeverBooster, applyEternalz |
| Food (6) | registerFood, consumeFood, refillFood, updateFood, getFoodList, feedCreature (deprecated) |
| Mailbox (3) | createMailbox, getMailbox, claimMailboxItem |
| Pedestal & Points (4) | getPedestalStatus, getPedestalList, getPointsHistory, getBoosterList |
| Config (2) | initConfig, getConfig |
| Container (2) | registerContainer, sendContainerToBeyond |
| Token Conversion (1) | convertToken |
| Asset Verification (2) | registerAsset, verifyAsset |

### Helper Modules: 5 total
- `breedingHelper.mjs` - Type compatibility, eligibility, offspring generation
- `deliveryHelper.mjs` - Weighted random drops, mailbox operations
- `pedestalHelper.mjs` - Pedestal state management
- `memorialHelper.mjs` - Memorial creation, 5% chance roll
- `pointsHelper.mjs` - Transaction logging, history, summary

### DynamoDB Tables: 13 total
| Table | Purpose |
|-------|---------|
| goobiez-users | User profiles, points, tokens |
| goobiez-creatures | Creature data, stats, ownership |
| goobiez-config | 47+ gameplay parameters |
| goobiez-food | Food objects, feedings, access |
| goobiez-mailbox | Delivery items with optimistic locking |
| goobiez-breedings | Breeding sessions |
| goobiez-pedestals | Heart Pedestal state |
| goobiez-boosters | Booster inventory |
| goobiez-pending-memorials | Queued memorials (mailbox full) |
| goobiez-pending-deliveries | Queued deliveries (mailbox full) |
| goobiez-points-transactions | Immutable audit log |
| goobiez-containers | Container registration & GB tracking |
| goobiez-assets | Asset ID verification & anti-copybot registry |

### LSL Scripts: 18 total
| Script | Purpose |
|--------|---------|
| creature_core.lsl | Main creature lifecycle, stats, hovertext |
| creature_menu.lsl | Touch menu UI |
| creature_feeding.lsl | Food discovery & eating |
| creature_breeding.lsl | Auto-breed listener |
| food.lsl | Food tray system |
| mailbox.lsl | Mailbox delivery system |
| heartPedestal.lsl | Breeding pedestal interface |
| creatureBooster.lsl | Booster scan coordinator |
| resurrectBooster.lsl | Resurrection booster |
| foreverBooster.lsl | Forever booster |
| eternalzPotion.lsl | Eternalz potion |
| babiez_carriage.lsl | Offspring container + GB points |
| Memorial_headstone.lsl | Memorial headstone display |
| Memorial_casket.lsl | Memorial casket display |
| registerUser.lsl | User registration |
| verify.lsl | Email verification |
| container.lsl | Generic container (GB points, 12 types) |
| coin.lsl | Coin and Rare Token conversion to GB points |
| asset_verify.lsl | Anti-copybot verification (companion script, Linkset Data) |

---

## LATEST CHANGES (Feb 18, 2026)

### Container Scripts - Deep Re-Validation & Fixes

**7 Issues Found & Fixed:**
1. Container type names didn't match actual SL object names (friend_suitcase vs friend_visit)
2. 5 delivery item types missing (goobiez, babiez, monthly_special, consolation_token, fuggiez_babiez)
3. babiez_carriage.lsl had no Great Beyond functionality
4. Lambda VALID_CONTAINER_TYPES too restrictive (8 of 13 types)
5. Mailbox items use bare names, not Goobiez_ prefix
6. Display name mapping incomplete
7. Dual-naming inconsistency between delivery types and container names

**Changes Made:**
- **UPDATED:** `lsl/container.lsl` - Added `normalizeContainerType()` for dual-name support (accepts both delivery types like `friend_visit` AND container names like `friend_suitcase`), expanded to 12 container types
- **UPDATED:** `lamda_functions/registerContainer.js` - Expanded `VALID_CONTAINER_TYPES` to 13 types
- **UPDATED:** `lsl/babiez_carriage.lsl` - Added container registration, Great Beyond menu for opened carriages, HTTP request handling, confirmation dialog, send-to-beyond flow

### Container Type Mapping (14 delivery types total)

| Delivery Type | Container Name | Display Name | Script |
|---|---|---|---|
| friend_visit | friend_suitcase | Friend Suitcase | container.lsl |
| family_visit | family_suitcase | Family Suitcase | container.lsl |
| stranger | stranger_suitcase | Stranger Suitcase | container.lsl |
| fuggiez | fuggiez_cage | Fuggiez Cage | container.lsl |
| token | coin_pouch | Coin Pouch | container.lsl* |
| rare_token | token_pouch | Token Pouch | container.lsl* |
| slox | slox | SLox | container.lsl* |
| babiez | babiez | Babiez | container.lsl |
| goobiez | goobiez | Goobiez | container.lsl |
| fuggiez_babiez | fuggiez_babiez | Fuggiez Baby | container.lsl |
| monthly_special | monthly_special | Monthly Special | container.lsl |
| consolation_token | consolation_token | Consolation Token | container.lsl |
| goobiez_babiez_carriage | babiez_carriage | Babiez Carriage | babiez_carriage.lsl |
| fuggiez_babiez_carriage | babiez_carriage | Babiez Carriage | babiez_carriage.lsl |

*interim: will later get dedicated scripts (coin conversion, SLox unboxing)

### Deployment Needed
```bash
# 1. Create DynamoDB table
aws dynamodb create-table --table-name goobiez-containers \
  --attribute-definitions AttributeName=container_id,AttributeType=S \
  --key-schema AttributeName=container_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region eu-north-1

# 2. Update IAM policy
aws iam put-role-policy --role-name goobiez-lambda-role \
  --policy-name goobiez-dynamodb-policy \
  --policy-document file://dynamodb-policy.json

# 3. Deploy Lambdas
./deploy-create.sh registerContainer --env "CONTAINERS_TABLE=goobiez-containers,CONFIG_TABLE=goobiez-config"
./deploy-create.sh sendContainerToBeyond --env "CONTAINERS_TABLE=goobiez-containers,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config"

# 4. Add API Gateway routes
# POST /container/register → registerContainer
# POST /container/send-to-beyond → sendContainerToBeyond

# 5. Claude Chat Thread Name

"All resources which you can refer..."
```

---

## LATEST CHANGES (Feb 25, 2026)

### Food Script — 3 Client Feedback Fixes

Three issues reported by client (Minkka) with the food container system. Each addressed as a separate fix.

#### Feedback 1: Prevent L$ Payment When Food Is Full (COMMITTED)

When food had 12/12 feedings and the user clicked Refill, the payment dialog appeared, money was sent, server rejected the request, and the script showed raw JSON error with "contact support" even for GBP errors where no money was lost.

**Fix applied:**
- Added guard at "Refill" button — blocks with "already full" message when food is at max feedings
- Added defense-in-depth guards at "L$" and "GBP" buttons
- Added `pending_linden_refill` flag to track whether L$ was actually sent
- Clean error messages: "contact support" shown only when L$ was actually paid
- Server-side guard already existed in `refillFood.js`

#### Feedback 2: Food Container Color Turns Black/Grey After Refill (IMPLEMENTED, NOT YET DEPLOYED)

When food containers depleted and were refilled, the mesh stayed grey instead of returning to the original white color. The root cause was the `CHANGED_COLOR` event handler creating a progressive darkening feedback loop. Each time `updateVisuals()` applied a dimming factor (0.8 or 0.6), `CHANGED_COLOR` fired and overwrote `original_color` with the dimmed value. After multiple feeding cycles, `original_color` degraded to near-black and the exact equality check (`== <0,0,0>`) failed to catch it.

**Fix applied:**
- Removed `CHANGED_COLOR` handler entirely — eliminates the feedback loop root cause
- Simplified `updateVisuals()` from 3-tier dimming (50%/20% thresholds, factors 1.0/0.8/0.6) to a clean 3-step system: normal (>30%, full color), low (<=30%, 0.7 dim), depleted (grey)
- Replaced exact equality checks with brightness threshold (`original_color.x + .y + .z < 0.1`) to catch near-black values
- `state_entry()` also checks for exact grey (`== <0.5, 0.5, 0.5>`) to handle script restart on depleted food
- Refill success handler validates `original_color` before calling `updateVisuals()`

**Color system after fix:**

| State | Condition | Prim Color | Text Color |
|-------|-----------|------------|------------|
| Normal | remaining > 30% of total | `original_color` (white = no tint) | Green |
| Low | remaining <= 30%, not depleted | `original_color * 0.7` | Orange |
| Depleted | empty or 0 feedings | Grey `<0.5, 0.5, 0.5>` | Grey |

#### Feedback 3: Update Food Refill Prices (IMPLEMENTED, NOT YET DEPLOYED)

Client requested price increase: food refill from 50 to 100 L$, GBP refill from 200 to 2000.

**Files changed:**
- `lsl/food.lsl` — default variables updated to 100 / 2000
- `lamda_functions/refillFood.js` — fallback defaults updated to 100 / 2000
- `lamda_functions/registerFood.js` — fallback defaults updated at 4 locations
- `lamda_functions/initConfig.js` — added `food_refill_price` (100) and `food_refill_price_gbp` (2000) config entries

**Deployment note:** If DynamoDB config table already has old values (50/200), must manually update those 2 keys since code fallbacks only apply when the config key is missing.

### Pending Client Decisions

#### Partial Refill Pricing
Client concern: refilling at 4/12 costs full 100L$ but wastes 4 remaining feedings. Recommended approach based on SL breedable industry research (KittyCatS uses disposable food packs): only allow refill when food is empty (0/12). This ensures the user always gets exactly 12 feedings for their payment with zero waste and no need for proportional pricing or refund logic. Client approved this approach.

#### Generic vs Premium Food Containers (New Trello Ticket)
Client wants free generic food containers at the store but needs to prevent GBP farming exploit (users buying thousands of free containers and sending them to Great Beyond for free GBP). Proposed solution: add a `container_type` flag ("generic" vs "premium") to `food.lsl`. Generic containers can feed and refill but cannot be sent to Great Beyond or become decor. Premium containers from drops or paid purchases retain all features. Server-side validation ensures the restriction cannot be bypassed.

**Trello ticket:** "Add generic food container type with Great Beyond restriction"
