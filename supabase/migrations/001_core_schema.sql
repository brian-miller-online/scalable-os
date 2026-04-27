-- OwnerScore Core Schema
-- 7 core tables + 1 seed/config table + indexes
-- All tables include tenant_id for RLS isolation

-- Tenant (company) table
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trade_type text NOT NULL CHECK (trade_type IN (
    'painting', 'plumbing', 'electrical', 'hvac',
    'general_contractor', 'chiropractor', 'auto_repair', 'other'
  )),
  team_size integer NOT NULL DEFAULT 1,
  timezone text NOT NULL DEFAULT 'America/New_York',
  nudge_time time NOT NULL DEFAULT '07:00',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users within a tenant
CREATE TABLE tenant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  display_name text NOT NULL,
  email text,
  phone text,
  push_subscription jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Scorecard metric definitions
CREATE TABLE scorecard_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'always_track',
  name text NOT NULL,
  metric_type text NOT NULL DEFAULT 'integer'
    CHECK (metric_type IN ('currency', 'integer', 'percentage', 'decimal')),
  aggregation text NOT NULL DEFAULT 'sum'
    CHECK (aggregation IN ('sum', 'average', 'latest')),
  target_value numeric,
  owner_member_id uuid REFERENCES tenant_members(id),
  data_source text DEFAULT 'manual',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Weekly scorecard data entries
CREATE TABLE scorecard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_id uuid NOT NULL REFERENCES scorecard_metrics(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  value numeric,
  status_color text NOT NULL CHECK (status_color IN (
    'dark_green', 'lime_green', 'yellow', 'light_red', 'dark_red'
  )),
  status_note text,
  entered_by uuid REFERENCES tenant_members(id),
  entered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(metric_id, week_start)
);

-- Weekly priorities per team member
CREATE TABLE weekly_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES tenant_members(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  priority_text text NOT NULL,
  sort_order integer NOT NULL CHECK (sort_order BETWEEN 1 AND 3),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'carried_over')),
  carried_from_id uuid REFERENCES weekly_priorities(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(member_id, week_start, sort_order)
);

-- Meeting records
CREATE TABLE meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  meeting_type text NOT NULL DEFAULT 'weekly_huddle'
    CHECK (meeting_type IN ('weekly_huddle', 'quarterly_game_plan', 'ad_hoc')),
  week_start date,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped')),
  notes text,
  agenda_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Simple event log for analytics + nudge tracking
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  member_id uuid REFERENCES tenant_members(id),
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Trade-specific default metrics (seed/config table)
CREATE TABLE trade_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_type text NOT NULL,
  metric_name text NOT NULL,
  metric_type text NOT NULL DEFAULT 'integer',
  category text NOT NULL DEFAULT 'always_track',
  sort_order integer NOT NULL
);

-- Indexes
CREATE INDEX idx_tenant_members_user ON tenant_members(user_id);
CREATE INDEX idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX idx_scorecard_metrics_tenant ON scorecard_metrics(tenant_id);
CREATE INDEX idx_scorecard_entries_metric_week ON scorecard_entries(metric_id, week_start);
CREATE INDEX idx_scorecard_entries_tenant_week ON scorecard_entries(tenant_id, week_start);
CREATE INDEX idx_weekly_priorities_member_week ON weekly_priorities(member_id, week_start);
CREATE INDEX idx_meetings_tenant_week ON meetings(tenant_id, week_start);
CREATE INDEX idx_events_tenant_type ON events(tenant_id, event_type);
CREATE INDEX idx_events_created ON events(created_at);
