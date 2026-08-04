import type { ReactNode } from 'react'
import { AppShell } from './components/layout/AppShell'
import { AddLearningItemPage } from './pages/AddLearningItemPage'
import { DashboardPage } from './pages/DashboardPage'
import { ActiveItemsPage } from './pages/ActiveItemsPage'
import { AllItemsPage } from './pages/AllItemsPage'
import { WaitingItemsPage } from './pages/WaitingItemsPage'
import { MasteredItemsPage } from './pages/MasteredItemsPage'
import { SettingsPage } from './pages/SettingsPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { TrainingPage } from './pages/TrainingPage'
import { PhaseOnePage } from './pages/PhaseOnePage'
import { PhaseTwoPage } from './pages/PhaseTwoPage'
import { PhaseThreePage } from './pages/PhaseThreePage'
import { LoginPage } from './pages/LoginPage'
import { useAuth } from './hooks/useAuth'
import { usePathname } from './routerHooks'

const routes: Record<string, () => ReactNode> = {
  '/': () => <DashboardPage />,
  '/training': () => <TrainingPage />,
  '/training/phase-1': () => <PhaseOnePage />,
  '/training/phase-2': () => <PhaseTwoPage />,
  '/training/phase-3': () => <PhaseThreePage />,
  '/new': () => <AddLearningItemPage />,
  '/items': () => <AllItemsPage />,
  '/active': () => <ActiveItemsPage />,
  '/waiting': () => <WaitingItemsPage />,
  '/mastered': () => <MasteredItemsPage />,
  '/settings': () => <SettingsPage />,
  '/statistics': () => <StatisticsPage />,
}

export function App() {
  const pathname = usePathname()
  const auth = useAuth()
  const Page = routes[pathname] ?? routes['/']
  if (!auth.authenticated) {
    return <LoginPage onLogin={auth.login} />
  }
  return (
    <AppShell onLogout={auth.logout}>
      <Page />
    </AppShell>
  )
}
