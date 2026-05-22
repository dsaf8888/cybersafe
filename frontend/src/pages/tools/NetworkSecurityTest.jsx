import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import {
  computeScore,
  countByStatus,
  detectTargetType,
  extractDomain,
  normalizeTarget,
  runChecksSequential,
  scoreColor,
  scoreLabel,
} from './toolHelpers'
import { BreakdownItem, CheckCard, ScoreRing } from './toolComponents'
import './tools.css'

/* ---------------------------------------------------------------
   CHECK CATALOGUE.
   Each runner receives { mode, target, type, host } and returns
   { status, value, detail }. Replace with real network probes later.
   --------------------------------------------------------------- */

const CHECKS = [
  /* Identification */
  {
    id: 'ip',
    icon: '🌐',
    title: 'Public IP Address',
    desc: "Address the target endpoint or your browser presents to the internet.",
    group: 'identification',
    duration: 500,
    runner: ({ mode, host }) => ({
      status: 'info',
      value: mode === 'self' ? '203.0.113.42' : `${pseudoIp(host)}`,
      detail: mode === 'self' ? 'IPv4 · static' : `Resolved A record for ${host}`,
    }),
  },
  {
    id: 'reverse-dns',
    icon: '🔁',
    title: 'Reverse DNS (PTR)',
    desc: 'Hostname the IP resolves back to — should match the owner.',
    group: 'identification',
    duration: 700,
    runner: ({ mode, host }) => ({
      status: 'info',
      value: mode === 'self' ? 'broadband.jio.in' : `edge-${host?.length || 4}.${host || 'target'}`,
      detail: 'PTR record found',
    }),
  },
  {
    id: 'isp',
    icon: '🏢',
    title: 'ISP / Hosting',
    desc: 'Network operator and hosting provider for the target.',
    group: 'identification',
    duration: 700,
    runner: ({ mode, host }) => ({
      status: 'info',
      value: mode === 'self' ? 'Jio Fiber' : pickHost(host),
      detail: mode === 'self' ? 'Bengaluru, IN · Broadband' : 'Tier-1 cloud',
    }),
  },
  {
    id: 'geo',
    icon: '📍',
    title: 'Geolocation',
    desc: 'Geographic origin of the target endpoint.',
    group: 'identification',
    duration: 600,
    runner: ({ mode }) => ({
      status: 'info',
      value: mode === 'self' ? 'Bengaluru, IN' : 'Frankfurt, DE',
      detail: mode === 'self' ? 'IN · Asia/Kolkata' : 'DE · Europe/Berlin',
    }),
  },

  /* DNS & connectivity */
  {
    id: 'dns',
    icon: '🧭',
    title: 'DNS Resolver',
    desc: 'Which DNS server resolves your lookups.',
    group: 'dns',
    duration: 900,
    runner: () => ({
      status: 'pass',
      value: '1.1.1.1 (Cloudflare)',
      detail: 'Encrypted DNS-over-HTTPS supported',
    }),
  },
  {
    id: 'dns-leak',
    icon: '💧',
    title: 'DNS Leak Test',
    desc: 'Detects whether DNS queries leak outside your VPN.',
    group: 'dns',
    duration: 1100,
    runner: () => ({
      status: 'pass',
      value: 'No leaks detected',
      detail: '3 resolvers contacted · all match VPN endpoint',
    }),
  },
  {
    id: 'webrtc',
    icon: '📡',
    title: 'WebRTC Leak',
    desc: 'Checks if your real IP leaks via the browser WebRTC API.',
    group: 'dns',
    duration: 800,
    onlySelf: true,
    runner: () => ({
      status: 'warn',
      value: 'Local IP exposed',
      detail: 'WebRTC reveals 192.168.1.42 — disable it for max privacy',
    }),
  },
  {
    id: 'ipv6',
    icon: '🔢',
    title: 'IPv6 Support',
    desc: 'Whether your connection has working IPv6.',
    group: 'dns',
    duration: 500,
    runner: ({ mode }) => ({
      status: 'info',
      value: mode === 'self' ? 'Disabled' : 'Available',
      detail: mode === 'self' ? 'Network is IPv4-only' : 'AAAA record present',
    }),
  },
  {
    id: 'latency',
    icon: '⚡',
    title: 'Latency / RTT',
    desc: 'Round-trip time to reach the target.',
    group: 'dns',
    duration: 600,
    runner: ({ mode }) => {
      const ms = mode === 'self' ? 18 : 76
      return {
        status: ms < 60 ? 'pass' : ms < 150 ? 'info' : 'warn',
        value: `${ms} ms`,
        detail: `Median over 5 ICMP probes`,
      }
    },
  },

  /* TLS / HTTPS */
  {
    id: 'tls',
    icon: '🔐',
    title: 'TLS / HTTPS',
    desc: 'Connection encryption strength.',
    group: 'tls',
    duration: 700,
    runner: () => ({
      status: 'pass',
      value: 'TLS 1.3 · A+',
      detail: 'Forward secrecy, modern ciphers',
    }),
  },
  {
    id: 'cert',
    icon: '📜',
    title: 'SSL Certificate',
    desc: 'Validity, issuer and expiry of the SSL cert.',
    group: 'tls',
    duration: 900,
    runner: ({ host, mode }) => ({
      status: 'pass',
      value: mode === 'self' ? 'Valid · 89 days left' : `Valid · 142 days left`,
      detail: `Issued by Let's Encrypt for ${host || 'this host'}`,
    }),
  },
  {
    id: 'hsts',
    icon: '🧱',
    title: 'HSTS Policy',
    desc: 'HTTP Strict Transport Security forces HTTPS connections.',
    group: 'tls',
    duration: 500,
    requiresUrl: true,
    runner: () => ({
      status: 'pass',
      value: 'Enabled · 2 years',
      detail: 'includeSubDomains; preload',
    }),
  },
  {
    id: 'redirect',
    icon: '↪️',
    title: 'HTTP → HTTPS Redirect',
    desc: 'Whether plain HTTP requests get upgraded to HTTPS.',
    group: 'tls',
    duration: 700,
    requiresUrl: true,
    runner: () => ({
      status: 'pass',
      value: '301 redirect in place',
      detail: 'Plain HTTP correctly redirected to HTTPS',
    }),
  },

  /* Security exposure */
  {
    id: 'ports',
    icon: '🚪',
    title: 'Open Ports',
    desc: 'Common service ports reachable from the public internet.',
    group: 'exposure',
    duration: 1400,
    runner: ({ mode }) => ({
      status: 'fail',
      value: mode === 'self' ? '2 risky ports open' : '1 risky port open',
      detail: mode === 'self'
        ? 'Port 22 (SSH) and 3389 (RDP) are exposed — firewall them'
        : 'Port 21 (FTP) is open — use SFTP/HTTPS instead',
    }),
  },
  {
    id: 'headers',
    icon: '📑',
    title: 'Security Headers',
    desc: 'CSP, X-Frame-Options, Referrer-Policy, etc.',
    group: 'exposure',
    duration: 1000,
    requiresUrl: true,
    runner: () => ({
      status: 'warn',
      value: '3 of 6 headers missing',
      detail: 'Missing: Content-Security-Policy, Permissions-Policy, COOP',
    }),
  },
  {
    id: 'server-leak',
    icon: '📰',
    title: 'Server Info Leak',
    desc: 'Server header reveals software & version, helping attackers fingerprint.',
    group: 'exposure',
    duration: 600,
    requiresUrl: true,
    runner: () => ({
      status: 'warn',
      value: 'Server: nginx/1.18.0',
      detail: 'Hide the version to reduce reconnaissance value',
    }),
  },
  {
    id: 'cookies',
    icon: '🍪',
    title: 'Cookie Security Flags',
    desc: 'Secure, HttpOnly, and SameSite on session cookies.',
    group: 'exposure',
    duration: 700,
    requiresUrl: true,
    runner: () => ({
      status: 'pass',
      value: 'All flags set',
      detail: 'Secure · HttpOnly · SameSite=Lax',
    }),
  },
  {
    id: 'vpn',
    icon: '🛡️',
    title: 'VPN / Proxy',
    desc: 'Detects whether traffic is routed through a VPN, Tor, or proxy.',
    group: 'exposure',
    duration: 900,
    onlySelf: true,
    runner: () => ({
      status: 'info',
      value: 'Not detected',
      detail: 'Direct connection to ISP',
    }),
  },
  {
    id: 'fingerprint',
    icon: '👣',
    title: 'Browser Fingerprint',
    desc: 'How unique your browser looks to trackers.',
    group: 'exposure',
    duration: 1000,
    onlySelf: true,
    runner: () => ({
      status: 'warn',
      value: 'Highly unique',
      detail: '1 in 14,200 browsers share your fingerprint',
    }),
  },
]

const GROUPS = [
  { id: 'identification', title: 'Identification', icon: '🪪', desc: 'Who and where is the target.' },
  { id: 'dns',            title: 'DNS & Connectivity', icon: '🧭', desc: 'How traffic finds its way to the target.' },
  { id: 'tls',            title: 'TLS & Certificates', icon: '🔐', desc: 'Encryption posture between you and the host.' },
  { id: 'exposure',       title: 'Security Exposure', icon: '🚨', desc: 'Attack surface and leaked information.' },
]

const RECOMMENDATIONS = {
  webrtc: { title: 'Disable WebRTC IP leak', desc: "Enable uBlock Origin's 'Prevent WebRTC leak' or set media.peerconnection.enabled=false in Firefox." },
  ports: { title: 'Close exposed administration ports', desc: 'Put SSH/RDP/FTP behind a VPN, change to a non-standard port, or restrict by source IP in your firewall.' },
  fingerprint: { title: 'Reduce browser fingerprint surface', desc: 'Use Firefox with resistFingerprinting=true, or Brave/Tor. Avoid niche extensions that add to your uniqueness.' },
  ipv6: { title: 'Enable IPv6 (optional)', desc: 'Modern CDNs and gaming networks benefit from native IPv6. Enable it in your router or ask your ISP.' },
  headers: { title: 'Add missing security headers', desc: 'Configure Content-Security-Policy, Permissions-Policy and Cross-Origin-Opener-Policy on your server.' },
  'server-leak': { title: 'Hide server version banner', desc: 'In nginx set `server_tokens off;`. In Apache set `ServerSignature Off` and `ServerTokens Prod`.' },
  latency: { title: 'Improve target latency', desc: 'High latency may indicate a far-away CDN edge — consider using a CDN with a closer PoP to your users.' },
}

/* ---------------------------------------------------------------
   Small mock helpers
   --------------------------------------------------------------- */
function pseudoIp(host) {
  if (!host) return '93.184.216.34'
  let h = 0
  for (const ch of host) h = (h * 31 + ch.charCodeAt(0)) & 0xffff
  return `${(h & 255)}.${((h >> 4) & 255)}.${((h >> 6) & 255)}.${((h >> 8) & 255)}`
}
function pickHost(host) {
  const list = ['Cloudflare', 'Amazon AWS', 'Google Cloud', 'Microsoft Azure', 'Vercel', 'Fastly', 'DigitalOcean']
  if (!host) return list[0]
  return list[host.length % list.length]
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function NetworkSecurityTest() {
  const [target, setTarget] = useState('')
  const [phase, setPhase] = useState('idle') // idle | running | done
  const [results, setResults] = useState(() =>
    Object.fromEntries(CHECKS.map((c) => [c.id, { status: 'idle' }])),
  )
  const [currentId, setCurrentId] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const cancelRef = useRef(null)

  const targetType = detectTargetType(target)
  const mode = !target.trim() ? 'self' : targetType === 'unknown' ? 'invalid' : 'remote'
  const host = mode === 'remote' ? extractDomain(target) : null

  const activeChecks = useMemo(() => {
    if (mode === 'self') return CHECKS.filter((c) => !c.requiresUrl)
    return CHECKS.filter((c) => !c.onlySelf)
  }, [mode])

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
    if (target.trim() && mode === 'invalid') {
      setErrorMsg('Please enter a valid URL, domain, or IP address — or leave empty to test this browser.')
      return
    }
    setPhase('running')
    setResults(Object.fromEntries(activeChecks.map((c) => [c.id, { status: 'idle' }])))

    const targetInfo = {
      mode,
      target: normalizeTarget(target),
      type: targetType,
      host,
    }

    cancelRef.current = runChecksSequential(activeChecks, targetInfo, {
      onProgress: (next, runningId) => {
        setResults(next)
        if (runningId !== null) setCurrentId(runningId)
        else setCurrentId(null)
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

  const score = phase === 'done' ? computeScore(activeChecks, results) : null
  const counts = countByStatus(results)
  const sColor = scoreColor(score)
  const sLabel = scoreLabel(score)

  const progress = phase === 'running'
    ? Object.values(results).filter((r) => r.status !== 'idle' && r.status !== 'running').length
    : phase === 'done' ? activeChecks.length : 0

  const recs = useMemo(() => {
    if (phase !== 'done') return []
    return activeChecks
      .filter((c) => {
        const s = results[c.id]?.status
        if (!RECOMMENDATIONS[c.id]) return false
        if (c.id === 'ipv6') return s === 'info'
        return s === 'warn' || s === 'fail'
      })
      .map((c) => ({ ...RECOMMENDATIONS[c.id], severity: results[c.id].status }))
  }, [phase, activeChecks, results])

  const grouped = useMemo(() => {
    const map = {}
    activeChecks.forEach((c) => {
      ;(map[c.group] = map[c.group] || []).push(c)
    })
    return map
  }, [activeChecks])

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
            <span className="tool-hero-tag">🛡️ Network Security · Free Tool</span>
            <h1>Test any network in <span className="accent">60 seconds</span></h1>
            <p>
              Scans your browser <strong>or any URL/IP you enter</strong> for DNS leaks, exposed ports,
              weak TLS, WebRTC leaks, missing security headers, and more — then tells you exactly what to fix.
            </p>

            <form
              className="target-bar"
              onSubmit={(e) => { e.preventDefault(); if (phase !== 'running') startScan() }}
            >
              <div className="target-input-wrap">
                <span className="target-input-icon" aria-hidden>
                  {mode === 'self' ? '💻' : mode === 'invalid' ? '⚠️' : targetType === 'ip' ? '🔢' : '🌐'}
                </span>
                <input
                  type="text"
                  placeholder="example.com, 8.8.8.8, or leave empty to test this browser"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={phase === 'running'}
                  aria-label="Target URL or IP"
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
                  Run Test
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
                  Re-run
                </button>
              )}
            </form>

            <div className="target-meta">
              {mode === 'self'    && <span>📍 Testing this browser&apos;s connection</span>}
              {mode === 'remote'  && <span>🎯 Target: <strong>{host}</strong> · {targetType.toUpperCase()}</span>}
              {mode === 'invalid' && <span style={{ color: '#fca5a5' }}>⚠ Invalid target — enter a URL, domain, or IP</span>}
              <span>· {activeChecks.length} checks will run</span>
            </div>

            {errorMsg && <div className="target-error">{errorMsg}</div>}

            <div className="tool-hero-trust">
              <span>🔒 Runs in your browser</span>
              <span>·</span>
              <span>No data stored</span>
              <span>·</span>
              <span>No sign-up needed</span>
            </div>
          </div>

          <div className="tool-hero-card">
            <div className="score-stack">
              <ScoreRing value={score} color={sColor} />
              <div className="score-stack-label">
                <span className="score-stack-label-main" style={{ color: sColor }}>{sLabel}</span>
                <span className="score-stack-label-sub">
                  {phase === 'idle'    && 'Ready to scan'}
                  {phase === 'running' && `${progress} / ${activeChecks.length} checks done`}
                  {phase === 'done'    && `Based on ${activeChecks.length} checks`}
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
          <div className="tool-progress-bar" style={{ width: `${(progress / activeChecks.length) * 100}%` }} />
        </div>
      )}

      {/* ===== CHECKS ===== */}
      <main className="tool-body">
        <div className="tool-section-head">
          <h2>{phase === 'done' ? 'Detailed Results' : 'What we check'}</h2>
          <p>
            {phase === 'idle'    && `${activeChecks.length} checks across 4 categories. Click Run Test to start.`}
            {phase === 'running' && 'Checks run sequentially. Watch each one light up.'}
            {phase === 'done'    && 'Tap any card for the full detail of that check.'}
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
              <h2>Recommended Fixes</h2>
              <p>Knock these out to bump your score into the green.</p>
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
                  <button type="button" className="rec-action">Show me how →</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {phase === 'done' && recs.length === 0 && (
          <section className="rec-section">
            <div className="rec-celebrate">
              <div className="rec-celebrate-emoji" aria-hidden>🎉</div>
              <h3>{mode === 'self' ? 'Your network looks clean!' : `${host} looks well-secured!`}</h3>
              <p>
                Every check passed. Re-run this test monthly, and explore our{' '}
                <Link to="/guides">security guides</Link> for next-level hardening.
              </p>
            </div>
          </section>
        )}

        <section className="tool-cta-row">
          <div>
            <h3>Want continuous monitoring?</h3>
            <p>Get email alerts when your network exposure changes — free during beta.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/about#contact" className="btn-submit">Join the beta</Link>
            <Link to="/guides" className="btn-secondary">Browse guides</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
