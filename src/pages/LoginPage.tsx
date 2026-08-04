import { LockKeyhole, LogIn } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

export function LoginPage({ onLogin }: { onLogin: (username: string, password: string) => boolean }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  function submit(event: FormEvent) {
    event.preventDefault()
    if (onLogin(username, password)) return
    setError('Benutzername oder Passwort ist falsch.')
    setPassword('')
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-yellow-300 text-slate-950">
          <LockKeyhole size={28} />
        </div>
        <h1 className="mt-6 text-center text-3xl font-black text-white">30 Minuten Englisch</h1>
        <p className="mt-2 text-center font-semibold text-slate-300">Bitte anmelden, um dein Training zu öffnen.</p>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Benutzer
            <input
              autoComplete="username"
              className="min-h-12 rounded-lg border border-white/10 bg-[#0f1a2c] p-3 text-white"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Passwort
            <input
              autoComplete="current-password"
              className="min-h-12 rounded-lg border border-white/10 bg-[#0f1a2c] p-3 text-white"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="rounded-lg bg-red-500/20 p-3 text-sm font-semibold text-red-100">{error}</p> : null}
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-yellow-300 px-4 font-black text-slate-950">
            <LogIn size={18} /> Einloggen
          </button>
        </form>
      </section>
    </main>
  )
}
