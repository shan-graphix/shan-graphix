import { useEffect, useState } from 'react'

export function useCountUp(value, duration = 700) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const target = Number(value) || 0
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setN(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return n
}
