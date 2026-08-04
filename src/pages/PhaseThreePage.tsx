import { CheckCircle2, RefreshCw, StopCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '../router'
import { CountdownTimer } from '../components/timer/CountdownTimer'
import { TimerControls } from '../components/timer/TimerControls'
import { useCountdownTimer } from '../hooks/useCountdownTimer'
import { useLearningItems } from '../hooks/useLearningItems'
import { useLearningSession } from '../hooks/useLearningSession'
import { useSettings } from '../hooks/useSettings'
import { completePhase, endTraining, setSessionState, updateSession } from '../services/sessionService'
import { useNavigate } from '../routerHooks'

const topics = [
  'Erzähle von deinem heutigen Tag.',
  'Erkläre, woran du gerade arbeitest.',
  'Beschreibe dein Unternehmen.',
  'Erzähle von deinen Zielen.',
  'Sprich über deine Familie.',
  'Erkläre ein Problem, das du heute gelöst hast.',
  'Beschreibe dein letztes Kundengespräch.',
  'Erzähle von deinen Hobbys.',
  'Beschreibe eine Reise.',
  'Erkläre, was du morgen machen möchtest.',
]

function randomTopic() {
  return topics[Math.floor(Math.random() * topics.length)]
}

export function PhaseThreePage() {
  const settings = useSettings()
  const items = useLearningItems()
  const sessionHook = useLearningSession()
  const navigate = useNavigate()
  const [topic, setTopic] = useState(randomTopic())
  const [note, setNote] = useState('')
  const [completed, setCompleted] = useState(false)
  const startedRef = useRef(false)
  const timer = useCountdownTimer(settings.data.phaseThreeMinutes * 60, () => void finish())

  const finish = useCallback(async () => {
    const session = await sessionHook.startOrResume()
    await updateSession(session.id, { freeSpeakingTopic: topic, freeSpeakingNote: note })
    await completePhase(session.id, 3)
    setCompleted(true)
  }, [note, sessionHook, topic])

  async function stopTraining() {
    timer.pause()
    const session = await sessionHook.startOrResume()
    await updateSession(session.id, { freeSpeakingTopic: topic, freeSpeakingNote: note })
    await endTraining(session.id, 3)
    navigate('/')
  }

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    void sessionHook.startOrResume().then((session) => {
      void setSessionState(session.id, 'phase3_running')
      timer.start(settings.data.phaseThreeMinutes * 60)
    })
    // The phase should initialize once per page entry; the timer controls own later state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (completed) {
    return (
      <div className="space-y-5 rounded-xl border border-violet-300/30 bg-violet-300/10 p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-300" size={48} />
        <h2 className="text-3xl font-black text-white">Training für heute abgeschlossen</h2>
        <p className="text-slate-200">Gelesene Inhalte: {items.data.reduce((sum, item) => sum + item.phaseOneViewCount, 0)} · Aktiver Pool: {items.activeItems.length}</p>
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
        <p className="text-sm font-bold uppercase text-violet-200">Gesprächsthema</p>
        <h3 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">{topic}</h3>
      </section>
      <textarea
        className="min-h-32 w-full rounded-xl border border-white/10 bg-[#0f1a2c] p-4 text-white"
        placeholder="Stichpunkte"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white/10 px-4 font-bold text-white" onClick={() => setTopic(randomTopic())}>
          <RefreshCw size={18} /> Neues Thema
        </button>
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
