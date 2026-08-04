import { Clock } from 'lucide-react'
import { secondsToClock } from '../../utils/dates'

export function CountdownTimer({ seconds, label = 'verbleibend' }: { seconds: number; label?: string }) {
  return (
    <div className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 font-black text-white">
      <Clock size={20} />
      <span className="text-lg tabular-nums">{secondsToClock(seconds)}</span>
      <span className="text-sm font-semibold text-slate-300">{label}</span>
    </div>
  )
}
