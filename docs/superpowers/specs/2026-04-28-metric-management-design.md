# Task 4b: Metric Management — Design Spec

**Date:** 2026-04-28
**Scope:** Owner-only CRUD + reorder for scorecard metrics at /settings/metrics

## What It Does

Settings page where the business owner can add, edit, delete (soft), and reorder their scorecard metrics. Linked from the Settings/More page.

## Route

`/settings/metrics` — owner only. Non-owners see nothing (redirect or hide).

## Operations

### Add Metric
- "Add Metric" button at bottom of list
- Inline form expands: name (required), description, type (select), category (select), aggregation (select), target value
- Save creates new scorecard_metric row with next sort_order
- Form clears after save

### Edit Metric
- Tap a metric row → fields become editable inline
- Save on blur or explicit "Save" button
- Cancel discards changes

### Delete Metric
- Trash icon on each row
- Soft delete: sets is_active = false
- No confirmation dialog — show "Undo" link for 5 seconds after delete
- Undo sets is_active = true

### Reorder Metrics
- Up/down arrow buttons on each row
- Swaps sort_order with adjacent metric
- Saves immediately on tap
- No drag-and-drop (overkill for 6-9 items)

## Field Definitions

| Field | Type | Required | Options |
|---|---|---|---|
| Name | text | yes | free text |
| Description | text | no | free text (helper text shown below metric name) |
| Type | select | yes | currency, integer, percentage, decimal |
| Category | select | yes | always_track ("Always Track"), quarterly_focus ("This Quarter's Focus") |
| Aggregation | select | yes | sum, latest, average |
| Target Value | number | no | optional monthly target |

## File Structure

```
src/app/(app)/settings/page.tsx              — MODIFY: add "Edit Metrics" link
src/app/(app)/settings/metrics/page.tsx      — CREATE: Server Component, fetches metrics
src/components/settings/metric-list.tsx       — CREATE: Client Component, renders list with edit/delete/reorder
src/components/settings/metric-form.tsx       — CREATE: Client Component, inline add/edit form
src/lib/actions/metrics.ts                   — CREATE: Server Actions (addMetric, updateMetric, deleteMetric, reorderMetrics)
src/lib/actions/onboarding.ts                — MODIFY: include description + aggregation in metric seeding
```

## Server Actions

### addMetric(formData)
- Requires: name, metric_type, category, aggregation, tenantId, memberId
- Optional: description, target_value
- Calculates sort_order as max(existing) + 1
- Returns { success, error?, metric? }

### updateMetric(data)
- Takes: metricId + any changed fields
- RLS: is_tenant_owner check
- Returns { success, error? }

### deleteMetric(metricId)
- Sets is_active = false
- RLS: is_tenant_owner check
- Returns { success, error? }

### reorderMetrics(metricId, direction: 'up' | 'down')
- Swaps sort_order with adjacent metric (same category)
- Two UPDATE statements in sequence
- Returns { success, error? }

## Onboarding Fix

Update `createTenant` in onboarding.ts:
- Add `description, aggregation` to the trade_defaults select query
- Map both fields into the metricsToInsert array

## Key Decisions

- Inline editing, not modal — matches scorecard's "everything on one page" philosophy
- Up/down arrows, not drag-and-drop — simpler, works on mobile, sufficient for 6-9 items
- Soft delete only — data preservation, undo capability
- 5-second undo toast instead of confirmation dialog — less friction
- Category limited to two options — matches the book's Evergreen + North Star framework
- Structured logging on all server actions (per new code-build standard)
