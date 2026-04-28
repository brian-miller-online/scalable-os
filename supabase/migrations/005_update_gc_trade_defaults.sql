-- Update General Contractor trade defaults based on Manus research + Brian's operational refinements.
-- Original defaults were ambiguous ("Active Projects", "Revenue This Week").
-- New defaults follow Get Scalable framework: 3 Evergreen + 3 North Star.

-- Delete old GC defaults
DELETE FROM trade_defaults WHERE trade_type = 'general_contractor';

-- Insert refined GC defaults
INSERT INTO trade_defaults (trade_type, metric_name, metric_type, category, sort_order) VALUES
  ('general_contractor', 'Cash in Bank', 'currency', 'always_track', 1),
  ('general_contractor', 'Crew-Days Booked (Next 8 Weeks)', 'integer', 'always_track', 2),
  ('general_contractor', 'Unbuilt Backlog', 'currency', 'always_track', 3),
  ('general_contractor', 'Estimates Out', 'currency', 'quarterly_focus', 4),
  ('general_contractor', 'Draws Collected', 'currency', 'quarterly_focus', 5),
  ('general_contractor', 'Jobs Awaiting Pre-Construction', 'integer', 'quarterly_focus', 6);
