import { useState } from 'react'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'
import { ResetProgressDialog } from '../components/dialogs/ResetProgressDialog'
import { useLearningItems } from '../hooks/useLearningItems'
import { deleteLearningItem, resetLearningItemProgress, setLearningItemStatus } from '../services/learningItemService'
import type { LearningItem } from '../types/learning'
import { formatDate } from '../utils/dates'

export function MasteredItemsPage() {
  const items = useLearningItems()
  const [deleteTarget, setDeleteTarget] = useState<LearningItem>()
  const [relearnTarget, setRelearnTarget] = useState<LearningItem>()

  async function refreshAfter(promise: Promise<unknown>) {
    await promise
    await items.refresh()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-black text-white">Gelernt</h2>
        <p className="mt-2 text-slate-300">Alle vollständig abgearbeiteten Inhalte.</p>
      </div>
      <div className="grid gap-3">
        {items.masteredItems.length === 0 ? <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-slate-200">Noch keine gelernten Inhalte.</p> : null}
        {items.masteredItems.map((item) => {
          const total = item.correctCount + item.incorrectCount
          const rate = total === 0 ? 0 : Math.round((item.correctCount / total) * 100)
          return (
            <article key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-lg font-black text-white">{item.english}</h3>
              <p className="text-slate-300">{item.german}</p>
              <p className="mt-3 text-sm text-slate-300">Abschluss: {formatDate(item.masteredAt)} · {item.correctCount} richtig · {item.incorrectCount} falsch · Quote {rate}%</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="min-h-11 rounded-lg bg-yellow-300 px-4 font-bold text-slate-950" onClick={() => setRelearnTarget(item)}>Erneut lernen</button>
                <button className="min-h-11 rounded-lg bg-red-500 px-4 font-bold text-white" onClick={() => setDeleteTarget(item)}>Löschen</button>
              </div>
            </article>
          )
        })}
      </div>
      {deleteTarget ? (
        <ConfirmDialog
          title="Lerninhalt löschen"
          message="Diese Aktion kann nicht rückgängig gemacht werden."
          confirmLabel="Löschen"
          onCancel={() => setDeleteTarget(undefined)}
          onConfirm={() => void refreshAfter(deleteLearningItem(deleteTarget.id)).then(() => setDeleteTarget(undefined))}
        />
      ) : null}
      {relearnTarget ? (
        <ResetProgressDialog
          onCancel={() => setRelearnTarget(undefined)}
          onKeep={() => void refreshAfter(setLearningItemStatus(relearnTarget.id, 'waiting')).then(() => setRelearnTarget(undefined))}
          onReset={() => void refreshAfter(resetLearningItemProgress(relearnTarget.id).then(() => setLearningItemStatus(relearnTarget.id, 'waiting'))).then(() => setRelearnTarget(undefined))}
        />
      ) : null}
    </div>
  )
}
