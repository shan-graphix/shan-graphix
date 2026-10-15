import { useEffect, useState } from 'react'
import { animate } from 'framer-motion'

export function useCountUp(value, duration = 0.9) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const controls = animate(0, Number(value) || 0, { duration, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) })
    return () => controls.stop()
  }, [value, duration])
  return n
}
