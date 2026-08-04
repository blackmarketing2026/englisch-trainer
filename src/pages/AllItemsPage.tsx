import { useState } from 'react'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'
import { LearningItemList } from '../components/lists/LearningItemList'
import { useLearningItems } from '../hooks/useLearningItems'
import { useSettings } from '../hooks/useSettings'
import { deleteLearningItem, resetLearningItemProgress, setLearningItemStatus } from '../services/learningItemService'
import type { LearningItem } from '../types/learning'

const statusLabels: Record<LearningItem['status'], string> = {
  active: 'Aktiv',
  waiting: 'Wartend',
  mastered: 'Gelernt',
  paused: 'Pausiert',
}

export function AllItemsPage() {
  const items = useLearningItems()
  const settings = useSettings()
  const [deleteTarget, setDeleteTarget] = useState<LearningItem>()

  async function action(promise: Promise<unknown>) {
    await promise
    await items.refresh()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-black text-white">Vokabelliste</h2>
        <p className="mt-2 text-slate-300">Alle hochgeladenen Wörter, Sätze und Satzbausteine an einem Ort.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        {(['active', 'waiting', 'mastered', 'paused'] as const).map((status) => (
          <div key={status} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-2xl font-black text-white">{items.data.filter((item) => item.status === status).length}</p>
            <p className="text-sm font-semibold text-slate-300">{statusLabels[status]}</p>
          </div>
        ))}
      </section>

      <LearningItemList
        items={items.data}
        requiredCorrectAnswers={settings.data.requiredCorrectAnswers}
        emptyText="Noch keine Vokabeln oder Sätze vorhanden."
        onPause={(item) => void action(setLearningItemStatus(item.id, 'paused'))}
        onActivate={(item) => void action(setLearningItemStatus(item.id, 'active'))}
        onWaiting={(item) => void action(setLearningItemStatus(item.id, 'waiting'))}
        onReset={(item) => void action(resetLearningItemProgress(item.id))}
        onDelete={setDeleteTarget}
      />

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
