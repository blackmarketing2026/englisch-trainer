import { type AnchorHTMLAttributes, type ReactNode, useEffect, useMemo, useState } from 'react'
import { currentPath, RouterContext, type RouterContextValue } from './routerCore'
import { useNavigate, usePathname } from './routerHooks'

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(currentPath())

  useEffect(() => {
    const onPop = () => setPathname(currentPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const value = useMemo<RouterContextValue>(
    () => ({
      pathname,
      navigate: (to: string) => {
        if (to === currentPath()) return
        window.history.pushState({}, '', to)
        setPathname(to)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
    }),
    [pathname],
  )

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function Link({
  to,
  children,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        event.preventDefault()
        navigate(to)
      }}
      {...props}
    >
      {children}
    </a>
  )
}

export function NavLink({
  to,
  end,
  className,
  children,
}: {
  to: string
  end?: boolean
  className: string | ((state: { isActive: boolean }) => string)
  children: ReactNode
}) {
  const pathname = usePathname()
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
  return (
    <Link to={to} className={typeof className === 'function' ? className({ isActive }) : className}>
      {children}
    </Link>
  )
}
