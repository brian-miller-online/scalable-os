'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { login } from '@/lib/actions/auth'
import { FormField } from '@/components/ui/form-field'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="mike@example.com"
        required
        autoFocus
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        required
      />

      {(error || callbackError) && (
        <p className="text-sm text-red-600 text-center" data-testid="login-error">
          {error || 'Something went wrong. Please try again.'}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
          hover:bg-blue-700 disabled:bg-blue-400"
        style={{ minHeight: '44px' }}
        data-testid="login-submit"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">OwnerScore</h1>
          <p className="mt-1 text-gray-500">Sign in to your account</p>
        </div>

        <Suspense fallback={<div className="h-48" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
