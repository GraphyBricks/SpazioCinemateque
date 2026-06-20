'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError(true)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 bg-cream">
      <div className="w-full max-w-md">
        <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tight mb-8 text-center">Admin Login</h1>
        <form onSubmit={login} className="border border-charcoal/10 p-8 bg-cream">
          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-stone mb-2 font-body">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-sm bg-wheat outline-none transition-all duration-500"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-terra text-sm font-body">Invalid password.</p>}
            <button type="submit" className="btn-gold w-full justify-center">
              Enter Dashboard
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
