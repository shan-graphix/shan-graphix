import { useMemo, useState } from 'react'
import { motion } from '../lib/motion.jsx'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { MessageCircle, Phone, Plus, Search, UserPlus, Users } from 'lucide-react'
import { db } from '../firebase.js'
import { useAdminData } from '../context/AdminData.jsx'
import Sheet from '../components/Sheet.jsx'
import { ConfirmButton, EmptyState, Field, PageHead, StatusBadge } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { clamp, initials, money, phoneKey, telLink, timeAgo, waLink } from '../lib/format.js'

const EMPTY = { name: '', phone: '', email: '', notes: '' }

export default function Customers({ orders }) {
  const toast = useToast()
  const { customers, customersLoading: loading } = useAdminData()
  const [q, setQ] = useState('')
  const [sheet, setSheet] = useState({ open: false, customer: null })
  const [f, setF] = useState(EMPTY)

  const ordersOf = (c) => orders.filter((o) => phoneKey(o.phone) && phoneKey(o.phone) === phoneKey(c.phone))

  // People who ordered but are not saved as customers yet
  const unsaved = useMemo(() => {
    const known = new Set(customers.map((c) => phoneKey(c.phone)))
    const seen = new Map()
    orders.forEach((o) => {
      const k = phoneKey(o.phone)
      if (k && !known.has(k) && !seen.has(k)) seen.set(k, o)
    })
    return [...seen.values()]
  }, [orders, customers])

  const list = customers.filter((c) => {
    const s = q.trim().toLowerCase()
    return !s || c.name?.toLowerCase().includes(s) || c.phone?.includes(s) || c.email?.toLowerCase().includes(s)
  })

  function openSheet(c) {
    setF(c ? { ...EMPTY, ...c } : EMPTY)
    setSheet({ open: true, customer: c })
  }
  const close = () => setSheet((s) => ({ ...s, open: false }))
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function save() {
    if (!f.name.trim() || !f.phone.trim()) return toast('Name and phone are required.', 'err')
    const data = { name: clamp(f.name, 80), phone: clamp(f.phone, 24), email: clamp(f.email, 120), notes: clamp(f.notes, 2000) }
    try {
      if (sheet.customer) await updateDoc(doc(db, 'customers', sheet.customer.id), data)
      else await addDoc(collection(db, 'customers'), { ...data, createdAt: serverTimestamp() })
      toast('Customer saved.')
      close()
    } catch {
      toast('Could not save the customer.', 'err')
    }
  }

  async function remove() {
    try {
      await deleteDoc(doc(db, 'customers', sheet.customer.id))
      toast('Customer deleted.')
      close()
    } catch {
      toast('Could not delete the customer.', 'err')
    }
  }

  async function saveAllUnsaved() {
    try {
      const batch = writeBatch(db)
      unsaved.forEach((o) =>
        batch.set(doc(collection(db, 'customers')), {
          name: clamp(o.name, 80), phone: clamp(o.phone, 24), email: clamp(o.email, 120), notes: '', createdAt: serverTimestamp(),
        })
      )
      await batch.commit()
      toast(`${unsaved.length} customer${unsaved.length > 1 ? 's' : ''} saved.`)
    } catch {
      toast('Could not save customers.', 'err')
    }
  }

  const theirOrders = sheet.customer ? ordersOf(sheet.customer) : []
  const total = theirOrders.reduce((s, o) => s + (o.paid ? Number(o.price) || 0 : 0), 0)

  return (
    <>
      <PageHead title="Customers" sub={`${customers.length} saved`} />

      {unsaved.length > 0 && (
        <motion.div className="banner card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="tile-icon"><UserPlus size={22} /></span>
          <span>
            <strong>{unsaved.length} new {unsaved.length > 1 ? 'people' : 'person'} from orders</strong>
            <small>Not in your customer list yet</small>
          </span>
          <button className="btn primary small" onClick={saveAllUnsaved}>Save</button>
        </motion.div>
      )}

      <div className="search">
        <Search size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone or email" />
      </div>

      {!loading && list.length === 0 ? (
        <EmptyState icon={Users} title={q ? 'No match' : 'No customers yet'} text={q ? 'Try a different search.' : 'Add one with the + button, or save people from new orders.'} />
      ) : (
        <div className="stack">
          {list.map((c, i) => {
            const n = ordersOf(c).length
            return (
              <motion.button key={c.id} layout className="row card press" onClick={() => openSheet(c)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03 }} whileTap={{ scale: 0.98 }}>
                <span className="avatar">{initials(c.name)}</span>
                <span className="row-main">
                  <strong>{c.name}</strong>
                  <small>{c.phone}</small>
                </span>
                <span className="count">{n} {n === 1 ? 'order' : 'orders'}</span>
              </motion.button>
            )
          })}
        </div>
      )}

      <motion.button className="fab" onClick={() => openSheet(null)} aria-label="Add customer" whileTap={{ scale: 0.9 }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.2 }}>
        <Plus size={26} />
      </motion.button>

      <Sheet
        open={sheet.open}
        onClose={close}
        title={sheet.customer ? sheet.customer.name : 'New customer'}
        footer={
          <>
            {sheet.customer && <ConfirmButton onConfirm={remove} label="Delete" confirmLabel="Sure?" />}
            <button className="btn primary grow" onClick={save}>Save customer</button>
          </>
        }
      >
        {sheet.customer && f.phone && (
          <div className="quick">
            <a className="btn ghost" href={telLink(f.phone)}><Phone size={18} /> Call</a>
            <a className="btn whatsapp" href={waLink(f.phone, `Hi ${f.name.split(' ')[0]}, this is Shan Graphix.`)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> WhatsApp</a>
          </div>
        )}
        <div className="form flat">
          <Field label="Name"><input value={f.name} onChange={set('name')} maxLength={80} /></Field>
          <Field label="Phone"><input value={f.phone} onChange={set('phone')} maxLength={24} inputMode="tel" /></Field>
          <Field label="Email"><input value={f.email} onChange={set('email')} maxLength={120} inputMode="email" /></Field>
          <Field label="Notes"><textarea value={f.notes} onChange={set('notes')} rows={3} maxLength={2000} placeholder="Preferences, past feedback, anything useful" /></Field>
        </div>
        {sheet.customer && (
          <section className="block">
            <div className="block-head">
              <h3>Orders ({theirOrders.length})</h3>
              {total > 0 && <small className="muted">Paid {money(total)}</small>}
            </div>
            {theirOrders.length === 0 ? (
              <p className="muted">No orders from this number yet.</p>
            ) : (
              <div className="stack tight">
                {theirOrders.map((o) => (
                  <div key={o.id} className="row flat-row">
                    <span className="row-main">
                      <strong>{o.service}</strong>
                      <small>{timeAgo(o.createdAt)}{o.price ? ` · ${money(o.price)}` : ''}</small>
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </Sheet>
    </>
  )
}
