import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return updateSession(request)
}
