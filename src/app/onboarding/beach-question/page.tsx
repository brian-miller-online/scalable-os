'use client'

import { useState } from 'react'
import { saveBigThree, skipBigThree } from '@/lib/actions/onboarding'
import { FormField } from '@/components/ui/form-field'

export default function BeachQuestionPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = await saveBigThree(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleSkip() {
    setLoading(true)
    await skipBigThree()
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold">One more thing</h1>
          <p className="mt-2 text-gray-500 leading-relaxed">
            If you left for two weeks and could only check 3 numbers to know
            your business was okay, what would they be?
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <FormField
            label="Number 1"
            name="metric1"
            placeholder="e.g. Revenue this week"
            autoFocus
          />
          <FormField
            label="Number 2"
            name="metric2"
            placeholder="e.g. Jobs in progress"
          />
          <FormField
            label="Number 3"
            name="metric3"
            placeholder="e.g. New leads"
          />

          {error && (
            <p className="text-sm text-red-600 text-center" data-testid="beach-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
              hover:bg-blue-700 disabled:bg-blue-400"
            style={{ minHeight: '44px' }}
            data-testid="beach-submit"
          >
            {loading ? 'Saving...' : 'Use these'}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium
              text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
            style={{ minHeight: '44px' }}
            data-testid="beach-skip"
          >
            Skip — use the defaults
          </button>
        </form>
      </div>
    </main>
  )
}
