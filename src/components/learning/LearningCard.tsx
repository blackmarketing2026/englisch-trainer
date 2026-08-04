import type { LearningItem } from '../../types/learning'

export function LearningCard({ item }: { item: LearningItem }) {
  return (
    <article className="rounded-xl border border-sky-300/25 bg-sky-300/10 p-5 text-center shadow-xl sm:p-8">
      {item.category ? <p className="mb-3 text-sm font-bold uppercase text-sky-200">{item.category}</p> : null}
      <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl">{item.english}</h2>
      <p className="mt-5 text-lg font-semibold text-slate-200 sm:text-2xl">{item.german}</p>
      {item.note ? <p className="mt-4 rounded-lg bg-white/10 p-3 text-sm text-slate-200">{item.note}</p> : null}
      <p className="mt-5 text-sm font-semibold text-yellow-200">Lies den Satz 3-5 Mal laut vor.</p>
    </article>
  )
}
