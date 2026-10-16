// Admin screens were written with animation props. This keeps them as plain elements:
// the animation library is gone, so nothing can freeze a page change.
import { createElement, forwardRef } from 'react'

const STRIP = new Set([
  'initial', 'animate', 'exit', 'transition', 'whileTap', 'whileHover', 'whileDrag',
  'layout', 'layoutId', 'variants', 'drag', 'dragConstraints', 'dragElastic', 'dragListener', 'dragControls', 'onDragEnd',
])
const cache = {}
export const motion = new Proxy(
  {},
  {
    get: (_, tag) =>
      (cache[tag] ||= forwardRef(({ children, ...props }, ref) => {
        const clean = {}
        for (const k in props) if (!STRIP.has(k)) clean[k] = props[k]
        return createElement(tag, { ...clean, ref }, children)
      })),
  }
)
