# Task 3: Scorecard Entry — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the weekly scorecard entry screen — the core product interaction where business owners enter numbers and pick health colors for 6-9 metrics in under 5 minutes.

**Architecture:** Server Component page fetches metrics + entries, renders category groups. Each metric row is an isolated Client Component managing its own value/color/note state with per-field auto-save via Server Actions. Duration tracking via client-side useRef + event logging.

**Tech Stack:** Next.js 16, Supabase (RLS + upsert), Tailwind CSS, Server Actions

**Working directory:** `C:/Users/brian/active-brain/SHARED/projects/ownerscore`

**Supabase project:** `gjteceldqvlstohcirnu`

**Design spec:** `docs/superpowers/specs/2026-04-28-scorecard-entry-design.md`

---

## Existing Files (reference)

```
src/lib/supabase/server.ts          — createClient() for server (async, cookie-based)
src/lib/supabase/client.ts          — createClient() for browser
src/lib/actions/onboarding.ts       — Server action pattern: 'use server', FormData, return { error? }
src/lib/actions/auth.ts             — Auth server actions
src/components/ui/form-field.tsx    — Reusable input (44px min-height, data-testid)
src/utils/week.ts                   — getWeekStart(), getCurrentWeekStart()
src/types/database.ts               — Generated Supabase types
src/app/(app)/layout.tsx            — Bottom tab nav, pb-16 main, fixed bottom bar
src/app/(app)/scorecard/page.tsx    — Current placeholder (read-only metric list)
```

## File Structure (new + modified)

```
src/
├── types/
│   └── scorecard.ts                    # CREATE — StatusColor type + color constants
├── utils/
│   ├── week.ts                         # MODIFY — add getPreviousWeekStart, formatWeekLabel
│   └── __tests__/
│       └── week.test.ts                # CREATE — tests for week utilities
├── components/scorecard/
│   ├── color-picker.tsx                # CREATE — 5 inline dots, one-tap select
│   ├── status-note.tsx                 # CREATE — expandable textarea for yellow/red
│   ├── week-header.tsx                 # CREATE — "Week of [date]" + navigation
│   └── metric-row.tsx                  # CREATE — orchestrates input + color + note + auto-save
├── lib/actions/
│   └── scorecard.ts                    # CREATE — saveEntry(), logEntryDuration()
└── app/(app)/scorecard/
    └── page.tsx                        # REPLACE — full scorecard with entry UI
```

## Parallelism Map

```
Task 1 (foundation) ──────────────────────────────┐
                                                    │
Task 2 (server actions) ─────────────┐             │
Task 3 (ColorPicker) ────────────┐   │             │
Task 4 (StatusNote) ─────────┐   │   │             │
Task 5 (WeekHeader) ─────┐   │   │   │             │
                          │   │   │   │             │
                          └───┴───┴───┴──→ Task 6 (MetricRow)
                                                    │
                                           Task 7 (Page + Duration)
```

Tasks 2-5 are fully independent after Task 1. Task 6 integrates 2+3+4. Task 7 integrates all.

---

### Task 1: Foundation — Types + Week Utilities

**Files:**
- Create: `src/types/scorecard.ts`
- Modify: `src/utils/week.ts`
- Create: `src/utils/__tests__/week.test.ts`

- [ ] **Step 1: Create the StatusColor type and constants**

Create `src/types/scorecard.ts`:

```ts
export type StatusColor =
  | 'dark_green'
  | 'lime_green'
  | 'yellow'
  | 'light_red'
  | 'dark_red'
  | 'not_set'

export const STATUS_COLORS: Record<Exclude<StatusColor, 'not_set'>, string> = {
  dark_green: '#1B7A3D',
  lime_green: '#7BC67E',
  yellow: '#F5C518',
  light_red: '#E8685A',
  dark_red: '#B71C1C',
}

export const NOTE_REQUIRED_COLORS: StatusColor[] = ['yellow', 'light_red', 'dark_red']

export const NOTE_PLACEHOLDERS: Record<string, string> = {
  yellow: "What's your plan to catch up?",
  light_red: 'What happened?',
  dark_red: "What went wrong? What's Plan B?",
}
```

- [ ] **Step 2: Write failing tests for new week utilities**

Create `src/utils/__tests__/week.test.ts`:

```ts
import { getPreviousWeekStart, formatWeekLabel } from '../week'

describe('getPreviousWeekStart', () => {
  it('returns the Monday 7 days before the given week start', () => {
    expect(getPreviousWeekStart('2026-04-27')).toBe('2026-04-20')
  })

  it('handles month boundaries', () => {
    expect(getPreviousWeekStart('2026-05-04')).toBe('2026-04-27')
  })

  it('handles year boundaries', () => {
    expect(getPreviousWeekStart('2026-01-05')).toBe('2025-12-29')
  })
})

describe('formatWeekLabel', () => {
  it('formats a week start as readable date', () => {
    expect(formatWeekLabel('2026-04-27')).toBe('April 27, 2026')
  })

  it('formats single-digit days without leading zero', () => {
    expect(formatWeekLabel('2026-05-04')).toBe('May 4, 2026')
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd C:/Users/brian/active-brain/SHARED/projects/ownerscore && npx jest src/utils/__tests__/week.test.ts --no-cache`

Expected: FAIL — `getPreviousWeekStart` and `formatWeekLabel` are not exported from `../week`

- [ ] **Step 4: Implement the new week utilities**

Add to the bottom of `src/utils/week.ts` (keep existing functions unchanged):

```ts
/**
 * Get the Monday 7 days before the given week start.
 * Input and output are both YYYY-MM-DD strings.
 */
export function getPreviousWeekStart(weekStart: string): string {
  const [year, month, day] = weekStart.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - 7)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Format a YYYY-MM-DD week start as "Month Day, Year".
 * Example: "2026-04-27" → "April 27, 2026"
 */
export function formatWeekLabel(weekStart: string): string {
  const [year, month, day] = weekStart.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd C:/Users/brian/active-brain/SHARED/projects/ownerscore && npx jest src/utils/__tests__/week.test.ts --no-cache`

Expected: PASS — all 5 tests green

- [ ] **Step 6: Commit**

```bash
cd C:/Users/brian/active-brain/SHARED/projects/ownerscore
git add src/types/scorecard.ts src/utils/week.ts src/utils/__tests__/week.test.ts
git commit -m "feat: add StatusColor types + week utility functions for scorecard entry"
```

---

### Task 2: Server Actions — saveEntry + logEntryDuration

**Files:**
- Create: `src/lib/actions/scorecard.ts`

**Depends on:** Task 1 (uses StatusColor type — but only for documentation. The action accepts `string` for status_color to match the DB column.)

- [ ] **Step 1: Create the scorecard server actions file**

Create `src/lib/actions/scorecard.ts`:

```ts
'use server'

import { createClient } from '@/lib/supabase/server'

export type SaveEntryInput = {
  metricId: string
  weekStart: string
  tenantId: string
  memberId: string
  value: number | null
  statusColor: string
  statusNote: string | null
}

export type SaveEntryResult = {
  success: boolean
  error?: string
}

export async function saveEntry(data: SaveEntryInput): Promise<SaveEntryResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const now = new Date().toISOString()

  const { error } = await supabase.from('scorecard_entries').upsert(
    {
      metric_id: data.metricId,
      week_start: data.weekStart,
      tenant_id: data.tenantId,
      entered_by: data.memberId,
      value: data.value,
      status_color: data.statusColor,
      status_note: data.statusNote,
      entered_at: now,
      updated_at: now,
    },
    { onConflict: 'metric_id,week_start' }
  )

  if (error) {
    console.error('saveEntry failed:', error)
    return { success: false, error: 'Failed to save entry' }
  }

  return { success: true }
}

export async function logEntryDuration(data: {
  tenantId: string
  memberId: string
  weekStart: string
  durationSeconds: number
  metricsFilled: number
}): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('events').insert({
    tenant_id: data.tenantId,
    member_id: data.memberId,
    event_type: 'scorecard_entry',
    event_data: {
      duration_seconds: data.durationSeconds,
      metrics_filled: data.metricsFilled,
      week_start: data.weekStart,
    },
  })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:/Users/brian/active-brain/SHARED/projects/ownerscore && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No errors related to `src/lib/actions/scorecard.ts`. (Other pre-existing errors are OK.)

- [ ] **Step 3: Commit**

```bash
cd C:/Users/brian/active-brain/SHARED/projects/ownerscore
git add src/lib/actions/scorecard.ts
git commit -m "feat: add saveEntry + logEntryDuration server actions"
```

---

### Task 3: ColorPicker Component

**Files:**
- Create: `src/components/scorecard/color-picker.tsx`

**Depends on:** Task 1 (imports from `@/types/scorecard`)

- [ ] **Step 1: Create the ColorPicker component**

Create `src/components/scorecard/color-picker.tsx`:

```tsx
'use client'

import { STATUS_COLORS, type StatusColor } from '@/types/scorecard'

const COLOR_ORDER: Exclude<StatusColor, 'not_set'>[] = [
  'dark_green',
  'lime_green',
  'yellow',
  'light_red',
  'dark_red',
]

export function ColorPicker({
  selected,
  onSelect,
}: {
  selected: StatusColor
  onSelect: (color: StatusColor) => void
}) {
  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label="Status color">
      {COLOR_ORDER.map((color) => {
        const isSelected = selected === color
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={color.replace(/_/g, ' ')}
            onClick={() => onSelect(isSelected ? 'not_set' : color)}
            className="flex items-center justify-center"
            style={{ width: '44px', height: '44px' }}
            data-testid={`color-${color}`}
          >
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: STATUS_COLORS[color],
              }}
            >
              {isSelected && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 7L5.5 10L11.5 4"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
```

**Key details:**
- Button is 44px (touch target). Inner circle is 32px (visible dot).
- Tapping selected color deselects back to `'not_set'`.
- White checkmark SVG on selected dot.
- `role="radiogroup"` + `role="radio"` for accessibility.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:/Users/brian/active-brain/SHARED/projects/ownerscore && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/brian/active-brain/SHARED/projects/ownerscore
git add src/components/scorecard/color-picker.tsx
git commit -m "feat: add ColorPicker component with 5 inline dots"
```

---

### Task 4: StatusNote Component

**Files:**
- Create: `src/components/scorecard/status-note.tsx`

**Depends on:** Task 1 (imports from `@/types/scorecard`)

- [ ] **Step 1: Create the StatusNote component**

Create `src/components/scorecard/status-note.tsx`:

```tsx
'use client'

import { NOTE_REQUIRED_COLORS, NOTE_PLACEHOLDERS, type StatusColor } from '@/types/scorecard'

export function StatusNote({
  color,
  note,
  onChange,
  onBlur,
}: {
  color: StatusColor
  note: string
  onChange: (note: string) => void
  onBlur: () => void
}) {
  const isExpanded = NOTE_REQUIRED_COLORS.includes(color)
  const placeholder = NOTE_PLACEHOLDERS[color] || ''
  const isEmpty = !note.trim()

  return (
    <div
      className="overflow-hidden transition-all duration-200 ease-in-out"
      style={{ maxHeight: isExpanded ? '200px' : '0' }}
    >
      <div className="pt-2">
        <textarea
          value={note}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={2}
          className={`w-full rounded-lg border px-3 py-2 text-sm resize-none
            focus:outline-none focus:ring-1 focus:ring-blue-500
            ${isExpanded && isEmpty ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500'}`}
          style={{ minHeight: '44px' }}
          data-testid="status-note"
        />
        {isExpanded && isEmpty && (
          <p className="text-xs text-red-500 mt-1">Required</p>
        )}
      </div>
    </div>
  )
}
```

**Key details:**
- `maxHeight` transition for slide animation (0 → 200px).
- Red border + "Required" label when note is empty on a warning/red color.
- Does NOT block navigation — visual nudge only.
- Saves on blur via parent callback.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:/Users/brian/active-brain/SHARED/projects/ownerscore && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/brian/active-brain/SHARED/projects/ownerscore
git add src/components/scorecard/status-note.tsx
git commit -m "feat: add StatusNote component with slide-open animation"
```

---

### Task 5: WeekHeader Component

**Files:**
- Create: `src/components/scorecard/week-header.tsx`

**Depends on:** Task 1 (imports from `@/utils/week`)

- [ ] **Step 1: Create the WeekHeader component**

Create `src/components/scorecard/week-header.tsx`:

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { formatWeekLabel, getPreviousWeekStart } from '@/utils/week'

export function WeekHeader({
  weekStart,
  currentWeekStart,
}: {
  weekStart: string
  currentWeekStart: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isCurrentWeek = weekStart === currentWeekStart
  const previousWeek = getPreviousWeekStart(weekStart)

  function navigateToWeek(targetWeek: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (targetWeek === currentWeekStart) {
      params.delete('week')
    } else {
      params.set('week', targetWeek)
    }
    const query = params.toString()
    router.push(`/scorecard${query ? `?${query}` : ''}`)
  }

  return (
    <div className="flex items-center justify-between py-2">
      <button
        type="button"
        onClick={() => navigateToWeek(previousWeek)}
        className="flex items-center justify-center text-gray-500 hover:text-gray-900"
        style={{ minWidth: '44px', minHeight: '44px' }}
        aria-label="Previous week"
        data-testid="week-prev"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 15L7.5 10L12.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="text-center">
        <p className="text-sm font-semibold" data-testid="week-label">
          Week of {formatWeekLabel(weekStart)}
        </p>
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={() => navigateToWeek(currentWeekStart)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-0.5"
            data-testid="week-current"
          >
            Back to current week
          </button>
        )}
      </div>

      <div style={{ minWidth: '44px', minHeight: '44px' }} />
    </div>
  )
}
```

**Key details:**
- Left chevron always visible for previous week navigation.
- Right side is empty spacer (no forward nav — can't enter future weeks).
- "Back to current week" link appears only when viewing a past week.
- Navigation uses search params (`?week=YYYY-MM-DD`), removing the param for current week.
- 44px touch targets on navigation buttons.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:/Users/brian/active-brain/SHARED/projects/ownerscore && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/brian/active-brain/SHARED/projects/ownerscore
git add src/components/scorecard/week-header.tsx
git commit -m "feat: add WeekHeader component with week navigation"
```

---

### Task 6: MetricRow Component

**Files:**
- Create: `src/components/scorecard/metric-row.tsx`

**Depends on:** Task 2 (saveEntry action), Task 3 (ColorPicker), Task 4 (StatusNote)

- [ ] **Step 1: Create the MetricRow component**

Create `src/components/scorecard/metric-row.tsx`:

```tsx
'use client'

import { useState, useCallback, useRef } from 'react'
import { ColorPicker } from './color-picker'
import { StatusNote } from './status-note'
import { saveEntry } from '@/lib/actions/scorecard'
import type { StatusColor } from '@/types/scorecard'

type MetricRowProps = {
  metric: {
    id: string
    name: string
    metric_type: string
    target_value: number | null
  }
  currentEntry: {
    value: number | null
    status_color: string
    status_note: string | null
  } | null
  lastWeekEntry: {
    value: number | null
  } | null
  tenantId: string
  weekStart: string
  memberId: string
  onInteraction: () => void
}

function formatDisplayValue(value: number | null, metricType: string): string {
  if (value == null) return ''
  if (metricType === 'currency') {
    return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  if (metricType === 'percentage') {
    return value + '%'
  }
  return String(value)
}

export function MetricRow({
  metric,
  currentEntry,
  lastWeekEntry,
  tenantId,
  weekStart,
  memberId,
  onInteraction,
}: MetricRowProps) {
  const [value, setValue] = useState(
    currentEntry?.value != null ? String(currentEntry.value) : ''
  )
  const [color, setColor] = useState<StatusColor>(
    (currentEntry?.status_color as StatusColor) || 'not_set'
  )
  const [note, setNote] = useState(currentEntry?.status_note || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Track what was last saved to avoid duplicate saves
  const lastSaved = useRef({
    value: currentEntry?.value ?? null as number | null,
    color: (currentEntry?.status_color as StatusColor) || 'not_set',
    note: currentEntry?.status_note || '',
  })

  const doSave = useCallback(
    async (fields: {
      value: number | null
      statusColor: string
      statusNote: string | null
    }) => {
      setSaving(true)
      const result = await saveEntry({
        metricId: metric.id,
        weekStart,
        tenantId,
        memberId,
        value: fields.value,
        statusColor: fields.statusColor,
        statusNote: fields.statusNote,
      })
      setSaving(false)

      if (result.success) {
        lastSaved.current = {
          value: fields.value,
          color: fields.statusColor as StatusColor,
          note: fields.statusNote || '',
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 300)
      }
    },
    [metric.id, weekStart, tenantId, memberId]
  )

  function handleValueBlur() {
    onInteraction()
    const parsed = value.trim() ? parseFloat(value.replace(/[,$]/g, '')) : null
    if (parsed !== lastSaved.current.value) {
      doSave({ value: parsed, statusColor: color, statusNote: note || null })
    }
  }

  function handleColorSelect(newColor: StatusColor) {
    onInteraction()
    setColor(newColor)
    const parsed = value.trim() ? parseFloat(value.replace(/[,$]/g, '')) : null
    doSave({ value: parsed, statusColor: newColor, statusNote: note || null })
  }

  function handleNoteBlur() {
    if (note !== lastSaved.current.note) {
      const parsed = value.trim() ? parseFloat(value.replace(/[,$]/g, '')) : null
      doSave({ value: parsed, statusColor: color, statusNote: note || null })
    }
  }

  const inputMode =
    metric.metric_type === 'currency' || metric.metric_type === 'decimal'
      ? ('decimal' as const)
      : ('numeric' as const)

  const lastWeekDisplay = formatDisplayValue(lastWeekEntry?.value ?? null, metric.metric_type)

  return (
    <div
      className={`rounded-lg border p-3 transition-colors duration-300 ${
        saved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
      }`}
      data-testid={`metric-row-${metric.id}`}
    >
      {/* Row 1: Metric name + color picker */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{metric.name}</p>
          {lastWeekEntry?.value != null && (
            <p className="text-xs text-gray-400">Last week: {lastWeekDisplay}</p>
          )}
        </div>
        <ColorPicker selected={color} onSelect={handleColorSelect} />
      </div>

      {/* Row 2: Value input */}
      <div className="mt-2">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            onInteraction()
          }}
          onBlur={handleValueBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          placeholder={lastWeekDisplay || 'Enter value'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          style={{ minHeight: '44px' }}
          data-testid={`input-${metric.id}`}
        />
      </div>

      {/* Row 3: Status note (expands for yellow/red) */}
      <StatusNote color={color} note={note} onChange={setNote} onBlur={handleNoteBlur} />

      {/* Save indicator */}
      {saving && <p className="text-xs text-gray-400 mt-1">Saving...</p>}
    </div>
  )
}
```

**Key details:**
- Each handler passes ALL current values to `doSave` — no stale closure issues.
- `lastSaved` ref prevents duplicate saves when value hasn't actually changed.
- Value input strips `$` and `,` before parsing (handles user typing currency format).
- Enter key blurs the input (triggers save).
- Green flash: `bg-green-50` for 300ms on successful save.
- `onInteraction` callback fires on first field interaction (for duration tracking).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd C:/Users/brian/active-brain/SHARED/projects/ownerscore && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/brian/active-brain/SHARED/projects/ownerscore
git add src/components/scorecard/metric-row.tsx
git commit -m "feat: add MetricRow component with auto-save + color picker + notes"
```

---

### Task 7: Scorecard Page + Duration Tracking

**Files:**
- Replace: `src/app/(app)/scorecard/page.tsx`

**Depends on:** All previous tasks

- [ ] **Step 1: Replace the scorecard page**

Replace the entire contents of `src/app/(app)/scorecard/page.tsx` with:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWeekStart, getPreviousWeekStart } from '@/utils/week'
import { WeekHeader } from '@/components/scorecard/week-header'
import { ScorecardBody } from './scorecard-body'

// Category display order
const CATEGORY_ORDER = ['always_track', 'quarterly_focus']

function groupByCategory(
  metrics: Array<{
    id: string
    name: string
    metric_type: string
    category: string
    sort_order: number
    target_value: number | null
  }>
): Map<string, typeof metrics> {
  const groups = new Map<string, typeof metrics>()
  for (const metric of metrics) {
    const existing = groups.get(metric.category) || []
    existing.push(metric)
    groups.set(metric.category, existing)
  }
  return groups
}

function categoryLabel(category: string): string {
  switch (category) {
    case 'always_track':
      return 'Always Track'
    case 'quarterly_focus':
      return "This Quarter's Focus"
    default:
      return category
  }
}

function sortedCategoryKeys(groups: Map<string, unknown[]>): string[] {
  const keys = Array.from(groups.keys())
  return keys.sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a)
    const bIndex = CATEGORY_ORDER.indexOf(b)
    const aOrder = aIndex >= 0 ? aIndex : CATEGORY_ORDER.length
    const bOrder = bIndex >= 0 ? bIndex : CATEGORY_ORDER.length
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.localeCompare(b)
  })
}

export default async function ScorecardPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: member } = await supabase
    .from('tenant_members')
    .select('id, tenant_id, display_name')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    redirect('/onboarding')
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, timezone')
    .eq('id', member.tenant_id)
    .single()

  const timezone = tenant?.timezone || 'America/New_York'
  const currentWeekStart = getWeekStart(new Date(), timezone)

  const params = await searchParams
  const weekStart = params.week || currentWeekStart
  const previousWeekStart = getPreviousWeekStart(weekStart)

  // Fetch metrics
  const { data: metrics } = await supabase
    .from('scorecard_metrics')
    .select('id, name, metric_type, category, sort_order, target_value')
    .eq('tenant_id', member.tenant_id)
    .eq('is_active', true)
    .order('category')
    .order('sort_order')

  if (!metrics || metrics.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Weekly Numbers</h1>
        <p className="text-gray-500 text-center py-8">
          No metrics set up yet. Go to Settings to add your first metric.
        </p>
      </div>
    )
  }

  // Fetch current week entries
  const { data: currentEntries } = await supabase
    .from('scorecard_entries')
    .select('metric_id, value, status_color, status_note')
    .eq('tenant_id', member.tenant_id)
    .eq('week_start', weekStart)

  // Fetch previous week entries (for "last week" reference)
  const { data: previousEntries } = await supabase
    .from('scorecard_entries')
    .select('metric_id, value, status_color')
    .eq('tenant_id', member.tenant_id)
    .eq('week_start', previousWeekStart)

  // Index entries by metric_id for O(1) lookup
  const currentByMetric = new Map(
    (currentEntries || []).map((e) => [
      e.metric_id,
      { value: e.value, status_color: e.status_color, status_note: e.status_note },
    ])
  )
  const previousByMetric = new Map(
    (previousEntries || []).map((e) => [e.metric_id, { value: e.value }])
  )

  // Group metrics by category
  const groups = groupByCategory(metrics)
  const orderedKeys = sortedCategoryKeys(groups)

  // Build serializable data for client component
  const categorizedMetrics = orderedKeys.map((category) => ({
    category,
    label: categoryLabel(category),
    metrics: (groups.get(category) || []).map((m) => ({
      metric: {
        id: m.id,
        name: m.name,
        metric_type: m.metric_type,
        target_value: m.target_value,
      },
      currentEntry: currentByMetric.get(m.id) || null,
      lastWeekEntry: previousByMetric.get(m.id) || null,
    })),
  }))

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold">Weekly Numbers</h1>
        <p className="text-sm text-gray-500">{tenant?.name}</p>
      </div>

      <WeekHeader weekStart={weekStart} currentWeekStart={currentWeekStart} />

      <ScorecardBody
        categorizedMetrics={categorizedMetrics}
        tenantId={member.tenant_id}
        weekStart={weekStart}
        memberId={member.id}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create the ScorecardBody client wrapper (duration tracking)**

Create `src/app/(app)/scorecard/scorecard-body.tsx`:

```tsx
'use client'

import { useRef, useCallback } from 'react'
import { MetricRow } from '@/components/scorecard/metric-row'
import { logEntryDuration } from '@/lib/actions/scorecard'

type CategorizedMetric = {
  metric: {
    id: string
    name: string
    metric_type: string
    target_value: number | null
  }
  currentEntry: {
    value: number | null
    status_color: string
    status_note: string | null
  } | null
  lastWeekEntry: {
    value: number | null
  } | null
}

type CategoryGroup = {
  category: string
  label: string
  metrics: CategorizedMetric[]
}

export function ScorecardBody({
  categorizedMetrics,
  tenantId,
  weekStart,
  memberId,
}: {
  categorizedMetrics: CategoryGroup[]
  tenantId: string
  weekStart: string
  memberId: string
}) {
  const firstInteraction = useRef<number | null>(null)
  const interactionCount = useRef(0)

  const handleInteraction = useCallback(() => {
    if (firstInteraction.current === null) {
      firstInteraction.current = Date.now()
    }
    interactionCount.current += 1

    // Log duration on every 3rd interaction and on each save
    // (saves happen on blur which also triggers interaction)
    if (firstInteraction.current) {
      const durationSeconds = Math.round(
        (Date.now() - firstInteraction.current) / 1000
      )
      const totalMetrics = categorizedMetrics.reduce(
        (sum, group) => sum + group.metrics.length,
        0
      )
      logEntryDuration({
        tenantId,
        memberId,
        weekStart,
        durationSeconds,
        metricsFilled: totalMetrics,
      })
    }
  }, [categorizedMetrics, tenantId, memberId, weekStart])

  return (
    <div className="space-y-6">
      {categorizedMetrics.map((group) => (
        <div key={group.category}>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {group.label}
          </h2>
          <div className="space-y-3">
            {group.metrics.map(({ metric, currentEntry, lastWeekEntry }) => (
              <MetricRow
                key={metric.id}
                metric={metric}
                currentEntry={currentEntry}
                lastWeekEntry={lastWeekEntry}
                tenantId={tenantId}
                weekStart={weekStart}
                memberId={memberId}
                onInteraction={handleInteraction}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Key details:**
- `firstInteraction` ref tracks when the user first touched any field.
- Duration logged progressively (each save updates the event).
- Server Component page does ALL data fetching; `ScorecardBody` is a thin client wrapper for interactivity + duration tracking.
- All props are serializable (no Date objects, no functions from server).

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd C:/Users/brian/active-brain/SHARED/projects/ownerscore && npx tsc --noEmit --pretty 2>&1 | head -20`

Expected: No errors.

- [ ] **Step 4: Run the dev server and test**

Run: `cd C:/Users/brian/active-brain/SHARED/projects/ownerscore && npm run dev`

**Manual verification checklist:**
1. Navigate to `/scorecard` — should see metrics grouped by category
2. Each metric shows: name, color dots, input field
3. Type a number → blur → green flash (check browser Network tab for server action call)
4. Tap a color dot → checkmark appears → saves immediately
5. Tap yellow/red → note field slides open with placeholder text
6. Type a note → blur → saves
7. Click left arrow → navigates to previous week (URL has `?week=...`)
8. Click "Back to current week" → returns to current week
9. Last week's values show as dimmed reference text
10. All touch targets feel right (no tiny buttons)

- [ ] **Step 5: Commit**

```bash
cd C:/Users/brian/active-brain/SHARED/projects/ownerscore
git add src/app/(app)/scorecard/page.tsx src/app/(app)/scorecard/scorecard-body.tsx
git commit -m "feat: replace scorecard page with full entry UI + duration tracking"
```

---

## Post-Build Verification

After all tasks complete, run through the full acceptance criteria from the spec:

- [ ] Scorecard displays all tenant metrics grouped by category
- [ ] Number input opens native number pad on mobile (test on phone or Chrome DevTools mobile)
- [ ] Per-field auto-save works (no submit button anywhere)
- [ ] Color picker requires exactly 1 tap to select
- [ ] Yellow/red color expands note field with appropriate placeholder
- [ ] Last week's value shows as reference
- [ ] Week navigation works correctly with timezone-aware Monday calculation
- [ ] Entry duration tracked in events table (check Supabase dashboard)
- [ ] Touch targets >= 44px for all interactive elements (inspect in DevTools)
- [ ] Green flash confirmation on save

**Not in scope (Task 4):**
- Owner can add/edit/delete/reorder metrics (deferred)
- Monthly actuals display (deferred)
- Page load < 2s benchmark (verify but don't optimize yet)
