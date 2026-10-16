import { createContext, useContext, useMemo } from 'react'
import { useCollection } from '../hooks/useFirestore.js'

const Ctx = createContext(null)
export const useAdminData = () => useContext(Ctx)

// Orders, customers and works are loaded once for the whole admin area.
export function AdminDataProvider({ children }) {
  const o = useCollection('orders', 'createdAt', 'desc')
  const c = useCollection('customers', 'name')
  const w = useCollection('works', 'order')
  const value = useMemo(
    () => ({
      orders: o.items,
      customers: c.items,
      works: w.items,
      customersLoading: c.loading,
      worksLoading: w.loading,
      error: o.error || c.error || w.error,
    }),
    [o, c, w]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
