import type { LearningItem } from '../../types/learning'

export function RecallCard({ item, revealed }: { item: LearningItem; revealed: boolean }) {
  return (
    <article className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-5 text-center shadow-xl sm:p-8">
      <p className="text-sm font-bold uppercase text-emerald-200">Deutsch ins Englische übersetzen</p>
      <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">{item.german}</h2>
      <p className="mt-4 text-slate-200">Sprich die englische Übersetzung laut aus.</p>
      {revealed ? (
        <div className="mt-6 rounded-lg bg-white/10 p-4">
          <p className="text-sm font-bold text-emerald-200">Lösung</p>
          <p className="mt-2 text-2xl font-black text-white sm:text-4xl">{item.english}</p>
          {item.example || item.note ? <p className="mt-3 text-slate-200">{item.example ?? item.note}</p> : null}
        </div>
      ) : null}
    </article>
  )
}
