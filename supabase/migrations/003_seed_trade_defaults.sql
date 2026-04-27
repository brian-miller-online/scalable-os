-- OwnerScore Trade Defaults
-- 6 default metrics per trade x 7 trades = 42 rows

INSERT INTO trade_defaults (trade_type, metric_name, metric_type, category, sort_order) VALUES
  -- Painting
  ('painting', 'Jobs in Progress', 'integer', 'always_track', 1),
  ('painting', 'Estimates Sent This Week', 'integer', 'always_track', 2),
  ('painting', 'Revenue This Week', 'currency', 'always_track', 3),
  ('painting', 'Cash Collected', 'currency', 'always_track', 4),
  ('painting', 'Callbacks / Punch List', 'integer', 'always_track', 5),
  ('painting', 'New Leads', 'integer', 'always_track', 6),

  -- Plumbing
  ('plumbing', 'Service Calls Completed', 'integer', 'always_track', 1),
  ('plumbing', 'Installs in Progress', 'integer', 'always_track', 2),
  ('plumbing', 'Revenue This Week', 'currency', 'always_track', 3),
  ('plumbing', 'Cash Collected', 'currency', 'always_track', 4),
  ('plumbing', 'Warranty Returns', 'integer', 'always_track', 5),
  ('plumbing', 'New Leads', 'integer', 'always_track', 6),

  -- Electrical
  ('electrical', 'Jobs in Progress', 'integer', 'always_track', 1),
  ('electrical', 'Permits Pulled', 'integer', 'always_track', 2),
  ('electrical', 'Revenue This Week', 'currency', 'always_track', 3),
  ('electrical', 'Cash Collected', 'currency', 'always_track', 4),
  ('electrical', 'Callbacks', 'integer', 'always_track', 5),
  ('electrical', 'New Leads', 'integer', 'always_track', 6),

  -- HVAC
  ('hvac', 'Service Calls Completed', 'integer', 'always_track', 1),
  ('hvac', 'Install Jobs in Progress', 'integer', 'always_track', 2),
  ('hvac', 'Revenue This Week', 'currency', 'always_track', 3),
  ('hvac', 'Cash Collected', 'currency', 'always_track', 4),
  ('hvac', 'Warranty Callbacks', 'integer', 'always_track', 5),
  ('hvac', 'New Leads', 'integer', 'always_track', 6),

  -- General Contractor
  ('general_contractor', 'Active Projects', 'integer', 'always_track', 1),
  ('general_contractor', 'Permits Pending', 'integer', 'always_track', 2),
  ('general_contractor', 'Revenue This Week', 'currency', 'always_track', 3),
  ('general_contractor', 'Cash Collected', 'currency', 'always_track', 4),
  ('general_contractor', 'Change Orders Open', 'integer', 'always_track', 5),
  ('general_contractor', 'Estimates Sent', 'integer', 'always_track', 6),

  -- Chiropractor
  ('chiropractor', 'Patients Seen', 'integer', 'always_track', 1),
  ('chiropractor', 'New Patient Visits', 'integer', 'always_track', 2),
  ('chiropractor', 'Revenue This Week', 'currency', 'always_track', 3),
  ('chiropractor', 'Cash Collected', 'currency', 'always_track', 4),
  ('chiropractor', 'No-Shows', 'integer', 'always_track', 5),
  ('chiropractor', 'New Leads', 'integer', 'always_track', 6),

  -- Auto Repair
  ('auto_repair', 'Cars in Shop', 'integer', 'always_track', 1),
  ('auto_repair', 'Jobs Completed', 'integer', 'always_track', 2),
  ('auto_repair', 'Revenue This Week', 'currency', 'always_track', 3),
  ('auto_repair', 'Cash Collected', 'currency', 'always_track', 4),
  ('auto_repair', 'Comebacks', 'integer', 'always_track', 5),
  ('auto_repair', 'New Leads', 'integer', 'always_track', 6);
