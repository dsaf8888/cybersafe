import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import { BreakdownItem, CheckCard, ScoreRing } from './toolComponents'
import { computeScore, countByStatus, scoreColor, scoreLabel } from './toolHelpers'
import './tools.css'

/* ---------------------------------------------------------------
   Browser detection from user-agent. Conservative — we surface the
   browser family and version when reliably parseable.
   --------------------------------------------------------------- */
function detectBrowser(ua) {
  const u = ua || ''
  let name = 'Unknown'
  let version = '?'
  let outdatedBelow = null

  if (/Edg\/(\d+)/.test(u))       { name = 'Edge';    version = u.match(/Edg\/(\d+)/)[1];    outdatedBelow = 120 }
  else if (/OPR\/(\d+)/.test(u))  { name = 'Opera';   version = u.match(/OPR\/(\d+)/)[1];    outdatedBelow = 100 }
  else if (/Firefox\/(\d+)/.test(u)) { name = 'Firefox'; version = u.match(/Firefox\/(\d+)/)[1]; outdatedBelow = 120 }
  else if (/Chrome\/(\d+)/.test(u))  { name = 'Chrome';  version = u.match(/Chrome\/(\d+)/)[1];  outdatedBelow = 120 }
  else if (/Version\/(\d+).*Safari/.test(u)) { name = 'Safari';  version = u.match(/Version\/(\d+)/)[1];  outdatedBelow = 16 }

  const isOutdated = outdatedBelow !== null && Number(version) < outdatedBelow
  return { name, version, isOutdated, outdatedBelow, raw: u }
}

/* ---------------------------------------------------------------
   Canvas fingerprint — approximate uniqueness via hash bucketing.
   --------------------------------------------------------------- */
function canvasFingerprint() {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = "14px 'Arial'"
    ctx.fillStyle = '#069'
    ctx.fillText('CyberSafe FP probe 🔐', 2, 2)
    ctx.strokeStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(120, 25, 18, 0, Math.PI * 2)
    ctx.stroke()
    const data = canvas.toDataURL()
    let h = 0
    for (const ch of data) h = (h * 31 + ch.charCodeAt(0)) & 0xffffffff
    return Math.abs(h).toString(16).slice(0, 10)
  } catch {
    return null
  }
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function BrowserSecurity() {
  const [phase, setPhase] = useState('idle') // idle | scanning | done
  const [results, setResults] = useState({})
  /* Detect once, eagerly, so we don't trigger a setState-in-effect */
  const [browserInfo] = useState(() =>
    typeof navigator !== 'undefined' ? detectBrowser(navigator.userAgent) : null,
  )

  const CHECKS = useMemo(() => buildChecks(browserInfo), [browserInfo])

  function runScan() {
    if (!browserInfo) return
    setPhase('scanning')
    const initial = Object.fromEntries(CHECKS.map((c) => [c.id, { status: 'idle' }]))
    setResults(initial)

    let i = 0
    const next = {}
    function tick() {
      if (i >= CHECKS.length) {
        setResults(next)
        setPhase('done')
        return
      }
      const c = CHECKS[i]
      next[c.id] = { status: 'running' }
      setResults({ ...next })
      setTimeout(() => {
        next[c.id] = c.runner()
        i += 1
        setResults({ ...next })
        setTimeout(tick, 60)
      }, 240)
    }
    tick()
  }

  /* Auto-run once on mount */
  useEffect(() => {
    if (!browserInfo) return undefined
    const t = setTimeout(runScan, 350)
    return () => clearTimeout(t)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

  const score = phase === 'done' ? computeScore(CHECKS, results) : null
  const counts = countByStatus(results)
  const sColor = scoreColor(score)
  const sLabel = scoreLabel(score)

  const progress = Object.values(results).filter((r) => r.status !== 'idle' && r.status !== 'running').length

  const recs = useMemo(() => {
    if (phase !== 'done') return []
    return CHECKS
      .filter((c) => ['warn', 'fail'].includes(results[c.id]?.status) && c.recommendation)
      .map((c) => ({ ...c.recommendation, severity: results[c.id].status }))
  }, [phase, CHECKS, results])

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
            <span className="tool-hero-tag">🌐 Browser Security Checker · Free Tool</span>
            <h1>What does the web know about <span className="accent">your browser?</span></h1>
            <p>
              We run {CHECKS.length} live checks against your browser&apos;s built-in security
              features, privacy settings, and fingerprintability — all client-side. No data leaves
              your device.
            </p>

            {browserInfo && (
              <div className="browser-banner">
                <span className="browser-banner-icon" aria-hidden>
                  {browserInfo.name === 'Chrome'  ? '🟢' :
                   browserInfo.name === 'Firefox' ? '🦊' :
                   browserInfo.name === 'Safari'  ? '🧭' :
                   browserInfo.name === 'Edge'    ? '🅴'  :
                   browserInfo.name === 'Opera'   ? '🅾️' : '🌐'}
                </span>
                <div>
                  <strong>{browserInfo.name} {browserInfo.version}</strong>
                  <span>{browserInfo.isOutdated ? `Outdated — recommended ${browserInfo.outdatedBelow}+` : 'Up-to-date'}</span>
                </div>
                {phase === 'done' && (
                  <button type="button" className="browser-banner-rerun" onClick={runScan}>↻ Re-scan</button>
                )}
              </div>
            )}

            <div className="tool-hero-trust">
              <span>🔒 100% client-side</span>
              <span>·</span>
              <span>No tracking</span>
              <span>·</span>
              <span>Auto-runs on load</span>
            </div>
          </div>

          <div className="tool-hero-card">
            <div className="score-stack">
              <ScoreRing value={score} color={sColor} />
              <div className="score-stack-label">
                <span className="score-stack-label-main" style={{ color: sColor }}>{sLabel}</span>
                <span className="score-stack-label-sub">
                  {phase === 'idle'     && 'Loading…'}
                  {phase === 'scanning' && `${progress} / ${CHECKS.length} checks done`}
                  {phase === 'done'     && `Across ${CHECKS.length} checks`}
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

      {/* ===== PROGRESS ===== */}
      {phase === 'scanning' && (
        <div className="tool-progress">
          <div className="tool-progress-bar" style={{ width: `${(progress / CHECKS.length) * 100}%` }} />
        </div>
      )}

      {/* ===== CHECKS ===== */}
      <main className="tool-body">
        <div className="tool-section-head">
          <h2>{phase === 'done' ? 'Detailed Results' : 'Running checks…'}</h2>
          <p>{phase === 'done' ? 'Tap any card for the full detail.' : 'Live values pulled from your browser\'s real APIs.'}</p>
        </div>

        <div className="check-grid">
          {CHECKS.map((c) => (
            <CheckCard
              key={c.id}
              check={c}
              result={results[c.id] || { status: 'idle' }}
              isActive={results[c.id]?.status === 'running'}
            />
          ))}
        </div>

        {phase === 'done' && recs.length > 0 && (
          <section className="rec-section">
            <div className="tool-section-head">
              <h2>Recommended fixes</h2>
              <p>Each one bumps your score — most take less than a minute.</p>
            </div>
            <div className="rec-list">
              {recs.map((r, i) => (
                <div key={i} className={`rec-card rec-${r.severity}`}>
                  <div className="rec-icon">{r.severity === 'fail' ? '🚨' : '⚠️'}</div>
                  <div className="rec-body">
                    <h4>{r.title}</h4>
                    <p>{r.desc}</p>
                  </div>
                  <button type="button" className="rec-action">Learn how →</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {phase === 'done' && recs.length === 0 && (
          <section className="rec-section">
            <div className="rec-celebrate">
              <div className="rec-celebrate-emoji" aria-hidden>🎉</div>
              <h3>Your browser is well-configured</h3>
              <p>
                Every check passed. Re-run this monthly and explore our{' '}
                <Link to="/guides/browser-privacy-speed">browser privacy guide</Link> for next-level hardening.
              </p>
            </div>
          </section>
        )}

        <section className="tool-cta-row">
          <div>
            <h3>Curious about your network too?</h3>
            <p>Combine this with the Network Security Test for a full client-side audit.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/tools/network-security" className="btn-submit">Network test →</Link>
            <Link to="/tools/account-security-score" className="btn-secondary">Account security score</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}

/* =============================================================== */
/*  CHECK DEFINITIONS                                               */
/* =============================================================== */

function buildChecks(browserInfo) {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  return [
    {
      id: 'browser-version',
      icon: '🌐',
      title: 'Browser Version',
      desc: 'Outdated browsers miss critical security patches.',
      runner: () => {
        if (!browserInfo) return { status: 'info', value: 'Unknown', detail: '' }
        if (browserInfo.isOutdated) {
          return { status: 'fail', value: `${browserInfo.name} ${browserInfo.version}`, detail: `Update to v${browserInfo.outdatedBelow}+` }
        }
        return { status: 'pass', value: `${browserInfo.name} ${browserInfo.version}`, detail: 'Recent and patched' }
      },
      recommendation: { title: 'Update your browser', desc: 'Recent browser versions ship critical CVE patches monthly. Restart your browser after updating to apply.' },
    },
    {
      id: 'https',
      icon: '🔒',
      title: 'HTTPS Connection',
      desc: 'Whether this page is loaded over an encrypted channel.',
      runner: () => isHttps
        ? { status: 'pass', value: 'HTTPS active', detail: 'Page is encrypted in transit' }
        : { status: 'fail', value: 'Plain HTTP', detail: 'Your traffic is readable in transit' },
      recommendation: { title: 'Enable HTTPS-only mode', desc: 'Settings → Privacy & Security → Always use secure connections. Stops accidental HTTP downgrades.' },
    },
    {
      id: 'dnt',
      icon: '🚫',
      title: 'Do Not Track',
      desc: 'Browser-level signal asking sites not to track you.',
      runner: () => {
        const v = navigator.doNotTrack
        const enabled = v === '1' || v === 'yes' || navigator.globalPrivacyControl === true
        return enabled
          ? { status: 'pass',  value: 'Signal sent', detail: 'Browser is requesting opt-out from trackers' }
          : { status: 'warn', value: 'Not enabled', detail: 'Most sites ignore DNT but it doesn\'t hurt to send it' }
      },
      recommendation: { title: 'Turn on Do Not Track + Global Privacy Control', desc: 'Privacy settings → Tracking. Both signals add real legal weight under GDPR/CCPA.' },
    },
    {
      id: 'cookies',
      icon: '🍪',
      title: 'Cookies Enabled',
      desc: 'Cookies are needed for logins, but should be limited.',
      runner: () => navigator.cookieEnabled
        ? { status: 'info', value: 'Enabled', detail: 'Required for sign-in. Block third-party cookies for privacy.' }
        : { status: 'warn', value: 'Disabled', detail: 'Most sites won\'t work without cookies' },
    },
    {
      id: 'fingerprint',
      icon: '👣',
      title: 'Canvas Fingerprint',
      desc: 'A unique signature derived from how your GPU renders text.',
      runner: () => {
        const fp = canvasFingerprint()
        if (!fp) return { status: 'warn', value: 'Blocked', detail: 'Canvas blocked — great for privacy' }
        return { status: 'warn', value: `${fp}…`, detail: 'Trackers can use this without cookies. Use Brave or Firefox\'s resistFingerprinting.' }
      },
      recommendation: { title: 'Reduce browser fingerprint', desc: 'Switch to Brave or set Firefox\'s privacy.resistFingerprinting=true. Avoid niche extensions that add uniqueness.' },
    },
    {
      id: 'language',
      icon: '🌍',
      title: 'Language Headers',
      desc: 'Languages your browser advertises to every site.',
      runner: () => ({
        status: 'info',
        value: (navigator.languages || [navigator.language]).join(', '),
        detail: 'Used to localise sites — also helps fingerprinting',
      }),
    },
    {
      id: 'screen',
      icon: '🖥️',
      title: 'Screen + Device',
      desc: 'Resolution and pixel ratio that sites can read.',
      runner: () => {
        const w = window.screen?.width || 0
        const h = window.screen?.height || 0
        const dpr = window.devicePixelRatio || 1
        return { status: 'info', value: `${w} × ${h} @ ${dpr}x`, detail: 'Available to any page via window.screen' }
      },
    },
    {
      id: 'hardware',
      icon: '🧮',
      title: 'CPU + Platform',
      desc: 'Cores and OS family exposed to every page.',
      runner: () => {
        const cores = navigator.hardwareConcurrency || '?'
        const platform = navigator.platform || 'unknown'
        return { status: 'info', value: `${cores} cores · ${platform}`, detail: 'Helps fingerprinting in a small way' }
      },
    },
    {
      id: 'plugins',
      icon: '🧩',
      title: 'Browser Plugins',
      desc: 'Old plugins (Flash, Java) used to be the #1 attack vector.',
      runner: () => {
        const count = navigator.plugins?.length || 0
        if (count === 0) return { status: 'pass', value: '0 plugins', detail: 'Modern browser — no legacy plugins' }
        return { status: 'warn', value: `${count} plugins`, detail: 'Modern browsers ignore most plugins, but extensions can still leak data' }
      },
    },
    {
      id: 'sw',
      icon: '⚙️',
      title: 'Service Workers',
      desc: 'Enable offline support but can also persist trackers.',
      runner: () => ('serviceWorker' in navigator)
        ? { status: 'info', value: 'Supported', detail: 'Standard in modern browsers' }
        : { status: 'warn', value: 'Not available', detail: 'Old browser detected' },
    },
    {
      id: 'webrtc',
      icon: '📡',
      title: 'WebRTC Available',
      desc: 'Real-time comms API — can leak your local IP.',
      runner: () => {
        const hasRTC = typeof RTCPeerConnection !== 'undefined'
        return hasRTC
          ? { status: 'warn', value: 'Enabled', detail: 'May leak local IP. Disable if you use a VPN.' }
          : { status: 'pass', value: 'Disabled', detail: 'Excellent — no WebRTC leak possible' }
      },
      recommendation: { title: 'Disable WebRTC IP leak', desc: 'uBlock Origin has a "Prevent WebRTC leak" toggle. In Firefox set media.peerconnection.enabled=false.' },
    },
    {
      id: 'storage',
      icon: '💾',
      title: 'Local Storage',
      desc: 'Persistent client storage — easy for trackers to abuse.',
      runner: () => {
        try {
          window.localStorage.setItem('__cs_probe', '1')
          window.localStorage.removeItem('__cs_probe')
          return { status: 'info', value: 'Enabled', detail: 'Required by most modern web apps' }
        } catch {
          return { status: 'pass', value: 'Blocked', detail: 'Strict privacy mode' }
        }
      },
    },
    {
      id: 'permissions',
      icon: '🔔',
      title: 'Notification Permission',
      desc: 'Sites that asked for notifications.',
      runner: () => {
        const p = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
        if (p === 'granted')  return { status: 'warn', value: 'Granted', detail: 'A site can push notifications to you — review periodically' }
        if (p === 'denied')   return { status: 'pass', value: 'Blocked',  detail: 'No notification spam possible' }
        return { status: 'info', value: 'Default', detail: 'Sites must ask before showing notifications' }
      },
    },
    {
      id: 'extensions',
      icon: '🧱',
      title: 'Extensions Hint',
      desc: 'Each extension expands your attack surface.',
      runner: () => ({
        status: 'info',
        value: 'Audit recommended',
        detail: 'Remove extensions you don\'t actively use. Only install from reputable publishers.',
      }),
    },
  ]
}
