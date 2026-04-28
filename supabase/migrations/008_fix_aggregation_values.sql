-- Fix aggregation values for snapshot metrics in scorecard_metrics.
-- Cash in Bank, Crew-Days, Backlog, Pre-Construction are snapshots (latest value wins).
-- Estimates Out and Draws Collected are activity metrics (sum across the month).

-- Fix ZPB tenant live metrics
UPDATE scorecard_metrics SET aggregation = 'latest'
WHERE tenant_id = '3da3ff0d-df52-4e96-a3ed-d5b4bd0e1b0d' AND name IN (
  'Cash in Bank', 'Crew-Days Booked (Next 8 Weeks)', 'Unbuilt Backlog', 'Jobs Awaiting Pre-Construction'
);

-- Add aggregation column to trade_defaults for future signups
ALTER TABLE trade_defaults ADD COLUMN IF NOT EXISTS aggregation text NOT NULL DEFAULT 'sum';

UPDATE trade_defaults SET aggregation = 'latest'
WHERE trade_type = 'general_contractor' AND metric_name IN (
  'Cash in Bank', 'Crew-Days Booked (Next 8 Weeks)', 'Unbuilt Backlog', 'Jobs Awaiting Pre-Construction'
);
