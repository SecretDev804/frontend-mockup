# Professional Development Rules — Goobiez

> **Full Stack**: Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · AWS Cognito · AWS Lambda (Node.js) · DynamoDB · API Gateway HTTP API · LSL (Linden Scripting Language)

---

# Part 1 — Frontend (Next.js / React / TypeScript)

---

## TypeScript

- Enable strict mode in `tsconfig.json` (already configured)
- Define explicit types for all props, state, and function parameters
- Avoid `any` — use `unknown` when the type is truly uncertain
- Place shared API types in `lib/api.ts`; component-specific types co-located in the component file
- Use `type` aliases for API response shapes and unions; `interface` only when extension/merging is needed
- Use `as const` for constant objects (status maps, event names, magic strings)
- Never use `@ts-ignore` — fix the actual type error
- Import types with `import type { Foo }` to keep runtime bundles clean

---

## Next.js App Router Rules

### Server vs Client Components

- **Default to Server Components** — only add `"use client"` when the component needs:
  - React hooks (`useState`, `useReducer`, `useEffect`, `useRef`, `useCallback`, `useMemo`, etc.)
  - Browser-only APIs (`window`, `document`, `localStorage`, event listeners)
  - Third-party client-only libraries
- Keep `"use client"` boundaries as deep (small) as possible — push them to leaf nodes
- Never fetch data inside a Client Component when a Server Component ancestor can do it
- Use `async/await` directly in Server Components for one-shot server-side data fetching
- Pass server-fetched data as props into Client Components — do not re-fetch on the client

### Route Groups and Layouts

- Route groups `(auth)` and `(dashboard)` must each have their own `layout.tsx`
- `(dashboard)/layout.tsx` is the **single mount point** for all Context Providers
  (`UserProvider`, `CreatureProvider`, `InventoryProvider`, `MailboxProvider`)
- Root `app/layout.tsx` handles global fonts and site-wide metadata only — no providers
- Each dashboard page component must be thin: import context/hooks, render UI, nothing else
- Auth pages must not mount dashboard providers

### API Routes (`app/api/`)

- API routes serve **BFF (Backend-for-Frontend)** purposes only: session management and token exchange
- **Never proxy business logic through Next.js API routes** — call the AWS Lambda API directly from the client
- Every API route must validate its request body before processing
- Return typed `NextResponse.json()` with explicit HTTP status codes
- Cookie settings:
  - `httpOnly: true` — always
  - `secure: true` — in production (`NODE_ENV === "production"`)
  - `sameSite: "lax"` — always
- Never return raw Cognito tokens in the response body — only write them to HTTP-only cookies

### Middleware

- Route protection belongs **only** in `middleware.ts` — never implement redirect logic inside components
- Keep `protectedPrefixes` in sync whenever a new dashboard segment is added
- Middleware must be stateless and synchronous — no `await` calls to external APIs
- Always append `?redirect=[pathname]` to the login redirect URL for post-login UX

### Metadata and SEO

- Every page must export a `metadata` or `generateMetadata` export with `title` and `description`
- Root layout defines the site-wide fallback: `title: "Goobiez Portal"`
- Dynamic pages (e.g. `/creatures/[id]`) must use `generateMetadata` with the creature name

---

## Component Architecture

- One component per file — named exports preferred
- Keep components under 200 lines — extract logic into custom hooks when approaching the limit
- Use functional components with hooks exclusively
- Follow container / presentational pattern: all data logic lives in hooks or context, not in UI components
- Props must be treated as immutable — never mutate them directly
- **React 19+**: pass `ref` as a regular prop — do not use `React.forwardRef` for new components
- For Shadcn components that still use `forwardRef` internally, use them as-is — that is fine:

```tsx
import { Button } from "@/components/ui/button";

const MyComponent = () => {
  const ref = useRef<HTMLButtonElement>(null);
  return <Button ref={ref}>Click me</Button>;
};
```

### Notifications

- Use **shadcn `toast`** / `sonner` for all transient user-facing feedback — **never** inline `alert()` or raw `<div>` banners for notifications
- Inline error states (form validation, empty states) use styled elements co-located with the form/list
- Loading states use skeleton placeholders alongside a spinner; never a spinner alone for content areas

---

## File Structure

```
Goobiez-WebPortal/
├── app/
│   ├── (auth)/                   # Login, register, confirm, forgot-password, verify-required
│   │   └── layout.tsx            # Auth-only layout (portal background, no providers)
│   ├── (dashboard)/              # All protected feature pages
│   │   └── layout.tsx            # Mounts all Providers + DashboardHeader/Sidebar/Footer
│   ├── api/
│   │   └── auth/                 # BFF session routes: /me, /session, /logout
│   ├── layout.tsx                # Root: Google Fonts + global metadata only
│   ├── page.tsx                  # Redirect → /login
│   └── globals.css               # Tailwind import + CSS custom properties
├── components/
│   ├── ui/                       # Generic reusable primitives (Button, Badge, Skeleton, etc.)
│   ├── creatures/                # Creature-specific UI components
│   ├── inventory/                # Inventory-specific UI components
│   └── layout/                   # DashboardHeader, DashboardSidebar, DashboardFooter
├── contexts/                     # React Context providers
│   ├── UserContext.tsx
│   ├── CreatureContext.tsx
│   ├── InventoryContext.tsx
│   └── MailboxContext.tsx
├── hooks/                        # Custom data-fetching and logic hooks
│   ├── useCreatures.ts
│   └── useCreature.ts
├── lib/
│   ├── api.ts                    # All AWS Lambda API calls + shared TypeScript types
│   ├── auth.ts                   # Cognito helper utilities
│   └── cognito.ts                # Cognito UserPool / client configuration
├── middleware.ts                 # Route protection (reads goobiez_id_token cookie)
├── next.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Data Fetching and State Management

### API Layer (`lib/api.ts`)

- **All** AWS Lambda calls live in `lib/api.ts` — never inline `fetch()` inside components or hooks directly
- Every exported function must have explicit TypeScript return types
- Use a single `apiBaseUrl` constant driven by `NEXT_PUBLIC_API_BASE_URL` with a safe fallback
- Standard error-handling pattern — always follow this:

```ts
const response = await fetch(`${apiBaseUrl}/some/endpoint`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const errBody = await response.json().catch(() => ({}));
  throw new Error(errBody.error || "Descriptive fallback message.");
}

return response.json() as Promise<ExpectedType>;
```

- Never swallow errors silently — always propagate to the calling hook
- Never hardcode game configuration values (ages, intervals, points, durations, thresholds) in components or hooks. All game mechanics values must come from `GameConfigContext` which fetches from the `/config/get` API. `DEFAULT_CONFIG` fallbacks exist only inside `GameConfigContext` itself

### Custom Hooks

- All data-fetching logic lives in `hooks/` — page and component files must not call `fetch()` directly
- Every hook must return this shape:

```ts
{
  data: T | null;
  isLoading: boolean;      // true only on the initial fetch
  isRefreshing: boolean;   // true during background polls / manual refetches
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}
```

- Use `isMountedRef` to prevent state updates after component unmount
- Always clear polling intervals in the `useEffect` cleanup return
- Default polling interval: **5 minutes** (`5 * 60 * 1000`) — expose as a configurable option
- Use `useCallback` for `fetchData` and `refetch` to keep `useEffect` dependency arrays stable
- `isLoading` resets to `true` only on an explicit user-triggered refetch, not background polls

### Context Providers

- React Context is for shared cross-page state: user identity, balances, creature list, mailbox
- Every Context must export a named hook (`useUserContext`, `useCreatureContext`, etc.)
  that throws a clear error if used outside its Provider
- Contexts are mounted **once** in `(dashboard)/layout.tsx` — never in individual pages
- Two-phase user initialisation (mandatory pattern):
  1. Fetch `cognitoSub` + `email` from `/api/auth/me` (BFF route)
  2. Fetch `ownerKey`, `userId`, balances from Lambda `/user/status`

### State Principles

- Prefer **local `useState`** for UI-only concerns (panel open/closed, active tab, form input)
- Lift to Context only when data must be shared across multiple route segments
- Never store derived values in state — compute them with `useMemo`
- Avoid prop drilling beyond 2 levels — lift to Context instead
- Split contexts by concern to avoid unnecessary re-renders (e.g. user identity vs. balance)

---

## Authentication (AWS Cognito)

- All Cognito SDK calls use `amazon-cognito-identity-js` via `lib/cognito.ts` and `lib/auth.ts`
- Tokens are stored **exclusively** in HTTP-only cookies — never in `localStorage`, `sessionStorage`, or React state
- BFF session pattern (mandatory):
  1. Client authenticates with Cognito → receives `accessToken`, `idToken`, `refreshToken`
  2. Client POSTs tokens to `/api/auth/session` → Next.js sets HTTP-only cookies
  3. All subsequent requests carry cookies automatically — no client-side token management
- Cookie lifetimes: access token 1 hour · refresh token 1 day (30 days with "remember me")
- `goobiez_id_token` cookie is the single source of truth for middleware route protection
- On logout, always call `/api/auth/logout` to clear all three cookies server-side
- Gate dashboard features by `accountStatus`: `"pending"` | `"sl_only"` | `"verified"`
- Redirect unlinked accounts (`sl_avatar_key === null`) to `/verify-required`

---

## Tailwind CSS v4

- Import Tailwind with `@import "tailwindcss"` in `globals.css` — **not** `@tailwind base/components/utilities`
- Brand CSS custom properties are defined in `:root`:
  `--moss`, `--moss-strong`, `--ember`, `--gold`, `--fog`, `--ink`, `--sand`, `--card`, `--ring`
- Reference custom properties in Tailwind via arbitrary values: `bg-[var(--moss)]`, `text-[var(--ink)]`
- Utility-first approach — write custom CSS classes **only** for:
  - Complex `@keyframes` animations (`.animate-rise`)
  - Multi-property compound rules that cannot be expressed with utilities
    (`.portal-bg`, `.auth-card`, `.dashboard-surface`)
- Group Tailwind classes in this order: **layout → spacing → colours → typography → states/variants**
- Never use `style={{}}` inline for values expressible as Tailwind utilities
- Prefer `font-display` class (maps to `--font-fraunces`) for headings; body uses `--font-manrope` by default

---

## Frontend Performance

### Next.js Built-ins

- Use `next/font` for all custom fonts — already configured; never use a `<link>` tag for Google Fonts
- Use `next/image` (`<Image>`) for all raster images — never a raw `<img>` tag
- Use `React.lazy()` + `<Suspense>` for heavy dashboard panels not visible on initial load
- Add `loading="lazy"` to images below the fold that `<Image>` does not handle automatically

### Data and Rendering

- Implement list virtualisation (`@tanstack/react-virtual`) for any list rendering 100+ items (creature list)
- Debounce filter and search inputs — minimum **300 ms** before triggering a refetch
- Memoize expensive computed values (filtered/sorted creature arrays) with `useMemo`
- Never define functions or plain objects inline in JSX — use `useCallback`, `useMemo`, or module-level constants

### Bundle

- Review `next build` output and route sizes before every production release
- Keep the dependency footprint minimal — the current stack (Cognito SDK + Lucide) is intentionally lean
- Do not introduce heavy UI component libraries (MUI, Chakra, Ant Design) — use Tailwind utilities + shadcn primitives
- Code-split feature-heavy pages with `dynamic(() => import("..."), { ssr: false })` when appropriate

---

## Frontend Security

- **Never expose Cognito tokens** to client JavaScript — HTTP-only cookies only
- `NEXT_PUBLIC_` env vars must contain only non-secret values (API base URL is acceptable)
- Validate and sanitise all form inputs on the client before submission
- Cookie settings in production: `httpOnly: true` + `secure: true` + `sameSite: "lax"`
- Do not concatenate user input directly into request body properties — always pass as typed fields
- Business-logic validation and rate-limiting are the AWS Lambda layer's responsibility — do not duplicate on the frontend
- Configure security response headers in `next.config.ts` via the `headers()` function:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
```

---

## React Best Practices

- Use `useMemo` and `useCallback` to prevent unnecessary re-renders on stable references
- Implement error boundaries at the layout level for graceful degradation
- Keep `useEffect` dependency arrays accurate and minimal — fix lint warnings, do not suppress them
- Clean up all side effects (intervals, subscriptions, abort controllers) in the `useEffect` return
- Use keys properly in lists — never use array index as key for dynamic/reorderable lists
- Implement loading and error states for every async operation
- Debounce expensive operations (search input → API call) — minimum 300 ms
- **React 19+**: use `ref` as a regular prop, not `forwardRef`, for new components

---

## Frontend Environment Variables

```
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev
```

- `NEXT_PUBLIC_` prefix: safe only for non-secret client-visible values (API base URL)
- All secrets (Cognito pool config, internal keys) must be server-only env vars (no `NEXT_PUBLIC_` prefix)
- Validate required env vars at startup — crash fast with a clear message if missing
- Use `.env.local` for local development; set production values in the deployment platform (Vercel / Docker)
- Never commit `.env*` files — only commit a `.env.example` with placeholder values

---

# Part 2 — LSL (Linden Scripting Language)

> Sources: [SL Wiki: LSL Portal](https://wiki.secondlife.com/wiki/LSL_Portal), [SL Wiki: Script Memory](https://wiki.secondlife.com/wiki/LSL_Script_Memory), [SL Wiki: Script Efficiency](https://wiki.secondlife.com/wiki/LSL_Script_Efficiency), [XS Pets: Breedables are Hard](https://xs-pets.com/posts/breedables-are-hard/)

---

## LSL Memory Management

- Every Mono script has a **64 KB** memory ceiling — design with this hard limit in mind
- Lists have massive overhead (~112 bytes for a single-integer list) — prefer strided lists over multiple separate lists
- Strings cost 12 + 2 bytes per character (UTF-16 under Mono) — minimize string concatenation in loops (each concat allocates a new copy)
- Pass-by-value in function calls doubles memory — data passed to a function is copied onto the stack
- When approaching the memory wall, split into multiple scripts communicating via `llMessageLinked()`
- Use **Linkset Data (LSD)** for overflow/persistent storage — 128 KB per linkset, does not count against script memory
- Never store large data in script globals when LSD can hold it

---

## LSL Performance

- **Minimize script count per object** — every idle script costs ~1.9 microseconds per frame. Sleeping scripts cost 0.0
- Prefer `llSleep()` over timers when the script has nothing to do between triggers — sleeping scripts consume zero script time
- Communication function cost hierarchy (fastest to slowest):
  - `llMessageLinked()` (intra-linkset, fastest, no distance limit within linkset)
  - `llRegionSayTo()` (targeted, private, single-recipient)
  - `llRegionSay()` on a non-zero channel (0.3 ms)
  - `llOwnerSay()` (3.6 ms)
  - `llSay()` (4.0 ms) / `llWhisper()` (4.9 ms)
  - `llShout()` (10.9 ms — 35x slower than `llRegionSay`)
- Use `llSetLinkPrimitiveParamsFast()` to control multiple prims from one script instead of one-script-per-prim
- Sensor scans: limit to every **30-60 seconds** minimum — never scan every 5 seconds
- `llDeleteSubList()` is expensive — batch deletions instead of one-per-loop-iteration
- Most micro-optimizations (`++a` vs `a++`) do not matter under Mono — focus on algorithmic improvements

---

## LSL HTTP Requests

- **Throttle limits**: 25 requests per 20 seconds per object; 1000 per 20 seconds per owner across all objects in a region
- Always validate `request_id` in `http_response` — match against the key returned by `llHTTPRequest()`
- Check for `NULL_KEY` return from `llHTTPRequest()` — indicates throttle hit or parameter error
- Handle HTTP status **499** (Linden timeout) and always verify status **200** before parsing body
- Set Content-Type via `HTTP_MIMETYPE`, **not** `HTTP_CUSTOM_HEADER` — the latter causes a runtime error for Content-Type
- Set `HTTP_BODY_MAXLENGTH` to **4096** (project standard) — default 2048 truncates longer responses
- Implement a **30-second timer guard** for all HTTP requests — if no response arrives, fail gracefully (project standard across all scripts)
- On throttle (`NULL_KEY` return), add random jitter (1-3 seconds) before retry

---

## LSL State Management

- LSL uses a Finite State Machine — all scripts must have a `default` state with at least one event
- State transitions **clear all event queues** and **remove all listeners and sensors**
- Always re-establish listeners, sensors, and timers in `state_entry()` after every state change
- Use `state_exit()` for cleanup — stop timers, remove listeners before transitioning
- Minimize state count — use variables (flags) for minor behavioral differences within a single state rather than creating separate states
- Use states for distinct lifecycle phases: setup/initialization vs runtime operation

---

## LSL Error Handling

- Always check `JSON_INVALID` on all JSON operations — `llJsonGetValue()` returns `JSON_INVALID` for malformed input
- Validate HTTP response status codes explicitly — never assume success
- Use `llOwnerSay()` for debug output — cheaper than `llSay()` and only visible to the owner
- Implement **fail-open** for server errors in game items — users must never lose access to legitimate items due to server downtime (project standard: items continue functioning, caught on next successful verify)
- On `llLinksetDataWrite()` failure (return code `-6` quota exceeded), warn the owner but keep the item functional

---

## LSL Timer Patterns

- Only **one timer per script** — calling `llSetTimerEvent()` replaces any existing timer
- Use `llSetTimerEvent(0.0)` to cancel the timer
- Simulate multiple timers with counters: use a single fast timer and increment counters, firing different logic when counters reach their targets
- Stop timers in `state_exit()` to prevent unintentional timer persistence across state changes
- Timer events are **not interrupts** — they queue behind the currently executing event. Keep event handlers short
- Do not set intervals below **0.04 seconds** — it has no effect except filling the event queue
- Use the timer + listener timeout pattern for dialogs: set a timer when opening a dialog, remove the listener and stop the timer when the response arrives or the timer fires

---

## LSL JSON and String Handling

- For multiple JSON value extractions, convert to list first: call `llJson2List()` once, then extract from the list — substantially faster than multiple `llJsonGetValue()` calls
- Never build JSON strings by manual concatenation — use `llList2Json(JSON_OBJECT, [...])` and `llJsonSetValue()` to avoid syntax errors with special characters
- Always check for `JSON_INVALID` return values
- LSL types (`key`, `rotation`, `vector`) become strings in JSON — always returned as strings by `llJsonGetValue()`
- `llGetSubString()` (0.5 ms) is 4x faster than `llSubStringIndex()` (2.2 ms) — prefer direct extraction when possible
- Minimize string concatenation in loops — each concatenation allocates a new string copy

---

## LSL Event Handling

- Filter listeners aggressively: always specify name, id, or msg filters in `llListen()` — never use `llListen(0, "", NULL_KEY, "")` (listens to all chat from everyone)
- Multiple filtered `llListen()` calls are faster than one open listener with script-level conditionals — engine-level filtering is more efficient
- Avoid channel **0** for script-to-script communication — use high negative channels or random positive channels
- Remove listeners when not needed with `llListenRemove()` — listeners auto-remove on state changes, but not within a state
- Use `llListenControl()` for toggle behavior — more efficient than removing and re-creating listeners
- Practical limit: ~64 listeners per script — design accordingly

---

## LSL Linkset Data (LSD)

- **128 KB** total storage per linkset as key/value pairs — attached to root prim, survives script reset and transfer
- Does **not** count against script's 64 KB memory limit — use it to offload persistent data
- **Prefix all keys** with `goobiez_` namespace (e.g., `goobiez_asset_id`, `goobiez_creature_id`) to avoid collisions with other scripts
- Use `llLinksetDataWriteProtected()` with a password for sensitive data — prevents other scripts from reading or modifying
- Treat LSD as untrusted if third-party scripts may be present in the linkset
- Use the `linkset_data` event to react to changes made by other scripts (pub/sub within linkset)
- Be aware of rollback risks: simulator rollbacks can revert LSD to a previous state

---

## LSL Security (Breedable/Game Systems)

- **Server-side is the source of truth** — never trust the client (in-world script) as authoritative for game state, breeding, ownership, or economy
- Never trust `X-SecondLife-*` HTTP headers alone for authentication — they can be spoofed from non-SL servers. Use owner_key/creature_id verification in the POST body validated server-side
- Use `llRegionSayTo()` for sensitive inter-object communication — targets a single object, cannot be overheard on the same channel
- `llGetCreator()` is **immutable** in SL — cannot be overridden by scripts. Record it on registration for anti-copybot verification
- Validate `llGetOwnerKey()` server-side for ownership verification on all mutating operations
- Use `llLinksetDataWriteProtected()` for asset IDs and verification state — prevents tampering by third-party scripts in the linkset
- For admin-flagged items: broadcast `llMessageLinked(LINK_SET, 0, "COPYBOT_DETECTED", NULL_KEY)` so all scripts in the linkset can disable functionality

---

## LSL Project Conventions

- All HTTP requests use `API_BASE_URL` constant at the top of the script — never hardcode URLs inline
- Standard body parsing: `llList2Json(JSON_OBJECT, [...])` for building request payloads
- Timer guard: **30.0 seconds** for all HTTP requests (matches all existing scripts)
- `CHANGED_OWNER`: call `init()` (not `llResetScript()`) to preserve LSD data and re-verify with new owner
- `state_entry` + `on_rez` both call `init()` for double-init safety pattern
- `HTTP_BODY_MAXLENGTH = 4096` across all scripts

---

# Part 3 — AWS Lambda Functions (Node.js)

> Sources: [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html), [AWS Lambda Node.js Handler](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html), [AWS Well-Architected Serverless Lens](https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/), [Powertools for AWS Lambda](https://docs.powertools.aws.dev/lambda/typescript/latest/)

---

## Lambda Handler Pattern

- Use `async/await` handlers exclusively — callback-based handlers are deprecated from Node.js 24 onward
- **Initialize SDK clients outside the handler** at module scope — subsequent warm invocations reuse them (connection reuse):

```js
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    // handler logic — client is already warm
};
```

- Read environment variables at module scope as constants — never inside the handler:

```js
const CREATURES_TABLE = process.env.CREATURES_TABLE || 'goobiez-creatures';
const CONFIG_TABLE = process.env.CONFIG_TABLE || 'goobiez-config';
```

- Keep handlers thin: parse event, call business logic, format response. All logic should live in helper functions or imported modules

---

## Lambda Input Validation

- Use the project's standard **3-branch body parsing pattern** in every handler:

```js
let body;
if (typeof event.body === 'string') {
    body = JSON.parse(event.body);
} else if (event.body) {
    body = event.body;
} else {
    body = event;
}
```

- Validate all required fields immediately after parsing — return `400` with a specific error message listing missing fields
- Validate enum values against an explicit allowlist (e.g., `validTypes.includes(creature_type)`)
- Never trust caller-provided IDs without server-side lookup verification
- Sanitize all inputs before using in DynamoDB expressions — prevent NoSQL injection

---

## Lambda Error Handling

- **Never throw unhandled errors** — wrap the entire handler in a try/catch and return a structured error response
- Use the project's standard response helpers consistently:

```js
const successResponse = (statusCode, data) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});

const errorResponse = (statusCode, message) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message })
});
```

- Differentiate error types:
  - `400` — client validation errors (missing fields, invalid types)
  - `404` — resource not found
  - `409` — conflict (conditional check failed, duplicate resource)
  - `500` — unexpected server error (log full error, return generic message to client)
- Handle `ConditionalCheckFailedException` explicitly when using DynamoDB condition expressions
- Always check `UnprocessedItems` in `BatchWriteItem` responses and retry with exponential backoff
- For synchronous invocations (API Gateway): no automatic retries — the handler must catch and return appropriate status codes
- Log errors with sufficient context (function name, request ID, relevant entity IDs) but never log full event payloads containing user data

---

## Lambda Idempotency

- Design all state-mutating functions to be idempotent — the same request should produce the same result if called multiple times
- Use DynamoDB conditional writes (`attribute_not_exists(pk)`) for create operations to prevent duplicates (project pattern: `registerAsset.js`, `registerBooster.js`)
- For registration endpoints: scan for existing record by unique identifier first, return existing record if found (idempotent re-registration)
- Handle `ConditionalCheckFailedException` (409) as a normal business flow, not a crash — return the existing resource or retry once

---

## Lambda Environment Variables

- Use environment variables for table names, stage identifiers, and configuration values:
  - `CREATURES_TABLE`, `USERS_TABLE`, `CONFIG_TABLE`, `BREEDINGS_TABLE`, `MAILBOX_TABLE`, `PEDESTALS_TABLE`, `BOOSTERS_TABLE`, `ASSETS_TABLE`
  - `SECONDS_PER_DAY` — controls time acceleration for testing (60 = test mode, 86400 = production)
- Always provide a fallback default when reading table names: `process.env.TABLE_NAME || 'goobiez-tablename'`
- Never store secrets (API keys, credentials) in Lambda environment variables — use AWS Secrets Manager or SSM Parameter Store
- Lambda encrypts environment variables at rest by default

---

## Lambda Cold Start Optimization

- **Minimize deployment package size** — do not bundle the full AWS SDK (it is built into the runtime). Only import specific clients:

```js
// Good — tree-shakeable
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// Bad — imports entire SDK
import AWS from 'aws-sdk';
```

- For latency-sensitive paths, increase memory allocation — Lambda allocates CPU proportionally to memory. 256-512 MB is a good starting point
- Use **Provisioned Concurrency** for sub-100ms latency requirements
- AWS SDK v3 enables HTTP keep-alive by default — connections are reused across warm invocations

---

## Lambda Code Organization

- One Lambda function per API endpoint — single-responsibility principle
- Extract shared business logic into `helpers/` directory as ES modules (`.mjs`):
  - `helpers/breedingHelper.mjs` — breeding calculations
  - `helpers/pedestalHelper.mjs` — pedestal operations
  - `helpers/deliveryHelper.mjs` — delivery/mailbox creation
  - `helpers/pointsHelper.mjs` — points economy transactions
  - `helpers/memorialHelper.mjs` — memorial/death handling
- When a Lambda uses helpers, they must be bundled together in the deployment zip:

```bash
mkdir -p temp_build/helpers
cp myFunction.js temp_build/index.mjs
cp helpers/myHelper.mjs temp_build/helpers/
cd temp_build && zip -r ../myFunction.zip . && cd .. && rm -rf temp_build
```

- Simple functions (no helpers) use direct copy: `cp myFunction.js index.mjs && zip myFunction.zip index.mjs`
- The entry point must always be named `index.mjs` with handler export `index.handler`

---

## Lambda Timeout and Memory

- Default timeout: **30 seconds** for functions with DynamoDB + HTTP operations
- API Gateway has a **29-second hard timeout** — set Lambda timeout below this for API-backed functions
- Default memory: **128 MB** is sufficient for simple CRUD operations; increase to **256-512 MB** for functions with complex calculations or multiple DynamoDB operations
- Never set timeout close to average duration — set it to the reasonable maximum (e.g., if average is 2s, set timeout to 10-15s)

---

# Part 4 — DynamoDB

> Sources: [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html), [Alex DeBrie: The DynamoDB Book](https://www.alexdebrie.com/posts/dynamodb-single-table/), [AWS Blog: Choosing Partition Key](https://aws.amazon.com/blogs/database/choosing-the-right-dynamodb-partition-key/)

---

## Table Design

- Use **multi-table design** (one table per entity type) — this matches the project's established pattern and is appropriate when:
  - Access patterns are still evolving
  - Entity types have different throughput requirements
  - Simpler to reason about and debug

### Current Tables

| Table | Partition Key | Purpose |
|---|---|---|
| `goobiez-users` | `user_id` | User accounts, balances, SL link |
| `goobiez-creatures` | `creature_id` | Creature state, stats, ownership |
| `goobiez-food` | `food_id` | Food tray registration and state |
| `goobiez-config` | `config_key` | Game configuration values |
| `goobiez-breedings` | `breeding_id` | Active breeding sessions |
| `goobiez-pedestals` | `pedestal_id` | Heart pedestal state |
| `goobiez-mailbox` | `mailbox_id` | Mailbox items for delivery |
| `goobiez-boosters` | `booster_id` | Booster/potion inventory |
| `goobiez-assets` | `asset_id` | Anti-copybot asset registry |
| `goobiez-pending-memorials` | `memorial_id` | Pending memorial operations |
| `goobiez-pending-deliveries` | `pending_id` | Pending delivery operations |
| `goobiez-points-transactions` | `transaction_id` | Points economy audit trail |

---

## Partition Key Design

- Use **high-cardinality attributes** as partition keys — UUIDs (`randomUUID()` from Node.js crypto) are the standard
- Never use low-cardinality attributes (status, type, boolean) as partition keys — they create hot partitions
- For query-by-owner patterns: use a GSI with `owner_key` as the partition key (e.g., `goobiez-points-transactions` has `user_id-created_at-index`)

---

## Query vs Scan

- **Always prefer Query over Scan** — Query performs a direct partition lookup; Scan reads every item in the table
- **Scan is acceptable** only for:
  - Infrequent administrative/batch operations
  - First-rez idempotency checks by `sl_object_key` (called once per item lifetime, not on every rez)
  - Tables with very few items (e.g., `goobiez-config`)
- If you find yourself using Scan with filters frequently, it signals the key design needs a GSI
- Use `FilterExpression` on Scans to reduce data transfer, but understand DynamoDB still reads and charges for all scanned items before filtering

---

## GSI (Global Secondary Index)

- Use GSIs when you have access patterns that cannot be served by the base table's key schema
- **Avoid GSIs** when the access pattern is rare — use Scan for infrequent batch operations instead
- Project only needed attributes (`KEYS_ONLY` or `INCLUDE`) rather than `ALL` to reduce GSI storage and write costs
- Every GSI consumes additional write capacity (replicated on every base table write) — add GSIs intentionally
- Always include the GSI ARN in the Lambda IAM policy when querying a GSI

---

## Atomic Operations and Conditional Writes

- Use **atomic counters** for thread-safe increments: `SET counter = if_not_exists(counter, :zero) + :one`
- Use `ConditionExpression: 'attribute_not_exists(pk)'` on `PutCommand` to prevent accidental overwrites (project pattern for registration endpoints)
- Handle `ConditionalCheckFailedException` as a business logic branch (return existing resource), not just an error
- Use `TransactWriteItems` (up to 100 actions) for multi-item atomic operations — do NOT use for bulk writes (2x WCU cost)
- Use `BatchWriteItem` (up to 25 items) for bulk operations — always check `UnprocessedItems` and retry with backoff

---

## TTL (Time to Live)

- Enable TTL on tables with temporary/expiring data — DynamoDB deletes expired items at **no cost**
- Use **epoch seconds** (not milliseconds) for TTL attributes
- Current TTL-enabled tables: `goobiez-pending-memorials` (`ttl_expiry`), `goobiez-pending-deliveries` (`ttl_expiry`)
- TTL deletions are eventually consistent (can take up to 48 hours) — filter out expired items in application code as a safety measure
- Use TTL for: pending operations, temporary tokens, idempotency records

---

## Capacity Mode

- Use **On-Demand (PAY_PER_REQUEST)** for all tables — this is the project standard
- On-Demand is ideal for: unpredictable traffic, game systems with spiky activity, early-stage projects where patterns are not established
- Consider switching to Provisioned with auto-scaling only when monthly DynamoDB costs exceed a significant threshold and traffic patterns are predictable

---

# Part 5 — API Gateway (HTTP API)

> Sources: [AWS API Gateway HTTP API Docs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html), [AWS HTTP API Throttling](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-throttling.html)

---

## Route Design

- Use resource-based paths with HTTP methods:
  - `POST /creature/register` — create a new creature
  - `POST /creature/resurrect` — mutating action on a creature
  - `GET /pedestal/{id}/status` — read a specific pedestal
  - `GET /points/history` — read a collection
  - `GET /breeding` — list breeding sessions
  - `POST /breeding/start` — start a new breeding
  - `POST /breeding/{id}/cancel` — cancel a specific breeding
- Use `POST` for all operations from LSL scripts (LSL `llHTTPRequest` works best with POST + JSON body)
- Use `GET` with query parameters for read-only web portal requests where appropriate
- Keep routes shallow — maximum 2-3 levels of nesting

---

## Route Naming Conventions

- Use **kebab-case** for multi-word route segments: `/creature/send-to-beyond`, `/breeding/check-completion`
- Group related endpoints under a common prefix: `/creature/*`, `/breeding/*`, `/mailbox/*`, `/booster/*`, `/pedestal/*`, `/asset/*`, `/config/*`, `/user/*`, `/food/*`, `/points/*`
- Use singular nouns for actions (`/creature/register`, not `/creatures/register`)

---

## Request/Response Standards

- All responses must include `Content-Type: application/json` header
- Success responses: return the resource data directly with appropriate status code (`200` for updates, `201` for creation)
- Error responses: return `{ "error": "Human-readable message" }` with appropriate status code
- Standard status codes:
  - `200` — success (read, update)
  - `201` — created (new resource)
  - `400` — validation error (missing/invalid fields)
  - `404` — resource not found
  - `409` — conflict (duplicate, condition failed)
  - `500` — server error

---

## CORS Configuration

- Configure CORS at the **API level** in HTTP API settings — API Gateway handles preflight `OPTIONS` automatically
- Set `Access-Control-Allow-Origin` to specific domains in production — never `*`
- LSL HTTP requests do not send CORS preflight — CORS configuration is primarily for the web portal

---

## Throttling

- API Gateway uses token bucket algorithm — default account-level limits: 10,000 RPS with 5,000 burst
- Set **route-level throttling** for expensive endpoints (Scan-heavy or complex operations)
- LSL objects are naturally rate-limited (25 requests per 20 seconds per object) — this provides built-in client-side throttling

---

# Part 6 — Shared Rules (All Code)

---

## Code Quality

- ESLint with `eslint-config-next` is the baseline for frontend — do not disable rules without a documented reason
- Use Prettier for consistent formatting (add `.prettierrc` if not present)
- Keep files under 300 lines — split into sub-components, hooks, or helper modules when approaching the limit
- Avoid deeply nested ternaries — use early returns or extracted helper functions
- Use `const` everywhere — only `let` when reassignment is genuinely required
- Extract magic numbers and string literals into named constants at the top of the file
- Never add comments in code unless the logic is truly non-obvious. Only add a minimal comment to critical functions or classes. Remove all section separator comments (`// ====`). Prefer self-documenting code with clear naming over comments
- No dead code — remove unused variables, imports, and commented-out blocks before committing

---

## Code Consistency and Voice (LSL + Lambda + Frontend)

> Every file in this project must read as if a single senior developer wrote the entire codebase by hand. Consistency is non-negotiable.

### Match Existing Patterns

- **Before writing or modifying any file**, read at least two existing files of the same type (`.lsl`, `.js`/`.mjs`, `.tsx`) to absorb the established style — variable naming, spacing, brace placement, function structure, and flow
- **LSL scripts**: follow the exact patterns visible in the existing scripts:
  - Globals at the top: `API_BASE_URL` first, then channel constants, then state variables, then derived constants
  - User-defined functions before `default` state
  - `init()` function called from both `state_entry()` and `on_rez()`
  - Allman brace style (opening brace on its own line) for states, events, functions, and control flow
  - `llList2Json(JSON_OBJECT, [...])` for building HTTP payloads — never manual string concatenation
  - `HTTP_BODY_MAXLENGTH, 4096` in every `llHTTPRequest()` call
  - 30-second timer guard after every HTTP request
  - `current_request` string pattern for routing `http_response` to the correct handler
- **Lambda functions**: follow the exact patterns visible in the existing handlers:
  - SDK client init at module scope, table name constants with fallback defaults
  - 3-branch body parsing at the top of every handler
  - `successResponse()` / `errorResponse()` helpers for all returns
  - Early validation with 400 returns listing the missing fields
  - Flat control flow — early returns rather than deep nesting
- **Frontend (React/TypeScript)**: follow existing component and hook patterns — same import order, same hook return shape, same error/loading state handling
- When in doubt about how to write something, find the closest existing example in the codebase and mirror it exactly

### Comments

- **No AI-generated comments** — do not produce boilerplate, overly formal, or template-style comments (e.g., `// Initialize the DynamoDB client`, `// Handle error response`, `// Process the result`)
- **No section separator comments** — no `// ====`, `// ----`, `// --- Section ---` lines. The code structure speaks for itself
- **No commented-out code** — delete dead code entirely, never leave it behind
- Default stance: **no comments at all** — clean code with clear naming is the documentation
- The only exception: if a line solves a genuinely tricky edge case or a non-obvious workaround, add one short plain-English comment that a human would actually write:

```lsl
// owner_key changes on transfer but LSD persists, so re-verify
if (llGetOwner() != owner_key) init();
```

```js
// DynamoDB returns numbers as strings in expression results
const age = parseInt(result.Attributes.age.N, 10);
```

- If you wouldn't explain it out loud to a teammate, don't write a comment for it

### Syntax and Formatting

- **LSL**: Allman braces, 4-space indentation, no trailing whitespace, blank line between functions, no blank line after opening brace
- **Lambda JS**: 4-space indentation, single quotes for strings, K&R braces (opening brace on same line), blank line between logical sections
- **Frontend TSX/TS**: follow the project's ESLint + Prettier config — do not override
- Write clean, correct syntax on the first pass — do not rely on linters to fix sloppy code after the fact

---

## Git and Version Control

- Follow **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`
- Branch naming: `feat/creature-detail-page`, `fix/auth-redirect-loop`
- Never commit directly to `main` — use pull requests with at least 1 review
- Protect the `main` branch
- Tag releases with semantic versioning: `v1.0.0`
- Never commit: `.env*` files, `/.next` build output, `node_modules`, `.zip` deployment packages
- Write a README section for every new feature covering setup and environment variables needed
- Never break current working features when adding new ones — maintain backward compatibility. After edit, you must make sure that the old feature is still working as expected

---

## IAM and AWS Security

- Use **least-privilege IAM policies** — specify exact DynamoDB actions and table ARNs:

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:UpdateItem",
    "dynamodb:DeleteItem",
    "dynamodb:Query",
    "dynamodb:Scan",
    "dynamodb:BatchWriteItem"
  ],
  "Resource": [
    "arn:aws:dynamodb:eu-north-1:*:table/goobiez-*",
    "arn:aws:dynamodb:eu-north-1:*:table/goobiez-*/index/*"
  ]
}
```

- When adding a new DynamoDB table, **always update** `dynamodb-policy.json` and re-apply the IAM role policy
- Include GSI ARNs (`table/*/index/*`) when the function queries a GSI
- Never grant `dynamodb:*` or `Resource: "*"` — always scope to specific tables
- Lambda execution role: one shared role (`goobiez-lambda-role`) is acceptable for this project size, but always review permissions when adding new functions

---

## Deployment

- Runtime: **Node.js 24.x** (`nodejs24.x`) for all new Lambda functions
- Region: **eu-north-1** (Stockholm) for all AWS resources
- API Gateway: HTTP API (v2) with ID `3w4cqxw8y1`
- Billing mode: **PAY_PER_REQUEST** (On-Demand) for all DynamoDB tables
- Always test new endpoints with `curl` before considering deployment complete
- Maintain separate environment variable sets for test mode (`SECONDS_PER_DAY=60`) and production (`SECONDS_PER_DAY=86400`)
