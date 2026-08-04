import { Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLearningItems } from '../hooks/useLearningItems'
import { addManyLearningItems, loadSampleItems } from '../services/learningItemService'
import { getOnlineVocabularyStatus } from '../services/onlineVocabularyService'
import { parseBulkInput } from '../utils/validation'

export function AddLearningItemPage() {
  const items = useLearningItems()
  const [bulk, setBulk] = useState('')
  const [message, setMessage] = useState<string>()
  const [saving, setSaving] = useState(false)
  const preview = useMemo(() => parseBulkInput(bulk, items.data), [bulk, items.data])

  async function saveBulk() {
    const valid = preview.filter((entry) => !entry.error).map((entry) => ({ english: entry.english, german: entry.german }))
    if (valid.length === 0) {
      setMessage('Keine gültigen Zeilen gefunden.')
      return
    }

    setSaving(true)
    setMessage(undefined)
    try {
      await addManyLearningItems(valid)
      setBulk('')
      await items.refresh()
      const status = await getOnlineVocabularyStatus()
      setMessage(
        status.ok
          ? `${valid.length} Lerninhalte online gespeichert. Online sichtbar: ${status.count}.`
          : `Gespeichert, aber Prüfung fehlgeschlagen: ${status.error}.`,
      )
    } catch (error) {
      setMessage(error instanceof Error ? `Nicht gespeichert: ${error.message}` : 'Nicht gespeichert: Online-Speicherung fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  async function loadSamples() {
    setSaving(true)
    setMessage(undefined)
    try {
      await loadSampleItems()
      await items.refresh()
      setMessage('Beispieldaten online gespeichert.')
    } catch (error) {
      setMessage(error instanceof Error ? `Nicht gespeichert: ${error.message}` : 'Nicht gespeichert: Online-Speicherung fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-3xl font-black text-white">Vokabeln hinzufügen</h2>
        <p className="mt-2 text-slate-300">Füge mehrere gültige Zeilen im Format Englisch | Deutsch ein.</p>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-xl font-black text-white">Mehrere hinzufügen</h3>
        <textarea
          className="mt-3 min-h-44 w-full rounded-lg border border-white/10 bg-[#0f1a2c] p-3 text-white"
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
        <button
          className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-lg bg-yellow-300 px-4 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
          onClick={() => void saveBulk()}
        >
          <Upload size={18} /> {saving ? 'Speichert online...' : 'Gültige Zeilen speichern'}
        </button>
      </section>

      <button
        className="min-h-12 rounded-lg border border-white/10 px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
        onClick={() => void loadSamples()}
      >
        Beispieldaten laden
      </button>
      {message ? <p className="rounded-xl bg-white/10 p-4 font-semibold text-white">{message}</p> : null}
    </div>
  )
}
