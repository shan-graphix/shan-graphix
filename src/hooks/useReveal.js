import { useEffect } from 'react'

// Gently fades sections in as they scroll into view.
export function useReveal(...deps) {
  useEffect(() => {
    const els = [...document.querySelectorAll('.reveal:not(.in)')]
    if (!('IntersectionObserver' in window)) return els.forEach((el) => el.classList.add('in'))
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
