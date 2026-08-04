export function ResetProgressDialog({
  onReset,
  onKeep,
  onCancel,
}: {
  onReset: () => void
  onKeep: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#101b2e] p-5 shadow-2xl">
        <h2 className="text-xl font-black text-white">Erneut lernen</h2>
        <p className="mt-2 text-slate-300">Möchtest du den Fortschritt zurücksetzen oder den bisherigen Fortschritt behalten?</p>
        <div className="mt-5 grid gap-3">
          <button className="min-h-11 rounded-lg bg-yellow-300 px-4 font-bold text-slate-950" onClick={onReset}>
            Fortschritt zurücksetzen
          </button>
          <button className="min-h-11 rounded-lg bg-emerald-400 px-4 font-bold text-slate-950" onClick={onKeep}>
            Fortschritt behalten
          </button>
          <button className="min-h-11 rounded-lg bg-white/10 px-4 font-bold text-white" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
