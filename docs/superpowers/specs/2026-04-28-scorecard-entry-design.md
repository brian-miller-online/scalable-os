# Task 3: Scorecard Entry — Design Spec

**Date:** 2026-04-28
**Scope:** Weekly scorecard entry experience — Steps 1-5 + 8 from epic 003.md
**Out of scope (Task 4):** Metric management (add/edit/delete/reorder), monthly actuals

## Overview

The scorecard is the core product interaction. A business owner opens the app, sees their 6-9 metrics grouped by category, enters this week's numbers, picks a health color for each, and adds a note if something is yellow or red. Target: under 5 minutes total entry time.

## Architecture

**Pattern:** Server Component page + per-row Client Components.

The server page fetches all data (metrics, current entries, last week entries). Each metric renders as an isolated `<MetricRow>` client component that manages its own state and auto-saves independently via Server Actions.

**Why per-row isolation:**
- Typing in one field never re-renders another row
- Each row's save is independent — one failure doesn't affect others
- Components are small, focused, and testable in isolation
- Clean for parallel subagent implementation

## File Structure

```
src/
├── app/(app)/scorecard/
│   └── page.tsx                    # Server — data fetch, category grouping, renders rows
├── components/scorecard/
│   ├── metric-row.tsx              # Client — orchestrates value input + color + note for one metric
│   ├── color-picker.tsx            # Client — 5 inline dots, one-tap select with checkmark
│   ├── status-note.tsx             # Client — slide-open textarea for yellow/red/dark_red
│   └── week-header.tsx             # Client — "Week of [date]" + prev/current week navigation
├── lib/actions/
│   └── scorecard.ts                # Server Actions — saveEntry(), logEntryDuration()
├── utils/
│   └── week.ts                     # MODIFY — add getPreviousWeekStart(), formatWeekLabel()
```

## Server Page: `/scorecard`

### Data Fetching

1. Auth check: get user → get tenant_member → get tenant (need timezone)
2. Compute `weekStart` via `getWeekStart(new Date(), tenant.timezone)`
3. Week override: if `?week=YYYY-MM-DD` search param exists, use that instead
4. Fetch `scorecard_metrics` where `is_active = true`, ordered by `category, sort_order`
5. Fetch `scorecard_entries` for current week (filter by `week_start`)
6. Fetch `scorecard_entries` for previous week (filter by previous Monday)
7. Group metrics by `category` field
8. Render: `<WeekHeader>` + category sections with `<MetricRow>` per metric

### Category Grouping

Metrics have a `category` field (string). Group and render with section headers:
- "Always Track" first (these are the core metrics)
- "This Quarter's Focus" second
- Custom categories alphabetically after

### Props Passed to MetricRow

```ts
{
  metric: { id, name, metric_type, category, sort_order, target_value }
  currentEntry: { id, value, status_color, status_note } | null
  lastWeekEntry: { value, status_color } | null
  tenantId: string
  weekStart: string  // YYYY-MM-DD
  memberId: string
}
```

## MetricRow Component

Client component. Manages local state for one metric's entry.

### State
- `value: string` — controlled input (string for input control, parsed to number on save)
- `color: StatusColor` — one of `'dark_green' | 'lime_green' | 'yellow' | 'light_red' | 'dark_red' | 'not_set'`
- `note: string` — status note text
- `saving: boolean` — shows save indicator
- `saved: boolean` — triggers green flash animation

### Initialization
- If `currentEntry` exists: populate value, color, note from it
- If no current entry: value empty, color `'not_set'`, note empty

### Layout (single row)
```
[Metric Name]              [Last week: $12,500]
[___value input___]        [G] [LG] [Y] [LR] [DR]
                           [note field if yellow/red]
```

- Metric name: left-aligned, font-medium
- Last week value: right-aligned, dimmed, small text — shows formatted value from lastWeekEntry
- Input field: full width below name, or inline depending on screen width
- Color picker: right side, inline with input
- Note: below the row, slides open on yellow/red selection

### Number Input
- `inputMode="decimal"` for metric_type `'currency'` or `'decimal'`
- `inputMode="numeric"` for metric_type `'integer'` or `'percentage'`
- Placeholder: last week's formatted value (e.g., "$12,500") or empty string
- On blur: parse value to number, call `saveEntry()` if value changed
- On Enter key: blur the field (triggers save)
- Currency formatting: prefix with `$`, comma-separate thousands on display (format on blur, strip for save)
- Minimum height: 44px

### Save Flow
1. Set `saving = true`
2. Call `saveEntry()` server action
3. On success: set `saving = false`, set `saved = true`, clear after 300ms (green flash)
4. On error: set `saving = false`, show brief error indicator

### Green Flash
- On successful save: background transitions to `bg-green-50` for 300ms, then back
- CSS transition on background-color, controlled by `saved` state

## ColorPicker Component

Five colored circles in a horizontal row.

### Colors
| Key | Hex | Meaning |
|---|---|---|
| `dark_green` | `#1B7A3D` | Strong / ahead |
| `lime_green` | `#7BC67E` | On track |
| `yellow` | `#F5C518` | Watch / slipping |
| `light_red` | `#E8685A` | Behind / problem |
| `dark_red` | `#B71C1C` | Critical / off track |

### Behavior
- Each dot: 36px visible diameter, 44px touch target (8px padding creates the target)
- Selected state: white checkmark SVG centered inside the dot
- Unselected: solid color circle, no border
- `not_set`: all dots unselected (no default — forces conscious choice per the ownership principle)
- On tap: call `onSelect(color)` → parent triggers save immediately
- One tap to select. Tapping the same color again deselects (back to `not_set`).

### Props
```ts
{
  selected: StatusColor
  onSelect: (color: StatusColor) => void
}
```

## StatusNote Component

Expandable textarea that appears below the metric row when yellow, light_red, or dark_red is selected.

### Behavior
- Slides open with CSS transition: `max-height` from 0 to content height, ~200ms ease
- Slides closed when color changes to green or not_set
- Placeholder varies by color:
  - yellow: "What's your plan to catch up?"
  - light_red: "What happened?"
  - dark_red: "What went wrong? What's Plan B?"
- Auto-save on blur via parent's save handler
- If note is empty and color is yellow/red: red border + subtle "Required" label — visual nudge only, does NOT block navigation or other saves

### Props
```ts
{
  color: StatusColor
  note: string
  onChange: (note: string) => void
  onBlur: () => void
}
```

## WeekHeader Component

Displays current week context and navigation.

### Display
- "Week of April 28, 2026" — formatted from weekStart prop
- Left chevron → navigates to previous week (`?week=YYYY-MM-DD`)
- If viewing a past week: right chevron + "Current week" link
- Uses Next.js `useRouter` for client-side navigation (search param change)

### Props
```ts
{
  weekStart: string       // YYYY-MM-DD
  currentWeekStart: string // for "is this the current week?" check
}
```

## Server Actions

### `saveEntry()`

```ts
async function saveEntry(data: {
  metricId: string
  weekStart: string
  tenantId: string
  memberId: string
  value: number | null
  statusColor: string
  statusNote: string | null
}): Promise<{ success: boolean; error?: string }>
```

- Uses `createClient()` from server
- Upserts into `scorecard_entries` with `onConflict: 'metric_id,week_start,tenant_id'`
- Sets `entered_by = memberId`, `entered_at = new Date().toISOString()`, `updated_at = now`
- RLS handles tenant isolation (user_tenant_ids() check)
- Returns success/error object (matches existing action pattern)

**Prerequisite (implementation step 1):** Verify unique constraint exists on `(metric_id, week_start, tenant_id)`. If it does not exist, add it via SQL migration before any other build work. The upsert will silently create duplicate rows without this constraint.

### `logEntryDuration()`

```ts
async function logEntryDuration(data: {
  tenantId: string
  memberId: string
  weekStart: string
  durationSeconds: number
  metricsFilled: number
}): Promise<void>
```

- Upserts into `events` table: `event_type = 'scorecard_entry'`
- `event_data`: `{ duration_seconds, metrics_filled, week_start }`
- Called from client on each save with running duration (client tracks first interaction via useRef)

## Week Utility Additions

Add to `src/utils/week.ts`:

### `getPreviousWeekStart(weekStart: string): string`
- Parse the YYYY-MM-DD, subtract 7 days, return YYYY-MM-DD

### `formatWeekLabel(weekStart: string): string`
- Returns human-readable: "Week of April 28, 2026"

## Entry Duration Tracking

Client-side tracking with server-side storage.

1. Parent page (or a thin wrapper) holds `firstInteractionRef = useRef<number | null>(null)`
2. Pass an `onFirstInteraction` callback to each `<MetricRow>`
3. On first focus of any input in any row: if ref is null, set to `Date.now()`
4. On each successful save: calculate `(Date.now() - firstInteractionRef.current) / 1000`
5. Call `logEntryDuration()` with the running total + count of filled metrics
6. This progressively updates the duration — final save has the most accurate number

## Status Color Type

```ts
type StatusColor = 'dark_green' | 'lime_green' | 'yellow' | 'light_red' | 'dark_red' | 'not_set'
```

The `not_set` sentinel handles the DB's non-nullable `status_color` column without requiring a migration. The UI treats `not_set` as "no selection made."

## Empty States

- **No entries this week:** All inputs empty, no colors selected. Last week values shown as placeholders.
- **No metrics configured:** "No metrics set up yet. Go to Settings to add your first metric." (Shouldn't happen post-onboarding, but defensive.)

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Color default | `"not_set"` sentinel | DB requires non-null status_color; avoids schema migration |
| Note enforcement | Visual indicator only | Don't block owner's workflow; gentle nudge is enough |
| Past week editing | Always editable (v1) | Spec decision; lockout is a future concern |
| Save trigger | Per-field on blur/tap | Matches existing codebase pattern; simpler than batch |
| Duration tracking | Client useRef + progressive server updates | No session concept needed; last save is most accurate |
| Metric management | Deferred to Task 4 | Keeps Task 3 focused on core entry experience |
| Monthly actuals | Deferred to Task 4 | Separate concern from weekly entry |

## Mobile Constraints

- All touch targets: minimum 44px
- Number inputs: `inputMode` attribute triggers native number pad
- Color dots: 36px visible, 44px touchable
- No modals — everything inline
- Target: complete 6-9 metrics in under 5 minutes (300 seconds)
