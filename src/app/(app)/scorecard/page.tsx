import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ScorecardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: member } = await supabase
    .from('tenant_members')
    .select('id, tenant_id, display_name')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    redirect('/onboarding')
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, trade_type')
    .eq('id', member.tenant_id)
    .single()

  const { data: metrics } = await supabase
    .from('scorecard_metrics')
    .select('id, name, metric_type, category, sort_order')
    .eq('tenant_id', member.tenant_id)
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold">Weekly Numbers</h1>
        <p className="text-sm text-gray-500">{tenant?.name}</p>
      </div>

      <div className="space-y-3">
        {metrics?.map((metric) => (
          <div
            key={metric.id}
            className="flex items-center justify-between rounded-lg border p-3"
            data-testid={`metric-${metric.sort_order}`}
          >
            <div>
              <p className="font-medium text-sm">{metric.name}</p>
              <p className="text-xs text-gray-400">{metric.metric_type}</p>
            </div>
            <p className="text-sm text-gray-400">Entry UI — Task 3</p>
          </div>
        ))}
      </div>

      {(!metrics || metrics.length === 0) && (
        <p className="text-gray-500 text-center py-8">No metrics configured</p>
      )}
    </div>
  )
}
