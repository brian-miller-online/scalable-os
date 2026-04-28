import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MetricList } from '@/components/settings/metric-list'

export default async function MetricsSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('tenant_members')
    .select('id, tenant_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/onboarding')
  if (member.role !== 'owner') redirect('/scorecard')

  const { data: metrics } = await supabase
    .from('scorecard_metrics')
    .select('id, name, description, metric_type, category, sort_order, target_value, aggregation, is_active')
    .eq('tenant_id', member.tenant_id)
    .eq('is_active', true)
    .order('category')
    .order('sort_order')

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Edit Metrics</h1>
        <a href="/settings" className="text-sm text-blue-600 hover:text-blue-800">Back</a>
      </div>
      <MetricList
        metrics={metrics || []}
        tenantId={member.tenant_id}
      />
    </div>
  )
}
