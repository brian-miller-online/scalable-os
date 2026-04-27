import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has a tenant with completed onboarding
  const { data: member } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!member) {
    redirect('/onboarding')
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('onboarding_completed')
    .eq('id', member.tenant_id)
    .single()

  if (!tenant?.onboarding_completed) {
    redirect('/onboarding/beach-question')
  }

  redirect('/scorecard')
}
