import { ArrowRight, Eye, Home } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '../router'
import { useNavigate } from '../routerHooks'
import { AnswerButtons } from '../components/learning/AnswerButtons'
import { RecallCard } from '../components/learning/RecallCard'
import { CountdownTimer } from '../components/timer/CountdownTimer'
import { useCountdownTimer } from '../hooks/useCountdownTimer'
import { useLearningItems } from '../hooks/useLearningItems'
import { useLearningSession } from '../hooks/useLearningSession'
import { useSettings } from '../hooks/useSettings'
import { getNextLearningItem, scheduleIncorrect } from '../logic/itemSelection'
import { appendSessionIds, completePhase, setSessionState } from '../services/sessionService'
import { recordCorrectAnswer, recordIncorrectAnswer } from '../services/learningItemService'
import type { LearningItem } from '../types/learning'

export function PhaseTwoPage() {
  const items = useLearningItems()
  const settings = useSettings()
  const sessionHook = useLearningSession()
  const navigate = useNavigate()
  const [current, setCurrent] = useState<LearningItem>()
  const [revealed, setRevealed] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [incorrectQueue, setIncorrectQueue] = useState<string[]>([])
  const [correctSession, setCorrectSession] = useState(0)
  const [incorrectSession, setIncorrectSession] = useState(0)
  const [masteredSession, setMasteredSession] = useState(0)
  const [busy, setBusy] = useState(false)
  const [completed, setCompleted] = useState(false)
  const startedRef = useRef(false)
  const timer = useCountdownTimer(settings.data.phaseTwoMinutes * 60, () => {
    if (!revealed) void finish()
  })

  const activeItems = useMemo(() => items.activeItems, [items.activeItems])

  const finish = useCallback(async () => {
    const session = await sessionHook.startOrResume()
    await completePhase(session.id, 2)
    setCompleted(true)
  }, [sessionHook])

  function pickNext(source = activeItems, wrongQueue = incorrectQueue) {
    const next = getNextLearningItem({ activeItems: source, currentItemId: current?.id, recentlyShownItemIds: recent, incorrectQueue: wrongQueue })
    setCurrent(next)
    setRevealed(false)
    if (next) setRecent((value) => [...value.slice(-4), next.id])
  }

  async function answer(correct: boolean) {
    if (!current || busy) return
    setBusy(true)
    const session = await sessionHook.startOrResume()
    if (correct) {
      const result = await recordCorrectAnswer(current.id)
      setCorrectSession((value) => value + 1)
      if (result.mastered) setMasteredSession((value) => value + 1)
      await appendSessionIds(session.id, {
        correctItemIds: [current.id],
        masteredItemIds: result.mastered ? [current.id] : [],
        activatedItemIds: result.activatedIds,
      })
      const refreshed = await items.refresh()
      setIncorrectQueue((queue) => queue.filter((id) => id !== current.id))
      setTimeout(() => {
        pickNext(items.data.filter((item) => item.status === 'active' && item.id !== current.id))
        setBusy(false)
      }, 250)
      return refreshed
    }
    await recordIncorrectAnswer(current.id)
    setIncorrectSession((value) => value + 1)
    await appendSessionIds(session.id, { incorrectItemIds: [current.id] })
    const nextQueue = scheduleIncorrect(incorrectQueue, current.id)
    setIncorrectQueue(nextQueue)
    await items.refresh()
    setTimeout(() => {
      pickNext(activeItems, nextQueue)
      setBusy(false)
    }, 250)
  }

  useEffect(() => {
    if (!startedRef.current && !current && activeItems.length > 0) {
      startedRef.current = true
      void sessionHook.startOrResume().then((session) => {
        void setSessionState(session.id, 'phase2_running')
        timer.start(settings.data.phaseTwoMinutes * 60)
        pickNext()
      })
    }
    // The phase should initialize once per page entry; answer handling owns the rotation after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItems.length])

  if (completed) {
    return (
      <div className="space-y-5 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-6 text-center">
        <h2 className="text-3xl font-black text-white">Phase 2 abgeschlossen</h2>
        <p className="text-slate-200">{correctSession} richtig · {incorrectSession} falsch · {masteredSession} neu gelernt · {items.activeItems.length} aktiv</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-violet-300 px-4 font-black text-slate-950" onClick={() => navigate('/training/phase-3')}>
            <ArrowRight /> Weiter zu Phase 3
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
          <p className="font-bold text-emerald-200">Phase 2 von 3</p>
          <h2 className="text-3xl font-black text-white">Übersetzen</h2>
          <p className="text-slate-300">{correctSession} richtig · {incorrectSession} falsch</p>
        </div>
        <CountdownTimer seconds={timer.remainingSeconds} />
      </div>
      {current ? <RecallCard item={current} revealed={revealed} /> : <p className="rounded-xl border border-white/10 bg-white/5 p-5 text-slate-200">Keine aktiven Lerninhalte vorhanden.</p>}
      {!revealed ? (
        <button disabled={!current} className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-yellow-300 px-5 text-lg font-black text-slate-950 disabled:opacity-60" onClick={() => setRevealed(true)}>
          <Eye /> Lösung anzeigen
        </button>
      ) : (
        <AnswerButtons disabled={busy} onCorrect={() => void answer(true)} onIncorrect={() => void answer(false)} />
      )}
      {timer.remainingSeconds === 0 && revealed ? (
        <button className="min-h-12 w-full rounded-lg bg-emerald-400 px-4 font-black text-slate-950" onClick={() => void finish()}>
          Phase abschließen
        </button>
      ) : null}
    </div>
  )
}
