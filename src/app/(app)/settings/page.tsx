'use client'

import { logout } from '@/lib/actions/auth'
import { useState } from 'react'

export default function SettingsPage() {
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>
      <p className="text-sm text-gray-500">Settings UI — Task 8</p>

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600
            hover:bg-red-50 disabled:text-red-300"
          style={{ minHeight: '44px' }}
          data-testid="logout-button"
        >
          {loggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  )
}
