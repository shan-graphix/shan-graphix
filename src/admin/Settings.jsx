import { useEffect, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { LogOut, Plus, Trash2 } from 'lucide-react'
import { db } from '../firebase.js'
import { DEFAULT_SETTINGS } from '../config.js'
import { useDocument } from '../hooks/useFirestore.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { Field, PageHead, Skeleton, Spinner } from '../components/ui.jsx'
import { ICON_NAMES } from '../lib/icons.js'
import { clamp } from '../lib/format.js'

const TEXT = ['tagline', 'intro', 'about', 'location', 'hours', 'phone', 'whatsapp', 'email', 'instagram', 'facebook', 'tiktok']

export default function Settings() {
  const { data, loading } = useDocument('settings', 'site')
  const { logout, user } = useAuth()
  const toast = useToast()
  const [f, setF] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && !f) setF({ ...DEFAULT_SETTINGS, ...(data || {}) })
  }, [loading, data, f])

  if (!f) return <Skeleton h={300} />

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const setSvc = (i, k, v) => setF((x) => ({ ...x, services: x.services.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }))

  async function save() {
    setBusy(true)
    try {
      const out = {}
      TEXT.forEach((k) => (out[k] = clamp(f[k], k === 'about' || k === 'intro' ? 800 : 200)))
      out.services = f.services
        .filter((s) => s.title.trim())
        .map((s) => ({ id: s.id, icon: s.icon, title: clamp(s.title, 60), desc: clamp(s.desc, 200), price: clamp(s.price, 40) }))
      await setDoc(doc(db, 'settings', 'site'), out, { merge: true })
      toast('Saved. Your website is updated.')
    } catch {
      toast('Could not save. Check your connection.', 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHead title="Settings" sub="These details appear on your website." />

      <div className="card form">
        <h3>Business</h3>
        <Field label="Headline"><input value={f.tagline} onChange={set('tagline')} maxLength={80} /></Field>
        <Field label="Short intro"><textarea value={f.intro} onChange={set('intro')} rows={3} maxLength={800} /></Field>
        <Field label="About us"><textarea value={f.about} onChange={set('about')} rows={5} maxLength={800} /></Field>
        <Field label="Location"><input value={f.location} onChange={set('location')} /></Field>
        <Field label="Working hours"><input value={f.hours} onChange={set('hours')} placeholder="e.g. Mon to Sat, 9 am to 6 pm" /></Field>
      </div>

      <div className="card form">
        <h3>Contact</h3>
        <Field label="WhatsApp number" hint="Used for the order button. Example: 0771234567"><input value={f.whatsapp} onChange={set('whatsapp')} inputMode="tel" /></Field>
        <Field label="Phone number"><input value={f.phone} onChange={set('phone')} inputMode="tel" /></Field>
        <Field label="Email"><input value={f.email} onChange={set('email')} inputMode="email" /></Field>
        <Field label="Instagram link"><input value={f.instagram} onChange={set('instagram')} placeholder="https://instagram.com/..." inputMode="url" /></Field>
        <Field label="Facebook link"><input value={f.facebook} onChange={set('facebook')} placeholder="https://facebook.com/..." inputMode="url" /></Field>
        <Field label="TikTok link"><input value={f.tiktok} onChange={set('tiktok')} placeholder="https://tiktok.com/@..." inputMode="url" /></Field>
      </div>

      <div className="card form">
        <h3>Services</h3>
        {f.services.map((s, i) => (
          <div key={s.id} className="svc-edit">
            <div className="two">
              <select value={s.icon} onChange={(e) => setSvc(i, 'icon', e.target.value)} aria-label="Icon">
                {ICON_NAMES.map((n) => <option key={n}>{n}</option>)}
              </select>
              <input value={s.price} onChange={(e) => setSvc(i, 'price', e.target.value)} placeholder="Price, e.g. From Rs. 2,500" maxLength={40} />
            </div>
            <input value={s.title} onChange={(e) => setSvc(i, 'title', e.target.value)} placeholder="Service name" maxLength={60} />
            <textarea value={s.desc} onChange={(e) => setSvc(i, 'desc', e.target.value)} rows={2} placeholder="Short description" maxLength={200} />
            <button className="link danger-text" onClick={() => setF((x) => ({ ...x, services: x.services.filter((_, j) => j !== i) }))}>
              <Trash2 size={16} /> Remove
            </button>
          </div>
        ))}
        <button className="btn ghost" onClick={() => setF((x) => ({ ...x, services: [...x.services, { id: `s${Date.now()}`, icon: 'Sparkles', title: '', desc: '', price: '' }] }))}>
          <Plus size={18} /> Add service
        </button>
      </div>

      <button className="btn primary block-btn sticky-save" onClick={save} disabled={busy}>
        {busy && <Spinner />} {busy ? 'Saving' : 'Save changes'}
      </button>

      <div className="card account">
        <div>
          <strong>Signed in</strong>
          <small>{user?.email}</small>
        </div>
        <button className="btn ghost" onClick={logout}><LogOut size={18} /> Sign out</button>
      </div>
    </>
  )
}
