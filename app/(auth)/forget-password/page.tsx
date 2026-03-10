'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ForgetPasswordPage() {

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage('Password reset link sent to your email.')
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-6">

      <div className="w-full max-w-sm bg-slate-800 p-6 rounded-xl border border-slate-700">

        <h1 className="text-xl text-white font-semibold mb-2">
          Forgot Password
        </h1>

        <p className="text-sm text-slate-400 mb-6">
          Enter your email to receive a reset link.
        </p>

        <form onSubmit={handleReset} className="space-y-4">

          <input
            type="email"
            required
            placeholder="staff@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {message && (
            <p className="text-green-400 text-sm">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 rounded-lg text-white"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

        </form>

        <button
          onClick={()=>router.push('/')}
          className="text-sm text-slate-400 mt-4"
        >
          Back to login
        </button>

      </div>

    </div>
  )
}