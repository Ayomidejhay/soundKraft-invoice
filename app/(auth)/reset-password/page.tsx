'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage(){

  const [password,setPassword] = useState('')
  const [confirm,setConfirm] = useState('')
  const [error,setError] = useState<string | null>(null)
  const [message,setMessage] = useState<string | null>(null)
  const [loading,setLoading] = useState(false)

  const router = useRouter()

  const handleReset = async (e:React.FormEvent)=>{
    e.preventDefault()

    if(password !== confirm){
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({
      password
    })

    if(error){
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage('Password updated successfully')

    setTimeout(()=>{
      router.push('/')
    },2000)

  }

  return(
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-6">

      <div className="w-full max-w-sm bg-slate-800 p-6 rounded-xl border border-slate-700">

        <h1 className="text-xl text-white font-semibold mb-4">
          Reset Password
        </h1>

        <form onSubmit={handleReset} className="space-y-4">

          <input
            type="password"
            placeholder="New password"
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
          />

          <input
            type="password"
            placeholder="Confirm password"
            required
            value={confirm}
            onChange={(e)=>setConfirm(e.target.value)}
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
            {loading ? 'Updating...' : 'Update Password'}
          </button>

        </form>

      </div>

    </div>
  )
}