-- Add description field to scorecard_metrics and trade_defaults.
-- Shows as helper text below the metric name in the scorecard UI.

ALTER TABLE scorecard_metrics ADD COLUMN description text;
ALTER TABLE trade_defaults ADD COLUMN description text;

-- Populate GC trade_defaults descriptions
UPDATE trade_defaults SET description = 'Total liquid cash across all operating accounts as of Friday'
WHERE trade_type = 'general_contractor' AND metric_name = 'Cash in Bank';

UPDATE trade_defaults SET description = 'Total days all crews (yours + subs) are confirmed on job sites over the next 8 weeks'
WHERE trade_type = 'general_contractor' AND metric_name = 'Crew-Days Booked (Next 8 Weeks)';

UPDATE trade_defaults SET description = 'Total dollar amount remaining to be billed on all signed contracts (unstarted + in-progress)'
WHERE trade_type = 'general_contractor' AND metric_name = 'Unbuilt Backlog';

UPDATE trade_defaults SET description = 'Total dollar value of proposals delivered to qualified prospects this week'
WHERE trade_type = 'general_contractor' AND metric_name = 'Estimates Out';

UPDATE trade_defaults SET description = 'Cash actually deposited into the bank from customer payments this week'
WHERE trade_type = 'general_contractor' AND metric_name = 'Draws Collected';

UPDATE trade_defaults SET description = 'Jobs sold but waiting on civil engineering; site plan; or architecture before permits can be filed'
WHERE trade_type = 'general_contractor' AND metric_name = 'Jobs Awaiting Pre-Construction';

-- Populate ZPB tenant live metric descriptions
UPDATE scorecard_metrics SET description = 'Total liquid cash across all operating accounts as of Friday'
WHERE tenant_id = '3da3ff0d-df52-4e96-a3ed-d5b4bd0e1b0d' AND name = 'Cash in Bank';

UPDATE scorecard_metrics SET description = 'Total days all crews (yours + subs) are confirmed on job sites over the next 8 weeks'
WHERE tenant_id = '3da3ff0d-df52-4e96-a3ed-d5b4bd0e1b0d' AND name = 'Crew-Days Booked (Next 8 Weeks)';

UPDATE scorecard_metrics SET description = 'Total dollar amount remaining to be billed on all signed contracts (unstarted + in-progress)'
WHERE tenant_id = '3da3ff0d-df52-4e96-a3ed-d5b4bd0e1b0d' AND name = 'Unbuilt Backlog';

UPDATE scorecard_metrics SET description = 'Total dollar value of proposals delivered to qualified prospects this week'
WHERE tenant_id = '3da3ff0d-df52-4e96-a3ed-d5b4bd0e1b0d' AND name = 'Estimates Out';

UPDATE scorecard_metrics SET description = 'Cash actually deposited into the bank from customer payments this week'
WHERE tenant_id = '3da3ff0d-df52-4e96-a3ed-d5b4bd0e1b0d' AND name = 'Draws Collected';

UPDATE scorecard_metrics SET description = 'Jobs sold but waiting on civil engineering; site plan; or architecture before permits can be filed'
WHERE tenant_id = '3da3ff0d-df52-4e96-a3ed-d5b4bd0e1b0d' AND name = 'Jobs Awaiting Pre-Construction';
