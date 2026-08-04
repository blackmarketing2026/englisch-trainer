import { ArrowRight, Home, StopCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '../router'
import { useNavigate } from '../routerHooks'
import { LearningCard } from '../components/learning/LearningCard'
import { CountdownTimer } from '../components/timer/CountdownTimer'
import { useCountdownTimer } from '../hooks/useCountdownTimer'
import { useLearningItems } from '../hooks/useLearningItems'
import { useLearningSession } from '../hooks/useLearningSession'
import { useSettings } from '../hooks/useSettings'
import { getNextLearningItem } from '../logic/itemSelection'
import { recordPhaseOneView } from '../services/learningItemService'
import { appendSessionIds, completePhase, endTraining, setSessionState, updateSession } from '../services/sessionService'
import type { LearningItem } from '../types/learning'

export function PhaseOnePage() {
  const items = useLearningItems()
  const settings = useSettings()
  const sessionHook = useLearningSession()
  const navigate = useNavigate()
  const [current, setCurrent] = useState<LearningItem>()
  const [recent, setRecent] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)
  const startedRef = useRef(false)
  const timer = useCountdownTimer(settings.data.phaseOneMinutes * 60, () => void finish())

  const activeItems = useMemo(() => items.activeItems, [items.activeItems])

  const finish = useCallback(async () => {
    const session = await sessionHook.startOrResume()
    await completePhase(session.id, 1)
    setCompleted(true)
  }, [sessionHook])

  async function stopTraining() {
    timer.pause()
    const session = await sessionHook.startOrResume()
    await endTraining(session.id, 1)
    navigate('/')
  }

  async function nextItem() {
    const next = getNextLearningItem({ activeItems, currentItemId: current?.id, recentlyShownItemIds: recent, incorrectQueue: [] })
    if (!next) return
    const session = await sessionHook.startOrResume()
    setCurrent(next)
    setRecent((value) => [...value.slice(-4), next.id])
    await recordPhaseOneView(next.id)
    await appendSessionIds(session.id, { shownItemIds: [next.id] })
    await updateSession(session.id, { currentPhase: 1, currentItemId: next.id, phaseOneTimer: timer.snapshot })
    await items.refresh()
  }

  useEffect(() => {
    if (!startedRef.current && !current && activeItems.length > 0) {
      startedRef.current = true
      void sessionHook.startOrResume().then((session) => {
        void setSessionState(session.id, 'phase1_running')
        timer.start(settings.data.phaseOneMinutes * 60)
        void nextItem()
      })
    }
    // The phase should initialize once per page entry; timer and picker state update continuously after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItems.length])

  if (completed) {
    return (
      <div className="space-y-5 rounded-xl border border-sky-300/30 bg-sky-300/10 p-6 text-center">
        <h2 className="text-3xl font-black text-white">Phase 1 abgeschlossen</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 font-black text-slate-950" onClick={() => navigate('/training/phase-2')}>
            <ArrowRight /> Weiter zu Phase 2
          </button>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white/10 px-4 font-black text-white" to="/">
            <Home /> Zur Startseite
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-sky-200">Phase 1 von 3</p>
          <h2 className="text-3xl font-black text-white">Lesen</h2>
        </div>
        <CountdownTimer seconds={timer.remainingSeconds} />
      </div>
      {current ? <LearningCard item={current} /> : <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-slate-200">Keine aktiven Lerninhalte vorhanden.</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <button disabled={timer.remainingSeconds === 0 || !current} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-yellow-300 px-5 text-lg font-black text-slate-950 disabled:opacity-60" onClick={() => void nextItem()}>
          Nächste Vokabel <ArrowRight />
        </button>
        <Link className="inline-flex min-h-14 items-center justify-center rounded-lg bg-white/10 px-5 font-bold text-white" to="/training">
          Zurück
        </Link>
        <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-red-500 px-5 font-black text-white" onClick={() => void stopTraining()}>
          <StopCircle size={20} /> Training beenden
        </button>
      </div>
    </div>
  )
}
