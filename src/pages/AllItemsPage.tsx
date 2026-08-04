import { CheckCircle2, Pause, Play, RotateCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'
import { FilterBar } from '../components/lists/FilterBar'
import { useLearningItems } from '../hooks/useLearningItems'
import { useSettings } from '../hooks/useSettings'
import { deleteLearningItem, resetLearningItemProgress, setLearningItemStatus } from '../services/learningItemService'
import type { LearningItem } from '../types/learning'
import { formatDateTime } from '../utils/dates'

const statusLabels: Record<LearningItem['status'], string> = {
  active: 'Aktiv',
  waiting: 'Wartend',
  mastered: 'Gelernt',
  paused: 'Pausiert',
}

const statusStyles: Record<LearningItem['status'], string> = {
  active: 'bg-emerald-400/15 text-emerald-100',
  waiting: 'bg-sky-400/15 text-sky-100',
  mastered: 'bg-yellow-300 text-slate-950',
  paused: 'bg-white/10 text-slate-200',
}

export function AllItemsPage() {
  const items = useLearningItems()
  const settings = useSettings()
  const [deleteTarget, setDeleteTarget] = useState<LearningItem>()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('progress')

  const visibleItems = useMemo(() => {
    const filtered = items.data.filter((item) =>
      `${item.english} ${item.german} ${item.category ?? ''} ${item.status}`.toLowerCase().includes(query.toLowerCase()),
    )

    return [...filtered].sort((a, b) => {
      if (sort === 'alpha') return a.english.localeCompare(b.english)
      if (sort === 'date') return b.createdAt.localeCompare(a.createdAt)
      if (sort === 'last') return (b.lastAnsweredAt ?? '').localeCompare(a.lastAnsweredAt ?? '')
      return a.correctCount - b.correctCount
    })
  }, [items.data, query, sort])

  async function action(promise: Promise<unknown>) {
    await promise
    await items.refresh()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-black text-white">Vokabelliste</h2>
        <p className="mt-2 text-slate-300">Alle hochgeladenen Wörter, Sätze und Satzbausteine als kompakte Liste.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        {(['active', 'waiting', 'mastered', 'paused'] as const).map((status) => (
          <div key={status} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-2xl font-black text-white">{items.data.filter((item) => item.status === status).length}</p>
            <p className="text-sm font-semibold text-slate-300">{statusLabels[status]}</p>
          </div>
        ))}
      </section>

      <FilterBar query={query} onQuery={setQuery} sort={sort} onSort={setSort} />

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="hidden grid-cols-[minmax(16rem,2fr)_minmax(14rem,2fr)_7rem_7rem_9rem_12rem] gap-3 border-b border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase text-slate-300 lg:grid">
          <span>Englisch</span>
          <span>Deutsch</span>
          <span>Status</span>
          <span>Fortschritt</span>
          <span>Zuletzt</span>
          <span className="text-right">Aktionen</span>
        </div>

        {visibleItems.length === 0 ? (
          <p className="p-5 text-slate-200">Noch keine Vokabeln oder Sätze vorhanden.</p>
        ) : null}

        <div className="divide-y divide-white/10">
          {visibleItems.map((item) => {
            const progress = `${item.correctCount}/${settings.data.requiredCorrectAnswers}`
            return (
              <article key={item.id} className="grid gap-2 px-4 py-3 lg:grid-cols-[minmax(16rem,2fr)_minmax(14rem,2fr)_7rem_7rem_9rem_12rem] lg:items-center lg:gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black text-white" title={item.english}>{item.english}</p>
                  {item.category ? <p className="mt-1 text-xs font-semibold text-sky-200">{item.category}</p> : null}
                </div>
                <p className="min-w-0 truncate text-sm font-semibold text-slate-300 lg:text-base" title={item.german}>{item.german}</p>

                <div className="flex flex-wrap items-center gap-2 lg:block">
                  <span className={`inline-flex rounded-md px-2 py-1 text-xs font-black ${statusStyles[item.status]}`}>
                    {statusLabels[item.status]}
                  </span>
                  <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-slate-200 lg:hidden">{progress}</span>
                  <span className="rounded-md bg-red-500/15 px-2 py-1 text-xs font-bold text-red-100 lg:hidden">{item.incorrectCount} falsch</span>
                </div>

                <p className="hidden text-sm font-black text-white lg:block">{progress}</p>
                <p className="hidden text-sm text-slate-300 lg:block">{formatDateTime(item.lastAnsweredAt)}</p>

                <div className="flex justify-end gap-1">
                  {item.status === 'active' ? (
                    <button className="rounded-md bg-white/10 p-2 text-white" aria-label="In Warteliste verschieben" onClick={() => void action(setLearningItemStatus(item.id, 'waiting'))}>
                      <Pause size={16} />
                    </button>
                  ) : (
                    <button className="rounded-md bg-emerald-400 p-2 text-slate-950" aria-label="Aktivieren" onClick={() => void action(setLearningItemStatus(item.id, 'active'))}>
                      <Play size={16} />
                    </button>
                  )}
                  <button className="rounded-md bg-white/10 p-2 text-white" aria-label="Pausieren" onClick={() => void action(setLearningItemStatus(item.id, 'paused'))}>
                    <Pause size={16} />
                  </button>
                  {item.status === 'mastered' ? (
                    <button className="rounded-md bg-yellow-300 p-2 text-slate-950" aria-label="Erneut lernen" onClick={() => void action(setLearningItemStatus(item.id, 'waiting'))}>
                      <CheckCircle2 size={16} />
                    </button>
                  ) : null}
                  <button className="rounded-md bg-white/10 p-2 text-white" aria-label="Fortschritt zurücksetzen" onClick={() => void action(resetLearningItemProgress(item.id))}>
                    <RotateCcw size={16} />
                  </button>
                  <button className="rounded-md bg-red-500 p-2 text-white" aria-label="Löschen" onClick={() => setDeleteTarget(item)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {deleteTarget ? (
        <ConfirmDialog
          title="Lerninhalt löschen"
          message="Diese Aktion kann nicht rückgängig gemacht werden."
          confirmLabel="Löschen"
          onCancel={() => setDeleteTarget(undefined)}
          onConfirm={() => void action(deleteLearningItem(deleteTarget.id)).then(() => setDeleteTarget(undefined))}
        />
      ) : null}
    </div>
  )
}
