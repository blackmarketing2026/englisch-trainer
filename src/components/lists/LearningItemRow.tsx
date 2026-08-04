import { Edit3, Pause, Play, RotateCcw, Trash2 } from 'lucide-react'
import { LearningProgress } from '../learning/LearningProgress'
import type { LearningItem } from '../../types/learning'
import { formatDateTime } from '../../utils/dates'

export function LearningItemRow({
  item,
  requiredCorrectAnswers,
  onPause,
  onActivate,
  onWaiting,
  onReset,
  onDelete,
}: {
  item: LearningItem
  requiredCorrectAnswers: number
  onPause: () => void
  onActivate: () => void
  onWaiting: () => void
  onReset: () => void
  onDelete: () => void
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-black text-white">{item.english}</h3>
          <p className="mt-1 text-slate-300">{item.german}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
            <span className="rounded-md bg-white/10 px-2 py-1">{item.correctCount} / {requiredCorrectAnswers} richtig</span>
            <span className="rounded-md bg-white/10 px-2 py-1">{item.incorrectCount} falsch</span>
            <span className="rounded-md bg-white/10 px-2 py-1">{formatDateTime(item.lastAnsweredAt)}</span>
            {item.category ? <span className="rounded-md bg-sky-400/20 px-2 py-1 text-sky-100">{item.category}</span> : null}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-1">
          <button className="rounded-lg bg-white/10 p-3 text-white" aria-label="Bearbeiten" disabled>
            <Edit3 size={18} />
          </button>
          {item.status === 'active' ? (
            <button className="rounded-lg bg-white/10 p-3 text-white" aria-label="In Warteliste verschieben" onClick={onWaiting}>
              <Pause size={18} />
            </button>
          ) : (
            <button className="rounded-lg bg-emerald-400 p-3 text-slate-950" aria-label="Aktivieren" onClick={onActivate}>
              <Play size={18} />
            </button>
          )}
          <button className="rounded-lg bg-white/10 p-3 text-white" aria-label="Pausieren" onClick={onPause}>
            <Pause size={18} />
          </button>
          <button className="rounded-lg bg-white/10 p-3 text-white" aria-label="Fortschritt zurücksetzen" onClick={onReset}>
            <RotateCcw size={18} />
          </button>
          <button className="rounded-lg bg-red-500/90 p-3 text-white" aria-label="Löschen" onClick={onDelete}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <LearningProgress value={item.correctCount} max={requiredCorrectAnswers} />
      </div>
    </article>
  )
}
