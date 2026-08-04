import { BookOpen, Languages, Mic } from 'lucide-react'
import { Link } from '../router'
import { useLearningItems } from '../hooks/useLearningItems'

export function TrainingPage() {
  const items = useLearningItems()

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-3xl font-black text-white">Training</h2>
        <p className="mt-2 text-slate-300">Starte jede Trainingsphase unabhängig voneinander.</p>
        {items.activeItems.length === 0 ? (
          <Link className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-yellow-300 px-4 font-black text-slate-950" to="/new">
            Lerninhalte hinzufügen
          </Link>
        ) : null}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Link to="/training/phase-1" className="rounded-xl border border-sky-300/30 bg-sky-300/10 p-5">
          <BookOpen className="text-sky-200" />
          <h3 className="mt-4 text-xl font-black text-white">Phase 1</h3>
          <p className="text-slate-300">Satzbausteine lesen und laut wiederholen.</p>
          <span className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-sky-300 px-4 font-black text-slate-950">
            Phase 1 starten
          </span>
        </Link>

        <Link to="/training/phase-2" className="rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-5">
          <Languages className="text-emerald-200" />
          <h3 className="mt-4 text-xl font-black text-white">Phase 2</h3>
          <p className="text-slate-300">Deutsch aktiv ins Englische übersetzen.</p>
          <span className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-emerald-300 px-4 font-black text-slate-950">
            Phase 2 starten
          </span>
        </Link>

        <Link to="/training/phase-3" className="rounded-xl border border-violet-300/30 bg-violet-300/10 p-5">
          <Mic className="text-violet-200" />
          <h3 className="mt-4 text-xl font-black text-white">Phase 3</h3>
          <p className="text-slate-300">Eine Minute WhatsApp-Sprachnachricht aufnehmen.</p>
          <span className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-violet-300 px-4 font-black text-slate-950">
            Phase 3 starten
          </span>
        </Link>
      </section>
    </div>
  )
}
