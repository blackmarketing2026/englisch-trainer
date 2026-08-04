import { BookOpen, CheckCircle2, Home, List, ListChecks, PlusCircle } from 'lucide-react'
import { NavLink } from '../../router'

const items = [
  { to: '/', label: 'Start', icon: Home },
  { to: '/training', label: 'Training', icon: BookOpen },
  { to: '/new', label: 'Neu', icon: PlusCircle },
  { to: '/items', label: 'Liste', icon: List },
  { to: '/active', label: 'Aktiv', icon: ListChecks },
  { to: '/mastered', label: 'Gelernt', icon: CheckCircle2 },
]

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b1424]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:sticky lg:top-24 lg:mx-0 lg:h-fit lg:rounded-xl lg:border lg:px-3 lg:py-3">
      <div className="mx-auto grid max-w-xl grid-cols-6 gap-1 lg:flex lg:max-w-none lg:flex-col">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold transition lg:min-h-12 lg:flex-row lg:justify-start lg:px-3 lg:text-sm ${
                isActive ? 'bg-yellow-300 text-slate-950' : 'text-slate-200 hover:bg-white/10'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
