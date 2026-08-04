import { BookOpen, CheckCircle2, Clock, PlayCircle, PlusCircle, XCircle } from 'lucide-react'
import { Link } from '../router'
import { useLearningItems } from '../hooks/useLearningItems'
import { useLearningSession, useSessions } from '../hooks/useLearningSession'
import { useSettings } from '../hooks/useSettings'
import { calculateStatistics } from '../logic/statistics'

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof BookOpen }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <Icon className="text-yellow-200" size={22} />
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="text-sm font-semibold text-slate-300">{label}</p>
    </div>
  )
}

export function DashboardPage() {
  const items = useLearningItems()
  const sessions = useSessions()
  const settings = useSettings()
  const session = useLearningSession()
  const stats = calculateStatistics(items.data, sessions.data)
  const phaseCards = [
    { label: 'Phase 1 - Lesen', done: session.data?.phaseOneCompleted, minutes: settings.data.phaseOneMinutes, color: 'border-sky-300/30 bg-sky-300/10' },
    { label: 'Phase 2 - Übersetzen', done: session.data?.phaseTwoCompleted, minutes: settings.data.phaseTwoMinutes, color: 'border-emerald-300/30 bg-emerald-300/10' },
    { label: 'Phase 3 - Sprechen', done: session.data?.phaseThreeCompleted, minutes: settings.data.phaseThreeMinutes, color: 'border-violet-300/30 bg-violet-300/10' },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-7">
        <p className="font-bold text-sky-200">Hallo Steve</p>
        <h2 className="mt-2 text-4xl font-black text-white sm:text-6xl">30 Minuten Englisch</h2>
        <p className="mt-3 text-xl font-semibold text-slate-200">Lesen, abrufen, sprechen.</p>
        <Link
          to="/training"
          className="mt-6 inline-flex min-h-14 items-center gap-2 rounded-lg bg-yellow-300 px-6 text-lg font-black text-slate-950"
        >
          <PlayCircle /> {session.data ? 'Training fortsetzen' : 'Training starten'}
        </Link>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {phaseCards.map((phase) => (
          <article key={phase.label} className={`rounded-xl border p-5 ${phase.color}`}>
            <p className="text-lg font-black text-white">{phase.label}</p>
            <p className="mt-2 text-slate-200">{phase.minutes} Minuten</p>
            <p className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white">
              {phase.done ? 'Abgeschlossen' : session.data?.state.includes('running') ? 'Läuft' : 'Noch nicht begonnen'}
            </p>
          </article>
        ))}
      </section>

      {items.activeItems.length < settings.data.activePoolSize ? (
        <p className="rounded-xl border border-yellow-300/30 bg-yellow-300/10 p-4 font-semibold text-yellow-100">
          Deine aktive Lernliste ist nicht vollständig. Füge neue Vokabeln oder Sätze hinzu.
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard icon={BookOpen} label="Aktiv" value={stats.activeCount} />
        <StatCard icon={PlusCircle} label="Wartend" value={stats.waitingCount} />
        <StatCard icon={CheckCircle2} label="Gelernt" value={stats.masteredCount} />
        <StatCard icon={CheckCircle2} label="Heute richtig" value={stats.todayCorrect} />
        <StatCard icon={XCircle} label="Heute falsch" value={stats.todayIncorrect} />
        <StatCard icon={Clock} label="Lernserie" value={`${stats.currentStreak} Tage`} />
      </section>
    </div>
  )
}
