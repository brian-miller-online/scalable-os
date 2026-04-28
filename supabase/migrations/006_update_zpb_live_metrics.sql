-- Update ZPB (Brian's test tenant) live metrics to match refined GC defaults.
-- Tenant ID: 3da3ff0d-df52-4e96-a3ed-d5b4bd0e1b0d

-- Evergreen: Cash in Bank (was Active Projects)
UPDATE scorecard_metrics SET name = 'Cash in Bank', metric_type = 'currency', category = 'always_track', sort_order = 1
WHERE id = 'fa41533f-dd3c-4b30-8740-7b5af4467371';

-- Evergreen: Crew-Days Booked (was Permits Pending)
UPDATE scorecard_metrics SET name = 'Crew-Days Booked (Next 8 Weeks)', metric_type = 'integer', category = 'always_track', sort_order = 2
WHERE id = 'c4faaa3f-6ad5-47ee-afab-7cb0db8934a4';

-- Evergreen: Unbuilt Backlog (was Revenue This Week)
UPDATE scorecard_metrics SET name = 'Unbuilt Backlog', metric_type = 'currency', category = 'always_track', sort_order = 3
WHERE id = '82123ea3-c604-4496-a27a-3544d778faae';

-- North Star: Estimates Out (was Cash Collected)
UPDATE scorecard_metrics SET name = 'Estimates Out', metric_type = 'currency', category = 'quarterly_focus', sort_order = 4
WHERE id = '48402b9b-ddca-4cc8-b462-e7406f037b50';

-- North Star: Draws Collected (was Change Orders Open)
UPDATE scorecard_metrics SET name = 'Draws Collected', metric_type = 'currency', category = 'quarterly_focus', sort_order = 5
WHERE id = 'a5c5db09-57b6-47ce-afb6-42fe5bc0d9e5';

-- North Star: Jobs Awaiting Pre-Construction (was Estimates Sent)
UPDATE scorecard_metrics SET name = 'Jobs Awaiting Pre-Construction', metric_type = 'integer', category = 'quarterly_focus', sort_order = 6
WHERE id = '7266cff8-6313-4545-aabb-5e847e903135';
