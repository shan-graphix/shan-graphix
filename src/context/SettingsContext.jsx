import { createContext, useContext, useMemo } from 'react'
import { useDocument } from '../hooks/useFirestore.js'
import { DEFAULT_SETTINGS } from '../config.js'

const Ctx = createContext(DEFAULT_SETTINGS)
export const useSettings = () => useContext(Ctx)

export function SettingsProvider({ children }) {
  const { data } = useDocument('settings', 'site')
  const value = useMemo(() => {
    const merged = { ...DEFAULT_SETTINGS, ...(data || {}) }
    if (!Array.isArray(merged.services) || merged.services.length === 0) merged.services = DEFAULT_SETTINGS.services
    return merged
  }, [data])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
