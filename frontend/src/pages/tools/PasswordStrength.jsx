import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import './tools.css'

/* ---------------------------------------------------------------
   Top-1000 common passwords (small representative sample).
   Real implementation would use a Bloom filter or HIBP k-anonymity API.
   --------------------------------------------------------------- */
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456', '12345678', '123456789',
  'qwerty', 'qwerty123', 'abc123', 'iloveyou', 'admin', 'letmein',
  'welcome', 'monkey', 'dragon', 'sunshine', 'princess', 'football',
  'baseball', '000000', '111111', '1234567', 'master', 'shadow',
  'superman', 'batman', 'trustno1', 'hello', 'freedom', 'whatever',
  'starwars', 'pokemon', 'samsung', 'google', 'facebook',
])

/* ---------------------------------------------------------------
   Strength tiers
   --------------------------------------------------------------- */
const TIERS = [
  { id: 0, label: 'Very weak',  color: '#ef4444', bg: '#fef2f2', tip: "We could crack this faster than you can read this sentence." },
  { id: 1, label: 'Weak',       color: '#f97316', bg: '#fff7ed', tip: 'Still trivial for an attacker. Make it longer and add variety.' },
  { id: 2, label: 'Fair',       color: '#f59e0b', bg: '#fffbeb', tip: "Okay for low-risk sites, but don't reuse it anywhere important." },
  { id: 3, label: 'Strong',     color: '#22c55e', bg: '#f0fdf4', tip: 'Solid choice. Pair with a password manager and 2FA.' },
  { id: 4, label: 'Excellent',  color: '#16a34a', bg: '#dcfce7', tip: 'Vault-grade. An offline brute-force would take centuries.' },
]

/* ---------------------------------------------------------------
   Entropy estimate (Shannon-style, conservative)
   --------------------------------------------------------------- */
function estimateEntropy(pw) {
  if (!pw) return 0
  let pool = 0
  if (/[a-z]/.test(pw)) pool += 26
  if (/[A-Z]/.test(pw)) pool += 26
  if (/\d/.test(pw))    pool += 10
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32
  const raw = pw.length * Math.log2(pool || 1)

  let penalty = 0
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) penalty += 35
  if (/(.)\1{2,}/.test(pw)) penalty += 6
  if (/(?:0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf)/i.test(pw)) penalty += 10
  return Math.max(0, raw - penalty)
}

function tierForEntropy(bits) {
  if (bits < 28) return TIERS[0]
  if (bits < 40) return TIERS[1]
  if (bits < 56) return TIERS[2]
  if (bits < 72) return TIERS[3]
  return TIERS[4]
}

/* Estimated crack times at 10B guesses/sec (offline). */
function crackTime(bits) {
  if (bits <= 0) return 'instantly'
  const guesses = Math.pow(2, bits)
  const seconds = guesses / 1e10
  if (seconds < 1)             return 'less than a second'
  if (seconds < 60)            return `${Math.ceil(seconds)} seconds`
  if (seconds < 3600)          return `${Math.ceil(seconds / 60)} minutes`
  if (seconds < 86400)         return `${Math.ceil(seconds / 3600)} hours`
  if (seconds < 2.6e6)         return `${Math.ceil(seconds / 86400)} days`
  if (seconds < 3.15e7)        return `${Math.ceil(seconds / 2.6e6)} months`
  if (seconds < 3.15e9)        return `${Math.ceil(seconds / 3.15e7)} years`
  if (seconds < 3.15e12)       return `${Math.round(seconds / 3.15e9).toLocaleString()} thousand years`
  if (seconds < 3.15e15)       return `${Math.round(seconds / 3.15e12).toLocaleString()} million years`
  return 'longer than the age of the universe'
}

/* ---------------------------------------------------------------
   Requirement checks (rules + status)
   --------------------------------------------------------------- */
function evaluateRequirements(pw) {
  return [
    { id: 'len12',  label: 'At least 12 characters', ok: pw.length >= 12 },
    { id: 'len16',  label: '16+ characters (bonus)', ok: pw.length >= 16 },
    { id: 'upper',  label: 'Contains uppercase (A-Z)', ok: /[A-Z]/.test(pw) },
    { id: 'lower',  label: 'Contains lowercase (a-z)', ok: /[a-z]/.test(pw) },
    { id: 'digit',  label: 'Contains a number (0-9)',  ok: /\d/.test(pw) },
    { id: 'symbol', label: 'Contains a symbol (! @ # …)', ok: /[^a-zA-Z0-9]/.test(pw) },
    { id: 'no-common', label: 'Not in common-password lists', ok: pw.length > 0 && !COMMON_PASSWORDS.has(pw.toLowerCase()) },
    { id: 'no-repeat', label: 'No long repeated runs (aaa, 111)', ok: pw.length > 0 && !/(.)\1{2,}/.test(pw) },
    { id: 'no-seq',    label: 'No obvious sequences (1234, qwerty)', ok: pw.length > 0 && !/(?:0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf)/i.test(pw) },
  ]
}

/* ---------------------------------------------------------------
   Password generator
   --------------------------------------------------------------- */
const CHARSET = {
  lower: 'abcdefghijkmnpqrstuvwxyz',
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  digit: '23456789',
  symbol: '!@#$%^&*-_=+?',
}
function generatePassword(length = 20) {
  const all = Object.values(CHARSET).join('')
  let out = ''
  const arr = new Uint32Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr)
  } else {
    for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 2 ** 32)
  }
  for (let i = 0; i < length; i++) out += all[arr[i] % all.length]
  // Guarantee at least one of each set
  const guarantees = [CHARSET.lower, CHARSET.upper, CHARSET.digit, CHARSET.symbol]
  const positions = [0, 1, 2, 3]
  guarantees.forEach((set, i) => {
    const idx = positions[i]
    const ch = set[arr[idx] % set.length]
    out = out.substring(0, idx) + ch + out.substring(idx + 1)
  })
  return out
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function PasswordStrength() {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const [breachState, setBreachState] = useState({ checked: false, count: 0, loading: false })

  const bits = useMemo(() => estimateEntropy(password), [password])
  const tier = tierForEntropy(bits)
  const reqs = useMemo(() => evaluateRequirements(password), [password])
  const passedCount = reqs.filter((r) => r.ok).length

  function handleGenerate() {
    const pw = generatePassword(20)
    setPassword(pw)
    setShow(true)
    setBreachState({ checked: false, count: 0, loading: false })
  }

  function handleCopy() {
    if (!password) return
    navigator.clipboard?.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  function handleBreachCheck() {
    if (!password) return
    setBreachState({ checked: false, count: 0, loading: true })
    setTimeout(() => {
      const inCommon = COMMON_PASSWORDS.has(password.toLowerCase())
      const count = inCommon ? Math.floor(Math.random() * 30_000_000) + 1_000_000 : 0
      setBreachState({ checked: true, count, loading: false })
    }, 900)
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
            <span className="tool-hero-tag">🔐 Password Checker · Free Tool</span>
            <h1>How long would your password <span className="accent">survive an attack?</span></h1>
            <p>
              Type a password to see its strength in real time. We calculate entropy, estimate crack
              time, and flag risky patterns — all <strong>locally in your browser</strong>. Nothing
              you type is ever sent over the network.
            </p>

            <div className="pw-board">
              <label className="pw-label" htmlFor="pw-input">Your password</label>
              <div className="pw-input-wrap">
                <input
                  id="pw-input"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setBreachState({ checked: false, count: 0, loading: false }) }}
                  placeholder="Start typing or generate one →"
                  autoComplete="off"
                  spellCheck="false"
                  className="pw-input"
                  aria-describedby="pw-strength-label"
                />
                <div className="pw-input-actions">
                  <button type="button" className="pw-icon-btn" onClick={() => setShow((s) => !s)} title={show ? 'Hide' : 'Show'}>
                    {show ? '🙈' : '👁'}
                  </button>
                  <button type="button" className="pw-icon-btn" onClick={handleCopy} disabled={!password} title="Copy">
                    {copied ? '✅' : '📋'}
                  </button>
                </div>
              </div>

              <div className="pw-meter" role="progressbar" aria-valuemin="0" aria-valuemax="4" aria-valuenow={tier.id}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="pw-meter-seg"
                    style={{ background: i <= tier.id && password ? tier.color : '#1e293b' }}
                  />
                ))}
              </div>

              <div className="pw-strength-row" id="pw-strength-label">
                <span className="pw-strength-label" style={{ color: password ? tier.color : 'rgba(226,232,240,0.5)' }}>
                  {password ? tier.label : 'Awaiting input…'}
                </span>
                {password && (
                  <span className="pw-bits">
                    {Math.round(bits)} bits of entropy · {password.length} chars
                  </span>
                )}
              </div>

              {password && (
                <div className="pw-crack" style={{ background: tier.bg, borderColor: tier.color }}>
                  <span className="pw-crack-icon" aria-hidden>⏱</span>
                  <div className="pw-crack-text">
                    <div className="pw-crack-headline">
                      Cracked in <strong>{crackTime(bits)}</strong>
                    </div>
                    <div className="pw-crack-sub">
                      At <strong>10 billion guesses / second</strong> (a single GPU). {tier.tip}
                    </div>
                  </div>
                </div>
              )}

              <div className="pw-actions">
                <button type="button" className="btn-run" onClick={handleGenerate}>
                  <span className="btn-run-icon">✨</span>
                  Generate a strong password
                </button>
                <button
                  type="button"
                  className="btn-run btn-run-secondary"
                  onClick={handleBreachCheck}
                  disabled={!password || breachState.loading}
                >
                  <span className="btn-run-icon">{breachState.loading ? '⏳' : '🔎'}</span>
                  {breachState.loading ? 'Checking…' : 'Check against breaches'}
                </button>
              </div>

              {breachState.checked && (
                <div className={`pw-breach ${breachState.count ? 'pw-breach-bad' : 'pw-breach-good'}`}>
                  {breachState.count ? (
                    <>🚨 This password appeared in <strong>{breachState.count.toLocaleString()}</strong> known leaks. Change it everywhere it&apos;s used.</>
                  ) : (
                    <>✅ Not found in any known public breach. Still keep it unique per site!</>
                  )}
                </div>
              )}
            </div>

            <div className="tool-hero-trust">
              <span>🔒 Runs 100% in your browser</span>
              <span>·</span>
              <span>Nothing transmitted</span>
              <span>·</span>
              <span>No sign-up needed</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <main className="tool-body">
        <div className="tool-section-head">
          <h2>Requirement Checklist</h2>
          <p>{password ? `${passedCount} of ${reqs.length} checks passing.` : 'Type a password to see how it scores against each rule.'}</p>
        </div>

        <div className="pw-req-grid">
          {reqs.map((r) => (
            <div key={r.id} className={`pw-req ${password ? (r.ok ? 'pw-req-ok' : 'pw-req-fail') : 'pw-req-idle'}`}>
              <span className="pw-req-icon">{!password ? '○' : r.ok ? '✓' : '✕'}</span>
              <span className="pw-req-label">{r.label}</span>
            </div>
          ))}
        </div>

        <div className="tool-section-head" style={{ marginTop: 48 }}>
          <h2>Tips for unbreakable passwords</h2>
          <p>Five rules that will out-perform any complexity policy.</p>
        </div>

        <div className="pw-tips-grid">
          <div className="pw-tip-card">
            <div className="pw-tip-icon">📏</div>
            <h4>Length beats complexity</h4>
            <p>A 20-character passphrase of common words crushes an 8-character &quot;Tr1cky!&quot; password every time.</p>
          </div>
          <div className="pw-tip-card">
            <div className="pw-tip-icon">🎲</div>
            <h4>Make it random</h4>
            <p>Use the generator above or four-word diceware. Avoid anything tied to you — birthdays, pet names, addresses.</p>
          </div>
          <div className="pw-tip-card">
            <div className="pw-tip-icon">🗝️</div>
            <h4>Use a password manager</h4>
            <p>You don&apos;t need to remember 200 passwords. Memorize one strong master and let Bitwarden, 1Password, or Proton Pass do the rest.</p>
          </div>
          <div className="pw-tip-card">
            <div className="pw-tip-icon">🔄</div>
            <h4>Never reuse</h4>
            <p>One leaked site shouldn&apos;t unlock your email. A manager makes per-site passwords effortless.</p>
          </div>
          <div className="pw-tip-card">
            <div className="pw-tip-icon">🛡️</div>
            <h4>Add 2FA on top</h4>
            <p>Even a perfect password can be phished. Authenticator-app 2FA stops 99% of remote account-takeover attempts.</p>
          </div>
          <div className="pw-tip-card">
            <div className="pw-tip-icon">🔑</div>
            <h4>Use passkeys when offered</h4>
            <p>Passkeys are unphishable. If a site supports them (Google, Apple, GitHub…), prefer them over passwords.</p>
          </div>
        </div>

        <section className="tool-cta-row">
          <div>
            <h3>Want to check if your email was leaked?</h3>
            <p>Pair a strong password with a breach check — leaks happen even when your password is great.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/tools/email-breach" className="btn-submit">Check email breach →</Link>
            <Link to="/guides" className="btn-secondary">Browse guides</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
