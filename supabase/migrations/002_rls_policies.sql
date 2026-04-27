-- OwnerScore RLS Policies
-- Pattern: all tables isolated by tenant_id
-- Helper function avoids self-referencing RLS issues on tenant_members

-- Helper: get all tenant_ids for the current user
CREATE OR REPLACE FUNCTION public.user_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND is_active = true;
$$;

-- Helper: check if current user is owner of a specific tenant
CREATE OR REPLACE FUNCTION public.is_tenant_owner(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members
    WHERE user_id = auth.uid()
      AND tenant_id = p_tenant_id
      AND role = 'owner'
      AND is_active = true
  );
$$;

-- TENANTS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenants_select ON tenants
  FOR SELECT USING (id IN (SELECT public.user_tenant_ids()));

CREATE POLICY tenants_update ON tenants
  FOR UPDATE USING (public.is_tenant_owner(id));

CREATE POLICY tenants_insert ON tenants
  FOR INSERT WITH CHECK (true);

CREATE POLICY tenants_delete ON tenants
  FOR DELETE USING (public.is_tenant_owner(id));

-- TENANT_MEMBERS
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_members_select ON tenant_members
  FOR SELECT USING (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY tenant_members_insert ON tenant_members
  FOR INSERT WITH CHECK (
    public.is_tenant_owner(tenant_id)
    OR (user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY tenant_members_update ON tenant_members
  FOR UPDATE USING (
    public.is_tenant_owner(tenant_id)
    OR user_id = auth.uid()
  );

CREATE POLICY tenant_members_delete ON tenant_members
  FOR DELETE USING (public.is_tenant_owner(tenant_id));

-- SCORECARD_METRICS
ALTER TABLE scorecard_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY scorecard_metrics_select ON scorecard_metrics
  FOR SELECT USING (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY scorecard_metrics_insert ON scorecard_metrics
  FOR INSERT WITH CHECK (public.is_tenant_owner(tenant_id));

CREATE POLICY scorecard_metrics_update ON scorecard_metrics
  FOR UPDATE USING (public.is_tenant_owner(tenant_id));

CREATE POLICY scorecard_metrics_delete ON scorecard_metrics
  FOR DELETE USING (public.is_tenant_owner(tenant_id));

-- SCORECARD_ENTRIES
ALTER TABLE scorecard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY scorecard_entries_select ON scorecard_entries
  FOR SELECT USING (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY scorecard_entries_insert ON scorecard_entries
  FOR INSERT WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY scorecard_entries_update ON scorecard_entries
  FOR UPDATE USING (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY scorecard_entries_delete ON scorecard_entries
  FOR DELETE USING (public.is_tenant_owner(tenant_id));

-- WEEKLY_PRIORITIES
ALTER TABLE weekly_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY weekly_priorities_select ON weekly_priorities
  FOR SELECT USING (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY weekly_priorities_insert ON weekly_priorities
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT public.user_tenant_ids())
    AND member_id IN (
      SELECT id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY weekly_priorities_update ON weekly_priorities
  FOR UPDATE USING (
    member_id IN (
      SELECT id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY weekly_priorities_delete ON weekly_priorities
  FOR DELETE USING (
    public.is_tenant_owner(tenant_id)
    OR member_id IN (
      SELECT id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- MEETINGS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY meetings_select ON meetings
  FOR SELECT USING (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY meetings_insert ON meetings
  FOR INSERT WITH CHECK (public.is_tenant_owner(tenant_id));

CREATE POLICY meetings_update ON meetings
  FOR UPDATE USING (public.is_tenant_owner(tenant_id));

CREATE POLICY meetings_delete ON meetings
  FOR DELETE USING (public.is_tenant_owner(tenant_id));

-- EVENTS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_insert ON events
  FOR INSERT WITH CHECK (tenant_id IN (SELECT public.user_tenant_ids()));

CREATE POLICY events_select ON events
  FOR SELECT USING (public.is_tenant_owner(tenant_id));

-- TRADE_DEFAULTS
ALTER TABLE trade_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY trade_defaults_select ON trade_defaults
  FOR SELECT USING (auth.uid() IS NOT NULL);
