/* Pure array helpers used by the tool-content editors. */

export function arrUpdate(arr, idx, patch)   { return arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }
export function arrReplace(arr, idx, value)  { return arr.map((it, i) => (i === idx ? value : it)) }
export function arrRemove(arr, idx)          { return arr.filter((_, i) => i !== idx) }
export function arrInsert(arr, idx, value)   { return [...arr.slice(0, idx), value, ...arr.slice(idx)] }
export function arrAppend(arr, value)        { return [...arr, value] }
export function arrMove(arr, idx, dir) {
  const next = arr.slice()
  const j = idx + dir
  if (j < 0 || j >= next.length) return arr
  ;[next[idx], next[j]] = [next[j], next[idx]]
  return next
}

/* Generate a stable-ish id from a label, plus disambiguation suffix. */
export function slugId(label, existingIds = []) {
  const base = (label || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item'
  let id = base
  let n = 2
  while (existingIds.includes(id)) {
    id = `${base}-${n}`
    n += 1
  }
  return id
}
