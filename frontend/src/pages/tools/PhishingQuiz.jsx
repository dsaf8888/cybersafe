import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageLayout from '../../components/layout/PageLayout'
import { selectPhishingQuiz } from '../../store/contentSlice'
import { PHISHING_QUESTIONS_DEFAULT, PHISHING_TIERS_DEFAULT } from '../../data/toolContent'
import './tools.css'

/* =============================================================== */
/*  PAGE — content from Redux override or imported defaults         */
/* =============================================================== */

export default function PhishingQuiz() {
  const override = useSelector(selectPhishingQuiz)
  const QUESTIONS = override?.questions || PHISHING_QUESTIONS_DEFAULT
  const TIERS     = override?.tiers     || PHISHING_TIERS_DEFAULT

  const [phase, setPhase] = useState('intro')        // intro | playing | done
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)

  const total   = QUESTIONS.length
  const current = QUESTIONS[index]
  const score   = useMemo(() => answers.filter((a) => a.correct).length, [answers])

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
    if (index + 1 >= total) setPhase('done')
    else setIndex((i) => i + 1)
  }
  function reset() {
    setPhase('intro')
    setIndex(0)
    setAnswers([])
    setShowFeedback(false)
  }

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [phase])

  const tier = useMemo(() => {
    if (phase !== 'done') return null
    return TIERS.find((t) => score >= t.min) || TIERS[TIERS.length - 1]
  }, [phase, score, TIERS])

  const progressPct = phase === 'playing' ? ((index + (showFeedback ? 1 : 0)) / total) * 100 : 0

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
            {phase === 'playing' && current && (
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
            {phase === 'done' && tier && (
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

      <main className="tool-body">
        {phase === 'intro' && (
          <>
            <div className="tool-section-head">
              <h2>What you&apos;ll learn</h2>
              <p>By the end of this 5-minute drill you&apos;ll be able to:</p>
            </div>
            <div className="pw-tips-grid">
              <div className="pw-tip-card"><div className="pw-tip-icon">🔍</div><h4>Inspect any URL in 2 seconds</h4><p>Spot typosquats, lookalike domains, IDN attacks and suspicious subdomain tricks.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">📨</div><h4>Read email headers like a pro</h4><p>Learn what sender domains, greetings and signatures reveal about authenticity.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">⚠️</div><h4>Recognize psychological triggers</h4><p>Urgency, authority, fear of loss — phishers exploit emotion. We&apos;ll show you how.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">📎</div><h4>Identify dangerous attachments</h4><p>.docm, .iso, .lnk and .scr files are red flags. Find out why.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">💬</div><h4>Catch SMS / smishing attacks</h4><p>Delivery notifications, bank alerts, fake 2FA codes — recognize them on your phone.</p></div>
              <div className="pw-tip-card"><div className="pw-tip-icon">🎯</div><h4>Verify a sender safely</h4><p>The right way to confirm a real message without ever clicking the link inside.</p></div>
            </div>
          </>
        )}

        {phase === 'playing' && current && (
          <section className="quiz-stage">
            {current.type === 'email' && (
              <article className="quiz-email">
                <header className="quiz-email-head">
                  <div className="quiz-email-row"><span className="quiz-email-label">From</span><span>{current.from}</span></div>
                  <div className="quiz-email-row"><span className="quiz-email-label">Subject</span><strong>{current.subject}</strong></div>
                </header>
                <div className="quiz-email-body">
                  {(current.body || []).map((line, i) => <p key={i}>{line}</p>)}
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
                  {(current.body || []).map((line, i) => <p key={i}>{line}</p>)}
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
                {(current.redFlags || []).length > 0 && (
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
