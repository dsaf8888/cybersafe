import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageLayout from '../../components/layout/PageLayout'
import { ScoreRing } from './toolComponents'
import { scoreColor, scoreLabel } from './toolHelpers'
import { selectWifiSafety } from '../../store/contentSlice'
import {
  WIFI_NETWORK_TYPES_DEFAULT,
  WIFI_QUESTIONS_DEFAULT,
  WIFI_RECS_DEFAULT,
} from '../../data/toolContent'
import './tools.css'

/* =============================================================== */
/*  PAGE — content from Redux override or imported defaults         */
/* =============================================================== */

export default function WiFiSafetyChecker() {
  const override = useSelector(selectWifiSafety)
  const NETWORK_TYPES = override?.networkTypes || WIFI_NETWORK_TYPES_DEFAULT
  const QUESTIONS     = override?.questions    || WIFI_QUESTIONS_DEFAULT
  const RECS          = override?.recs         || WIFI_RECS_DEFAULT

  const [type, setType]       = useState(null)
  const [answers, setAnswers] = useState({})

  const questions      = useMemo(() => (type ? (QUESTIONS[type] || []) : []), [type, QUESTIONS])
  const answeredCount  = Object.keys(answers).length
  const totalQuestions = questions.length
  const done           = totalQuestions > 0 && answeredCount === totalQuestions

  const { score, byQuestion } = useMemo(() => {
    if (questions.length === 0) return { score: null, byQuestion: {} }
    let total = 0
    let max = 0
    const map = {}
    questions.forEach((q) => {
      max += 10
      const opt = q.opts.find((o) => o.id === answers[q.id])
      if (opt) {
        total += opt.score
        map[q.id] = opt
      }
    })
    return { score: Math.round((total / max) * 100), byQuestion: map }
  }, [questions, answers])

  const sColor = scoreColor(done ? score : null)
  const sLabel = scoreLabel(done ? score : null)

  function pickType(t)        { setType(t); setAnswers({}) }
  function answer(qid, oid)   { setAnswers((a) => ({ ...a, [qid]: oid })) }

  const recs = useMemo(() => {
    if (!done) return []
    return questions
      .map((q) => {
        const opt = byQuestion[q.id]
        if (!opt) return null
        if (opt.score >= 7) return null
        const r = RECS[q.id]
        if (!r) return null
        return { ...r, severity: opt.score === 0 ? 'fail' : 'warn' }
      })
      .filter(Boolean)
  }, [done, questions, byQuestion, RECS])

  const progress = totalQuestions === 0 ? 0 : (answeredCount / totalQuestions) * 100
  const activeType = type ? NETWORK_TYPES.find((n) => n.id === type) : null

  return (
    <PageLayout>
      <header className="tool-hero">
        <div className="tool-hero-bg" aria-hidden>
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="grid-bg" />
        </div>
        <div className="tool-hero-inner">
          <div className="tool-hero-text">
            <span className="tool-hero-tag">📶 WiFi Safety Checker · Free Tool</span>
            <h1>Is the WiFi you&apos;re on <span className="accent">actually safe?</span></h1>
            <p>
              Browsers can&apos;t see WiFi encryption directly, so we ask a few quick questions about
              your network. We then give you a tailored score and the exact settings to harden it.
            </p>

            {!type && (
              <div className="platform-pick">
                {NETWORK_TYPES.map((nt) => (
                  <button key={nt.id} type="button" className="platform-card" onClick={() => pickType(nt.id)}>
                    <span className="platform-icon">{nt.icon}</span>
                    <strong>{nt.label}</strong>
                    <span className="platform-desc">{nt.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {activeType && (
              <div className="wifi-context-banner">
                <span aria-hidden style={{ fontSize: '1.4rem' }}>{activeType.icon}</span>
                <div>
                  <strong>{activeType.label}</strong>
                  <span>{activeType.desc}</span>
                </div>
                <button type="button" className="wifi-context-change" onClick={() => pickType(null)}>Change</button>
              </div>
            )}

            {type && (
              <div className="survey-progress">
                <div className="survey-progress-row">
                  <span><strong>{answeredCount}</strong> / {totalQuestions} answered</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="survey-progress-bar">
                  <div className="survey-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="tool-hero-trust">
              <span>🔒 100% private</span>
              <span>·</span>
              <span>No data leaves your browser</span>
            </div>
          </div>

          <div className="tool-hero-card">
            <div className="score-stack">
              <ScoreRing value={done ? score : null} color={sColor} />
              <div className="score-stack-label">
                <span className="score-stack-label-main" style={{ color: sColor }}>{sLabel}</span>
                <span className="score-stack-label-sub">
                  {!type           && 'Pick a network type to start'}
                  {type && !done   && `${answeredCount} / ${totalQuestions} answered`}
                  {done            && `Across ${totalQuestions} checks`}
                </span>
              </div>
            </div>
            {done && (
              <div className="wifi-summary">
                <div className="wifi-summary-row"><span>✅ Good</span><strong>{Object.values(byQuestion).filter((o) => o.score >= 7).length}</strong></div>
                <div className="wifi-summary-row"><span>⚠️ Improve</span><strong>{Object.values(byQuestion).filter((o) => o.score > 0 && o.score < 7).length}</strong></div>
                <div className="wifi-summary-row"><span>🚨 Risky</span><strong>{Object.values(byQuestion).filter((o) => o.score === 0).length}</strong></div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="tool-body">
        {!type && (
          <div className="rec-celebrate" style={{ marginBottom: 0 }}>
            <div className="rec-celebrate-emoji" aria-hidden>👆</div>
            <h3>Pick your network type to begin</h3>
            <p>Different networks have different threat profiles — we tailor the questions accordingly.</p>
          </div>
        )}

        {type && (
          <>
            <div className="tool-section-head">
              <h2>Quick safety check</h2>
              <p>{done ? 'Adjust any answer and your score updates live.' : 'Pick the option closest to your reality.'}</p>
            </div>

            <div className="survey-questions">
              {questions.map((q) => (
                <div key={q.id} className="survey-question">
                  <div className="survey-question-text">{q.q}</div>
                  <div className="survey-options">
                    {q.opts.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={`survey-option ${answers[q.id] === o.id ? 'active' : ''}`}
                        onClick={() => answer(q.id, o.id)}
                      >
                        <span className="survey-option-dot" />
                        <span>{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {done && recs.length > 0 && (
              <section className="rec-section" style={{ marginTop: 40 }}>
                <div className="tool-section-head">
                  <h2>Recommended improvements</h2>
                  <p>Each one bumps your score. Most take less than 5 minutes in the router admin.</p>
                </div>
                <div className="rec-list">
                  {recs.map((r, i) => (
                    <div key={i} className={`rec-card rec-${r.severity}`}>
                      <div className="rec-icon">{r.severity === 'fail' ? '🚨' : '⚠️'}</div>
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

            {done && recs.length === 0 && (
              <section className="rec-section">
                <div className="rec-celebrate">
                  <div className="rec-celebrate-emoji" aria-hidden>🎉</div>
                  <h3>Your network looks well-secured!</h3>
                  <p>Every check is in the green zone. Re-check after any router firmware update or major change.</p>
                </div>
              </section>
            )}
          </>
        )}

        <section className="tool-cta-row">
          <div>
            <h3>Want to test the network itself?</h3>
            <p>Run our active Network Security Test for DNS, TLS, open-port and header checks.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/tools/network-security" className="btn-submit">Run network test →</Link>
            <Link to="/guides/dns-level-ad-blocking" className="btn-secondary">DNS hardening guide</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
