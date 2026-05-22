import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import { ScoreRing } from './toolComponents'
import './tools.css'

/* ---------------------------------------------------------------
   Google PageSpeed Insights v5 — real Lighthouse audits run on
   Google's servers (same engine as the `lighthouse` npm package).
   No backend required.

   Notes on quotas:
     - Without an API key, requests are heavily rate-limited and
       shared across all anonymous traffic. Users will often hit 429.
     - With a free Google Cloud API key, the quota is 25,000/day
       and 400/100s. We persist the key in localStorage so the user
       only enters it once.
   --------------------------------------------------------------- */
const PSI_ENDPOINT  = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const API_KEY_STORE = 'cybersafe.psi.apiKey.v1'
const FETCH_TIMEOUT_MS = 120_000   /* 2 minutes — desktop audits can take 60s+ */
const MAX_RETRIES      = 2

const CATEGORIES = [
  { id: 'performance',    icon: '⚡', label: 'Performance',    desc: 'How fast pages load & become interactive' },
  { id: 'accessibility',  icon: '♿', label: 'Accessibility',  desc: 'How usable for people with disabilities' },
  { id: 'best-practices', icon: '✅', label: 'Best Practices', desc: 'Modern web standards & security' },
  { id: 'seo',            icon: '🔍', label: 'SEO',            desc: 'How well search engines can read it' },
]

const VITAL_AUDITS = [
  { id: 'largest-contentful-paint', short: 'LCP', full: 'Largest Contentful Paint', good: 2500, needs: 4000, unit: 'ms' },
  { id: 'first-contentful-paint',   short: 'FCP', full: 'First Contentful Paint',   good: 1800, needs: 3000, unit: 'ms' },
  { id: 'cumulative-layout-shift',  short: 'CLS', full: 'Cumulative Layout Shift',  good: 0.1,  needs: 0.25, unit: ''   },
  { id: 'total-blocking-time',      short: 'TBT', full: 'Total Blocking Time',      good: 200,  needs: 600,  unit: 'ms' },
  { id: 'speed-index',              short: 'SI',  full: 'Speed Index',              good: 3400, needs: 5800, unit: 'ms' },
  { id: 'interactive',              short: 'TTI', full: 'Time to Interactive',      good: 3800, needs: 7300, unit: 'ms' },
]

function normalizeUrl(raw) {
  if (!raw) return ''
  let v = raw.trim()
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`
  return v
}

function isPublicUrl(u) {
  try {
    const url = new URL(u)
    if (!/^https?:$/.test(url.protocol)) return false
    const host = url.hostname.toLowerCase()
    if (host === 'localhost') return false
    if (host === '127.0.0.1' || host === '::1') return false
    if (/^192\.168\./.test(host)) return false
    if (/^10\./.test(host))       return false
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false
    if (host.endsWith('.local') || host.endsWith('.internal')) return false
    return true
  } catch {
    return false
  }
}

function lhScoreColor(score) {
  if (score == null) return '#94a3b8'
  const pct = Math.round(score * 100)
  if (pct >= 90) return '#0cce6b'
  if (pct >= 50) return '#ffa400'
  return '#ff4e42'
}

function lhScoreLabel(score) {
  if (score == null) return '—'
  const pct = Math.round(score * 100)
  if (pct >= 90) return 'Good'
  if (pct >= 50) return 'Needs work'
  return 'Poor'
}

function vitalRating(audit) {
  if (!audit || audit.score == null) return null
  if (audit.score >= 0.9) return 'good'
  if (audit.score >= 0.5) return 'avg'
  return 'poor'
}

function stripMarkdown(s) {
  if (!s) return ''
  return s
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

/* Friendly error message for a given HTTP / network failure */
function friendlyError(status, bodyText, clean) {
  if (status === 0) {
    return 'Could not reach the PageSpeed Insights service. Check your internet connection.'
  }
  if (status === 429) {
    return 'You\'ve hit the anonymous rate limit (1 request per ~100 seconds, shared across all visitors). Wait a minute and try again — or add your own free Google API key below for 25,000 requests per day.'
  }
  if (status === 403) {
    return 'Google denied the request. If you supplied an API key, it may be invalid, missing PageSpeed API access, or restricted to a different referrer.'
  }
  if (status === 400) {
    const reason = parseGoogleError(bodyText)
    if (reason && /invalid.*url|malformed/i.test(reason)) {
      return `Google says the URL "${clean}" is not valid. Try a different URL.`
    }
    if (reason && /unable to fetch|fetched.*error|page could not/i.test(reason)) {
      return `Google could not load ${clean}. Make sure the site is publicly reachable (no login wall, not localhost, and accessible from the internet).`
    }
    return reason ? `Google rejected the request: ${reason}` : `The request was malformed (${clean}).`
  }
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return 'PageSpeed Insights is having trouble right now. Wait a minute and try again.'
  }
  if (status === 408) {
    return 'The Lighthouse audit timed out. The site may be very slow or unresponsive — try a smaller page or try again.'
  }
  return `PageSpeed returned HTTP ${status}. ${parseGoogleError(bodyText) || ''}`.trim()
}

function parseGoogleError(text) {
  if (!text) return ''
  try {
    const j = JSON.parse(text)
    return j?.error?.message || ''
  } catch {
    return text.slice(0, 200)
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function WebsitePerformance() {
  const [url, setUrl]           = useState('')
  const [strategy, setStrategy] = useState('mobile')
  const [phase, setPhase]       = useState('idle')   // idle | loading | done | error
  const [data, setData]         = useState(null)
  const [error, setError]       = useState('')
  const [elapsed, setElapsed]   = useState(0)
  const [apiKey, setApiKey]     = useState(() => {
    try { return localStorage.getItem(API_KEY_STORE) || '' } catch { return '' }
  })
  const [showKeyInput, setShowKeyInput] = useState(false)
  const abortRef = useRef(null)

  /* Persist API key */
  useEffect(() => {
    try {
      if (apiKey) localStorage.setItem(API_KEY_STORE, apiKey)
      else        localStorage.removeItem(API_KEY_STORE)
    } catch { /* storage blocked — silently ignore */ }
  }, [apiKey])

  /* Tick the elapsed-time counter while loading. We don't reset it
     on phase change inside the effect (lint rule); we reset it at
     the start of runTest() which is the only path into 'loading'. */
  useEffect(() => {
    if (phase !== 'loading') return undefined
    const start = Date.now()
    const id = setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [phase])

  /* Cancel any pending request when the component unmounts */
  useEffect(() => () => abortRef.current?.abort(), [])

  async function runTest(e) {
    if (e) e.preventDefault()
    const clean = normalizeUrl(url)
    if (!clean) { setError('Please enter a website URL.'); setPhase('error'); return }
    try { new URL(clean) } catch { setError('That URL doesn\'t look valid.'); setPhase('error'); return }
    if (!isPublicUrl(clean)) {
      setError('Google\'s servers can only audit public URLs. localhost, private IPs, and .local addresses won\'t work.')
      setPhase('error')
      return
    }

    setError('')
    setPhase('loading')
    setData(null)
    setElapsed(0)

    /* Build URL with query params */
    const params = new URLSearchParams({ url: clean, strategy })
    ;['performance', 'accessibility', 'best-practices', 'seo']
      .forEach((c) => params.append('category', c))
    if (apiKey) params.set('key', apiKey)

    const reqUrl = `${PSI_ENDPOINT}?${params.toString()}`

    /* Fresh AbortController for this request */
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    const timeoutId = setTimeout(() => ctrl.abort('timeout'), FETCH_TIMEOUT_MS)

    /* Retry loop with exponential backoff for 429/5xx */
    let lastErr
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const resp = await fetch(reqUrl, { signal: ctrl.signal })

        if (!resp.ok) {
          const text = await resp.text().catch(() => '')
          /* Retry on 429 + 5xx with exponential backoff */
          if ((resp.status === 429 || resp.status >= 500) && attempt < MAX_RETRIES) {
            const wait = (attempt + 1) * 2000 + Math.random() * 800
            await sleep(wait)
            continue
          }
          clearTimeout(timeoutId)
          setError(friendlyError(resp.status, text, clean))
          setPhase('error')
          return
        }

        const json = await resp.json()
        if (!json.lighthouseResult) {
          clearTimeout(timeoutId)
          setError('PageSpeed returned no Lighthouse data. The URL may have errored out during the audit.')
          setPhase('error')
          return
        }

        clearTimeout(timeoutId)
        setData({ raw: json, finalUrl: clean, ranAt: Date.now() })
        setPhase('done')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      } catch (err) {
        if (ctrl.signal.aborted) {
          clearTimeout(timeoutId)
          const reason = ctrl.signal.reason
          setError(reason === 'timeout'
            ? `The audit took longer than ${Math.round(FETCH_TIMEOUT_MS / 1000)} seconds and was cancelled. Google's servers may be busy — try again.`
            : 'Audit cancelled.')
          setPhase('error')
          return
        }
        lastErr = err
        /* Retry network errors too */
        if (attempt < MAX_RETRIES) {
          await sleep((attempt + 1) * 1500)
          continue
        }
      }
    }

    clearTimeout(timeoutId)
    setError(lastErr?.message
      ? `Network error: ${lastErr.message}`
      : 'Failed to reach PageSpeed Insights after several attempts.')
    setPhase('error')
  }

  function cancelTest() {
    abortRef.current?.abort('cancel')
    setPhase('idle')
    setError('')
  }

  /* Parse PSI response into render-ready shapes */
  const parsed = useMemo(() => {
    if (!data) return null
    const lh = data.raw.lighthouseResult
    const cats = lh.categories
    const audits = lh.audits

    const categoryScores = CATEGORIES.map((c) => ({
      ...c,
      score: cats[c.id]?.score ?? null,
    }))

    const vitals = VITAL_AUDITS.map((v) => {
      const a = audits[v.id]
      return {
        ...v,
        audit: a,
        displayValue: a?.displayValue || '—',
        rating: vitalRating(a),
      }
    })

    const perfRefs = cats.performance?.auditRefs || []
    const opportunities = perfRefs
      .filter((r) => r.group === 'load-opportunities')
      .map((r) => audits[r.id])
      .filter((a) => a && a.score != null && a.score < 0.9)
      .sort((a, b) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))

    const diagnostics = perfRefs
      .filter((r) => r.group === 'diagnostics')
      .map((r) => audits[r.id])
      .filter((a) => a && a.score != null && a.score < 1)
      .slice(0, 8)

    const a11yIssues = (cats.accessibility?.auditRefs || [])
      .map((r) => audits[r.id])
      .filter((a) => a && a.score != null && a.score < 1)
      .slice(0, 8)

    const seoIssues = (cats.seo?.auditRefs || [])
      .map((r) => audits[r.id])
      .filter((a) => a && a.score != null && a.score < 1)
      .slice(0, 6)

    const bpIssues = (cats['best-practices']?.auditRefs || [])
      .map((r) => audits[r.id])
      .filter((a) => a && a.score != null && a.score < 1)
      .slice(0, 6)

    const field = data.raw.loadingExperience
    const fieldVitals = field?.metrics
      ? Object.entries(field.metrics).map(([k, v]) => ({ key: k, ...v }))
      : []

    return {
      categoryScores,
      vitals,
      opportunities,
      diagnostics,
      a11yIssues,
      seoIssues,
      bpIssues,
      finalDisplayUrl: lh.finalDisplayedUrl || lh.requestedUrl || data.finalUrl,
      fetchTime: lh.fetchTime,
      fieldCategory: field?.overall_category,
      fieldVitals,
      lhVersion: lh.lighthouseVersion,
    }
  }, [data])

  /* ===== Download helpers ===== */
  function downloadJsonReport() {
    if (!data) return
    const blob = new Blob([JSON.stringify(data.raw, null, 2)], { type: 'application/json' })
    triggerDownload(blob, `lighthouse-${slugifyUrl(parsed.finalDisplayUrl)}-${strategy}-${Date.now()}.json`)
  }

  function downloadHtmlReport() {
    if (!parsed) return
    const html = buildHtmlReport(parsed, strategy, data.ranAt)
    const blob = new Blob([html], { type: 'text/html' })
    triggerDownload(blob, `lighthouse-${slugifyUrl(parsed.finalDisplayUrl)}-${strategy}-${Date.now()}.html`)
  }

  function openInGoogleUI() {
    if (!parsed) return
    const target = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(parsed.finalDisplayUrl)}&form_factor=${strategy}`
    window.open(target, '_blank', 'noopener,noreferrer')
  }

  return (
    <PageLayout>
      {/* ===== HERO ===== */}
      <header className="tool-hero">
        <div className="tool-hero-bg" aria-hidden>
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="grid-bg" />
        </div>
        <div className="tool-hero-inner tool-hero-inner-single">
          <div className="tool-hero-text">
            <span className="tool-hero-tag">⚡ Website Performance Test · Powered by Lighthouse</span>
            <h1>Real <span className="accent">Lighthouse scores</span> for any site</h1>
            <p>
              We run a full Lighthouse audit on Google&apos;s PageSpeed Insights infrastructure and
              show you the four scores, Core Web Vitals, top opportunities, and exact fixes.
              Downloadable reports included.
            </p>

            <form className="target-bar" onSubmit={runTest}>
              <div className="target-input-wrap">
                <input
                  type="text"
                  placeholder="example.com  or  https://example.com/page"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  disabled={phase === 'loading'}
                />
                {url && phase !== 'loading' && (
                  <button type="button" className="target-input-clear" onClick={() => setUrl('')} aria-label="Clear">✕</button>
                )}
              </div>

              <div className="lh-strategy">
                <button
                  type="button"
                  className={`lh-strategy-btn ${strategy === 'mobile' ? 'active' : ''}`}
                  onClick={() => setStrategy('mobile')}
                  disabled={phase === 'loading'}
                >📱 Mobile</button>
                <button
                  type="button"
                  className={`lh-strategy-btn ${strategy === 'desktop' ? 'active' : ''}`}
                  onClick={() => setStrategy('desktop')}
                  disabled={phase === 'loading'}
                >🖥 Desktop</button>
              </div>

              <button type="submit" className="btn-run" disabled={phase === 'loading' || !url.trim()}>
                {phase === 'loading' ? (
                  <>
                    <span className="lh-spinner" />
                    Auditing…
                  </>
                ) : (
                  <>
                    <span className="btn-run-icon">⚡</span>
                    Run audit
                  </>
                )}
              </button>
            </form>

            {/* API key panel (collapsible) */}
            <div className="lh-keyrow">
              <button
                type="button"
                className="lh-keyrow-toggle"
                onClick={() => setShowKeyInput((s) => !s)}
              >
                🔑 {apiKey ? 'API key set' : 'Add an API key'}
                <span className="lh-keyrow-caret">{showKeyInput ? '▴' : '▾'}</span>
              </button>
              {apiKey && !showKeyInput && (
                <span className="lh-keyrow-status">Higher quota active</span>
              )}
            </div>
            {showKeyInput && (
              <div className="lh-keypanel">
                <label htmlFor="psi-key">Google PageSpeed Insights API key (optional)</label>
                <div className="lh-keypanel-row">
                  <input
                    id="psi-key"
                    type="text"
                    placeholder="AIza…"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value.trim())}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                  />
                  {apiKey && (
                    <button type="button" className="btn-secondary" onClick={() => setApiKey('')}>
                      Clear
                    </button>
                  )}
                </div>
                <p className="lh-keypanel-help">
                  Without a key, Google rate-limits anonymous requests to about <strong>1 every 100 seconds</strong>{' '}
                  shared across all visitors — so you&apos;ll often see HTTP 429 errors.
                  {' '}
                  <a
                    href="https://developers.google.com/speed/docs/insights/v5/get-started#APIKey"
                    target="_blank"
                    rel="noreferrer"
                  >Get a free key →</a>
                  {' '}
                  (takes 60 seconds, 25,000 audits/day)
                </p>
                <p className="lh-keypanel-help">
                  The key is saved in your browser&apos;s localStorage only — never sent anywhere except Google.
                </p>
              </div>
            )}

            {error && (
              <div className="target-error">
                <strong>⚠️ {error}</strong>
                {phase === 'error' && (
                  <div style={{ marginTop: 8 }}>
                    <button type="button" className="btn-secondary" onClick={() => runTest()}>
                      Retry
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="tool-hero-trust">
              <span>🔬 Real Lighthouse v10+</span>
              <span>·</span>
              <span>Google PageSpeed API</span>
              <span>·</span>
              <span>Downloadable reports</span>
              <span>·</span>
              <span>Free</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== LOADING STATE ===== */}
      {phase === 'loading' && (
        <div className="tool-body">
          <div className="lh-loading">
            <div className="lh-loading-bars">
              <span style={{ animationDelay: '0s' }} />
              <span style={{ animationDelay: '0.15s' }} />
              <span style={{ animationDelay: '0.3s' }} />
              <span style={{ animationDelay: '0.45s' }} />
            </div>
            <h3>Running Lighthouse audit…</h3>
            <p>
              Google&apos;s servers are loading the page in a real headless Chrome and measuring
              performance, accessibility, best practices, and SEO. This usually takes 15–60 seconds.
            </p>
            <div className="lh-loading-timer">
              <strong>{elapsed}s</strong> elapsed
              {elapsed > 45 && <span> · still working — large sites take longer</span>}
            </div>
            <button type="button" className="btn-secondary" onClick={cancelTest} style={{ marginTop: 14 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== RESULTS ===== */}
      {phase === 'done' && parsed && (
        <main className="tool-body">
          {/* Meta + download bar */}
          <div className="lh-meta-bar">
            <div>
              <span className="lh-meta-label">Audited URL</span>
              <a href={parsed.finalDisplayUrl} target="_blank" rel="noopener noreferrer" className="lh-meta-url">
                {parsed.finalDisplayUrl}
              </a>
            </div>
            <div className="lh-meta-pills">
              <span className="lh-pill">{strategy === 'mobile' ? '📱 Mobile' : '🖥 Desktop'}</span>
              {parsed.fieldCategory && (
                <span className={`lh-pill lh-pill-${parsed.fieldCategory.toLowerCase()}`}>
                  CrUX: {parsed.fieldCategory}
                </span>
              )}
              <span className="lh-pill">Lighthouse {parsed.lhVersion}</span>
            </div>
          </div>

          {/* Report download actions */}
          <div className="lh-report-actions">
            <button type="button" className="btn-submit" onClick={downloadHtmlReport}>
              📄 Download HTML report
            </button>
            <button type="button" className="btn-secondary" onClick={downloadJsonReport}>
              📦 Download JSON
            </button>
            <button type="button" className="btn-secondary" onClick={openInGoogleUI}>
              🔗 Open in Google&apos;s viewer ↗
            </button>
          </div>

          {/* === FOUR CATEGORY SCORES === */}
          <div className="tool-section-head">
            <h2>Lighthouse scores</h2>
            <p>The four categories Google measures, each scored 0–100.</p>
          </div>
          <div className="lh-score-grid">
            {parsed.categoryScores.map((c) => {
              const pct   = c.score == null ? null : Math.round(c.score * 100)
              const color = lhScoreColor(c.score)
              return (
                <div key={c.id} className="lh-score-card">
                  <ScoreRing value={pct} color={color} size={108} />
                  <div className="lh-score-meta">
                    <span className="lh-score-icon" aria-hidden>{c.icon}</span>
                    <strong>{c.label}</strong>
                    <span className="lh-score-rating" style={{ color }}>{lhScoreLabel(c.score)}</span>
                    <span className="lh-score-desc">{c.desc}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* === CORE WEB VITALS === */}
          <div className="tool-section-head" style={{ marginTop: 48 }}>
            <h2>Core Web Vitals & metrics</h2>
            <p>The raw numbers behind your performance score.</p>
          </div>
          <div className="lh-vitals-grid">
            {parsed.vitals.map((v) => (
              <div key={v.id} className={`lh-vital lh-vital-${v.rating || 'unknown'}`}>
                <div className="lh-vital-head">
                  <strong>{v.short}</strong>
                  <span className="lh-vital-full">{v.full}</span>
                </div>
                <div className="lh-vital-value">{v.displayValue}</div>
                <div className="lh-vital-bar">
                  <div className="lh-vital-bar-fill" style={{
                    width: `${v.audit?.score != null ? Math.round(v.audit.score * 100) : 0}%`,
                    background: lhScoreColor(v.audit?.score),
                  }} />
                </div>
                <div className="lh-vital-thresh">
                  Good ≤ {v.good}{v.unit} · Needs work ≤ {v.needs}{v.unit}
                </div>
              </div>
            ))}
          </div>

          {/* === OPPORTUNITIES === */}
          {parsed.opportunities.length > 0 && (
            <section className="rec-section" style={{ marginTop: 48 }}>
              <div className="tool-section-head">
                <h2>Top opportunities</h2>
                <p>Each one estimates how many milliseconds you&apos;d save by fixing it.</p>
              </div>
              <div className="lh-opp-list">
                {parsed.opportunities.map((a) => {
                  const ms = a.details?.overallSavingsMs || 0
                  const kb = a.details?.overallSavingsBytes ? Math.round(a.details.overallSavingsBytes / 1024) : null
                  return (
                    <div key={a.id} className="lh-opp">
                      <div className="lh-opp-savings">
                        <strong>{ms > 0 ? `${(ms / 1000).toFixed(2)}s` : '—'}</strong>
                        <span>potential savings</span>
                        {kb !== null && kb > 0 && <em>{kb} KB</em>}
                      </div>
                      <div className="lh-opp-body">
                        <h4>{a.title}</h4>
                        <p>{stripMarkdown(a.description)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* === DIAGNOSTICS === */}
          {parsed.diagnostics.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <div className="tool-section-head">
                <h2>Performance diagnostics</h2>
                <p>Additional information about your app&apos;s runtime — not directly scored.</p>
              </div>
              <div className="lh-issue-list">
                {parsed.diagnostics.map((a) => (
                  <Diag key={a.id} audit={a} />
                ))}
              </div>
            </section>
          )}

          {/* === ACCESSIBILITY === */}
          {parsed.a11yIssues.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <div className="tool-section-head">
                <h2>♿ Accessibility issues</h2>
                <p>Things that block screen readers and assistive tech.</p>
              </div>
              <div className="lh-issue-list">
                {parsed.a11yIssues.map((a) => (
                  <Diag key={a.id} audit={a} sev="warn" />
                ))}
              </div>
            </section>
          )}

          {/* === BEST PRACTICES + SEO === */}
          {(parsed.bpIssues.length > 0 || parsed.seoIssues.length > 0) && (
            <section style={{ marginTop: 40 }}>
              <div className="lh-two-col">
                {parsed.bpIssues.length > 0 && (
                  <div>
                    <div className="tool-section-head"><h2>✅ Best practices</h2></div>
                    <div className="lh-issue-list">
                      {parsed.bpIssues.map((a) => (
                        <Diag key={a.id} audit={a} sev="warn" compact />
                      ))}
                    </div>
                  </div>
                )}
                {parsed.seoIssues.length > 0 && (
                  <div>
                    <div className="tool-section-head"><h2>🔍 SEO</h2></div>
                    <div className="lh-issue-list">
                      {parsed.seoIssues.map((a) => (
                        <Diag key={a.id} audit={a} sev="warn" compact />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="pw-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
            <button type="button" className="btn-run" onClick={() => runTest()}>
              <span className="btn-run-icon">↻</span>
              Re-run audit
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setPhase('idle'); setData(null); setUrl('') }}
            >
              Test another URL
            </button>
          </div>
        </main>
      )}

      {/* ===== EMPTY / EXPLAIN STATE ===== */}
      {(phase === 'idle' || phase === 'error') && !parsed && (
        <main className="tool-body">
          <div className="tool-section-head">
            <h2>What the audit measures</h2>
            <p>The same scores Google itself uses to evaluate your site.</p>
          </div>
          <div className="lh-explain-grid">
            {CATEGORIES.map((c) => (
              <div key={c.id} className="lh-explain-card">
                <div className="lh-explain-icon">{c.icon}</div>
                <h4>{c.label}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="tool-section-head" style={{ marginTop: 32 }}>
            <h2>Core Web Vitals explained</h2>
            <p>The three metrics Google uses for actual search ranking.</p>
          </div>
          <div className="pw-tips-grid">
            <div className="pw-tip-card"><div className="pw-tip-icon">🎨</div><h4>LCP — Largest Contentful Paint</h4><p>How long until the biggest element above the fold is visible. Good ≤ 2.5s.</p></div>
            <div className="pw-tip-card"><div className="pw-tip-icon">📐</div><h4>CLS — Cumulative Layout Shift</h4><p>How much the page jumps around as it loads. Good ≤ 0.1.</p></div>
            <div className="pw-tip-card"><div className="pw-tip-icon">⌨️</div><h4>INP / TBT — Interactivity</h4><p>How responsive the page feels when you tap or type. TBT good ≤ 200ms.</p></div>
          </div>
        </main>
      )}

      <section className="tool-cta-row" style={{ marginTop: 40 }}>
        <div>
          <h3>While you&apos;re here…</h3>
          <p>Run the URL Safety Scanner and Network Security Test on the same site.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/tools/url-scanner" className="btn-submit">URL safety →</Link>
          <Link to="/tools/network-security" className="btn-secondary">Network test</Link>
        </div>
      </section>
    </PageLayout>
  )
}

/* =============================================================== */
/*  Small subcomponents                                             */
/* =============================================================== */

function Diag({ audit, sev = 'info', compact }) {
  return (
    <div className={`lh-issue lh-issue-${sev} ${compact ? 'compact' : ''}`}>
      <div className="lh-issue-head">
        <h4>{audit.title}</h4>
        {audit.displayValue && <span className="lh-issue-value">{audit.displayValue}</span>}
      </div>
      {!compact && audit.description && (
        <p>{stripMarkdown(audit.description)}</p>
      )}
    </div>
  )
}

/* =============================================================== */
/*  Report helpers                                                  */
/* =============================================================== */

function triggerDownload(blob, filename) {
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function slugifyUrl(u) {
  try {
    const { hostname, pathname } = new URL(u)
    const path = pathname.replace(/\/+$/, '').replace(/[^a-z0-9]+/gi, '-')
    return (hostname + path).slice(0, 60).replace(/-+$/, '')
  } catch { return 'report' }
}

function escapeHtml(s) {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Generate a self-contained, printable HTML report from the parsed
 * Lighthouse data. No external assets — everything is inline so the
 * file works offline and can be shared as a single file.
 */
function buildHtmlReport(p, strategy, ranAt) {
  const ts = new Date(ranAt || Date.now()).toLocaleString()
  const scoreCards = p.categoryScores.map((c) => {
    const pct = c.score == null ? '—' : Math.round(c.score * 100)
    const color = lhScoreColor(c.score)
    return `
      <div class="rep-card">
        <div class="rep-ring" style="--c:${color}">
          <span>${pct}</span>
        </div>
        <h3>${escapeHtml(c.icon)} ${escapeHtml(c.label)}</h3>
        <small>${escapeHtml(c.desc)}</small>
      </div>`
  }).join('')

  const vitals = p.vitals.map((v) => `
    <tr class="rep-rating-${v.rating || 'unknown'}">
      <th>${escapeHtml(v.short)} <small>${escapeHtml(v.full)}</small></th>
      <td>${escapeHtml(v.displayValue)}</td>
      <td><small>Good ≤ ${v.good}${v.unit} · Needs work ≤ ${v.needs}${v.unit}</small></td>
    </tr>`).join('')

  const opps = p.opportunities.length === 0
    ? '<p class="rep-empty">No major opportunities — great work!</p>'
    : `<ul class="rep-opps">${p.opportunities.map((a) => {
        const ms = a.details?.overallSavingsMs || 0
        return `
          <li>
            <div class="rep-opp-save">
              <strong>${ms > 0 ? (ms / 1000).toFixed(2) + 's' : '—'}</strong>
              <small>potential savings</small>
            </div>
            <div>
              <h4>${escapeHtml(a.title)}</h4>
              <p>${escapeHtml(stripMarkdown(a.description))}</p>
            </div>
          </li>`
      }).join('')}</ul>`

  const issueList = (arr) => arr.length === 0
    ? '<p class="rep-empty">No issues found.</p>'
    : `<ul class="rep-issues">${arr.map((a) => `
        <li>
          <h4>${escapeHtml(a.title)}${a.displayValue ? ` — <em>${escapeHtml(a.displayValue)}</em>` : ''}</h4>
          ${a.description ? `<p>${escapeHtml(stripMarkdown(a.description))}</p>` : ''}
        </li>`).join('')}</ul>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lighthouse Report — ${escapeHtml(p.finalDisplayUrl)}</title>
<style>
  *,*::before,*::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color: #1f2937; background: #f9fafb; line-height: 1.55; }
  .wrap { max-width: 980px; margin: 0 auto; padding: 32px 24px 64px; }
  header.rep-head { background: linear-gradient(135deg, #1a6dff 0%, #5b8def 100%); color: #fff; padding: 36px 32px; border-radius: 16px; margin-bottom: 28px; box-shadow: 0 12px 32px -16px rgba(26,109,255,0.55); }
  header.rep-head h1 { margin: 0 0 8px; font-size: 1.85rem; font-weight: 800; }
  header.rep-head .rep-url { display: block; font-size: 1rem; word-break: break-all; opacity: 0.95; margin-bottom: 14px; }
  header.rep-head .rep-meta { display: flex; gap: 12px; font-size: 0.85rem; opacity: 0.9; flex-wrap: wrap; }
  header.rep-head .rep-meta span { background: rgba(255,255,255,0.18); padding: 4px 11px; border-radius: 999px; }
  h2.rep-section { font-size: 1.2rem; margin: 36px 0 14px; color: #0f172a; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
  .rep-scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
  .rep-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 16px; text-align: center; }
  .rep-card h3 { margin: 12px 0 4px; font-size: 0.95rem; font-weight: 700; }
  .rep-card small { color: #64748b; font-size: 0.78rem; display: block; line-height: 1.4; }
  .rep-ring { --c: #94a3b8; width: 96px; height: 96px; border-radius: 50%; background: conic-gradient(var(--c) 0deg, var(--c) 360deg); display: grid; place-items: center; margin: 0 auto; position: relative; }
  .rep-ring::before { content: ''; position: absolute; inset: 9px; background: #fff; border-radius: 50%; }
  .rep-ring span { position: relative; font-weight: 800; font-size: 1.55rem; color: var(--c); }
  table.rep-vitals { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
  table.rep-vitals th, table.rep-vitals td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 0.92rem; }
  table.rep-vitals th { background: #f8fafc; font-weight: 600; min-width: 160px; }
  table.rep-vitals th small { display: block; font-weight: 400; font-size: 0.78rem; color: #64748b; margin-top: 2px; }
  table.rep-vitals td small { color: #64748b; font-size: 0.78rem; }
  table.rep-vitals tr.rep-rating-good td { color: #059669; font-weight: 600; }
  table.rep-vitals tr.rep-rating-avg td  { color: #d97706; font-weight: 600; }
  table.rep-vitals tr.rep-rating-poor td { color: #dc2626; font-weight: 600; }
  ul.rep-opps, ul.rep-issues { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
  ul.rep-opps li { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; display: flex; gap: 18px; align-items: flex-start; }
  ul.rep-opps .rep-opp-save { min-width: 110px; padding: 10px 14px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; text-align: center; }
  ul.rep-opps .rep-opp-save strong { display: block; font-size: 1.2rem; color: #c2410c; }
  ul.rep-opps .rep-opp-save small { font-size: 0.7rem; color: #9a3412; text-transform: uppercase; }
  ul.rep-opps h4, ul.rep-issues h4 { margin: 0 0 6px; font-size: 0.96rem; color: #0f172a; }
  ul.rep-issues li { background: #fff; border-left: 4px solid #f59e0b; border: 1px solid #e5e7eb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 12px 14px; }
  ul.rep-issues h4 em { color: #b45309; font-style: normal; font-weight: 700; font-size: 0.85rem; }
  ul.rep-issues p, ul.rep-opps p { margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.55; }
  .rep-empty { color: #16a34a; font-weight: 600; margin: 0; padding: 14px; background: #f0fdf4; border-radius: 8px; }
  footer.rep-foot { margin-top: 48px; text-align: center; font-size: 0.78rem; color: #94a3b8; }
  @media print {
    body { background: #fff; }
    header.rep-head { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <header class="rep-head">
      <h1>⚡ Lighthouse Report</h1>
      <span class="rep-url">${escapeHtml(p.finalDisplayUrl)}</span>
      <div class="rep-meta">
        <span>${strategy === 'mobile' ? '📱 Mobile' : '🖥 Desktop'}</span>
        <span>Lighthouse ${escapeHtml(p.lhVersion)}</span>
        <span>${escapeHtml(ts)}</span>
        ${p.fieldCategory ? `<span>CrUX: ${escapeHtml(p.fieldCategory)}</span>` : ''}
      </div>
    </header>

    <h2 class="rep-section">Category Scores</h2>
    <div class="rep-scores">${scoreCards}</div>

    <h2 class="rep-section">Core Web Vitals</h2>
    <table class="rep-vitals"><tbody>${vitals}</tbody></table>

    <h2 class="rep-section">Top Opportunities</h2>
    ${opps}

    <h2 class="rep-section">Accessibility Issues</h2>
    ${issueList(p.a11yIssues)}

    <h2 class="rep-section">Best Practices</h2>
    ${issueList(p.bpIssues)}

    <h2 class="rep-section">SEO Issues</h2>
    ${issueList(p.seoIssues)}

    <footer class="rep-foot">
      Generated by CyberSafe · Powered by Google Lighthouse v${escapeHtml(p.lhVersion)}<br>
      Audit run at ${escapeHtml(ts)}
    </footer>
  </div>
</body>
</html>`
}
