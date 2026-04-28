'use server'

import { createClient } from '@/lib/supabase/server'

export type MetricInput = {
  tenantId: string
  name: string
  description?: string | null
  metricType: string
  category: string
  aggregation: string
  targetValue?: number | null
}

export type ActionResult = {
  success: boolean
  error?: string
}

export async function addMetric(data: MetricInput): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get next sort_order
  const { data: existing } = await supabase
    .from('scorecard_metrics')
    .select('sort_order')
    .eq('tenant_id', data.tenantId)
    .eq('is_active', true)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1

  const { error } = await supabase
    .from('scorecard_metrics')
    .insert({
      tenant_id: data.tenantId,
      name: data.name,
      description: data.description || null,
      metric_type: data.metricType,
      category: data.category,
      aggregation: data.aggregation,
      target_value: data.targetValue ?? null,
      sort_order: nextOrder,
    })

  if (error) {
    console.error('[metrics] addMetric failed:', error)
    return { success: false, error: 'Failed to add metric' }
  }
  console.log('[metrics] added metric:', data.name)
  return { success: true }
}

export async function updateMetric(
  metricId: string,
  updates: Partial<{
    name: string
    description: string | null
    metricType: string
    category: string
    aggregation: string
    targetValue: number | null
  }>
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const dbUpdates: {
    name?: string
    description?: string | null
    metric_type?: string
    category?: string
    aggregation?: string
    target_value?: number | null
    updated_at: string
  } = { updated_at: new Date().toISOString() }
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.metricType !== undefined) dbUpdates.metric_type = updates.metricType
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.aggregation !== undefined) dbUpdates.aggregation = updates.aggregation
  if (updates.targetValue !== undefined) dbUpdates.target_value = updates.targetValue

  const { error } = await supabase
    .from('scorecard_metrics')
    .update(dbUpdates)
    .eq('id', metricId)

  if (error) {
    console.error('[metrics] updateMetric failed:', error)
    return { success: false, error: 'Failed to update metric' }
  }
  console.log('[metrics] updated metric:', metricId)
  return { success: true }
}

export async function deleteMetric(metricId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('scorecard_metrics')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', metricId)

  if (error) {
    console.error('[metrics] deleteMetric failed:', error)
    return { success: false, error: 'Failed to delete metric' }
  }
  console.log('[metrics] soft-deleted metric:', metricId)
  return { success: true }
}

export async function restoreMetric(metricId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('scorecard_metrics')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', metricId)

  if (error) {
    console.error('[metrics] restoreMetric failed:', error)
    return { success: false, error: 'Failed to restore metric' }
  }
  console.log('[metrics] restored metric:', metricId)
  return { success: true }
}

export async function reorderMetric(
  metricId: string,
  direction: 'up' | 'down',
  tenantId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get the metric being moved
  const { data: metric } = await supabase
    .from('scorecard_metrics')
    .select('id, sort_order, category')
    .eq('id', metricId)
    .single()

  if (!metric) return { success: false, error: 'Metric not found' }

  // Get adjacent metric in same category
  const { data: adjacent } = await supabase
    .from('scorecard_metrics')
    .select('id, sort_order')
    .eq('tenant_id', tenantId)
    .eq('category', metric.category)
    .eq('is_active', true)
    .order('sort_order', { ascending: direction === 'up' ? false : true })
    .filter('sort_order', direction === 'up' ? 'lt' : 'gt', metric.sort_order)
    .limit(1)

  if (!adjacent || adjacent.length === 0) {
    return { success: true } // Already at boundary, no-op
  }

  const swap = adjacent[0]

  // Swap sort_orders
  await supabase
    .from('scorecard_metrics')
    .update({ sort_order: swap.sort_order })
    .eq('id', metric.id)

  await supabase
    .from('scorecard_metrics')
    .update({ sort_order: metric.sort_order })
    .eq('id', swap.id)

  console.log('[metrics] reordered metric:', metricId, direction)
  return { success: true }
}
