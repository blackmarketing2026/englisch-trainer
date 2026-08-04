import { useState } from 'react'
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog'
import { LearningItemList } from '../components/lists/LearningItemList'
import { useLearningItems } from '../hooks/useLearningItems'
import { useSettings } from '../hooks/useSettings'
import { deleteLearningItem, resetLearningItemProgress, setLearningItemStatus } from '../services/learningItemService'
import type { LearningItem } from '../types/learning'

export function WaitingItemsPage() {
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
        <h2 className="text-3xl font-black text-white">Warteliste</h2>
        <p className="mt-2 text-slate-300">Diese Inhalte rücken automatisch nach, sobald Platz im aktiven Pool entsteht.</p>
      </div>
      <LearningItemList
        items={items.waitingItems}
        requiredCorrectAnswers={settings.data.requiredCorrectAnswers}
        emptyText="Keine wartenden Lerninhalte vorhanden."
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
