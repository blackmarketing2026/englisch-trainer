import { useLearningItems } from '../hooks/useLearningItems'
import { useSessions } from '../hooks/useLearningSession'
import { calculateStatistics } from '../logic/statistics'
import { secondsToClock } from '../utils/dates'

export function StatisticsPage() {
  const items = useLearningItems()
  const sessions = useSessions()
  const stats = calculateStatistics(items.data, sessions.data)
  const rows = [
    ['Trainingstage insgesamt', stats.totalTrainingDays],
    ['Aktuelle Lernserie', `${stats.currentStreak} Tage`],
    ['Längste Lernserie', `${stats.longestStreak} Tage`],
    ['Gesamte Trainingszeit', secondsToClock(stats.totalTrainingSeconds)],
    ['Richtige Antworten insgesamt', stats.totalCorrect],
    ['Falsche Antworten insgesamt', stats.totalIncorrect],
    ['Trefferquote', `${stats.hitRate}%`],
    ['Gelernte Lerninhalte', stats.masteredCount],
    ['Aktive Lerninhalte', stats.activeCount],
    ['Wartende Lerninhalte', stats.waitingCount],
  ]
  return (
    <div className="space-y-5">
      <h2 className="text-3xl font-black text-white">Statistiken</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-sm font-semibold text-slate-300">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
