import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Check, MessageCircle, Phone, UserPlus } from 'lucide-react'
import { db } from '../firebase.js'
import { STATUSES } from '../config.js'
import Sheet from '../components/Sheet.jsx'
import { ConfirmButton, Field } from '../components/ui.jsx'
import { useToast } from '../components/Toast.jsx'
import { clamp, formatDate, phoneKey, telLink, waLink } from '../lib/format.js'

const EMPTY = { name: '', phone: '', email: '', service: '', details: '', deadline: '', status: 'new', price: '', paid: false, notes: '' }

export default function OrderSheet({ open, order, customers, onClose }) {
  const toast = useToast()
  const isNew = !order
  const [f, setF] = useState(EMPTY)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) setF(order ? { ...EMPTY, ...order, price: order.price ?? '' } : EMPTY)
  }, [open, order])

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const known = f.phone && customers.some((c) => phoneKey(c.phone) === phoneKey(f.phone))

  async function save() {
    if (!f.name.trim() || !f.phone.trim()) return toast('Name and phone are required.', 'err')
    setBusy(true)
    const data = {
      name: clamp(f.name, 80),
      phone: clamp(f.phone, 24),
      email: clamp(f.email, 120),
      service: clamp(f.service, 80) || 'Other',
      details: clamp(f.details, 2000),
      deadline: clamp(f.deadline, 40),
      status: f.status,
      price: f.price === '' ? null : Number(f.price) || 0,
      paid: !!f.paid,
      notes: clamp(f.notes, 2000),
    }
    try {
      if (isNew) {
        await addDoc(collection(db, 'orders'), { ...data, source: 'admin', createdAt: serverTimestamp(), paidAt: data.paid ? serverTimestamp() : null })
      } else {
        const patch = { ...data }
        if (data.paid && !order.paid) patch.paidAt = serverTimestamp()
        if (!data.paid && order.paid) patch.paidAt = null
        await updateDoc(doc(db, 'orders', order.id), patch)
      }
      toast(isNew ? 'Order added.' : 'Order saved.')
      onClose()
    } catch {
      toast('Could not save the order.', 'err')
    } finally {
      setBusy(false)
    }
  }

  async function saveCustomer() {
    try {
      await addDoc(collection(db, 'customers'), {
        name: clamp(f.name, 80), phone: clamp(f.phone, 24), email: clamp(f.email, 120), notes: '', createdAt: serverTimestamp(),
      })
      toast('Saved to customers.')
    } catch {
      toast('Could not save the customer.', 'err')
    }
  }

  async function remove() {
    try {
      await deleteDoc(doc(db, 'orders', order.id))
      toast('Order deleted.')
      onClose()
    } catch {
      toast('Could not delete the order.', 'err')
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isNew ? 'New order' : 'Order details'}
      footer={
        <>
          {!isNew && <ConfirmButton onConfirm={remove} label="Delete" confirmLabel="Sure?" />}
          <button className="btn primary grow" onClick={save} disabled={busy}>
            {busy ? 'Saving' : isNew ? 'Add order' : 'Save changes'}
          </button>
        </>
      }
    >
      {!isNew && order.createdAt && <p className="muted">Received {formatDate(order.createdAt)}{order.source === 'website' ? ' from the website' : ''}</p>}

      {f.phone && (
        <div className="quick">
          <a className="btn ghost" href={telLink(f.phone)}>
            <Phone size={18} /> Call
          </a>
          <a className="btn whatsapp" href={waLink(f.phone, `Hi ${f.name.split(' ')[0] || ''}, this is Shan Graphix about your ${f.service || 'design'} order.`)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      )}

      <div className="seg" role="radiogroup" aria-label="Status">
        {STATUSES.map((s) => (
          <button key={s.id} role="radio" aria-checked={f.status === s.id} className={f.status === s.id ? 'on' : ''} style={{ '--c': s.color }} onClick={() => setF((x) => ({ ...x, status: s.id }))}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="form flat">
        <Field label="Name"><input value={f.name} onChange={set('name')} maxLength={80} /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set('phone')} maxLength={24} inputMode="tel" /></Field>
        <Field label="Email"><input value={f.email} onChange={set('email')} maxLength={120} inputMode="email" /></Field>
        <Field label="Service"><input value={f.service} onChange={set('service')} maxLength={80} /></Field>
        <Field label="Details"><textarea value={f.details} onChange={set('details')} rows={4} maxLength={2000} /></Field>
        <Field label="Needed by"><input type="date" value={f.deadline} onChange={set('deadline')} /></Field>
        <div className="two">
          <Field label="Price (Rs.)"><input value={f.price} onChange={set('price')} inputMode="numeric" placeholder="0" /></Field>
          <label className="field">
            <span>Payment</span>
            <button type="button" className={`toggle ${f.paid ? 'on' : ''}`} onClick={() => setF((x) => ({ ...x, paid: !x.paid }))} aria-pressed={f.paid}>
              {f.paid && <Check size={16} />} {f.paid ? 'Paid' : 'Not paid'}
            </button>
          </label>
        </div>
        <Field label="Private notes"><textarea value={f.notes} onChange={set('notes')} rows={3} maxLength={2000} placeholder="Only you can see this" /></Field>
      </div>

      {f.phone && !known && (
        <button className="btn ghost block-btn" onClick={saveCustomer}>
          <UserPlus size={18} /> Save to customers
        </button>
      )}
    </Sheet>
  )
}
