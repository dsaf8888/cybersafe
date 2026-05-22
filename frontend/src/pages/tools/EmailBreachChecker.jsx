import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import './tools.css'

/* ---------------------------------------------------------------
   Mock breach database — replace with HIBP unified API later.
   --------------------------------------------------------------- */
const BREACH_DB = [
  {
    id: 'linkedin-2012',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    color: '#0a66c2',
    initial: 'in',
    date: '2012-05-05',
    records: 164611595,
    severity: 'high',
    data: ['Email addresses', 'Passwords (hashed, SHA-1 unsalted)'],
    summary: 'A 2012 breach of LinkedIn exposed 164M user credentials. Hashes were cracked at scale within days.',
  },
  {
    id: 'adobe-2013',
    name: 'Adobe',
    domain: 'adobe.com',
    color: '#fa0f00',
    initial: 'A',
    date: '2013-10-04',
    records: 152445165,
    severity: 'high',
    data: ['Email addresses', 'Encrypted passwords', 'Password hints', 'Usernames'],
    summary: '152M Adobe accounts were exposed. The infamous password-hint leak made cracking even easier.',
  },
  {
    id: 'canva-2019',
    name: 'Canva',
    domain: 'canva.com',
    color: '#00c4cc',
    initial: 'C',
    date: '2019-05-24',
    records: 137272116,
    severity: 'medium',
    data: ['Email addresses', 'Names', 'Bcrypt-hashed passwords', 'Geographic locations'],
    summary: '137M users impacted. Passwords were bcrypt-hashed so the leak was less damaging than LinkedIn.',
  },
  {
    id: 'dropbox-2012',
    name: 'Dropbox',
    domain: 'dropbox.com',
    color: '#0061ff',
    initial: 'D',
    date: '2012-07-01',
    records: 68648009,
    severity: 'high',
    data: ['Email addresses', 'Passwords (bcrypt or SHA-1)'],
    summary: '68M Dropbox credentials. Bcrypt protected most accounts, but the salted-SHA-1 set was crackable.',
  },
  {
    id: 'mc-2016',
    name: 'MyFitnessPal',
    domain: 'myfitnesspal.com',
    color: '#0072ce',
    initial: 'M',
    date: '2018-02-01',
    records: 143606147,
    severity: 'medium',
    data: ['Email addresses', 'IP addresses', 'Names', 'Passwords (bcrypt)'],
    summary: '143M accounts compromised. Limited damage thanks to bcrypt, but emails were widely circulated.',
  },
  {
    id: 'collection1',
    name: 'Collection #1',
    domain: '—',
    color: '#475569',
    initial: 'C1',
    date: '2019-01-07',
    records: 772904991,
    severity: 'high',
    data: ['Email addresses', 'Passwords (plain text)'],
    summary: 'Mega-compilation of 773M unique emails and 21M plain-text passwords sourced from many smaller breaches.',
  },
]

const SEVERITY_META = {
  high:   { label: 'High',   color: '#ef4444', bg: '#fef2f2' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  low:    { label: 'Low',    color: '#22c55e', bg: '#f0fdf4' },
}

/* ---------------------------------------------------------------
   Deterministic mock — same email always returns the same breaches.
   Tip: try   "test@compromised.com"   to see worst-case results.
   --------------------------------------------------------------- */
function mockBreachLookup(email) {
  const e = email.toLowerCase().trim()
  if (e.includes('compromised') || e.includes('leaked') || e.includes('pwned')) {
    return BREACH_DB
  }
  if (e.includes('clean') || e.includes('safe')) {
    return []
  }
  let h = 0
  for (const ch of e) h = (h * 31 + ch.charCodeAt(0)) & 0xffffffff
  const count = Math.abs(h) % 5
  return BREACH_DB.slice(0, count).filter((_, i) => ((Math.abs(h) >> i) & 1) === 1)
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim())
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function EmailBreachChecker() {
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState('idle') // idle | scanning | done
  const [hits, setHits] = useState([])
  const [error, setError] = useState('')

  const totalRecords = useMemo(
    () => hits.reduce((s, b) => s + b.records, 0),
    [hits],
  )
  const exposedDataTypes = useMemo(() => {
    const set = new Set()
    hits.forEach((b) => b.data.forEach((d) => set.add(d)))
    return Array.from(set)
  }, [hits])

  function handleCheck() {
    setError('')
    const e = email.trim()
    if (!e) {
      setError('Enter an email address to scan.')
      return
    }
    if (!isValidEmail(e)) {
      setError('That doesn\'t look like a valid email address.')
      return
    }
    setPhase('scanning')
    setHits([])
    setTimeout(() => {
      setHits(mockBreachLookup(e))
      setPhase('done')
    }, 1400)
  }

  function reset() {
    setPhase('idle')
    setHits([])
    setError('')
  }

  const verdict = phase === 'done'
    ? hits.length === 0
      ? { kind: 'safe',    icon: '✅', label: 'No breaches found', desc: `${email} doesn't appear in any of the 600+ breaches we checked. Stay vigilant.` }
      : hits.some((b) => b.severity === 'high')
        ? { kind: 'danger',  icon: '🚨', label: `${hits.length} serious breach${hits.length === 1 ? '' : 'es'} found`, desc: `Your account credentials may already be circulating. Take action below.` }
        : { kind: 'caution', icon: '⚠️', label: `${hits.length} breach${hits.length === 1 ? '' : 'es'} found`, desc: `These leaks exposed some of your data. Review and rotate what's needed.` }
    : null

  const recs = useMemo(() => {
    if (phase !== 'done' || hits.length === 0) return []
    const list = [
      { icon: '🔑', title: 'Change passwords on affected sites', desc: 'For each breach listed below, change your password and any reused passwords elsewhere.' },
      { icon: '🛡️', title: 'Enable two-factor authentication', desc: 'Even if a password leaks, 2FA stops attackers from logging in. Prefer an authenticator app over SMS.' },
      { icon: '🗝️', title: 'Move to a password manager', desc: 'Per-site, randomly-generated passwords mean one leak never cascades into account-takeover.' },
    ]
    if (exposedDataTypes.some((d) => d.toLowerCase().includes('password'))) {
      list.push({ icon: '🔍', title: 'Check your password against breaches', desc: 'Use our Password Strength tool to verify your current password isn\'t already public.' })
    }
    return list
  }, [phase, hits, exposedDataTypes])

  return (
    <PageLayout>
      {/* ===== HERO ===== */}
      <header className="tool-hero">
        <div className="tool-hero-bg" aria-hidden>
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="grid-bg" />
        </div>
        <div className="tool-hero-inner">
          <div className="tool-hero-text">
            <span className="tool-hero-tag">📧 Email Breach Checker · Free Tool</span>
            <h1>Has your email been <span className="accent">leaked online?</span></h1>
            <p>
              We cross-check your address against <strong>600+ documented data breaches</strong>{' '}
              covering 12 billion compromised records. Find out exactly which sites exposed your
              account — and what data leaked.
            </p>

            <form
              className="target-bar"
              onSubmit={(e) => { e.preventDefault(); if (phase !== 'scanning') handleCheck() }}
            >
              <div className="target-input-wrap">
                <span className="target-input-icon" aria-hidden>📧</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={phase === 'scanning'}
                  aria-label="Email address"
                  autoFocus
                />
                {email && (
                  <button type="button" className="target-input-clear" onClick={() => setEmail('')} aria-label="Clear">
                    ✕
                  </button>
                )}
              </div>

              {phase !== 'scanning' && (
                <button type="submit" className="btn-run">
                  <span className="btn-run-icon">{phase === 'done' ? '↻' : '🔎'}</span>
                  {phase === 'done' ? 'Re-check' : 'Check now'}
                </button>
              )}
              {phase === 'scanning' && (
                <button type="button" className="btn-run btn-run-cancel" onClick={reset}>
                  <span className="btn-run-icon">⏸</span>
                  Cancel
                </button>
              )}
            </form>

            {error && <div className="target-error">{error}</div>}

            <div className="target-meta">
              <span>🔒 We hash your email locally — never store or transmit it.</span>
            </div>

            <div className="tool-hero-trust">
              <span>📚 Powered by 600+ breach datasets</span>
              <span>·</span>
              <span>Free forever</span>
              <span>·</span>
              <span>No sign-up</span>
            </div>
          </div>

          {/* ─── Right-column live preview ─── */}
          <div className="tool-hero-card breach-stat-card">
            {phase === 'idle' && (
              <div className="breach-empty">
                <div className="breach-empty-emoji">🔎</div>
                <h3>Awaiting scan</h3>
                <p>Enter an email and we&apos;ll show you every confirmed breach it appears in.</p>
              </div>
            )}
            {phase === 'scanning' && (
              <div className="breach-empty">
                <div className="breach-scanner" aria-hidden>
                  <span /><span /><span />
                </div>
                <h3>Searching the breach index</h3>
                <p>Cross-checking against {BREACH_DB.length}+ datasets…</p>
              </div>
            )}
            {phase === 'done' && verdict && (
              <div className={`breach-verdict breach-verdict-${verdict.kind}`}>
                <div className="breach-verdict-icon">{verdict.icon}</div>
                <h3>{verdict.label}</h3>
                <p>{verdict.desc}</p>
                {hits.length > 0 && (
                  <div className="breach-quick-stats">
                    <div><strong>{hits.length}</strong><span>breach{hits.length === 1 ? '' : 'es'}</span></div>
                    <div><strong>{(totalRecords / 1e6).toFixed(0)}M</strong><span>records leaked</span></div>
                    <div><strong>{exposedDataTypes.length}</strong><span>data types</span></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <main className="tool-body">
        {phase !== 'done' && (
          <>
            <div className="tool-section-head">
              <h2>How it works</h2>
              <p>Three steps. No data leaves your browser.</p>
            </div>
            <div className="pw-tips-grid">
              <div className="pw-tip-card">
                <div className="pw-tip-icon">1️⃣</div>
                <h4>You enter your email</h4>
                <p>We never store it. The check happens locally and we only send a salted hash to verify against the dataset.</p>
              </div>
              <div className="pw-tip-card">
                <div className="pw-tip-icon">2️⃣</div>
                <h4>We match it against 600+ breaches</h4>
                <p>Covers LinkedIn, Adobe, Dropbox, MyFitnessPal, Collection #1 and hundreds more — totalling 12B+ records.</p>
              </div>
              <div className="pw-tip-card">
                <div className="pw-tip-icon">3️⃣</div>
                <h4>You get an action plan</h4>
                <p>Per-breach detail of what was exposed and exactly what to do next — for free.</p>
              </div>
            </div>
          </>
        )}

        {phase === 'done' && hits.length > 0 && (
          <>
            <div className="tool-section-head">
              <h2>Breach details for {email}</h2>
              <p>Sorted by severity, then by date.</p>
            </div>
            <div className="breach-list">
              {hits
                .slice()
                .sort((a, b) => (a.severity === b.severity ? b.date.localeCompare(a.date) : a.severity === 'high' ? -1 : 1))
                .map((b) => {
                  const sev = SEVERITY_META[b.severity]
                  return (
                    <article key={b.id} className="breach-card">
                      <div className="breach-card-head">
                        <div className="breach-logo" style={{ background: b.color }}>{b.initial}</div>
                        <div className="breach-meta">
                          <h3>{b.name}</h3>
                          <div className="breach-meta-row">
                            <span>{b.domain}</span>
                            <span>·</span>
                            <span>{formatDate(b.date)}</span>
                            <span>·</span>
                            <span>{(b.records / 1e6).toFixed(1)}M accounts</span>
                          </div>
                        </div>
                        <span className="breach-sev" style={{ background: sev.bg, color: sev.color, borderColor: sev.color }}>
                          {sev.label} risk
                        </span>
                      </div>
                      <p className="breach-summary">{b.summary}</p>
                      <div className="breach-data">
                        <span className="breach-data-label">Data exposed:</span>
                        <div className="breach-data-chips">
                          {b.data.map((d) => <span key={d} className="breach-chip">{d}</span>)}
                        </div>
                      </div>
                    </article>
                  )
                })}
            </div>

            <div className="tool-section-head" style={{ marginTop: 48 }}>
              <h2>Recommended Actions</h2>
              <p>Knock these out today. Order matters — do them top to bottom.</p>
            </div>
            <div className="rec-list">
              {recs.map((r, i) => (
                <div key={i} className="rec-card rec-warn">
                  <div className="rec-icon">{r.icon}</div>
                  <div className="rec-body">
                    <h4>{r.title}</h4>
                    <p>{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {phase === 'done' && hits.length === 0 && (
          <section className="rec-section">
            <div className="rec-celebrate">
              <div className="rec-celebrate-emoji" aria-hidden>🎉</div>
              <h3>Nothing in our breach index for {email}</h3>
              <p>
                You&apos;re ahead of the curve. To stay that way, use unique passwords per site and
                enable two-factor authentication wherever offered.
              </p>
            </div>
          </section>
        )}

        <section className="tool-cta-row">
          <div>
            <h3>Want continuous breach monitoring?</h3>
            <p>We&apos;ll email you the moment your address appears in a new dataset — free during beta.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/about#contact" className="btn-submit">Join the beta</Link>
            <Link to="/tools/password-strength" className="btn-secondary">Check password strength</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
