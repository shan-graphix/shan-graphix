import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'

// Live list from a collection. Sorted by one field.
export function useCollection(name, sortField, direction = 'asc') {
  const [state, setState] = useState({ items: [], loading: true, error: null })
  useEffect(() => {
    const q = sortField ? query(collection(db, name), orderBy(sortField, direction)) : collection(db, name)
    return onSnapshot(
      q,
      (snap) => setState({ items: snap.docs.map((d) => ({ id: d.id, ...d.data() })), loading: false, error: null }),
      (error) => setState({ items: [], loading: false, error })
    )
  }, [name, sortField, direction])
  return state
}

export function useDocument(path, id) {
  const [state, setState] = useState({ data: null, loading: true })
  useEffect(
    () =>
      onSnapshot(
        doc(db, path, id),
        (snap) => setState({ data: snap.exists() ? snap.data() : null, loading: false }),
        () => setState({ data: null, loading: false })
      ),
    [path, id]
  )
  return state
}
