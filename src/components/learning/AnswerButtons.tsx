import { CheckCircle2, XCircle } from 'lucide-react'

export function AnswerButtons({
  disabled,
  onCorrect,
  onIncorrect,
}: {
  disabled: boolean
  onCorrect: () => void
  onIncorrect: () => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        disabled={disabled}
        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 text-lg font-black text-slate-950 disabled:opacity-60"
        onClick={onCorrect}
      >
        <CheckCircle2 /> Richtig
      </button>
      <button
        disabled={disabled}
        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-red-500 px-5 text-lg font-black text-white disabled:opacity-60"
        onClick={onIncorrect}
      >
        <XCircle /> Falsch
      </button>
    </div>
  )
}
