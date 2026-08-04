export function LearningProgress({ value, max }: { value: number; max: number }) {
  const percent = Math.min(100, Math.round((value / Math.max(1, max)) * 100))
  return (
    <div className="h-2 w-full rounded-full bg-white/10" aria-label={`Fortschritt ${value} von ${max}`}>
      <div className="h-full rounded-full bg-yellow-300" style={{ width: `${percent}%` }} />
    </div>
  )
}
