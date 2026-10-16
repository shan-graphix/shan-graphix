import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'

const stop = (unsub) => () => typeof unsub === 'function' && unsub()

// Live list from a collection, sorted by one field.
export function useCollection(name, sortField, direction = 'asc') {
  const [state, setState] = useState({ items: [], loading: true, error: null })
  useEffect(() => {
    const q = sortField ? query(collection(db, name), orderBy(sortField, direction)) : collection(db, name)
    const unsub = onSnapshot(
      q,
      (snap) => setState({ items: snap.docs.map((d) => ({ id: d.id, ...d.data() })), loading: false, error: null }),
      (error) => setState({ items: [], loading: false, error })
    )
    return stop(unsub)
  }, [name, sortField, direction])
  return state
}

export function useDocument(path, id) {
  const [state, setState] = useState({ data: null, loading: true })
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, path, id),
      (snap) => setState({ data: snap.exists() ? snap.data() : null, loading: false }),
      () => setState({ data: null, loading: false })
    )
    return stop(unsub)
  }, [path, id])
  return state
}
