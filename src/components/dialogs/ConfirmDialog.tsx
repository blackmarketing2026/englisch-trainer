export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#101b2e] p-5 shadow-2xl">
        <h2 className="text-xl font-black text-white">{title}</h2>
        <p className="mt-2 text-slate-300">{message}</p>
        <div className="mt-5 flex gap-3">
          <button className="min-h-11 flex-1 rounded-lg bg-red-500 px-4 font-bold text-white" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="min-h-11 flex-1 rounded-lg bg-white/10 px-4 font-bold text-white" onClick={onCancel}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
