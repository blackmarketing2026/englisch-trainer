import type { ReactNode } from 'react'
import { BottomNavigation } from './BottomNavigation'
import { Header } from './Header'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[14rem_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <BottomNavigation />
        </aside>
        <main className="safe-bottom min-w-0">{children}</main>
      </div>
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  )
}
