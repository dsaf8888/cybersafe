import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../../components/layout/PageLayout'
import './tools.css'

/* ---------------------------------------------------------------
   QUESTION BANK — each question shows a realistic artefact and
   asks the user whether it's safe or a phishing attempt.
   --------------------------------------------------------------- */

const QUESTIONS = [
  {
    id: 'q1',
    type: 'email',
    isPhish: true,
    from: 'Apple Support <support@app1e-id.com>',
    subject: 'Your Apple ID has been locked',
    body: [
      'Dear Customer,',
      'We detected unusual sign-in activity. To prevent unauthorized access, your Apple ID has been temporarily locked.',
      'Please verify your identity within 24 hours or your account will be permanently disabled.',
      'Verify now: https://app1e-id.com/verify',
      'Apple Inc. — © 2024',
    ],
    why: 'The sender domain "app1e-id.com" uses a numeral "1" instead of the letter "l" — a classic typosquat. Apple never asks you to verify via a third-party domain.',
    redFlags: ['Lookalike sender domain', 'Urgency / 24-hour deadline', 'Generic greeting', 'Non-Apple verification URL'],
  },
  {
    id: 'q2',
    type: 'email',
    isPhish: false,
    from: 'GitHub <noreply@github.com>',
    subject: '[GitHub] A new SSH key was added to your account',
    body: [
      'Hi octocat,',
      'A new SSH key was added to your account: "MacBook-Pro" (SHA256:8j9k…)',
      'If you did not authorize this action, immediately revoke the key from your security settings: https://github.com/settings/keys',
      "If this was you, you can safely ignore this email.",
    ],
    why: 'Legitimate transactional email: addresses you by username, links to the real github.com domain, and gives a clear action without using fear tactics.',
    redFlags: [],
  },
  {
    id: 'q3',
    type: 'url',
    isPhish: true,
    url: 'https://amaz0n.com.secure-login.ru/signin?ref=order',
    why: 'The actual domain is "secure-login.ru", not amazon.com. Phishers often hide the real domain in front of subdomains. Always read URLs right-to-left.',
    redFlags: ['Real domain is .ru, not .com', 'Brand name in subdomain only', 'Numeric substitution (amaz0n)'],
  },
  {
    id: 'q4',
    type: 'url',
    isPhish: false,
    url: 'https://accounts.google.com/o/oauth2/auth?client_id=123&redirect_uri=…',
    why: 'The domain is accounts.google.com — Google\'s legitimate OAuth host. Long query strings are normal for OAuth flows.',
    redFlags: [],
  },
  {
    id: 'q5',
    type: 'email',
    isPhish: true,
    from: 'HR Department <hr@payro11.benefits.co>',
    subject: 'URGENT: New 2024 W-2 form requires immediate action',
    body: [
      'Hello,',
      'Per IRS update, all employees must download and re-submit the attached W-2 form by end of day.',
      'Failure to comply will result in payroll suspension.',
      '[ Open attachment: W-2_Form_2024.docm ]',
      'Thank you,',
      'HR',
    ],
    why: 'Unfamiliar sender domain, extreme urgency, threats of consequence, and a .docm macro attachment — all hallmarks of an invoice/payroll phish.',
    redFlags: ['Unknown domain (payro11.benefits.co)', '.docm attachment can run macros', 'Threats and urgency', 'No personal greeting'],
  },
  {
    id: 'q6',
    type: 'email',
    isPhish: false,
    from: 'Slack <feedback@slack.com>',
    subject: 'Your weekly Slack digest',
    body: [
      'Hi Sarah,',
      'You missed 14 messages across 3 channels this week. Top channel: #engineering (8 messages).',
      'Catch up: https://yourcompany.slack.com',
      'You can change notification preferences in Slack settings.',
    ],
    why: 'A typical product digest from a known sender, links to your own workspace subdomain. No call-to-action that asks for credentials.',
    redFlags: [],
  },
  {
    id: 'q7',
    type: 'sms',
    isPhish: true,
    from: '+1 (415) 555-0100',
    body: [
      'USPS: Your package #US98231 is on hold due to incomplete address. Confirm details: https://bit.ly/uspsdelivery',
    ],
    why: 'USPS never texts you with shortened URLs. Smishing attacks exploit common delivery anxiety. Real tracking links use usps.com or your carrier\'s domain.',
    redFlags: ['Shortened URL hides destination', 'Unfamiliar sender number', 'Common smishing pretext (delivery)', 'No real tracking number format'],
  },
  {
    id: 'q8',
    type: 'url',
    isPhish: true,
    url: 'https://xn--pple-43d.com/account',
    why: 'This is a Punycode (IDN) attack — "xn--pple-43d.com" renders as "applé.com" in many browsers, looking nearly identical to apple.com. Hover and inspect the raw URL.',
    redFlags: ['Punycode (xn--) prefix', 'Imitates well-known brand', 'Generic /account path'],
  },
  {
    id: 'q9',
    type: 'email',
    isPhish: true,
    from: 'IT Helpdesk <admin@helpdesk-portal.com>',
    subject: 'Mailbox storage is 99% full — action required',
    body: [
      'Dear user,',
      'Your mailbox has exceeded the storage quota. To avoid losing emails, please re-validate your account.',
      'Re-validate here: https://helpdesk-portal.com/owa-login',
      'IT Department',
    ],
    why: 'Mailbox-quota phishing is one of the most common corporate phish patterns. The link goes to a third-party domain that mimics Outlook Web Access (OWA).',
    redFlags: ['Third-party domain mimicking IT', 'Generic "Dear user"', 'Quota / fear-of-loss pretext', 'OWA lookalike URL'],
  },
  {
    id: 'q10',
    type: 'email',
    isPhish: false,
    from: 'Stripe <receipts@stripe.com>',
    subject: 'Your receipt from Acme, Inc. #1234-5678',
    body: [
      'Amount paid: $29.00',
      'Date: May 12, 2026',
      'Payment method: Visa ending in 4242',
      'View receipt: https://invoice.stripe.com/i/acct_1234/test_abc',
      'Questions? Reply to this email or contact merchant.',
    ],
    why: 'Real Stripe receipt: comes from stripe.com, links to invoice.stripe.com, contains specific transactional detail (card last-4, amount, date). No credential request.',
    redFlags: [],
  },
]

const TIERS = [
  { min: 9,  label: 'Phishing Expert',   color: '#16a34a', desc: 'You spot threats most people miss. You could train your team.' },
  { min: 7,  label: 'Defender',          color: '#22c55e', desc: "Solid instincts. A few tricks slipped through — keep practicing." },
  { min: 5,  label: 'Aware',             color: '#f59e0b', desc: "You're catching the obvious stuff, but sophisticated phish would still get you. Review the misses." },
  { min: 3,  label: 'At Risk',           color: '#f97316', desc: 'You missed several attacks that would compromise an account. Read our guides before clicking another link.' },
  { min: 0,  label: 'Easy Target',       color: '#ef4444', desc: 'An attacker would have a field day. Take our phishing-awareness training — seriously.' },
]

function tierFor(score) {
  return TIERS.find((t) => score >= t.min)
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function PhishingQuiz() {
  const [phase, setPhase] = useState('intro') // intro | playing | done
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)

  const total = QUESTIONS.length
  const current = QUESTIONS[index]
  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers])

  function start() {
    setPhase('playing')
    setIndex(0)
    setAnswers([])
    setShowFeedback(false)
  }

  function answer(saidPhish) {
    if (showFeedback) return
    const correct = saidPhish === current.isPhish
    setLastCorrect(correct)
    setShowFeedback(true)
    setAnswers((prev) => [...prev, { id: current.id, answeredPhish: saidPhish, correct }])
  }

  function next() {
    setShowFeedback(false)
    if (index + 1 >= total) {
      setPhase('done')
    } else {
      setIndex((i) => i + 1)
    }
  }

  function reset() {
    setPhase('intro')
    setIndex(0)
    setAnswers([])
    setShowFeedback(false)
  }

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [phase])

  const tier = phase === 'done' ? tierFor(score) : null
  const progressPct = phase === 'playing' ? ((index + (showFeedback ? 1 : 0)) / total) * 100 : 0

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
            <span className="tool-hero-tag">🎣 Phishing Awareness · Free Quiz</span>
            {phase === 'intro' && (
              <>
                <h1>Can you <span className="accent">spot a phishing attack?</span></h1>
                <p>
                  We&apos;ll show you {total} real-world examples — emails, URLs, and text messages —
                  and you decide which are safe and which are phishing. You&apos;ll get instant
                  feedback after each one explaining the red flags to watch for.
                </p>
              </>
            )}
            {phase === 'playing' && (
              <>
                <h1>Question {index + 1} of {total}</h1>
                <p>Look at the {current.type === 'email' ? 'email' : current.type === 'sms' ? 'text message' : 'URL'} below. Would you trust it?</p>
                <div className="quiz-progress">
                  <div className="quiz-progress-bar" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="quiz-progress-meta">
                  <span>Score so far: <strong>{score}</strong> / {answers.length}</span>
                </div>
              </>
            )}
            {phase === 'done' && (
              <>
                <h1>You scored <span className="accent" style={{ color: tier.color }}>{score} / {total}</span></h1>
                <p>{tier.desc}</p>
              </>
            )}

            {phase === 'intro' && (
              <div className="pw-actions" style={{ marginTop: 8 }}>
                <button type="button" className="btn-run" onClick={start}>
                  <span className="btn-run-icon">▶</span>
                  Start the quiz
                </button>
                <Link to="/guides" className="btn-run btn-run-secondary">
                  <span className="btn-run-icon">📚</span>
                  Read the guides first
                </Link>
              </div>
            )}

            <div className="tool-hero-trust">
              <span>⏱ 5 minutes</span>
              <span>·</span>
              <span>{total} real-world scenarios</span>
              <span>·</span>
              <span>Free · No sign-up</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <main className="tool-body">
        {phase === 'intro' && (
          <>
            <div className="tool-section-head">
              <h2>What you&apos;ll learn</h2>
              <p>By the end of this 5-minute drill you&apos;ll be able to:</p>
            </div>
            <div className="pw-tips-grid">
              <div className="pw-tip-card">
                <div className="pw-tip-icon">🔍</div>
                <h4>Inspect any URL in 2 seconds</h4>
                <p>Spot typosquats, lookalike domains, IDN attacks and suspicious subdomain tricks.</p>
              </div>
              <div className="pw-tip-card">
                <div className="pw-tip-icon">📨</div>
                <h4>Read email headers like a pro</h4>
                <p>Learn what sender domains, greetings and signatures reveal about authenticity.</p>
              </div>
              <div className="pw-tip-card">
                <div className="pw-tip-icon">⚠️</div>
                <h4>Recognize psychological triggers</h4>
                <p>Urgency, authority, fear of loss — phishers exploit emotion. We&apos;ll show you how.</p>
              </div>
              <div className="pw-tip-card">
                <div className="pw-tip-icon">📎</div>
                <h4>Identify dangerous attachments</h4>
                <p>.docm, .iso, .lnk and .scr files are red flags. Find out why.</p>
              </div>
              <div className="pw-tip-card">
                <div className="pw-tip-icon">💬</div>
                <h4>Catch SMS / smishing attacks</h4>
                <p>Delivery notifications, bank alerts, fake 2FA codes — recognize them on your phone.</p>
              </div>
              <div className="pw-tip-card">
                <div className="pw-tip-icon">🎯</div>
                <h4>Verify a sender safely</h4>
                <p>The right way to confirm a real message without ever clicking the link inside.</p>
              </div>
            </div>
          </>
        )}

        {phase === 'playing' && current && (
          <section className="quiz-stage">
            {/* SCENARIO ARTEFACT */}
            {current.type === 'email' && (
              <article className="quiz-email">
                <header className="quiz-email-head">
                  <div className="quiz-email-row"><span className="quiz-email-label">From</span><span>{current.from}</span></div>
                  <div className="quiz-email-row"><span className="quiz-email-label">Subject</span><strong>{current.subject}</strong></div>
                </header>
                <div className="quiz-email-body">
                  {current.body.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </article>
            )}

            {current.type === 'sms' && (
              <article className="quiz-sms">
                <div className="quiz-sms-head">
                  <span className="quiz-sms-icon">💬</span>
                  <div>
                    <strong>{current.from}</strong>
                    <span>Today · 10:42 AM</span>
                  </div>
                </div>
                <div className="quiz-sms-bubble">
                  {current.body.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </article>
            )}

            {current.type === 'url' && (
              <article className="quiz-url">
                <div className="quiz-url-chrome">
                  <span className="quiz-url-dot" style={{ background: '#fb7185' }} />
                  <span className="quiz-url-dot" style={{ background: '#fbbf24' }} />
                  <span className="quiz-url-dot" style={{ background: '#34d399' }} />
                </div>
                <div className="quiz-url-bar">
                  <span className="quiz-url-lock">🔒</span>
                  <code>{current.url}</code>
                </div>
                <div className="quiz-url-preview">
                  <div className="quiz-url-preview-skeleton" />
                  <div className="quiz-url-preview-skeleton short" />
                  <div className="quiz-url-preview-skeleton" />
                </div>
              </article>
            )}

            {/* ANSWER BUTTONS */}
            {!showFeedback && (
              <div className="quiz-answers">
                <button type="button" className="quiz-btn quiz-btn-safe" onClick={() => answer(false)}>
                  <span className="quiz-btn-icon">✅</span>
                  <div>
                    <strong>Looks legit</strong>
                    <span>I would trust this</span>
                  </div>
                </button>
                <button type="button" className="quiz-btn quiz-btn-phish" onClick={() => answer(true)}>
                  <span className="quiz-btn-icon">🎣</span>
                  <div>
                    <strong>It&apos;s phishing</strong>
                    <span>Something feels off</span>
                  </div>
                </button>
              </div>
            )}

            {/* FEEDBACK */}
            {showFeedback && (
              <div className={`quiz-feedback ${lastCorrect ? 'quiz-feedback-ok' : 'quiz-feedback-bad'}`}>
                <div className="quiz-feedback-head">
                  <span className="quiz-feedback-emoji">{lastCorrect ? '🎉' : '😬'}</span>
                  <div>
                    <h3>{lastCorrect ? 'Correct!' : 'Not quite.'}</h3>
                    <p>This message is <strong>{current.isPhish ? 'phishing' : 'legitimate'}</strong>.</p>
                  </div>
                </div>
                <p className="quiz-feedback-why">{current.why}</p>
                {current.redFlags.length > 0 && (
                  <div className="quiz-flags">
                    <span className="quiz-flags-label">Red flags to watch for</span>
                    <div className="quiz-flags-list">
                      {current.redFlags.map((f) => (
                        <span key={f} className="quiz-flag">🚩 {f}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button type="button" className="btn-run" onClick={next}>
                  <span className="btn-run-icon">{index + 1 >= total ? '🏁' : '→'}</span>
                  {index + 1 >= total ? 'See my score' : 'Next question'}
                </button>
              </div>
            )}
          </section>
        )}

        {phase === 'done' && tier && (
          <>
            <section className={`verdict-banner verdict-${score >= 8 ? 'safe' : score >= 5 ? 'caution' : 'danger'}`}>
              <div className="verdict-icon" aria-hidden>
                {score >= 8 ? '🏆' : score >= 5 ? '🛡️' : '⚠️'}
              </div>
              <div className="verdict-body">
                <div className="verdict-eyebrow">YOUR RANK</div>
                <h2 style={{ color: tier.color }}>{tier.label}</h2>
                <p>{tier.desc}</p>
              </div>
              <div className="verdict-stats">
                <div className="verdict-stat"><strong>{score}</strong><span>/ {total} correct</span></div>
                <div className="verdict-stat"><strong>{Math.round((score / total) * 100)}%</strong><span>accuracy</span></div>
              </div>
            </section>

            <div className="tool-section-head">
              <h2>Review every question</h2>
              <p>See where you nailed it — and where to brush up.</p>
            </div>

            <div className="quiz-review-list">
              {QUESTIONS.map((q, i) => {
                const ans = answers[i]
                return (
                  <div key={q.id} className={`quiz-review-item ${ans?.correct ? 'ok' : 'bad'}`}>
                    <div className="quiz-review-num">{i + 1}</div>
                    <div className="quiz-review-body">
                      <div className="quiz-review-row">
                        <span className={`quiz-review-tag ${q.isPhish ? 'tag-phish' : 'tag-safe'}`}>
                          {q.isPhish ? 'Phishing' : 'Legitimate'}
                        </span>
                        <span className="quiz-review-type">{q.type === 'email' ? '📨 Email' : q.type === 'sms' ? '💬 SMS' : '🔗 URL'}</span>
                        <span className={`quiz-review-result ${ans?.correct ? 'ok' : 'bad'}`}>
                          {ans?.correct ? '✓ Correct' : '✕ Missed'}
                        </span>
                      </div>
                      <div className="quiz-review-title">
                        {q.type === 'url' ? <code>{q.url}</code> : (q.subject || q.body?.[0])}
                      </div>
                      <p className="quiz-review-why">{q.why}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pw-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
              <button type="button" className="btn-run" onClick={start}>
                <span className="btn-run-icon">↻</span>
                Take the quiz again
              </button>
              <button type="button" className="btn-run btn-run-secondary" onClick={reset}>
                <span className="btn-run-icon">⏎</span>
                Back to intro
              </button>
            </div>
          </>
        )}

        <section className="tool-cta-row">
          <div>
            <h3>Want phishing-awareness training for your team?</h3>
            <p>Quarterly simulated phishing campaigns + tracking dashboards. Coming soon.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/about#contact" className="btn-submit">Get notified</Link>
            <Link to="/guides" className="btn-secondary">Browse guides</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
