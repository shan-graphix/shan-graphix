import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Inbox, Plus } from 'lucide-react'
import { useCollection } from '../hooks/useFirestore.js'
import { STATUSES } from '../config.js'
import { Chips, EmptyState, PageHead, StatusBadge } from '../components/ui.jsx'
import { money, timeAgo } from '../lib/format.js'
import OrderSheet from './OrderSheet.jsx'

const FILTERS = [{ id: 'all', label: 'All' }, ...STATUSES, { id: 'unpaid', label: 'Unpaid' }]

export default function Orders({ orders }) {
  const { items: customers } = useCollection('customers', 'name')
  const [filter, setFilter] = useState('all')
  const [sheet, setSheet] = useState({ open: false, order: null })

  const list = useMemo(() => {
    if (filter === 'all') return orders
    if (filter === 'unpaid') return orders.filter((o) => !o.paid)
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  return (
    <>
      <PageHead title="Orders" sub={`${orders.length} in total`} />
      <Chips id="orders" items={FILTERS} value={filter} onChange={setFilter} />

      {list.length === 0 ? (
        <EmptyState icon={Inbox} title="No orders here" text={filter === 'all' ? 'Requests from your website will show up here.' : 'Nothing matches this filter.'} />
      ) : (
        <div className="stack">
          {list.map((o, i) => (
            <motion.button
              key={o.id}
              layout
              className="row card press"
              onClick={() => setSheet({ open: true, order: o })}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="avatar">{(o.name || '?')[0].toUpperCase()}</span>
              <span className="row-main">
                <strong>{o.name}</strong>
                <small>
                  {o.service} · {timeAgo(o.createdAt)}
                  {o.price ? ` · ${money(o.price)}${o.paid ? ' paid' : ''}` : ''}
                </small>
              </span>
              <StatusBadge status={o.status} />
            </motion.button>
          ))}
        </div>
      )}

      <motion.button className="fab" onClick={() => setSheet({ open: true, order: null })} aria-label="Add order" whileTap={{ scale: 0.9 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.2 }}>
        <Plus size={26} />
      </motion.button>

      <OrderSheet open={sheet.open} order={sheet.order} customers={customers} onClose={() => setSheet((s) => ({ ...s, open: false }))} />
    </>
  )
}
