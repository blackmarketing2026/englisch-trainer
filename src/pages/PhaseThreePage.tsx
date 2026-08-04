import { CheckCircle2, MessageCircle, StopCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '../router'
import { useNavigate } from '../routerHooks'
import { CountdownTimer } from '../components/timer/CountdownTimer'
import { TimerControls } from '../components/timer/TimerControls'
import { useCountdownTimer } from '../hooks/useCountdownTimer'
import { useLearningSession } from '../hooks/useLearningSession'
import { completePhase, endTraining, setSessionState, updateSession } from '../services/sessionService'

const PHASE_THREE_SECONDS = 60
const WHATSAPP_TASK = 'Mache jetzt eine Sprachnachricht auf WhatsApp.'

export function PhaseThreePage() {
  const sessionHook = useLearningSession()
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(false)
  const startedRef = useRef(false)
  const timer = useCountdownTimer(PHASE_THREE_SECONDS, () => void finish())

  const finish = useCallback(async () => {
    const session = await sessionHook.startOrResume()
    await updateSession(session.id, {
      freeSpeakingTopic: WHATSAPP_TASK,
      phaseThreeDurationSeconds: PHASE_THREE_SECONDS,
    })
    await completePhase(session.id, 3)
    setCompleted(true)
  }, [sessionHook])

  async function stopTraining() {
    timer.pause()
    const session = await sessionHook.startOrResume()
    await updateSession(session.id, {
      freeSpeakingTopic: WHATSAPP_TASK,
      phaseThreeDurationSeconds: PHASE_THREE_SECONDS,
    })
    await endTraining(session.id, 3)
    navigate('/')
  }

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    void sessionHook.startOrResume().then((session) => {
      void setSessionState(session.id, 'phase3_running')
      void updateSession(session.id, {
        freeSpeakingTopic: WHATSAPP_TASK,
        phaseThreeDurationSeconds: PHASE_THREE_SECONDS,
      })
      timer.start(PHASE_THREE_SECONDS)
    })
    // The phase should initialize once per page entry; the timer controls own later state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (completed) {
    return (
      <div className="space-y-5 rounded-xl border border-violet-300/30 bg-violet-300/10 p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-300" size={48} />
        <h2 className="text-3xl font-black text-white">Phase 3 abgeschlossen</h2>
        <p className="text-slate-200">Die Minute ist vorbei. Deine WhatsApp-Sprachnachricht ist erledigt.</p>
        <Link className="inline-flex min-h-12 items-center justify-center rounded-lg bg-yellow-300 px-4 font-black text-slate-950" to="/">
          Zur Startseite
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-violet-200">Phase 3 von 3</p>
          <h2 className="text-3xl font-black text-white">Freies Sprechen</h2>
        </div>
        <CountdownTimer seconds={timer.remainingSeconds} />
      </div>

      <section className="rounded-xl border border-violet-300/30 bg-violet-300/10 p-6 text-center">
        <MessageCircle className="mx-auto text-violet-200" size={42} />
        <p className="mt-4 text-sm font-bold uppercase text-violet-200">Aufgabe</p>
        <h3 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">{WHATSAPP_TASK}</h3>
        <p className="mt-5 text-lg font-semibold text-slate-200">Sprich eine Minute frei. Der Timer stoppt automatisch.</p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <TimerControls paused={timer.paused} onPause={timer.pause} onResume={timer.resume} />
        <button className="min-h-12 rounded-lg bg-yellow-300 px-4 font-black text-slate-950" onClick={() => void finish()}>
          Phase beenden
        </button>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 font-black text-white" onClick={() => void stopTraining()}>
          <StopCircle size={18} /> Training beenden
        </button>
      </div>
    </div>
  )
}
