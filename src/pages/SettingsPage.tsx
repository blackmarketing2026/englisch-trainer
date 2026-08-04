import { Download, Upload, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { clearAllData, createBackup, downloadBackup, importBackup, parseBackup } from '../services/backupService'
import { useSettings } from '../hooks/useSettings'

function NumberSetting({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <label className="grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4 font-bold text-slate-200">
      {label}
      <input
        className="min-h-11 rounded-lg border border-white/10 bg-[#0f1a2c] p-3 text-white"
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 font-bold text-slate-200">
      {label}
      <input className="h-6 w-6 accent-yellow-300" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}

export function SettingsPage() {
  const settings = useSettings()
  const [message, setMessage] = useState<string>()

  async function exportData() {
    downloadBackup(await createBackup())
  }

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const payload = parseBackup(await file.text())
      const mode = window.confirm('Bestehende Daten ersetzen? Abbrechen führt zur Zusammenführung.') ? 'replace' : 'merge'
      await importBackup(payload, mode)
      setMessage('Import abgeschlossen.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import fehlgeschlagen.')
    }
  }

  async function resetAll() {
    if (!window.confirm('Diese Aktion kann nicht rückgängig gemacht werden. Wirklich alle Daten löschen?')) return
    await clearAllData()
    setMessage('Alle Daten wurden gelöscht.')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-white">Einstellungen</h2>
      <section className="grid gap-3 sm:grid-cols-2">
        <NumberSetting label="Dauer Phase 1" min={1} max={60} value={settings.data.phaseOneMinutes} onChange={(value) => void settings.update({ phaseOneMinutes: value })} />
        <NumberSetting label="Dauer Phase 2" min={1} max={60} value={settings.data.phaseTwoMinutes} onChange={(value) => void settings.update({ phaseTwoMinutes: value })} />
        <NumberSetting label="Dauer Phase 3" min={1} max={60} value={settings.data.phaseThreeMinutes} onChange={(value) => void settings.update({ phaseThreeMinutes: value })} />
        <NumberSetting label="Größe der aktiven Lernliste" min={1} max={50} value={settings.data.activePoolSize} onChange={(value) => void settings.update({ activePoolSize: value })} />
        <NumberSetting label="Notwendige richtige Antworten" min={1} max={20} value={settings.data.requiredCorrectAnswers} onChange={(value) => void settings.update({ requiredCorrectAnswers: value })} />
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <Toggle label="Ton" checked={settings.data.soundEnabled} onChange={(value) => void settings.update({ soundEnabled: value })} />
        <Toggle label="Vibration" checked={settings.data.vibrationEnabled} onChange={(value) => void settings.update({ vibrationEnabled: value })} />
        <Toggle label="Dark Mode" checked={settings.data.darkMode} onChange={(value) => void settings.update({ darkMode: value })} />
        <Toggle label="Nächste Phase automatisch starten" checked={settings.data.autoStartNextPhase} onChange={(value) => void settings.update({ autoStartNextPhase: value })} />
        <Toggle label="Unmittelbare Wiederholungen verhindern" checked={settings.data.preventImmediateRepeats} onChange={(value) => void settings.update({ preventImmediateRepeats: value })} />
      </section>
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-xl font-black text-white">Daten und Sicherung</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-yellow-300 px-4 font-black text-slate-950" onClick={() => void exportData()}>
            <Download size={18} /> Export
          </button>
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/10 px-4 font-black text-white">
            <Upload size={18} /> Import
            <input className="hidden" type="file" accept="application/json" onChange={(event) => void onImport(event)} />
          </label>
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 font-black text-white" onClick={() => void resetAll()}>
            <Trash2 size={18} /> Alle Daten löschen
          </button>
        </div>
      </section>
      {message ? <p className="rounded-xl bg-white/10 p-4 font-semibold text-white">{message}</p> : null}
    </div>
  )
}
