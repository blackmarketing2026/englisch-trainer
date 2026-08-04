import { useMemo, useState } from 'react'
import type { LearningItem } from '../../types/learning'
import { FilterBar } from './FilterBar'
import { LearningItemRow } from './LearningItemRow'

export function LearningItemList({
  items,
  requiredCorrectAnswers,
  emptyText,
  onPause,
  onActivate,
  onWaiting,
  onReset,
  onDelete,
}: {
  items: LearningItem[]
  requiredCorrectAnswers: number
  emptyText: string
  onPause: (item: LearningItem) => void
  onActivate: (item: LearningItem) => void
  onWaiting: (item: LearningItem) => void
  onReset: (item: LearningItem) => void
  onDelete: (item: LearningItem) => void
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('progress')

  const visible = useMemo(() => {
    const filtered = items.filter((item) => `${item.english} ${item.german} ${item.category ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    return [...filtered].sort((a, b) => {
      if (sort === 'alpha') return a.english.localeCompare(b.english)
      if (sort === 'date') return b.createdAt.localeCompare(a.createdAt)
      if (sort === 'last') return (b.lastAnsweredAt ?? '').localeCompare(a.lastAnsweredAt ?? '')
      return a.correctCount - b.correctCount
    })
  }, [items, query, sort])

  return (
    <div className="space-y-4">
      <FilterBar query={query} onQuery={setQuery} sort={sort} onSort={setSort} />
      {visible.length === 0 ? <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-slate-200">{emptyText}</p> : null}
      <div className="grid gap-3">
        {visible.map((item) => (
          <LearningItemRow
            key={item.id}
            item={item}
            requiredCorrectAnswers={requiredCorrectAnswers}
            onPause={() => onPause(item)}
            onActivate={() => onActivate(item)}
            onWaiting={() => onWaiting(item)}
            onReset={() => onReset(item)}
            onDelete={() => onDelete(item)}
          />
        ))}
      </div>
    </div>
  )
}
