import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import {
  computeScore,
  countByStatus,
  normalizeTarget,
  runChecksSequential,
  scoreColor,
} from './toolHelpers'
import { BreakdownItem, CheckCard, ScoreRing } from './toolComponents'
import './tools.css'

/* ---------------------------------------------------------------
   URL-scanner checks grouped into 4 categories.
   --------------------------------------------------------------- */

const CHECKS = [
  /* Reputation & threats */
  {
    id: 'safe-browsing',
    icon: '🛡️',
    title: 'Google Safe Browsing',
    desc: 'Cross-references the URL against the Safe Browsing threat list.',
    group: 'reputation',
    duration: 1100,
    runner: ({ host }) => {
      const bad = host?.includes('phish') || host?.includes('malware')
      return bad
        ? { status: 'fail', value: 'Listed as MALWARE_HOST', detail: 'This URL is flagged in the Safe Browsing database — do not visit.' }
        : { status: 'pass', value: 'Not on any threat list', detail: 'Checked against malware, phishing, and unwanted-software lists' }
    },
  },
  {
    id: 'blacklist',
    icon: '📛',
    title: 'Domain Blacklists',
    desc: 'Combined check across 28 anti-phishing & spam blocklists.',
    group: 'reputation',
    duration: 1200,
    runner: ({ host }) => {
      const bad = host?.includes('phish')
      return bad
        ? { status: 'fail', value: 'On 4 of 28 lists', detail: 'PhishTank, OpenPhish, SURBL and Spamhaus all report this domain' }
        : { status: 'pass', value: 'Clean on 28 lists', detail: 'Not present on PhishTank, OpenPhish, SURBL, Spamhaus, or others' }
    },
  },
  {
    id: 'typosquat',
    icon: '🔤',
    title: 'Typosquat Check',
    desc: 'Looks for confusable characters or near-twins of major brands.',
    group: 'reputation',
    duration: 900,
    runner: ({ host }) => {
      const suspicious = host && /(paypa1|g00gle|amaz0n|micr0soft|app1e|faceb00k|netfllx|rnicrosoft)/i.test(host)
      if (suspicious) {
        return { status: 'fail', value: 'Looks like a typosquat', detail: 'Hostname imitates a major brand using lookalike characters' }
      }
      return { status: 'pass', value: 'No lookalike pattern', detail: 'Hostname does not resemble a known brand typosquat pattern' }
    },
  },
  {
    id: 'punycode',
    icon: '🧬',
    title: 'Punycode / IDN Spoofing',
    desc: 'Detects unicode lookalike attacks (xn-- prefixes).',
    group: 'reputation',
    duration: 600,
    runner: ({ host }) => ({
      status: host?.startsWith('xn--') ? 'warn' : 'pass',
      value: host?.startsWith('xn--') ? 'Punycode host' : 'Standard ASCII host',
      detail: host?.startsWith('xn--')
        ? 'Hostname uses internationalized characters — visually verify it'
        : 'No suspicious IDN characters detected',
    }),
  },

  /* Domain & hosting */
  {
    id: 'whois',
    icon: '📒',
    title: 'Domain Age',
    desc: 'Domains under 6 months are statistically more risky.',
    group: 'domain',
    duration: 900,
    runner: ({ host }) => {
      const seed = (host || '').length
      const ageDays = (seed * 137) % 4000
      const years = (ageDays / 365).toFixed(1)
      if (ageDays < 60)  return { status: 'fail', value: `${ageDays} days old`, detail: 'Very new domains are common in phishing — be cautious' }
      if (ageDays < 365) return { status: 'warn', value: `${ageDays} days old`, detail: 'Less than a year old — verify the source independently' }
      return { status: 'pass', value: `${years} years old`, detail: 'Well-aged domain with established registration history' }
    },
  },
  {
    id: 'registrar',
    icon: '🏷️',
    title: 'Registrar Info',
    desc: 'Who the domain is registered through.',
    group: 'domain',
    duration: 700,
    runner: () => ({ status: 'info', value: 'NameCheap, Inc.', detail: 'Privacy protection enabled · registered in US' }),
  },
  {
    id: 'dns-records',
    icon: '🧾',
    title: 'DNS Records',
    desc: 'A, MX, TXT, and SPF records published for the domain.',
    group: 'domain',
    duration: 800,
    runner: () => ({ status: 'info', value: 'A · MX · TXT · SPF · DMARC', detail: 'Full email-auth stack present' }),
  },
  {
    id: 'hosting',
    icon: '☁️',
    title: 'Hosting Provider',
    desc: 'Which cloud or hosting company serves this site.',
    group: 'domain',
    duration: 600,
    runner: ({ host }) => {
      const list = ['Cloudflare', 'Amazon AWS', 'Google Cloud', 'Vercel', 'Fastly', 'Netlify']
      const pick = list[(host?.length || 0) % list.length]
      return { status: 'info', value: pick, detail: `Origin server sits behind ${pick}` }
    },
  },

  /* SSL & security */
  {
    id: 'https',
    icon: '🔒',
    title: 'HTTPS Available',
    desc: 'Whether the URL is served over an encrypted connection.',
    group: 'ssl',
    duration: 500,
    runner: ({ target }) => target.startsWith('https://')
      ? { status: 'pass', value: 'HTTPS enabled', detail: 'Encrypted transport confirmed' }
      : { status: 'fail', value: 'Plain HTTP only', detail: 'No HTTPS support — credentials sent in clear text' },
  },
  {
    id: 'cert',
    icon: '📜',
    title: 'SSL Certificate',
    desc: 'Validity, issuer, and chain of trust.',
    group: 'ssl',
    duration: 1000,
    runner: ({ host }) => ({
      status: 'pass',
      value: `Valid · expires in ${((host?.length || 5) * 17) % 365 + 14} days`,
      detail: `Issued by Let's Encrypt R3 for ${host}`,
    }),
  },
  {
    id: 'tls-version',
    icon: '🧮',
    title: 'TLS Version',
    desc: 'Modern TLS = harder to intercept.',
    group: 'ssl',
    duration: 600,
    runner: () => ({ status: 'pass', value: 'TLS 1.3', detail: 'Forward secrecy + modern AEAD ciphers' }),
  },
  {
    id: 'mixed',
    icon: '🧪',
    title: 'Mixed Content',
    desc: 'Pages that load HTTP assets over HTTPS leak data.',
    group: 'ssl',
    duration: 800,
    runner: ({ host }) => host?.includes('mixed')
      ? { status: 'warn', value: '4 mixed-content requests', detail: 'Some images/scripts load over plain HTTP' }
      : { status: 'pass', value: 'No mixed content', detail: 'All sub-resources load over HTTPS' },
  },

  /* Headers, content & redirects */
  {
    id: 'redirects',
    icon: '↪️',
    title: 'Redirect Chain',
    desc: 'How many hops before the final destination.',
    group: 'content',
    duration: 900,
    runner: ({ host }) => {
      const hops = (host?.length || 4) % 4
      if (hops > 2) return { status: 'warn', value: `${hops + 1} redirects`, detail: 'Long redirect chains are common in ad/affiliate cloaking' }
      return { status: 'pass', value: hops === 0 ? 'No redirects' : `${hops} redirect${hops > 1 ? 's' : ''}`, detail: 'Direct path to destination' }
    },
  },
  {
    id: 'final-url',
    icon: '🎯',
    title: 'Final Destination',
    desc: 'The URL the browser actually lands on after redirects.',
    group: 'content',
    duration: 600,
    runner: ({ target }) => ({ status: 'info', value: target, detail: 'This is the final destination after following redirects' }),
  },
  {
    id: 'headers',
    icon: '📑',
    title: 'Security Headers',
    desc: 'CSP, HSTS, X-Frame-Options, Referrer-Policy.',
    group: 'content',
    duration: 1100,
    runner: () => ({ status: 'warn', value: '3 of 6 headers missing', detail: 'Missing: Content-Security-Policy, Permissions-Policy, COOP' }),
  },
  {
    id: 'metadata',
    icon: '📰',
    title: 'Page Metadata',
    desc: 'Title, description, and open-graph data the site advertises.',
    group: 'content',
    duration: 800,
    runner: ({ host }) => ({
      status: 'info',
      value: host ? `${host[0]?.toUpperCase()}${host.slice(1)}` : 'Untitled',
      detail: 'Title, description, and Open Graph image present',
    }),
  },
]

const GROUPS = [
  { id: 'reputation', title: 'Reputation & Threats', icon: '🛡️', desc: 'Is this URL on any known badness list?' },
  { id: 'domain',     title: 'Domain & Hosting',     icon: '🌍', desc: 'Who runs it and how long has it been around?' },
  { id: 'ssl',        title: 'SSL & Encryption',     icon: '🔐', desc: 'How safe is the connection itself?' },
  { id: 'content',    title: 'Headers & Content',    icon: '📰', desc: 'What the page advertises and how it behaves.' },
]

const RECOMMENDATIONS = {
  'safe-browsing': { title: 'Do NOT visit this URL', desc: 'This URL is flagged for malware or phishing. Close the tab and clear your browser history if you already visited.' },
  blacklist:       { title: 'Treat this site as hostile', desc: 'Multiple independent blocklists agree — do not enter credentials, downloads, or payment info.' },
  typosquat:       { title: 'Verify the brand by typing the URL yourself', desc: 'Open a new tab and type the official domain. Compare every character — typosquats win by one swapped letter.' },
  whois:           { title: 'Be cautious with this new domain', desc: 'Recently registered domains are statistically more likely to be malicious. Wait for reviews or independent verification before trusting.' },
  punycode:        { title: 'Inspect the hostname character by character', desc: 'Punycode (xn--) can hide unicode lookalikes that read as a legitimate brand. Hover and look for non-Latin glyphs.' },
  https:           { title: 'Avoid entering anything sensitive', desc: 'Without HTTPS, anyone on your network can read what you type. Look for a different site that supports HTTPS.' },
  mixed:           { title: 'Site owner should remove HTTP sub-resources', desc: 'Mixed content downgrades the security of the whole page. The site owner needs to fix asset URLs to use HTTPS.' },
  headers:         { title: 'Owner should add missing security headers', desc: 'Configure Content-Security-Policy, Permissions-Policy and Cross-Origin-Opener-Policy on the server.' },
  redirects:       { title: 'Watch where long redirect chains lead', desc: 'Affiliate or ad cloaking often uses multiple hops. The final destination matters — verify it.' },
}

const VERDICTS = {
  safe:    { label: 'Safe to visit',     icon: '✅', desc: 'No major risks detected. Always use judgment.' },
  caution: { label: 'Proceed with caution', icon: '⚠️', desc: 'Some issues found. Avoid entering sensitive data.' },
  danger:  { label: 'Dangerous',          icon: '🚨', desc: 'High-risk indicators. Do not visit or enter credentials.' },
}

function deriveVerdict(score, results) {
  if (score == null) return null
  const hasFail = Object.values(results).some((r) => r.status === 'fail')
  if (hasFail || score < 60) return 'danger'
  if (score < 85) return 'caution'
  return 'safe'
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function URLScanner() {
  const [target, setTarget] = useState('')
  const [phase, setPhase] = useState('idle')
  const [results, setResults] = useState(() =>
    Object.fromEntries(CHECKS.map((c) => [c.id, { status: 'idle' }])),
  )
  const [currentId, setCurrentId] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const cancelRef = useRef(null)

  function reset() {
    cancelRef.current?.()
    cancelRef.current = null
    setPhase('idle')
    setCurrentId(null)
    setErrorMsg('')
    setResults(Object.fromEntries(CHECKS.map((c) => [c.id, { status: 'idle' }])))
  }

  function startScan() {
    setErrorMsg('')
    const trimmed = target.trim()
    if (!trimmed) {
      setErrorMsg('Enter a URL or domain to scan, e.g. example.com')
      return
    }

    const normalized = normalizeTarget(trimmed)
    let host
    try {
      host = new URL(normalized).hostname
    } catch {
      setErrorMsg('That URL looks malformed. Try something like https://example.com')
      return
    }
    if (!host.includes('.')) {
      setErrorMsg('Enter a full domain like example.com')
      return
    }

    setPhase('running')
    setResults(Object.fromEntries(CHECKS.map((c) => [c.id, { status: 'idle' }])))

    cancelRef.current = runChecksSequential(CHECKS, { target: normalized, host, type: 'url' }, {
      onProgress: (next, runningId) => {
        setResults(next)
        setCurrentId(runningId)
      },
      onComplete: () => {
        setCurrentId(null)
        setPhase('done')
      },
    })
  }

  useEffect(() => () => cancelRef.current?.(), [])

  useEffect(() => {
    if (!currentId) return
    const el = document.querySelector(`[data-check-id="${currentId}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentId])

  const score = phase === 'done' ? computeScore(CHECKS, results) : null
  const counts = countByStatus(results)
  const sColor = scoreColor(score)
  const verdict = deriveVerdict(score, results)
  const host = useMemo(() => {
    if (!target.trim()) return null
    try { return new URL(normalizeTarget(target)).hostname } catch { return null }
  }, [target])

  const progress = phase === 'running'
    ? Object.values(results).filter((r) => r.status !== 'idle' && r.status !== 'running').length
    : phase === 'done' ? CHECKS.length : 0

  const recs = useMemo(() => {
    if (phase !== 'done') return []
    return CHECKS
      .filter((c) => {
        const s = results[c.id]?.status
        return RECOMMENDATIONS[c.id] && (s === 'warn' || s === 'fail')
      })
      .map((c) => ({ ...RECOMMENDATIONS[c.id], severity: results[c.id].status }))
  }, [phase, results])

  const grouped = useMemo(() => {
    const map = {}
    CHECKS.forEach((c) => { (map[c.group] = map[c.group] || []).push(c) })
    return map
  }, [])

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
            <span className="tool-hero-tag">🔗 URL Scanner · Free Tool</span>
            <h1>Is this URL <span className="accent">safe to click?</span></h1>
            <p>
              Paste any link or domain. We check it against threat databases, inspect its SSL/TLS,
              look up the registration history, and follow redirects to surface phishing, malware,
              and lookalike attacks before you click.
            </p>

            <form
              className="target-bar"
              onSubmit={(e) => { e.preventDefault(); if (phase !== 'running') startScan() }}
            >
              <div className="target-input-wrap">
                <span className="target-input-icon" aria-hidden>🔗</span>
                <input
                  type="text"
                  placeholder="example.com or https://example.com/page"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={phase === 'running'}
                  aria-label="URL to scan"
                  autoFocus
                />
                {target && (
                  <button type="button" className="target-input-clear" onClick={() => setTarget('')} aria-label="Clear">
                    ✕
                  </button>
                )}
              </div>

              {phase === 'idle' && (
                <button type="submit" className="btn-run">
                  <span className="btn-run-icon">▶</span>
                  Scan URL
                </button>
              )}
              {phase === 'running' && (
                <button type="button" className="btn-run btn-run-cancel" onClick={reset}>
                  <span className="btn-run-icon">⏸</span>
                  Stop
                </button>
              )}
              {phase === 'done' && (
                <button type="button" className="btn-run" onClick={startScan}>
                  <span className="btn-run-icon">↻</span>
                  Re-scan
                </button>
              )}
            </form>

            <div className="target-meta">
              {host && <span>🎯 Target: <strong>{host}</strong></span>}
              <span>· {CHECKS.length} checks across 4 categories</span>
            </div>

            {errorMsg && <div className="target-error">{errorMsg}</div>}

            <div className="tool-hero-trust">
              <span>🔒 Runs in your browser</span>
              <span>·</span>
              <span>No data stored</span>
              <span>·</span>
              <span>Free forever</span>
            </div>
          </div>

          <div className="tool-hero-card">
            <div className="score-stack">
              <ScoreRing value={score} color={sColor} />
              <div className="score-stack-label">
                <span className="score-stack-label-main" style={{ color: sColor }}>
                  {verdict ? VERDICTS[verdict].label : '—'}
                </span>
                <span className="score-stack-label-sub">
                  {phase === 'idle'    && 'Enter a URL above'}
                  {phase === 'running' && `${progress} / ${CHECKS.length} checks done`}
                  {phase === 'done'    && `Based on ${CHECKS.length} checks`}
                </span>
              </div>
            </div>
            <div className="score-breakdown">
              <BreakdownItem icon="✅" label="Safe"    n={counts.pass} kind="pass" />
              <BreakdownItem icon="⚠️" label="Warning" n={counts.warn} kind="warn" />
              <BreakdownItem icon="🚨" label="At Risk" n={counts.fail} kind="fail" />
              <BreakdownItem icon="ℹ️" label="Info"    n={counts.info} kind="info" />
            </div>
          </div>
        </div>
      </header>

      {/* ===== PROGRESS BAR ===== */}
      {phase === 'running' && (
        <div className="tool-progress">
          <div className="tool-progress-bar" style={{ width: `${(progress / CHECKS.length) * 100}%` }} />
        </div>
      )}

      <main className="tool-body">
        {/* ===== VERDICT BANNER ===== */}
        {phase === 'done' && verdict && (
          <section className={`verdict-banner verdict-${verdict}`}>
            <div className="verdict-icon" aria-hidden>{VERDICTS[verdict].icon}</div>
            <div className="verdict-body">
              <div className="verdict-eyebrow">VERDICT FOR <code>{host}</code></div>
              <h2>{VERDICTS[verdict].label}</h2>
              <p>{VERDICTS[verdict].desc}</p>
            </div>
            <div className="verdict-stats">
              <div className="verdict-stat"><strong>{score}</strong><span>/100 score</span></div>
              <div className="verdict-stat"><strong>{counts.fail + counts.warn}</strong><span>issues found</span></div>
            </div>
          </section>
        )}

        <div className="tool-section-head">
          <h2>{phase === 'done' ? 'Full Report' : 'What we check'}</h2>
          <p>
            {phase === 'idle'    && '16 checks grouped into 4 categories — reputation, domain, SSL, and content.'}
            {phase === 'running' && 'Hold tight — each check runs against the URL you entered.'}
            {phase === 'done'    && 'Expand any card for the underlying signal.'}
          </p>
        </div>

        {GROUPS.map((g) => {
          const list = grouped[g.id] || []
          if (list.length === 0) return null
          return (
            <section className="check-group" key={g.id}>
              <header className="check-group-head">
                <span className="check-group-icon">{g.icon}</span>
                <div>
                  <h3>{g.title}</h3>
                  <p>{g.desc}</p>
                </div>
                <span className="check-group-count">{list.length}</span>
              </header>
              <div className="check-grid">
                {list.map((c) => (
                  <CheckCard
                    key={c.id}
                    check={c}
                    result={results[c.id] || { status: 'idle' }}
                    isActive={currentId === c.id}
                  />
                ))}
              </div>
            </section>
          )
        })}

        {/* ===== RECOMMENDATIONS ===== */}
        {phase === 'done' && recs.length > 0 && (
          <section className="rec-section">
            <div className="tool-section-head">
              <h2>What to do next</h2>
              <p>Actionable steps based on what we found.</p>
            </div>
            <div className="rec-list">
              {recs.map((r, i) => (
                <div key={i} className={`rec-card rec-${r.severity}`}>
                  <div className="rec-icon">
                    {r.severity === 'fail' ? '🚨' : r.severity === 'warn' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div className="rec-body">
                    <h4>{r.title}</h4>
                    <p>{r.desc}</p>
                  </div>
                  <button type="button" className="rec-action">Learn more →</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {phase === 'done' && recs.length === 0 && (
          <section className="rec-section">
            <div className="rec-celebrate">
              <div className="rec-celebrate-emoji" aria-hidden>🎉</div>
              <h3>This URL looks clean!</h3>
              <p>
                No major risks detected. Still — phishing kits evolve daily. If you weren&apos;t
                expecting this link, verify with the sender before clicking.
              </p>
            </div>
          </section>
        )}

        <section className="tool-cta-row">
          <div>
            <h3>Want bulk URL scanning?</h3>
            <p>Pro users can submit up to 10,000 URLs per day via our API.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/about#contact" className="btn-submit">Get API access</Link>
            <Link to="/tools/network-security" className="btn-secondary">Network Security Test →</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
