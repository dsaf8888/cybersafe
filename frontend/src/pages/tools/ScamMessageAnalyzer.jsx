import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageLayout from '../../components/layout/PageLayout'
import { ScoreRing } from './toolComponents'
import { scoreColor } from './toolHelpers'
import { selectScamAnalyzer } from '../../store/contentSlice'
import {
  SCAM_PATTERNS_DEFAULT,
  SCAM_EXAMPLES_DEFAULT,
  hydrateScamPatterns,
} from '../../data/toolContent'
import './tools.css'

/* ---------------------------------------------------------------
   Pattern matching — receives `patterns` so the function works with
   any override coming from the contentSlice.
   --------------------------------------------------------------- */
function annotate(text, patterns) {
  if (!text) return { hits: [], byCategory: {}, segments: [] }

  const matches = []
  patterns.forEach((p) => {
    p.regex.lastIndex = 0
    let m
    while ((m = p.regex.exec(text)) !== null) {
      if (m[0] === '') break
      matches.push({ start: m.index, end: m.index + m[0].length, pattern: p, text: m[0] })
      if (m.index === p.regex.lastIndex) p.regex.lastIndex++
    }
  })

  const hitsByPattern = new Map()
  matches.forEach((m) => {
    const entry = hitsByPattern.get(m.pattern.id) || { pattern: m.pattern, count: 0, samples: [] }
    entry.count += 1
    if (entry.samples.length < 4) entry.samples.push(m.text)
    hitsByPattern.set(m.pattern.id, entry)
  })

  matches.sort((a, b) => a.start - b.start || b.end - a.end)
  const merged = []
  matches.forEach((m) => {
    const last = merged[merged.length - 1]
    if (last && m.start < last.end) {
      last.end = Math.max(last.end, m.end)
      const sev = { high: 3, med: 2, low: 1 }
      if (sev[m.pattern.severity] > sev[last.pattern.severity]) last.pattern = m.pattern
    } else {
      merged.push({ ...m })
    }
  })

  const segments = []
  let cursor = 0
  merged.forEach((m) => {
    if (cursor < m.start) segments.push({ kind: 'plain', text: text.slice(cursor, m.start) })
    segments.push({ kind: 'flag', text: text.slice(m.start, m.end), pattern: m.pattern })
    cursor = m.end
  })
  if (cursor < text.length) segments.push({ kind: 'plain', text: text.slice(cursor) })

  const byCategory = {}
  hitsByPattern.forEach(({ pattern, count }) => {
    byCategory[pattern.cat] = (byCategory[pattern.cat] || 0) + count
  })

  return {
    hits: Array.from(hitsByPattern.values()).sort((a, b) => severityScore(b.pattern) - severityScore(a.pattern)),
    byCategory,
    segments,
  }
}

function severityScore(p) { return p.severity === 'high' ? 3 : p.severity === 'med' ? 2 : 1 }

function riskScore(hits) {
  let pts = 100
  hits.forEach((h) => {
    const per = h.pattern.severity === 'high' ? 25 : h.pattern.severity === 'med' ? 12 : 5
    pts -= Math.min(per * h.count, per * 2)
  })
  return Math.max(0, Math.min(100, Math.round(pts)))
}

/* =============================================================== */
/*  PAGE — content from Redux override or imported defaults         */
/* =============================================================== */

export default function ScamMessageAnalyzer() {
  const override   = useSelector(selectScamAnalyzer)
  const rawPatterns = override?.patterns || SCAM_PATTERNS_DEFAULT
  const EXAMPLES    = override?.examples || SCAM_EXAMPLES_DEFAULT

  /* Compile string regex -> RegExp once per override change */
  const PATTERNS = useMemo(() => hydrateScamPatterns(rawPatterns), [rawPatterns])

  const [text, setText] = useState('')
  const analysis = useMemo(() => annotate(text, PATTERNS), [text, PATTERNS])
  const score    = riskScore(analysis.hits)
  const sColor   = scoreColor(score)

  const verdict = useMemo(() => {
    if (!text.trim()) return null
    const highCount = analysis.hits.filter((h) => h.pattern.severity === 'high').length
    if (highCount >= 3 || score < 40) return { kind: 'danger',  icon: '🚨', label: 'Highly likely scam', desc: 'Multiple severe red flags. Do not reply, click, or call back. Block the sender.' }
    if (highCount >= 1 || score < 75) return { kind: 'caution', icon: '⚠️', label: 'Suspicious',          desc: 'Several patterns that scams use. Verify the sender out-of-band before doing anything.' }
    return { kind: 'safe', icon: '✅', label: 'Looks legit', desc: 'No obvious scam patterns detected. Always stay alert — sophisticated scams can evade pattern matching.' }
  }, [text, analysis, score])

  function loadExample(kind) {
    setText(EXAMPLES[kind] || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageLayout>
      <header className="tool-hero">
        <div className="tool-hero-bg" aria-hidden>
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="grid-bg" />
        </div>
        <div className="tool-hero-inner tool-hero-inner-single">
          <div className="tool-hero-text">
            <span className="tool-hero-tag">💬 Scam Message Analyzer · Free Tool</span>
            <h1>Paste a message — find out if it&apos;s <span className="accent">a scam</span></h1>
            <p>
              We scan the text for {PATTERNS.length} known scam patterns — urgency phrases, lookalike
              URLs, OTP requests, fake authority claims — and tell you exactly what to look out for.
              Everything runs locally in your browser.
            </p>

            <div className="msg-input-wrap">
              <textarea
                className="msg-input"
                placeholder="Paste an email, SMS, WhatsApp message, or any text you're unsure about…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                autoFocus
              />
              <div className="msg-input-footer">
                <span className="msg-input-count">{text.length} characters · {text.trim().split(/\s+/).filter(Boolean).length} words</span>
                <div className="msg-input-actions">
                  <button type="button" className="msg-example-btn" onClick={() => loadExample('scam')}>Load scam example</button>
                  <button type="button" className="msg-example-btn" onClick={() => loadExample('legit')}>Load legit example</button>
                  {text && <button type="button" className="msg-example-btn msg-clear" onClick={() => setText('')}>Clear</button>}
                </div>
              </div>
            </div>

            <div className="tool-hero-trust">
              <span>🔒 100% client-side</span>
              <span>·</span>
              <span>Text never leaves your browser</span>
              <span>·</span>
              <span>{PATTERNS.length} patterns</span>
            </div>
          </div>
        </div>
      </header>

      <main className="tool-body">
        {!text.trim() && (
          <>
            <div className="tool-section-head">
              <h2>How it works</h2>
              <p>We don&apos;t use AI — we match against {PATTERNS.length} curated regex patterns from real-world scam data.</p>
            </div>
            <div className="pw-tips-grid">
              <div className="pw-tip-card"><div className="pw-tip-icon">⏰</div><h4>Urgency</h4><p>&quot;Act in 24 hours&quot;, &quot;Account will be closed&quot; — fear that bypasses your judgement.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">👮</div><h4>Spoofed authority</h4><p>IRS, banks, police, courts — agencies that never first-contact via text.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">💰</div><h4>Money lures</h4><p>Free prizes, gift cards, crypto wallets, inheritance — too-good-to-be-true.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">🔗</div><h4>Sketchy URLs</h4><p>Shorteners, typosquats, .ru / .tk domains, IP-only URLs.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">🔑</div><h4>OTP / data requests</h4><p>Asking for your one-time code, password, PIN, or government ID number.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">📣</div><h4>Style red flags</h4><p>Generic greetings, ALL CAPS, multiple !!! — telltale signs of a blast.</p></div>
            </div>
          </>
        )}

        {text.trim() && verdict && (
          <>
            <section className={`verdict-banner verdict-${verdict.kind}`}>
              <div className="verdict-icon" aria-hidden>{verdict.icon}</div>
              <div className="verdict-body">
                <div className="verdict-eyebrow">SCAM ANALYSIS</div>
                <h2>{verdict.label}</h2>
                <p>{verdict.desc}</p>
              </div>
              <div className="verdict-stats">
                <div className="verdict-stat"><strong>{score}</strong><span>/100 trust score</span></div>
                <div className="verdict-stat"><strong>{analysis.hits.length}</strong><span>red flags</span></div>
              </div>
            </section>

            <div className="msg-analysis-grid">
              <section className="msg-annotated">
                <header className="msg-annotated-head">
                  <h2>Annotated message</h2>
                  <span>Hover a highlight to see why it was flagged</span>
                </header>
                <div className="msg-annotated-body">
                  {analysis.segments.length === 0
                    ? <span style={{ color: 'var(--muted)' }}>{text}</span>
                    : analysis.segments.map((seg, i) =>
                        seg.kind === 'plain'
                          ? <span key={i}>{seg.text}</span>
                          : <span key={i} className={`msg-flag msg-flag-${seg.pattern.severity}`} title={seg.pattern.why}>
                              {seg.text}
                            </span>,
                      )}
                </div>
              </section>

              <aside className="msg-score-card">
                <ScoreRing value={score} color={sColor} size={132} />
                <div className="msg-score-label">
                  <span className="msg-score-main" style={{ color: sColor }}>
                    {score >= 80 ? 'Low risk' : score >= 50 ? 'Medium risk' : 'High risk'}
                  </span>
                  <span className="msg-score-sub">{analysis.hits.length} pattern match{analysis.hits.length === 1 ? '' : 'es'}</span>
                </div>

                {Object.keys(analysis.byCategory).length > 0 && (
                  <div className="msg-cat-list">
                    {Object.entries(analysis.byCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, n]) => (
                        <div key={cat} className="msg-cat-row">
                          <span className="msg-cat-name">{cat}</span>
                          <span className="msg-cat-count">{n}</span>
                        </div>
                      ))}
                  </div>
                )}
              </aside>
            </div>

            {analysis.hits.length > 0 && (
              <section className="rec-section">
                <div className="tool-section-head">
                  <h2>Detected patterns</h2>
                  <p>Each one is a known scam signature. Multiple = act with extreme caution.</p>
                </div>
                <div className="rec-list">
                  {analysis.hits.map((hit) => {
                    const sev = hit.pattern.severity
                    const recClass = sev === 'high' ? 'fail' : 'warn'
                    return (
                      <div key={hit.pattern.id} className={`rec-card rec-${recClass}`}>
                        <div className="rec-icon">{sev === 'high' ? '🚨' : sev === 'med' ? '⚠️' : 'ℹ️'}</div>
                        <div className="rec-body">
                          <h4>
                            {hit.pattern.label}
                            <span className="msg-hit-count">×{hit.count}</span>
                          </h4>
                          <p>{hit.pattern.why}</p>
                          <div className="msg-hit-samples">
                            {hit.samples.map((s, i) => <code key={i}>{s}</code>)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {analysis.hits.length === 0 && (
              <section className="rec-section">
                <div className="rec-celebrate">
                  <div className="rec-celebrate-emoji" aria-hidden>👍</div>
                  <h3>No known scam patterns detected</h3>
                  <p>
                    The message doesn&apos;t trip any of our heuristics. That said, sophisticated
                    scams can evade pattern matching — always verify the sender independently before
                    clicking links or sharing info.
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        <section className="tool-cta-row">
          <div>
            <h3>Want to train your phishing instincts?</h3>
            <p>Take our 5-minute interactive quiz with real-world phishing examples.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/tools/phishing-quiz" className="btn-submit">Take phishing quiz →</Link>
            <Link to="/guides/spot-phishing-email-30-seconds" className="btn-secondary">Read the guide</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
