import { useCallback, useEffect, useState } from 'react'

export function useAsyncData<T>(loader: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setData(await loader())
      setError(undefined)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }, [loader])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, error, refresh, setData }
}
