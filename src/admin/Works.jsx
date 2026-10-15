import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, Reorder, motion, useDragControls } from 'framer-motion'
import { collection, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { AlertCircle, CheckCircle2, GripVertical, ImagePlus, Images, Star, UploadCloud } from 'lucide-react'
import { db } from '../firebase.js'
import { CATEGORIES } from '../config.js'
import { useCollection } from '../hooks/useFirestore.js'
import { useToast } from '../components/Toast.jsx'
import { ConfirmButton, EmptyState, PageHead, Skeleton } from '../components/ui.jsx'
import { processImage } from '../lib/image.js'
import { cleanTitle } from '../lib/format.js'

function saveError(e) {
  if (e?.code === 'permission-denied') return 'Not allowed. Publish the latest firestore.rules in Firebase and make sure you are signed in as the admin.'
  if (e?.code === 'unavailable') return 'No connection to Firebase. Check your internet and try again.'
  return e?.message || 'Upload failed.'
}

function Row({ w, onSaveOrder }) {
  const controls = useDragControls()
  const toast = useToast()
  const [title, setTitle] = useState(w.title)
  useEffect(() => setTitle(w.title), [w.title])

  const update = (patch) => updateDoc(doc(db, 'works', w.id), patch).catch(() => toast('Could not save that change.', 'err'))

  async function remove() {
    try {
      const batch = writeBatch(db)
      batch.delete(doc(db, 'works', w.id))
      batch.delete(doc(db, 'workImages', w.id))
      await batch.commit()
      toast('Work deleted.')
    } catch {
      toast('Could not delete this work.', 'err')
    }
  }

  return (
    <Reorder.Item value={w} as="div" className="work-row card" dragListener={false} dragControls={controls} onDragEnd={onSaveOrder} whileDrag={{ scale: 1.02, boxShadow: '0 18px 40px rgba(23,23,28,.2)' }}>
      <button className="handle" onPointerDown={(e) => controls.start(e)} aria-label="Drag to reorder">
        <GripVertical size={20} />
      </button>
      <img src={w.thumb} alt="" draggable="false" />
      <div className="work-fields">
        <input
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== w.title && update({ title: title.trim() })}
          aria-label="Title"
        />
        <select value={w.category} onChange={(e) => update({ category: e.target.value })} aria-label="Category">
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <div className="work-actions">
          <button className={`btn small ${w.featured ? 'primary' : 'ghost'}`} onClick={() => update({ featured: !w.featured })}>
            <Star size={16} fill={w.featured ? 'currentColor' : 'none'} /> {w.featured ? 'Featured' : 'Feature'}
          </button>
          <ConfirmButton onConfirm={remove} label="Delete" confirmLabel="Sure?" className="small" />
        </div>
      </div>
    </Reorder.Item>
  )
}

export default function Works() {
  const toast = useToast()
  const { items, loading } = useCollection('works', 'order')
  const [list, setList] = useState([])
  const listRef = useRef([])
  const [cat, setCat] = useState('Logo')
  const [uploads, setUploads] = useState([])
  const [over, setOver] = useState(false)
  const input = useRef()
  const minOrder = useRef(0)

  useEffect(() => {
    setList(items)
    listRef.current = items
    minOrder.current = items.length ? Math.min(...items.map((i) => i.order ?? 0)) : 0
  }, [items])

  const patchUpload = (id, patch) => setUploads((u) => u.map((x) => (x.id === id ? { ...x, ...patch } : x)))

  async function uploadFiles(files) {
    const imgs = [...files].filter((f) => f.type.startsWith('image/'))
    if (!imgs.length) return toast('Choose image files (JPG, PNG or WebP).', 'err')
    for (const file of imgs) {
      const uid = crypto.randomUUID()
      setUploads((u) => [...u, { id: uid, name: file.name, progress: 0 }])
      try {
        const { full, thumb } = await processImage(file)
        patchUpload(uid, { progress: 0.55 })
        const id = doc(collection(db, 'works')).id
        minOrder.current -= 1
        const batch = writeBatch(db)
        // The small preview goes in the portfolio list; the full picture is opened only when tapped.
        batch.set(doc(db, 'workImages', id), { data: full.dataUrl, createdAt: serverTimestamp() })
        batch.set(doc(db, 'works', id), {
          title: cleanTitle(file.name) || 'Untitled',
          category: cat,
          thumb: thumb.dataUrl,
          width: full.width,
          height: full.height,
          featured: false,
          order: minOrder.current,
          createdAt: serverTimestamp(),
        })
        await batch.commit()
        patchUpload(uid, { progress: 1, done: true })
        setTimeout(() => setUploads((u) => u.filter((x) => x.id !== uid)), 1600)
      } catch (e) {
        patchUpload(uid, { error: saveError(e) })
      }
    }
  }

  async function saveOrder() {
    const batch = writeBatch(db)
    let changed = 0
    listRef.current.forEach((w, i) => {
      if (w.order !== i) {
        batch.update(doc(db, 'works', w.id), { order: i })
        changed++
      }
    })
    if (changed) {
      try {
        await batch.commit()
      } catch {
        toast('Could not save the new order.', 'err')
      }
    }
  }

  return (
    <>
      <PageHead title="Works" sub="Add designs to your portfolio. They go live straight away." />

      <div
        className={`dropzone card ${over ? 'over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          uploadFiles(e.dataTransfer.files)
        }}
        onClick={() => input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      >
        <motion.div className="dz-icon" animate={over ? { scale: 1.2, rotate: -6 } : { scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
          <UploadCloud size={30} />
        </motion.div>
        <strong>{over ? 'Drop to upload' : 'Drag images here, or tap to choose'}</strong>
        <small>JPG, PNG or WebP. Pick as many as you like.</small>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { uploadFiles(e.target.files); e.target.value = '' }} />
      </div>

      <div className="cat-pick">
        <span>Add to category</span>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <AnimatePresence>
        {uploads.map((u) => (
          <motion.div key={u.id} className={`upload card ${u.error ? 'bad' : ''}`} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {u.error ? <AlertCircle size={20} /> : u.done ? <CheckCircle2 size={20} /> : <ImagePlus size={20} />}
            <div>
              <strong>{u.name}</strong>
              {u.error ? <small>{u.error}</small> : <div className="bar"><motion.i animate={{ width: `${Math.round(u.progress * 100)}%` }} /></div>}
            </div>
            {u.error && <button className="link" onClick={() => setUploads((x) => x.filter((y) => y.id !== u.id))}>Dismiss</button>}
          </motion.div>
        ))}
      </AnimatePresence>

      <section className="block">
        <div className="block-head">
          <h2>Your portfolio ({list.length})</h2>
          {list.length > 1 && <small className="muted">Hold the handle to reorder</small>}
        </div>
        {loading ? (
          <Skeleton h={110} />
        ) : list.length === 0 ? (
          <EmptyState icon={Images} title="No works yet" text="Add your first design above." />
        ) : (
          <Reorder.Group axis="y" values={list} onReorder={(v) => { setList(v); listRef.current = v }} as="div" className="stack">
            {list.map((w) => (
              <Row key={w.id} w={w} onSaveOrder={saveOrder} />
            ))}
          </Reorder.Group>
        )}
      </section>
    </>
  )
}
