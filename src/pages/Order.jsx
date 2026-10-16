import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Check, MessageCircle, Send } from 'lucide-react'
import { db } from '../firebase.js'
import { useSettings } from '../context/PublicData.jsx'
import { useToast } from '../components/Toast.jsx'
import { Field, PageHead, Spinner } from '../components/ui.jsx'
import Select from '../components/Select.jsx'
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

const EMPTY = { name: '', phone: '', email: '', service: '', details: '', deadline: '', website: '' }

export default function Order() {
  const s = useSettings()
  const toast = useToast()
  const [params] = useSearchParams()
  const options = useMemo(() => [...s.services.map((x) => x.title), 'Something else'], [s.services])
  const [form, setForm] = useState({ ...EMPTY, service: params.get('service') || '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (form.website) return // hidden field: only bots fill it in
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
    <div className="container inner">
      <PageHead title="Place an order" sub="Send your request and we will get back to you with a quote." />
      <div className="order-grid">
        {done ? (
          <div className="card done">
            <span className="done-tick">
              <Check size={26} />
            </span>
            <h2>Thanks, {done.name.split(' ')[0]}. Your request is in.</h2>
            <p>We will contact you on the number you gave us. For a faster reply, message us on WhatsApp.</p>
            <div className="done-actions">
              {wa && (
                <a className="btn whatsapp" href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={17} /> Message on WhatsApp
                </a>
              )}
              <button
                className="btn ghost"
                onClick={() => {
                  setDone(null)
                  setForm(EMPTY)
                }}
              >
                Send another request
              </button>
            </div>
          </div>
        ) : (
          <form className="card form" onSubmit={submit} noValidate>
            <div className="two">
              <Field label="Your name">
                <input value={form.name} onChange={set('name')} maxLength={80} autoComplete="name" placeholder="Full name" />
              </Field>
              <Field label="Phone or WhatsApp">
                <input value={form.phone} onChange={set('phone')} maxLength={24} inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" />
              </Field>
            </div>
            <Field label="Email (optional)">
              <input value={form.email} onChange={set('email')} maxLength={120} inputMode="email" autoComplete="email" placeholder="you@example.com" />
            </Field>
            <div className="two">
              <Field label="Service" plain>
                <Select value={form.service} onChange={(v) => setForm((f) => ({ ...f, service: v }))} options={options} placeholder="Choose a service" />
              </Field>
              <Field label="Needed by (optional)">
                <input type="date" value={form.deadline} onChange={set('deadline')} min={new Date().toISOString().slice(0, 10)} />
              </Field>
            </div>
            <Field label="Project details" hint="Text, sizes, colours, event date. You can send images on WhatsApp after submitting.">
              <textarea value={form.details} onChange={set('details')} maxLength={2000} rows={5} placeholder="Describe the design you want" />
            </Field>
            {/* Honeypot: hidden from people, bots fill it in. */}
            <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} name="website" />
            <button className="btn primary lg block-btn" disabled={busy}>
              {busy ? <Spinner /> : <Send size={16} />} {busy ? 'Sending' : 'Send request'}
            </button>
          </form>
        )}

        <aside className="card side-info">
          <h3>What happens next</h3>
          <ol>
            <li>
              <b>1</b> We review your request.
            </li>
            <li>
              <b>2</b> We contact you with a quote and timeline.
            </li>
            <li>
              <b>3</b> We design, you review, and we deliver the final files.
            </li>
          </ol>
          {s.whatsapp && (
            <a className="btn ghost block-btn" href={waLink(s.whatsapp, 'Hi Shan Graphix')} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} /> Prefer WhatsApp?
            </a>
          )}
        </aside>
      </div>
    </div>
  )
}
