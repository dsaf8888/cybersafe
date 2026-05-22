import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import { ScoreRing } from './toolComponents'
import { runBrowserAudit } from './clientAudit'
import './tools.css'

/* ---------------------------------------------------------------
   Website Performance — 100% client-side audit. No API keys, no
   rate limits, no backend. Fetches the target site through a public
   CORS proxy and inspects the HTML + response headers to score four
   Lighthouse-style categories.

   For the "real" Lighthouse audit (with Core Web Vitals from a Chrome
   render), users can click "Open in Google's PageSpeed Insights ↗"
   which opens pagespeed.web.dev for the same URL.
   --------------------------------------------------------------- */

const CATEGORIES = [
  { id: 'performance',    icon: '⚡', label: 'Performance',    desc: 'Page weight, resource counts, render-blocking assets' },
  { id: 'accessibility',  icon: '♿', label: 'Accessibility',  desc: 'Alt text, labels, landmarks, language, headings' },
  { id: 'best-practices', icon: '✅', label: 'Best Practices', desc: 'HTTPS, security headers, doctype, charset' },
  { id: 'seo',            icon: '🔍', label: 'SEO',            desc: 'Title, description, viewport, OG, language' },
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
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false
    if (/^192\.168\./.test(host) || /^10\./.test(host)) return false
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false
    if (host.endsWith('.local') || host.endsWith('.internal')) return false
    return true
  } catch { return false }
}

function scoreColor(score) {
  if (score == null) return '#94a3b8'
  const pct = Math.round(score * 100)
  if (pct >= 90) return '#0cce6b'
  if (pct >= 50) return '#ffa400'
  return '#ff4e42'
}

function scoreLabel(score) {
  if (score == null) return '—'
  const pct = Math.round(score * 100)
  if (pct >= 90) return 'Good'
  if (pct >= 50) return 'Needs work'
  return 'Poor'
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function WebsitePerformance() {
  const [url, setUrl]         = useState('')
  const [phase, setPhase]     = useState('idle')   // idle | loading | done | error
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')
  const [progress, setProgress] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const abortRef = useRef({ cancelled: false })

  useEffect(() => () => { abortRef.current.cancelled = true }, [])

  useEffect(() => {
    if (phase !== 'loading') return undefined
    const start = Date.now()
    const id = setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [phase])

  async function runTest(e) {
    if (e) e.preventDefault()
    const clean = normalizeUrl(url)
    if (!clean) { setError('Please enter a website URL.'); setPhase('error'); return }
    try { new URL(clean) } catch { setError('That URL doesn\'t look valid.'); setPhase('error'); return }
    if (!isPublicUrl(clean)) {
      setError('Only public URLs can be audited (no localhost, private IPs, or .local addresses).')
      setPhase('error')
      return
    }

    setError('')
    setResult(null)
    setProgress('')
    setElapsed(0)
    setPhase('loading')

    abortRef.current = { cancelled: false }
    const myRun = abortRef.current

    try {
      const audit = await runBrowserAudit(clean, {
        onProgress: (msg) => { if (!myRun.cancelled) setProgress(msg) },
      })
      if (myRun.cancelled) return
      setResult(audit)
      setPhase('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      if (myRun.cancelled) return
      setError(err.message || 'Audit failed.')
      setPhase('error')
    }
  }

  function cancelTest() {
    abortRef.current.cancelled = true
    setPhase('idle')
    setError('')
  }

  /* Massage audit categories into display shape with passing/failing splits */
  const view = useMemo(() => {
    if (!result) return null
    const categories = CATEGORIES.map((c) => {
      const cat = result.categories.find((r) => r.id === c.id)
      const audits = cat?.audits || []
      const failing = audits.filter((a) => a.pass === false)
      const passing = audits.filter((a) => a.pass === true)
      const na      = audits.filter((a) => a.pass == null)
      return { ...c, score: cat?.score ?? null, failing, passing, na }
    })
    return { ...result, categories }
  }, [result])

  /* ===== Download helpers ===== */
  function downloadHtmlReport() {
    if (!view) return
    const html = buildHtmlReport(view)
    triggerDownload(new Blob([html], { type: 'text/html' }),
      `audit-${slugifyUrl(view.finalDisplayUrl)}-${Date.now()}.html`)
  }
  function downloadJsonReport() {
    if (!view) return
    triggerDownload(new Blob([JSON.stringify(view, null, 2)], { type: 'application/json' }),
      `audit-${slugifyUrl(view.finalDisplayUrl)}-${Date.now()}.json`)
  }
  function openLighthouseInGoogle() {
    if (!view) return
    const target = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(view.finalDisplayUrl)}`
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
            <span className="tool-hero-tag">⚡ Website Performance Audit · Free · No signup</span>
            <h1>Audit any website&apos;s <span className="accent">performance, SEO, accessibility</span></h1>
            <p>
              Runs entirely in your browser — no API keys, no rate limits, no waiting. We fetch the page
              through a public CORS proxy and analyse its HTML, response headers, and resource graph
              to score it across four Lighthouse-style categories. Downloadable reports included.
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

            {error && (
              <div className="target-error">
                <strong>⚠️ {error}</strong>
                {phase === 'error' && (
                  <div style={{ marginTop: 8 }}>
                    <button type="button" className="btn-secondary" onClick={() => runTest()}>Retry</button>
                  </div>
                )}
              </div>
            )}

            <div className="tool-hero-trust">
              <span>🆓 No API key</span>
              <span>·</span>
              <span>🔒 Runs in your browser</span>
              <span>·</span>
              <span>📄 Downloadable reports</span>
              <span>·</span>
              <span>⚡ No rate limits</span>
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
            <h3>Auditing the site…</h3>
            <p>{progress || 'Starting up…'}</p>
            <div className="lh-loading-timer">
              <strong>{elapsed}s</strong> elapsed
            </div>
            <button type="button" className="btn-secondary" onClick={cancelTest} style={{ marginTop: 14 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== RESULTS ===== */}
      {phase === 'done' && view && (
        <main className="tool-body">
          {/* Meta bar */}
          <div className="lh-meta-bar">
            <div>
              <span className="lh-meta-label">Audited URL</span>
              <a href={view.finalDisplayUrl} target="_blank" rel="noopener noreferrer" className="lh-meta-url">
                {view.finalDisplayUrl}
              </a>
            </div>
            <div className="lh-meta-pills">
              <span className="lh-pill">via {view.proxyUsed}</span>
              <span className="lh-pill">TTFB {view.timings.ttfbMs}ms</span>
              <span className="lh-pill">≈ {(view.weightSummary.estTotalBytes / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>

          <div className="lh-report-actions">
            <button type="button" className="btn-submit" onClick={downloadHtmlReport}>
              📄 Download HTML report
            </button>
            <button type="button" className="btn-secondary" onClick={downloadJsonReport}>
              📦 Download JSON
            </button>
            <button type="button" className="btn-secondary" onClick={openLighthouseInGoogle}>
              🔬 Open in Google PageSpeed Insights ↗
            </button>
          </div>

          {/* === FOUR CATEGORY SCORES === */}
          <div className="tool-section-head">
            <h2>Audit scores</h2>
            <p>Four Lighthouse-style categories scored from your browser. Click a category below for details.</p>
          </div>
          <div className="lh-score-grid">
            {view.categories.map((c) => {
              const pct   = c.score == null ? null : Math.round(c.score * 100)
              const color = scoreColor(c.score)
              return (
                <a
                  key={c.id}
                  href={`#cat-${c.id}`}
                  className="lh-score-card"
                  style={{ '--score-color': color }}
                >
                  <ScoreRing value={pct} color={color} size={108} />
                  <div className="lh-score-meta">
                    <span className="lh-score-icon" aria-hidden>{c.icon}</span>
                    <strong>{c.label}</strong>
                    <span className="lh-score-rating" style={{ color }}>{scoreLabel(c.score)}</span>
                    <span className="lh-score-desc">{c.desc}</span>
                  </div>
                </a>
              )
            })}
          </div>

          {/* === PAGE WEIGHT SNAPSHOT === */}
          <div className="tool-section-head" style={{ marginTop: 48 }}>
            <h2>Page weight snapshot</h2>
            <p>Quick at-a-glance metrics about what makes up this page.</p>
          </div>
          <div className="lh-vitals-grid">
            <WeightCard label="HTML"          value={`${(view.weightSummary.htmlBytes / 1024).toFixed(1)} KB`}      hint="Initial document" />
            <WeightCard label="Stylesheets"   value={`${view.weightSummary.cssCount}`}                              hint={`≈ ${(view.weightSummary.estCssBytes / 1024).toFixed(0)} KB total`} />
            <WeightCard label="Scripts"       value={`${view.weightSummary.jsCount}`}                               hint={`≈ ${(view.weightSummary.estJsBytes / 1024).toFixed(0)} KB total`} />
            <WeightCard label="Images"        value={`${view.weightSummary.imgCount}`}                              hint="On the page" />
            <WeightCard label="Iframes"       value={`${view.weightSummary.iframeCount}`}                           hint="Embedded frames" />
            <WeightCard label="Est. total"    value={`${(view.weightSummary.estTotalBytes / 1024 / 1024).toFixed(2)} MB`} hint={`Sampled ${view.weightSummary.sampledCount} resources`} />
          </div>

          {/* === PER-CATEGORY AUDIT DETAIL === */}
          {view.categories.map((c) => (
            <section key={c.id} id={`cat-${c.id}`} style={{ marginTop: 48 }}>
              <div className="tool-section-head">
                <h2>{c.icon} {c.label}</h2>
                <p>
                  Score: <strong style={{ color: scoreColor(c.score) }}>
                    {c.score == null ? '—' : Math.round(c.score * 100)}/100
                  </strong>
                  {' · '}
                  {c.failing.length} failing · {c.passing.length} passing
                </p>
              </div>

              {c.failing.length > 0 && (
                <div className="lh-issue-list" style={{ marginBottom: 18 }}>
                  {c.failing.map((a) => (
                    <AuditCard key={a.id} audit={a} sev="warn" />
                  ))}
                </div>
              )}
              {c.passing.length > 0 && (
                <details className="lh-passing-toggle">
                  <summary>Show {c.passing.length} passing checks</summary>
                  <div className="lh-issue-list" style={{ marginTop: 12 }}>
                    {c.passing.map((a) => (
                      <AuditCard key={a.id} audit={a} sev="ok" />
                    ))}
                  </div>
                </details>
              )}
            </section>
          ))}

          <div className="pw-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
            <button type="button" className="btn-run" onClick={() => runTest()}>
              <span className="btn-run-icon">↻</span> Re-run audit
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setPhase('idle'); setResult(null); setUrl('') }}
            >
              Test another URL
            </button>
          </div>
        </main>
      )}

      {/* ===== EMPTY / EXPLAIN STATE ===== */}
      {(phase === 'idle' || phase === 'error') && !view && (
        <main className="tool-body">
          <div className="tool-section-head">
            <h2>What the audit measures</h2>
            <p>Four categories — same as Google Lighthouse, all measured client-side from the HTML + response headers.</p>
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
            <h2>Why a browser audit?</h2>
            <p>Trade-offs between this tool and Google&apos;s PageSpeed Insights.</p>
          </div>
          <div className="pw-tips-grid">
            <div className="pw-tip-card">
              <div className="pw-tip-icon">⚡</div>
              <h4>Runs instantly</h4>
              <p>No rate limits, no API keys, no waiting in queue. The audit kicks off the moment you click run.</p>
            </div>
            <div className="pw-tip-card">
              <div className="pw-tip-icon">🆓</div>
              <h4>Always free</h4>
              <p>Everything runs in your tab. Your URL goes through a public CORS proxy only — never our servers.</p>
            </div>
            <div className="pw-tip-card">
              <div className="pw-tip-icon">⚠️</div>
              <h4>No Core Web Vitals</h4>
              <p>Measuring LCP, CLS, FCP requires actually rendering the page in a real Chrome — only possible on Google&apos;s servers. Click &quot;Open in Google PageSpeed Insights&quot; after the audit for those numbers.</p>
            </div>
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
/*  Subcomponents                                                   */
/* =============================================================== */

function AuditCard({ audit, sev }) {
  return (
    <div className={`lh-issue lh-issue-${sev}`}>
      <div className="lh-issue-head">
        <h4>
          {sev === 'ok' ? '✓ ' : '⚠ '}
          {audit.title}
        </h4>
        {audit.value && <span className="lh-issue-value">{audit.value}</span>}
      </div>
      {audit.description && <p>{audit.description}</p>}
    </div>
  )
}

function WeightCard({ label, value, hint }) {
  return (
    <div className="lh-vital lh-vital-unknown">
      <div className="lh-vital-head">
        <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </strong>
      </div>
      <div className="lh-vital-value">{value}</div>
      <div className="lh-vital-thresh">{hint}</div>
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

function buildHtmlReport(p) {
  const ts = new Date(p.ranAt || Date.now()).toLocaleString()

  const scoreCards = p.categories.map((c) => {
    const pct   = c.score == null ? '—' : Math.round(c.score * 100)
    const color = scoreColor(c.score)
    return `
      <div class="rep-card">
        <div class="rep-ring" style="--c:${color}"><span>${pct}</span></div>
        <h3>${escapeHtml(c.icon)} ${escapeHtml(c.label)}</h3>
        <small>${escapeHtml(c.desc)}</small>
      </div>`
  }).join('')

  const sections = p.categories.map((c) => {
    const renderAudits = (arr, badge) => arr.length === 0
      ? ''
      : `<ul class="rep-audits">${arr.map((a) => `
          <li class="rep-audit rep-audit-${badge}">
            <h4>${badge === 'ok' ? '✓' : '⚠'} ${escapeHtml(a.title)}${a.value ? ` <em>— ${escapeHtml(a.value)}</em>` : ''}</h4>
            ${a.description ? `<p>${escapeHtml(a.description)}</p>` : ''}
          </li>`).join('')}</ul>`

    return `
      <h2 class="rep-section">${escapeHtml(c.icon)} ${escapeHtml(c.label)} — ${c.score == null ? '—' : Math.round(c.score * 100)}/100</h2>
      ${c.failing.length > 0 ? `<h3 class="rep-subhead">Failing (${c.failing.length})</h3>${renderAudits(c.failing, 'fail')}` : ''}
      ${c.passing.length > 0 ? `<h3 class="rep-subhead">Passing (${c.passing.length})</h3>${renderAudits(c.passing, 'ok')}` : ''}
    `
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Website Audit — ${escapeHtml(p.finalDisplayUrl)}</title>
<style>
  *,*::before,*::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color: #1f2937; background: #f9fafb; line-height: 1.55; }
  .wrap { max-width: 980px; margin: 0 auto; padding: 32px 24px 64px; }
  header.rep-head { background: linear-gradient(135deg, #1a6dff 0%, #5b8def 100%); color: #fff; padding: 36px 32px; border-radius: 16px; margin-bottom: 28px; box-shadow: 0 12px 32px -16px rgba(26,109,255,0.55); }
  header.rep-head h1 { margin: 0 0 8px; font-size: 1.85rem; font-weight: 800; }
  header.rep-head .rep-url { display: block; font-size: 1rem; word-break: break-all; opacity: 0.95; margin-bottom: 14px; }
  header.rep-head .rep-meta { display: flex; gap: 12px; font-size: 0.85rem; opacity: 0.9; flex-wrap: wrap; }
  header.rep-head .rep-meta span { background: rgba(255,255,255,0.18); padding: 4px 11px; border-radius: 999px; }
  h2.rep-section { font-size: 1.3rem; margin: 36px 0 6px; color: #0f172a; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
  h3.rep-subhead { font-size: 0.95rem; margin: 18px 0 8px; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
  .rep-scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
  .rep-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 16px; text-align: center; }
  .rep-card h3 { margin: 12px 0 4px; font-size: 0.95rem; font-weight: 700; }
  .rep-card small { color: #64748b; font-size: 0.78rem; display: block; line-height: 1.4; }
  .rep-ring { --c: #94a3b8; width: 96px; height: 96px; border-radius: 50%; background: conic-gradient(var(--c) 0deg, var(--c) 360deg); display: grid; place-items: center; margin: 0 auto; position: relative; }
  .rep-ring::before { content: ''; position: absolute; inset: 9px; background: #fff; border-radius: 50%; }
  .rep-ring span { position: relative; font-weight: 800; font-size: 1.55rem; color: var(--c); }
  ul.rep-audits { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
  li.rep-audit { background: #fff; border-radius: 8px; padding: 12px 14px; border-left: 4px solid #e5e7eb; }
  li.rep-audit-fail { border-left-color: #f59e0b; }
  li.rep-audit-ok   { border-left-color: #16a34a; opacity: 0.8; }
  li.rep-audit h4 { margin: 0; font-size: 0.92rem; color: #0f172a; }
  li.rep-audit h4 em { color: #475569; font-style: normal; font-weight: 500; font-size: 0.85rem; }
  li.rep-audit p { margin: 4px 0 0; font-size: 0.84rem; color: #475569; }
  footer.rep-foot { margin-top: 48px; text-align: center; font-size: 0.78rem; color: #94a3b8; }
  @media print { body { background: #fff; } header.rep-head { box-shadow: none; } }
</style>
</head>
<body>
  <div class="wrap">
    <header class="rep-head">
      <h1>⚡ Website Audit</h1>
      <span class="rep-url">${escapeHtml(p.finalDisplayUrl)}</span>
      <div class="rep-meta">
        <span>${escapeHtml(ts)}</span>
        <span>via ${escapeHtml(p.proxyUsed)}</span>
        <span>TTFB ${p.timings.ttfbMs}ms</span>
        <span>≈ ${(p.weightSummary.estTotalBytes / 1024 / 1024).toFixed(2)} MB</span>
      </div>
    </header>

    <h2 class="rep-section">Category Scores</h2>
    <div class="rep-scores">${scoreCards}</div>

    ${sections}

    <footer class="rep-foot">
      Generated by CyberSafe · Client-side audit · For Core Web Vitals, run a Lighthouse audit in Chrome DevTools.<br>
      Generated at ${escapeHtml(ts)}
    </footer>
  </div>
</body>
</html>`
}
