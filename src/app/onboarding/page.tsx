'use client'

import { useState } from 'react'
import { createTenant } from '@/lib/actions/onboarding'
import { FormField } from '@/components/ui/form-field'

const tradeTypes = [
  { value: 'painting', label: 'Painting' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'general_contractor', label: 'General Contractor' },
  { value: 'chiropractor', label: 'Chiropractor' },
  { value: 'auto_repair', label: 'Auto Repair' },
  { value: 'other', label: 'Other' },
]

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = await createTenant(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to OwnerScore</h1>
          <p className="mt-1 text-gray-500">Tell us about your business</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <FormField
            label="Business name"
            name="businessName"
            placeholder="Johnson Painting LLC"
            required
            autoFocus
          />

          <div className="space-y-1">
            <label htmlFor="tradeType" className="block text-sm font-medium text-gray-700">
              What kind of business?
            </label>
            <select
              id="tradeType"
              name="tradeType"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
                focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{ minHeight: '44px' }}
              data-testid="field-tradeType"
            >
              <option value="">Select your trade</option>
              {tradeTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="How many people work here (including you)?"
            name="teamSize"
            type="number"
            min={1}
            max={50}
            defaultValue={1}
            required
          />

          {error && (
            <p className="text-sm text-red-600 text-center" data-testid="onboarding-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
              hover:bg-blue-700 disabled:bg-blue-400"
            style={{ minHeight: '44px' }}
            data-testid="onboarding-submit"
          >
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </form>
      </div>
    </main>
  )
}
