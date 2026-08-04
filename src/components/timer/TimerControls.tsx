import { Pause, Play } from 'lucide-react'

export function TimerControls({
  paused,
  onPause,
  onResume,
}: {
  paused: boolean
  onPause: () => void
  onResume: () => void
}) {
  return paused ? (
    <button className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-400 px-4 font-bold text-slate-950" onClick={onResume}>
      <Play size={18} /> Fortsetzen
    </button>
  ) : (
    <button className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white/10 px-4 font-bold text-white" onClick={onPause}>
      <Pause size={18} /> Pausieren
    </button>
  )
}
