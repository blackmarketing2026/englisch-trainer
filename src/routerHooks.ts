import { useContext } from 'react'
import { RouterContext } from './routerCore'

export function useNavigate() {
  const context = useContext(RouterContext)
  if (!context) throw new Error('useNavigate must be used inside BrowserRouter')
  return context.navigate
}

export function usePathname() {
  const context = useContext(RouterContext)
  if (!context) throw new Error('usePathname must be used inside BrowserRouter')
  return context.pathname
}
