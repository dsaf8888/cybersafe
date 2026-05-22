import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import { ScoreRing } from './toolComponents'
import './tools.css'

/* ---------------------------------------------------------------
   Google PageSpeed Insights v5 — real Lighthouse from the browser.
   No auth needed for low-volume usage; CORS is open.
   --------------------------------------------------------------- */
const PSI_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

const CATEGORIES = [
  { id: 'performance',    icon: '⚡', label: 'Performance',    desc: 'How fast pages load & become interactive' },
  { id: 'accessibility',  icon: '♿', label: 'Accessibility',  desc: 'How usable for people with disabilities' },
  { id: 'best-practices', icon: '✅', label: 'Best Practices', desc: 'Modern web standards & security' },
  { id: 'seo',            icon: '🔍', label: 'SEO',            desc: 'How well search engines can read it' },
]

/* Core Web Vitals — most important audit IDs */
const VITAL_AUDITS = [
  { id: 'largest-contentful-paint', short: 'LCP',  full: 'Largest Contentful Paint',  good: 2500,  needs: 4000, unit: 'ms' },
  { id: 'first-contentful-paint',   short: 'FCP',  full: 'First Contentful Paint',    good: 1800,  needs: 3000, unit: 'ms' },
  { id: 'cumulative-layout-shift',  short: 'CLS',  full: 'Cumulative Layout Shift',   good: 0.1,   needs: 0.25, unit: '' },
  { id: 'total-blocking-time',      short: 'TBT',  full: 'Total Blocking Time',       good: 200,   needs: 600,  unit: 'ms' },
  { id: 'speed-index',              short: 'SI',   full: 'Speed Index',               good: 3400,  needs: 5800, unit: 'ms' },
  { id: 'interactive',              short: 'TTI',  full: 'Time to Interactive',       good: 3800,  needs: 7300, unit: 'ms' },
]

function normalizeUrl(raw) {
  if (!raw) return ''
  let v = raw.trim()
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`
  return v
}

function lhScoreColor(score) {
  if (score == null) return '#94a3b8'
  const pct = Math.round(score * 100)
  if (pct >= 90) return '#0cce6b'   // green
  if (pct >= 50) return '#ffa400'   // orange
  return '#ff4e42'                  // red
}

function lhScoreLabel(score) {
  if (score == null) return '—'
  const pct = Math.round(score * 100)
  if (pct >= 90) return 'Good'
  if (pct >= 50) return 'Needs work'
  return 'Poor'
}

function vitalRating(audit) {
  if (!audit) return null
  if (audit.score == null) return null
  if (audit.score >= 0.9) return 'good'
  if (audit.score >= 0.5) return 'avg'
  return 'poor'
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function WebsitePerformance() {
  const [url, setUrl]           = useState('')
  const [strategy, setStrategy] = useState('mobile')
  const [phase, setPhase]       = useState('idle') // idle | loading | done | error
  const [data, setData]         = useState(null)
  const [error, setError]       = useState('')

  async function runTest(e) {
    if (e) e.preventDefault()
    const clean = normalizeUrl(url)
    if (!clean) { setError('Please enter a website URL.'); return }
    try { new URL(clean) } catch { setError('That URL doesn\'t look valid.'); return }

    setError('')
    setPhase('loading')
    setData(null)
    try {
      const params = new URLSearchParams({
        url: clean,
        strategy,
      })
      ;['performance', 'accessibility', 'best-practices', 'seo'].forEach((c) => params.append('category', c))

      const resp = await fetch(`${PSI_ENDPOINT}?${params.toString()}`)
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        throw new Error(`PageSpeed returned ${resp.status}. ${text.slice(0, 200)}`)
      }
      const json = await resp.json()
      if (!json.lighthouseResult) throw new Error('PageSpeed returned no Lighthouse data — the URL may be unreachable.')

      setData({ raw: json, finalUrl: clean })
      setPhase('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Failed to reach PageSpeed Insights. Try again in a minute.')
      setPhase('error')
    }
  }

  /* Parse PSI response into easy-to-render shapes */
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

    /* Opportunities — sorted by overallSavingsMs */
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

    /* CrUX field data, if available */
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
                  className={`lh-strategy-btn ${strategy === 'mobile'  ? 'active' : ''}`}
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

            {error && <div className="target-error">⚠️ {error}</div>}

            <div className="tool-hero-trust">
              <span>🔬 Real Lighthouse v10+</span>
              <span>·</span>
              <span>Google PageSpeed API</span>
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
            <p>This usually takes 15–40 seconds. We&apos;re measuring load times, layout shifts, accessibility, SEO, and more.</p>
          </div>
        </div>
      )}

      {/* ===== RESULTS ===== */}
      {phase === 'done' && parsed && (
        <main className="tool-body">
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

          {/* === FOUR CATEGORY SCORES === */}
          <div className="tool-section-head">
            <h2>Lighthouse scores</h2>
            <p>Click a score for the underlying audits below.</p>
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
                    <div className="tool-section-head">
                      <h2>✅ Best practices</h2>
                    </div>
                    <div className="lh-issue-list">
                      {parsed.bpIssues.map((a) => (
                        <Diag key={a.id} audit={a} sev="warn" compact />
                      ))}
                    </div>
                  </div>
                )}
                {parsed.seoIssues.length > 0 && (
                  <div>
                    <div className="tool-section-head">
                      <h2>🔍 SEO</h2>
                    </div>
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
            <button type="button" className="btn-secondary" onClick={() => { setPhase('idle'); setData(null); setUrl('') }}>
              Test another URL
            </button>
          </div>
        </main>
      )}

      {/* ===== EMPTY STATE (default) ===== */}
      {phase === 'idle' && (
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

function stripMarkdown(s) {
  if (!s) return ''
  return s
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}
