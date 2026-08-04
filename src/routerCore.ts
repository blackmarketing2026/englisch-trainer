import { createContext } from 'react'

export interface RouterContextValue {
  pathname: string
  navigate: (to: string) => void
}

export const RouterContext = createContext<RouterContextValue | undefined>(undefined)

export function currentPath() {
  return window.location.pathname || '/'
}
