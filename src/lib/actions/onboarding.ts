'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type OnboardingResult = {
  error?: string
  tenantId?: string
  memberId?: string
}

export async function createTenant(formData: FormData): Promise<OnboardingResult> {
  const businessName = formData.get('businessName') as string
  const tradeType = formData.get('tradeType') as string
  const teamSize = parseInt(formData.get('teamSize') as string, 10)

  if (!businessName || !tradeType) {
    return { error: 'Business name and trade type are required' }
  }

  if (!teamSize || teamSize < 1 || teamSize > 50) {
    return { error: 'Team size must be between 1 and 50' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Generate IDs client-side to avoid .select() hitting RLS SELECT policy
  // (user has no tenant membership yet, so SELECT on tenants is blocked)
  const tenantId = crypto.randomUUID()
  const memberId = crypto.randomUUID()

  // Create tenant
  const { error: tenantError } = await supabase
    .from('tenants')
    .insert({
      id: tenantId,
      name: businessName,
      trade_type: tradeType,
      team_size: teamSize,
    })

  if (tenantError) {
    return { error: 'Failed to create business: ' + tenantError.message }
  }

  // Create owner membership
  const displayName = user.user_metadata?.display_name || user.email || 'Owner'

  const { error: memberError } = await supabase
    .from('tenant_members')
    .insert({
      id: memberId,
      tenant_id: tenantId,
      user_id: user.id,
      role: 'owner',
      display_name: displayName,
      email: user.email,
    })

  if (memberError) {
    return { error: 'Failed to create membership: ' + memberError.message }
  }

  // Seed default metrics from trade_defaults
  const { data: defaults, error: defaultsError } = await supabase
    .from('trade_defaults')
    .select('metric_name, metric_type, category, sort_order')
    .eq('trade_type', tradeType)
    .order('sort_order')

  if (defaultsError || !defaults) {
    return { error: 'Failed to load default metrics' }
  }

  const metricsToInsert = defaults.map((d) => ({
    tenant_id: tenantId,
    name: d.metric_name,
    metric_type: d.metric_type,
    category: d.category,
    sort_order: d.sort_order,
    owner_member_id: memberId,
  }))

  const { error: metricsError } = await supabase
    .from('scorecard_metrics')
    .insert(metricsToInsert)

  if (metricsError) {
    return { error: 'Failed to seed metrics: ' + metricsError.message }
  }

  redirect('/onboarding/beach-question')
}

export async function saveBigThree(formData: FormData): Promise<OnboardingResult> {
  const metric1 = formData.get('metric1') as string
  const metric2 = formData.get('metric2') as string
  const metric3 = formData.get('metric3') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: member } = await supabase
    .from('tenant_members')
    .select('id, tenant_id')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return { error: 'No business found' }
  }

  const { data: metrics } = await supabase
    .from('scorecard_metrics')
    .select('id, sort_order')
    .eq('tenant_id', member.tenant_id)
    .order('sort_order')

  if (!metrics || metrics.length === 0) {
    return { error: 'No metrics found' }
  }

  const customMetrics = [metric1, metric2, metric3].filter(Boolean)

  for (let i = 0; i < customMetrics.length && i < metrics.length; i++) {
    await supabase
      .from('scorecard_metrics')
      .update({ name: customMetrics[i] })
      .eq('id', metrics[i].id)
  }

  await supabase
    .from('tenants')
    .update({ onboarding_completed: true })
    .eq('id', member.tenant_id)

  redirect('/scorecard')
}

export async function skipBigThree(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: member } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single()

  if (member) {
    await supabase
      .from('tenants')
      .update({ onboarding_completed: true })
      .eq('id', member.tenant_id)
  }

  redirect('/scorecard')
}
