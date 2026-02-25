'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Fake login check (frontend only)
    setTimeout(() => {
      if (email === 'demo@example.com' && password === 'password123') {
        router.push('/dashboard')
      } else {
        setError('Invalid email or password')
      }
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-6">
      <div className="w-full max-w-sm">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div> */}
          </div>
          <h1 className="text-2xl font-bold text-white">SoundKraft Invoice</h1>
          {/* <p className="text-sm text-slate-400 mt-1">Staff Portal</p> */}
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-1">Login</h2>
          <p className="text-sm text-slate-400 mb-6">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-slate-200 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-200 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
                {error}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Demo: <span className="text-slate-300">demo@example.com</span> /{' '}
          <span className="text-slate-300">password123</span>
        </p>
      </div>
    </div>
  )
}