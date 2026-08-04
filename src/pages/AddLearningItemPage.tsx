import { Save, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { addLearningItem, addManyLearningItems, loadSampleItems } from '../services/learningItemService'
import { useLearningItems } from '../hooks/useLearningItems'
import { parseBulkInput } from '../utils/validation'
import type { LearningItemDraft } from '../types/learning'

const blank: LearningItemDraft = { english: '', german: '', category: '', topic: '', example: '', note: '' }

export function AddLearningItemPage() {
  const items = useLearningItems()
  const [draft, setDraft] = useState(blank)
  const [bulk, setBulk] = useState('')
  const [message, setMessage] = useState<string>()
  const preview = useMemo(() => parseBulkInput(bulk, items.data), [bulk, items.data])

  async function save(keepGoing = false) {
    await addLearningItem(draft)
    setMessage('Gespeichert.')
    await items.refresh()
    setDraft(keepGoing ? blank : draft)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await save(false)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.')
    }
  }

  async function saveBulk() {
    const valid = preview.filter((entry) => !entry.error).map((entry) => ({ english: entry.english, german: entry.german }))
    if (valid.length === 0) {
      setMessage('Keine gültigen Zeilen gefunden.')
      return
    }
    await addManyLearningItems(valid)
    setBulk('')
    setMessage(`${valid.length} Lerninhalte gespeichert.`)
    await items.refresh()
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-3xl font-black text-white">Neue Vokabel oder Satz hinzufügen</h2>
        <p className="mt-2 text-slate-300">Pflichtfelder sind Englisch und Deutsch.</p>
      </section>
      <form className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-5" onSubmit={(event) => void submit(event)}>
        {(['english', 'german', 'category', 'topic', 'example', 'note'] as const).map((field) => (
          <label key={field} className="grid gap-2 text-sm font-bold text-slate-200">
            {field === 'english' ? 'Englisch' : field === 'german' ? 'Deutsch' : field}
            {field === 'note' || field === 'example' ? (
              <textarea className="min-h-24 rounded-lg border border-white/10 bg-[#0f1a2c] p-3 text-white" value={draft[field] ?? ''} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />
            ) : (
              <input className="min-h-11 rounded-lg border border-white/10 bg-[#0f1a2c] p-3 text-white" value={draft[field] ?? ''} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />
            )}
          </label>
        ))}
        <div className="grid gap-3 sm:grid-cols-3">
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-yellow-300 px-4 font-black text-slate-950">
            <Save size={18} /> Speichern
          </button>
          <button type="button" className="min-h-12 rounded-lg bg-emerald-400 px-4 font-black text-slate-950" onClick={() => void save(true).catch((error: Error) => setMessage(error.message))}>
            Speichern und weitere hinzufügen
          </button>
          <button type="button" className="min-h-12 rounded-lg bg-white/10 px-4 font-bold text-white" onClick={() => setDraft(blank)}>
            Abbrechen
          </button>
        </div>
      </form>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-xl font-black text-white">Mehrere hinzufügen</h3>
        <textarea
          className="mt-3 min-h-36 w-full rounded-lg border border-white/10 bg-[#0f1a2c] p-3 text-white"
          placeholder="I live in Germany. | Ich lebe in Deutschland."
          value={bulk}
          onChange={(event) => setBulk(event.target.value)}
        />
        {preview.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {preview.map((entry) => (
              <p key={entry.line} className={`rounded-lg p-3 text-sm ${entry.error ? 'bg-red-500/20 text-red-100' : 'bg-emerald-400/15 text-emerald-100'}`}>
                Zeile {entry.line}: {entry.english} | {entry.german} {entry.error ? `- ${entry.error}` : ''}
              </p>
            ))}
          </div>
        ) : null}
        <button className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-lg bg-yellow-300 px-4 font-black text-slate-950" onClick={() => void saveBulk()}>
          <Upload size={18} /> Gültige Zeilen speichern
        </button>
      </section>

      <button className="min-h-12 rounded-lg border border-white/10 px-4 font-bold text-white" onClick={() => void loadSampleItems().then(items.refresh).then(() => setMessage('Beispieldaten geladen.')).catch((error: Error) => setMessage(error.message))}>
        Beispieldaten laden
      </button>
      {message ? <p className="rounded-xl bg-white/10 p-4 font-semibold text-white">{message}</p> : null}
    </div>
  )
}
