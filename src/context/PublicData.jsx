import { createContext, useContext, useMemo } from 'react'
import { useCollection, useDocument } from '../hooks/useFirestore.js'
import { DEFAULT_SETTINGS } from '../config.js'

const Ctx = createContext({ settings: DEFAULT_SETTINGS, works: [], worksLoading: true })

export const useSettings = () => useContext(Ctx).settings
export const useWorks = () => {
  const c = useContext(Ctx)
  return { works: c.works, loading: c.worksLoading }
}

// Loaded once for the whole public site, so changing pages never re-downloads anything.
export function PublicDataProvider({ children }) {
  const { data } = useDocument('settings', 'site')
  const { items: works, loading } = useCollection('works', 'order')
  const value = useMemo(() => {
    const settings = { ...DEFAULT_SETTINGS, ...(data || {}) }
    if (!Array.isArray(settings.services) || settings.services.length === 0) settings.services = DEFAULT_SETTINGS.services
    return { settings, works, worksLoading: loading }
  }, [data, works, loading])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
