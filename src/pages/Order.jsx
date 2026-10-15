import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { MessageCircle, Send } from 'lucide-react'
import { db } from '../firebase.js'
import { useSettings } from '../context/SettingsContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { Field, PageHead, Spinner } from '../components/ui.jsx'
import { clamp, digits, waLink } from '../lib/format.js'

const COOLDOWN_MS = 60 * 1000
const DAILY_LIMIT = 5

function recentOrders() {
  try {
    const list = JSON.parse(localStorage.getItem('sg_orders') || '[]')
    return list.filter((t) => Date.now() - t < 24 * 3600 * 1000)
  } catch {
    return []
  }
}

function Tick() {
  return (
    <svg viewBox="0 0 52 52" width="84" height="84" aria-hidden="true">
      <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#B90D0D" strokeWidth="3"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      <motion.path d="M15 27 l8 8 l15 -17" fill="none" stroke="#B90D0D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }} />
    </svg>
  )
}

export default function Order() {
  const s = useSettings()
  const toast = useToast()
  const [params] = useSearchParams()
  const options = useMemo(() => [...s.services.map((x) => x.title), 'Something else'], [s.services])
  const [form, setForm] = useState({
    name: '', phone: '', email: '', service: params.get('service') || '', details: '', deadline: '', website: '',
  })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (form.website) return // hidden field: only bots fill it
    const name = clamp(form.name, 80)
    const phone = clamp(form.phone, 24)
    const details = clamp(form.details, 2000)
    const service = clamp(form.service, 80)
    if (!name) return toast('Please enter your name.', 'err')
    if (digits(phone).length < 7) return toast('Please enter a valid phone or WhatsApp number.', 'err')
    if (!service) return toast('Please choose a service.', 'err')
    if (!details) return toast('Please tell us what you need.', 'err')

    const recent = recentOrders()
    if (recent.length && Date.now() - recent[recent.length - 1] < COOLDOWN_MS)
      return toast('Please wait a minute before sending another request.', 'err')
    if (recent.length >= DAILY_LIMIT) return toast('Daily request limit reached. Please message us on WhatsApp.', 'err')

    const data = { name, phone, service, details, status: 'new', paid: false, source: 'website', createdAt: serverTimestamp() }
    if (clamp(form.email, 120)) data.email = clamp(form.email, 120)
    if (form.deadline) data.deadline = clamp(form.deadline, 40)

    setBusy(true)
    try {
      await addDoc(collection(db, 'orders'), data)
      localStorage.setItem('sg_orders', JSON.stringify([...recent, Date.now()]))
      setDone({ name, service })
    } catch {
      toast('Could not send your request. Check your connection and try again.', 'err')
    } finally {
      setBusy(false)
    }
  }

  const wa = done && waLink(s.whatsapp, `Hi Shan Graphix, I just sent an order request for ${done.service}. My name is ${done.name}.`)

  return (
    <div className="narrow">
      <PageHead title="Place an order" sub="Fill this in and we will get back to you with a quote." />
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" className="card done" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Tick />
            <h2>Thanks, {done.name.split(' ')[0]}. Your request is in.</h2>
            <p>We will contact you on the number you gave us. For a faster reply, message us on WhatsApp.</p>
            {wa && (
              <a className="btn whatsapp" href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={20} /> Message on WhatsApp
              </a>
            )}
            <button
              className="btn ghost"
              onClick={() => {
                setDone(null)
                setForm({ name: '', phone: '', email: '', service: '', details: '', deadline: '', website: '' })
              }}
            >
              Send another request
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" className="card form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} noValidate>
            <Field label="Your name">
              <input value={form.name} onChange={set('name')} maxLength={80} autoComplete="name" placeholder="e.g. Nimal Perera" />
            </Field>
            <Field label="Phone or WhatsApp number">
              <input value={form.phone} onChange={set('phone')} maxLength={24} inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" />
            </Field>
            <Field label="Email (optional)">
              <input value={form.email} onChange={set('email')} maxLength={120} inputMode="email" autoComplete="email" placeholder="you@example.com" />
            </Field>
            <Field label="What do you need?">
              <select value={form.service} onChange={set('service')}>
                <option value="">Choose a service</option>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Tell us about it" hint="Text, sizes, colours, event date. Send images on WhatsApp after you submit.">
              <textarea value={form.details} onChange={set('details')} maxLength={2000} rows={5} placeholder="Describe the design you want" />
            </Field>
            <Field label="Needed by (optional)">
              <input type="date" value={form.deadline} onChange={set('deadline')} min={new Date().toISOString().slice(0, 10)} />
            </Field>
            {/* Honeypot: hidden from people, bots fill it in. */}
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />
            <button className="btn primary block-btn" disabled={busy}>
              {busy ? <Spinner /> : <Send size={18} />} {busy ? 'Sending' : 'Send request'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
