// Shrinks images in the browser and turns them into small text strings so they can be
// stored for free inside Firestore (no Firebase Storage needed).
const MAX_INPUT = 25 * 1024 * 1024
const FULL_MAX_CHARS = 880000 // stays under Firestore's 1 MB document limit
const THUMB_MAX_CHARS = 70000

const toBlob = (canvas, type, q) => new Promise((resolve) => canvas.toBlob(resolve, type, q))
const readDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })

async function render(bitmap, maxSide, quality) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, width, height)
  let blob = await toBlob(canvas, 'image/webp', quality)
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', quality)
  return { blob, width, height }
}

// Lowers quality, then size, until the result fits.
async function encode(bitmap, maxSide, quality, maxChars) {
  let side = maxSide
  let q = quality
  for (let i = 0; i < 16; i++) {
    const { blob, width, height } = await render(bitmap, side, q)
    const dataUrl = await readDataUrl(blob)
    if (dataUrl.length <= maxChars) return { dataUrl, width, height }
    if (q > 0.55) q -= 0.08
    else side = Math.round(side * 0.85)
  }
  throw new Error('This image is too detailed to store. Try a smaller image.')
}

export async function processImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.')
  if (file.size > MAX_INPUT) throw new Error('That image is larger than 25 MB.')
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('This image format is not supported. Use JPG, PNG or WebP.')
  }
  const full = await encode(bitmap, 1400, 0.86, FULL_MAX_CHARS)
  const thumb = await encode(bitmap, 520, 0.78, THUMB_MAX_CHARS)
  bitmap.close?.()
  return { full, thumb }
}
