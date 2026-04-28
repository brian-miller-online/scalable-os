import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getWeekStart, getPreviousWeekStart } from '@/utils/week'
import { WeekHeader } from '@/components/scorecard/week-header'
import { ScorecardBody } from './scorecard-body'

// Category display order
const CATEGORY_ORDER = ['always_track', 'quarterly_focus']

function groupByCategory(
  metrics: Array<{
    id: string
    name: string
    description: string | null
    metric_type: string
    category: string
    sort_order: number
    target_value: number | null
  }>
): Map<string, typeof metrics> {
  const groups = new Map<string, typeof metrics>()
  for (const metric of metrics) {
    const existing = groups.get(metric.category) || []
    existing.push(metric)
    groups.set(metric.category, existing)
  }
  return groups
}

function categoryLabel(category: string): string {
  switch (category) {
    case 'always_track':
      return 'Always Track'
    case 'quarterly_focus':
      return "This Quarter's Focus"
    default:
      return category
  }
}

function sortedCategoryKeys(groups: Map<string, unknown[]>): string[] {
  const keys = Array.from(groups.keys())
  return keys.sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a)
    const bIndex = CATEGORY_ORDER.indexOf(b)
    const aOrder = aIndex >= 0 ? aIndex : CATEGORY_ORDER.length
    const bOrder = bIndex >= 0 ? bIndex : CATEGORY_ORDER.length
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.localeCompare(b)
  })
}

export default async function ScorecardPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    .select('name, timezone')
    .eq('id', member.tenant_id)
    .single()

  const timezone = tenant?.timezone || 'America/New_York'
  const currentWeekStart = getWeekStart(new Date(), timezone)

  const params = await searchParams
  const weekParam = params.week
  const weekStart =
    weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)
      ? weekParam
      : currentWeekStart
  const previousWeekStart = getPreviousWeekStart(weekStart)

  // Fetch metrics
  const { data: metrics } = await supabase
    .from('scorecard_metrics')
    .select('id, name, description, metric_type, category, sort_order, target_value')
    .eq('tenant_id', member.tenant_id)
    .eq('is_active', true)
    .order('category')
    .order('sort_order')

  if (!metrics || metrics.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Weekly Numbers</h1>
        <p className="text-gray-500 text-center py-8">
          No metrics set up yet. Go to Settings to add your first metric.
        </p>
      </div>
    )
  }

  // Fetch current week entries
  const { data: currentEntries } = await supabase
    .from('scorecard_entries')
    .select('metric_id, value, status_color, status_note')
    .eq('tenant_id', member.tenant_id)
    .eq('week_start', weekStart)

  // Fetch previous week entries (for "last week" reference)
  const { data: previousEntries } = await supabase
    .from('scorecard_entries')
    .select('metric_id, value, status_color')
    .eq('tenant_id', member.tenant_id)
    .eq('week_start', previousWeekStart)

  // Index entries by metric_id for O(1) lookup
  const currentByMetric = new Map(
    (currentEntries || []).map((e) => [
      e.metric_id,
      { value: e.value, status_color: e.status_color, status_note: e.status_note },
    ])
  )
  const previousByMetric = new Map(
    (previousEntries || []).map((e) => [e.metric_id, { value: e.value }])
  )

  // Group metrics by category
  const groups = groupByCategory(metrics)
  const orderedKeys = sortedCategoryKeys(groups)

  // Build serializable data for client component
  const categorizedMetrics = orderedKeys.map((category) => ({
    category,
    label: categoryLabel(category),
    metrics: (groups.get(category) || []).map((m) => ({
      metric: {
        id: m.id,
        name: m.name,
        description: m.description,
        metric_type: m.metric_type,
        target_value: m.target_value,
      },
      currentEntry: currentByMetric.get(m.id) || null,
      lastWeekEntry: previousByMetric.get(m.id) || null,
    })),
  }))

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold">Weekly Numbers</h1>
        <p className="text-sm text-gray-500">{tenant?.name}</p>
      </div>

      <WeekHeader weekStart={weekStart} currentWeekStart={currentWeekStart} />

      <ScorecardBody
        categorizedMetrics={categorizedMetrics}
        tenantId={member.tenant_id}
        weekStart={weekStart}
        memberId={member.id}
      />
    </div>
  )
}
