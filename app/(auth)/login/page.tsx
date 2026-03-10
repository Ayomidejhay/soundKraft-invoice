// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { signInWithEmailAndPassword } from 'firebase/auth'
// import { auth } from '@/lib/firebase'
// import { FirebaseError } from 'firebase/app'

// export default function Page() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter()

//   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError(null)

//     try {
//       await signInWithEmailAndPassword(auth, email, password)

//       // Redirect after successful login
//       router.push('/dashboard')

//     } catch (err) {
//       if (err instanceof FirebaseError) {
//         switch (err.code) {
//           case 'auth/user-not-found':
//             setError('User not found')
//             break
//           case 'auth/wrong-password':
//             setError('Incorrect password')
//             break
//           case 'auth/invalid-email':
//             setError('Invalid email format')
//             break
//           default:
//             setError('Login failed. Please try again.')
//         }
//       } else {
//         setError('Unexpected error occurred')
//       }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-6">
//       <div className="w-full max-w-sm">

//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-2xl font-bold text-white">
//             Welcome to the SoundKrafterz
//           </h1>
//         </div>

//         {/* Login Card */}
//         <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-xl p-6 shadow-lg">
//           <h2 className="text-xl font-semibold text-white mb-1">Login</h2>
//           <p className="text-sm text-slate-400 mb-6">
//             Enter your credentials to continue
//           </p>

//           <form onSubmit={handleLogin} className="space-y-5">

//             {/* Email */}
//             <div>
//               <label className="block text-sm text-slate-200 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 required
//                 placeholder="staff@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm text-slate-200 mb-1">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-4 py-2 rounded-lg bg-slate-700/60 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
//               />
//             </div>

//             {/* Error */}
//             {error && (
//               <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
//                 {error}
//               </p>
//             )}

//             {/* Button */}
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition disabled:opacity-50"
//             >
//               {isLoading ? 'Logging in...' : 'Login'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/context/AuthContext'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { user, loading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome to the SoundKrafterz
          </h1>
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
              <label className="block text-sm text-slate-200 mb-1">
                Email
              </label>
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
              <label className="block text-sm text-slate-200 mb-1">
                Password
              </label>
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

            <div className="text-right">
  <a
    href="/forget-password"
    className="text-sm text-blue-400 hover:underline"
  >
    Forgot password?
  </a>
</div>

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
      </div>
    </div>
  )
}