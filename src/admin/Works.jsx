import { useEffect, useRef, useState } from 'react'
import { collection, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, GripVertical, ImagePlus, Images, Star, UploadCloud } from 'lucide-react'
import { db } from '../firebase.js'
import { CATEGORIES } from '../config.js'
import { useAdminData } from '../context/AdminData.jsx'
import { useToast } from '../components/Toast.jsx'
import { ConfirmButton, EmptyState, PageHead, Skeleton } from '../components/ui.jsx'
import { processImage } from '../lib/image.js'
import { cleanTitle } from '../lib/format.js'

function saveError(e) {
  if (e?.code === 'permission-denied') return 'Not allowed. Publish the latest firestore.rules in Firebase and make sure you are signed in as the admin.'
  if (e?.code === 'unavailable') return 'No connection to Firebase. Check your internet and try again.'
  return e?.message || 'Upload failed.'
}

function Row({ w, index, count, onMove, dragProps }) {
  const toast = useToast()
  const [title, setTitle] = useState(w.title)
  useEffect(() => {
    setTitle(w.title)
  }, [w.title])

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
    <div className="work-row card" {...dragProps}>
      <div className="work-side">
        <span className="handle" title="Drag to reorder">
          <GripVertical size={18} />
        </span>
        <button className="mini" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Move up">
          <ArrowUp size={15} />
        </button>
        <button className="mini" onClick={() => onMove(index, 1)} disabled={index === count - 1} aria-label="Move down">
          <ArrowDown size={15} />
        </button>
      </div>
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
          <button className={`btn sm ${w.featured ? 'primary' : 'ghost'}`} onClick={() => update({ featured: !w.featured })}>
            <Star size={14} fill={w.featured ? 'currentColor' : 'none'} /> {w.featured ? 'Featured' : 'Feature'}
          </button>
          <ConfirmButton onConfirm={remove} label="Delete" confirmLabel="Sure?" className="sm" />
        </div>
      </div>
    </div>
  )
}

export default function Works() {
  const toast = useToast()
  const { works: items, worksLoading: loading } = useAdminData()
  const [list, setList] = useState([])
  const listRef = useRef([])
  const dragFrom = useRef(null)
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
      setUploads((u) => [...u, { id: uid, name: file.name, progress: 0.1 }])
      try {
        const { full, thumb } = await processImage(file)
        patchUpload(uid, { progress: 0.55 })
        const id = doc(collection(db, 'works')).id
        minOrder.current -= 1
        const batch = writeBatch(db)
        // The small preview goes in the portfolio list; the full picture is opened only when selected.
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

  async function saveOrder(next = listRef.current) {
    const batch = writeBatch(db)
    let changed = 0
    next.forEach((w, i) => {
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

  function move(i, d) {
    const next = [...listRef.current]
    const j = i + d
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    listRef.current = next
    setList(next)
    saveOrder(next)
  }

  // Mouse drag and drop for reordering (phones use the arrow buttons)
  const dragProps = (i) => ({
    draggable: true,
    onDragStart: () => (dragFrom.current = i),
    onDragOver: (e) => {
      e.preventDefault()
      const from = dragFrom.current
      if (from === null || from === i) return
      const next = [...listRef.current]
      const [moved] = next.splice(from, 1)
      next.splice(i, 0, moved)
      dragFrom.current = i
      listRef.current = next
      setList(next)
    },
    onDragEnd: () => {
      dragFrom.current = null
      saveOrder()
    },
  })

  return (
    <>
      <PageHead title="Works" sub="Add designs to your portfolio. They go live straight away." />

      <div
        className={`dropzone card ${over ? 'over' : ''}`}
        onDragOver={(e) => {
          if (dragFrom.current !== null) return
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (dragFrom.current !== null) return
          e.preventDefault()
          setOver(false)
          uploadFiles(e.dataTransfer.files)
        }}
        onClick={() => input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      >
        <div className="dz-icon">
          <UploadCloud size={24} />
        </div>
        <strong>{over ? 'Drop to upload' : 'Drag images here, or select files'}</strong>
        <small>JPG, PNG or WebP. Choose as many as you like.</small>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            uploadFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      <div className="cat-pick">
        <span>Add to category</span>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {uploads.map((u) => (
        <div key={u.id} className={`upload card ${u.error ? 'bad' : ''}`}>
          {u.error ? <AlertCircle size={18} /> : u.done ? <CheckCircle2 size={18} /> : <ImagePlus size={18} />}
          <div>
            <strong>{u.name}</strong>
            {u.error ? (
              <small>{u.error}</small>
            ) : (
              <div className="upload-bar">
                <i style={{ width: `${Math.round(u.progress * 100)}%` }} />
              </div>
            )}
          </div>
          {u.error && (
            <button className="link" onClick={() => setUploads((x) => x.filter((y) => y.id !== u.id))}>
              Dismiss
            </button>
          )}
        </div>
      ))}

      <section className="block">
        <div className="section-head">
          <h2>Your portfolio ({list.length})</h2>
          {list.length > 1 && <small className="muted">Drag rows or use the arrows to reorder</small>}
        </div>
        {loading ? (
          <Skeleton h={110} />
        ) : list.length === 0 ? (
          <EmptyState icon={Images} title="No works yet" text="Add your first design above." />
        ) : (
          <div className="stack">
            {list.map((w, i) => (
              <Row key={w.id} w={w} index={i} count={list.length} onMove={move} dragProps={dragProps(i)} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
