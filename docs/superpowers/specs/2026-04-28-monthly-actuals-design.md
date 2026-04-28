# Task 4a: Monthly Actuals — Design Spec

**Date:** 2026-04-28
**Scope:** Read-only month-to-date calculation displayed below weekly entries

## What It Does

Below the weekly entry rows on the scorecard, a "Month to Date" section shows each metric's accumulated or latest value for the current calendar month, with target comparison if target_value is set.

## Calculation Logic

For each metric, fetch all scorecard_entries where week_start falls in the current calendar month. Calculate based on the metric's `aggregation` field:

- **SUM:** Add all weekly values. Used for: Estimates Out, Draws Collected.
- **LATEST:** Take the most recent week's value. Used for: Cash in Bank, Crew-Days Booked, Unbuilt Backlog, Jobs Awaiting Pre-Construction.
- **AVERAGE:** Average all weekly values. Not used by current GC metrics but supported.

## Display

Each metric shows one line:
- Without target: `"Cash in Bank: $45,000"`
- With target: `"Draws Collected: $32,000 / $50,000"`
- No value this month: `"—"`

Currency metrics get $ prefix + comma formatting. Integer metrics show plain number.

## Files

- Migration 008: Fix aggregation values (sum → latest for 4 snapshot metrics)
- `src/app/(app)/scorecard/page.tsx`: Add aggregation to metrics query + fetch monthly entries + pass to component
- `src/components/scorecard/monthly-actuals.tsx`: New component, renders month-to-date section

## Prerequisite

Fix ZPB metric aggregation values AND trade_defaults:
- Cash in Bank → latest
- Crew-Days Booked → latest
- Unbuilt Backlog → latest
- Jobs Awaiting Pre-Construction → latest
- Estimates Out → sum (already correct)
- Draws Collected → sum (already correct)
