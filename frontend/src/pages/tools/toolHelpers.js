/**
 * Shared helpers for tool pages (constants, scoring, target parsing, scan runner).
 * Components live in toolComponents.jsx so Fast Refresh stays happy.
 */

export const STATUS_META = {
  idle:    { label: 'Pending',   className: 'idle' },
  running: { label: 'Scanning…', className: 'running' },
  pass:    { label: 'Safe',      className: 'pass' },
  warn:    { label: 'Warning',   className: 'warn' },
  fail:    { label: 'At Risk',   className: 'fail' },
  info:    { label: 'Info',      className: 'info' },
}

export const STATUS_SCORE = {
  pass: 10,
  info: 8,
  warn: 5,
  fail: 0,
}

/* ─── Target-type detection ─── */
export function detectTargetType(input) {
  const t = String(input || '').trim()
  if (!t) return 'self'
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(t)) return 'ip'
  if (/^[0-9a-fA-F:]+:[0-9a-fA-F:]+/.test(t)) return 'ip6'
  if (/^[a-zA-Z]+:\/\//.test(t) || /\.[a-zA-Z]{2,}/.test(t)) return 'url'
  return 'unknown'
}

export function normalizeTarget(input) {
  const t = String(input || '').trim()
  const type = detectTargetType(t)
  if (type === 'url' && !/^[a-zA-Z]+:\/\//.test(t)) return `https://${t}`
  return t
}

export function extractDomain(input) {
  const t = normalizeTarget(input)
  try {
    return new URL(t).hostname
  } catch {
    return t.replace(/^[a-zA-Z]+:\/\//, '').split('/')[0]
  }
}

/* =================================================================== */
/*  SCORING                                                             */
/* =================================================================== */

export function computeScore(checks, results) {
  const total = checks.reduce((sum, c) => sum + (STATUS_SCORE[results[c.id]?.status] ?? 0), 0)
  const max = checks.length * 10
  if (max === 0) return 0
  return Math.round((total / max) * 100)
}

export function countByStatus(results) {
  const c = { pass: 0, warn: 0, fail: 0, info: 0 }
  Object.values(results).forEach((r) => {
    if (c[r.status] !== undefined) c[r.status] += 1
  })
  return c
}

export function scoreColor(score) {
  if (score == null) return '#94a3b8'
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

export function scoreLabel(score) {
  if (score == null) return '—'
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Fair'
  return 'At Risk'
}

/* =================================================================== */
/*  SCAN RUNNER (sequential, cancellable)                               */
/* =================================================================== */

/**
 * Run a list of checks one at a time and call onUpdate after each step.
 * Returns a cancel function.
 */
export function runChecksSequential(checks, target, { onProgress, onComplete }) {
  let cancelled = false
  const results = Object.fromEntries(checks.map((c) => [c.id, { status: 'idle' }]))

  ;(async () => {
    for (const check of checks) {
      if (cancelled) return
      results[check.id] = { status: 'running' }
      onProgress?.({ ...results }, check.id)
      await new Promise((r) => setTimeout(r, check.duration ?? 800))
      if (cancelled) return
      try {
        results[check.id] = await check.runner(target)
      } catch (e) {
        results[check.id] = { status: 'fail', value: 'Error', detail: e?.message || 'Check failed' }
      }
      onProgress?.({ ...results }, null)
    }
    onComplete?.({ ...results })
  })()

  return () => { cancelled = true }
}
