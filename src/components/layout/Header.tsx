import { BarChart3, Settings } from 'lucide-react'
import { Link } from '../../router'
import { formatDate } from '../../utils/dates'

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08111f]/88 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link to="/" className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">{formatDate(new Date().toISOString())}</p>
          <h1 className="truncate text-xl font-black text-white sm:text-2xl">30 Minuten Englisch</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link className="rounded-lg border border-white/10 p-3 text-white hover:bg-white/10" to="/statistics" aria-label="Statistiken">
            <BarChart3 size={20} />
          </Link>
          <Link className="rounded-lg border border-white/10 p-3 text-white hover:bg-white/10" to="/settings" aria-label="Einstellungen">
            <Settings size={20} />
          </Link>
        </div>
      </div>
    </header>
  )
}
