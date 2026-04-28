'use server'

import { createClient } from '@/lib/supabase/server'

export type SaveEntryInput = {
  metricId: string
  weekStart: string
  tenantId: string
  memberId: string
  value: number | null
  statusColor: string
  statusNote: string | null
}

export type SaveEntryResult = {
  success: boolean
  error?: string
}

export async function saveEntry(data: SaveEntryInput): Promise<SaveEntryResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const now = new Date().toISOString()

  const { error } = await supabase.from('scorecard_entries').upsert(
    {
      metric_id: data.metricId,
      week_start: data.weekStart,
      tenant_id: data.tenantId,
      entered_by: data.memberId,
      value: data.value,
      status_color: data.statusColor,
      status_note: data.statusNote,
      entered_at: now,
      updated_at: now,
    },
    { onConflict: 'metric_id,week_start' }
  )

  if (error) {
    console.error('saveEntry failed:', error)
    return { success: false, error: 'Failed to save entry' }
  }

  return { success: true }
}

export async function logEntryDuration(data: {
  tenantId: string
  memberId: string
  weekStart: string
  durationSeconds: number
  metricsFilled: number
}): Promise<void> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('events').insert({
    tenant_id: data.tenantId,
    member_id: data.memberId,
    event_type: 'scorecard_entry',
    event_data: {
      duration_seconds: data.durationSeconds,
      metrics_filled: data.metricsFilled,
      week_start: data.weekStart,
    },
  })
}
