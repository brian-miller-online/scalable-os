'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import { FormField } from '@/components/ui/form-field'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">OwnerScore</h1>
          <p className="mt-1 text-gray-500">Create your account</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <FormField
            label="Your name"
            name="name"
            placeholder="Mike Johnson"
            required
            autoFocus
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="mike@example.com"
            required
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            required
          />
          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            required
          />

          {error && (
            <p className="text-sm text-red-600 text-center" data-testid="signup-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
              hover:bg-blue-700 disabled:bg-blue-400"
            style={{ minHeight: '44px' }}
            data-testid="signup-submit"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
