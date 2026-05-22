import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageLayout from '../../components/layout/PageLayout'
import { BreakdownItem, ScoreRing } from './toolComponents'
import { scoreColor, scoreLabel } from './toolHelpers'
import { selectAccountScore } from '../../store/contentSlice'
import {
  ACCOUNT_BASIC_DEFAULT,
  ACCOUNT_ADVANCED_DEFAULT,
  ACCOUNT_RECOMMENDATIONS_DEFAULT,
} from '../../data/toolContent'
import './tools.css'

/* =============================================================== */
/*  PAGE                                                            */
/*  Content is editable via /set-content — overrides come from      */
/*  the Redux contentSlice, falling back to the defaults imported   */
/*  from src/data/toolContent.js.                                   */
/* =============================================================== */

export default function AccountSecurityScore() {
  const override = useSelector(selectAccountScore)
  const CATEGORIES          = override?.basic           || ACCOUNT_BASIC_DEFAULT
  const ADVANCED_CATEGORIES = override?.advanced        || ACCOUNT_ADVANCED_DEFAULT
  const RECOMMENDATIONS     = override?.recommendations || ACCOUNT_RECOMMENDATIONS_DEFAULT

  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [advancedLoaded, setAdvancedLoaded] = useState(false)

  const activeCategories = useMemo(
    () => (advancedLoaded ? [...CATEGORIES, ...ADVANCED_CATEGORIES] : CATEGORIES),
    [advancedLoaded, CATEGORIES, ADVANCED_CATEGORIES],
  )

  const allQuestions = useMemo(
    () => activeCategories.flatMap((c) => c.questions.map((q) => ({ ...q, categoryId: c.id }))),
    [activeCategories],
  )

  const answeredCount = useMemo(
    () => allQuestions.filter((q) => answers[q.id]).length,
    [allQuestions, answers],
  )
  const totalQuestions = allQuestions.length
  const progress = totalQuestions === 0 ? 0 : (answeredCount / totalQuestions) * 100

  const { score, byCategory, worstCategories } = useMemo(() => {
    let total = 0
    let max = 0
    const cats = {}
    activeCategories.forEach((c) => {
      let cTotal = 0
      let cMax = 0
      c.questions.forEach((q) => {
        const optionMax = Math.max(...q.options.map((o) => o.score))
        cMax += optionMax
        max += optionMax
        const chosen = answers[q.id]
        const opt = q.options.find((o) => o.id === chosen)
        if (opt) {
          cTotal += opt.score
          total += opt.score
        }
      })
      cats[c.id] = { score: cMax === 0 ? 0 : Math.round((cTotal / cMax) * 100), absolute: cTotal, max: cMax }
    })
    const pct = max === 0 ? 0 : Math.round((total / max) * 100)
    const worst = Object.entries(cats)
      .filter(([, v]) => v.score < 70)
      .sort(([, a], [, b]) => a.score - b.score)
      .map(([id]) => id)
    return { score: pct, byCategory: cats, worstCategories: worst }
  }, [answers, activeCategories])

  function answer(qid, oid) { setAnswers((a) => ({ ...a, [qid]: oid })) }
  function submit() { setSubmitted(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function reset() { setAnswers({}); setSubmitted(false); setAdvancedLoaded(false) }
  function toggleAdvanced() {
    if (advancedLoaded) {
      const advancedIds = new Set(ADVANCED_CATEGORIES.flatMap((c) => c.questions.map((q) => q.id)))
      setAnswers((a) => {
        const next = { ...a }
        advancedIds.forEach((id) => delete next[id])
        return next
      })
      setAdvancedLoaded(false)
    } else {
      setAdvancedLoaded(true)
      setSubmitted(false)
      setTimeout(() => {
        const first = ADVANCED_CATEGORIES[0]
        if (first) document.getElementById(`cat-${first.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const sColor = submitted ? scoreColor(score) : '#94a3b8'
  const sLabel = submitted ? scoreLabel(score) : 'Not yet scored'

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
            <span className="tool-hero-tag">📊 Account Security Score · Free Tool</span>
            <h1>Get your personal <span className="accent">security score</span></h1>
            <p>
              Answer {totalQuestions} quick questions about your habits across passwords, 2FA, devices,
              and browsing. We&apos;ll give you a score from 0–100 and tell you exactly where you&apos;re
              exposed — and how to fix it.
            </p>

            <div className="survey-progress">
              <div className="survey-progress-row">
                <span><strong>{answeredCount}</strong> / {totalQuestions} answered</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="survey-progress-bar">
                <div className="survey-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="pw-actions" style={{ marginTop: 16 }}>
              {!submitted && (
                <button type="button" className="btn-run" disabled={answeredCount < totalQuestions} onClick={submit}>
                  <span className="btn-run-icon">📊</span>
                  Calculate my score
                </button>
              )}
              {submitted && (
                <button type="button" className="btn-run" onClick={reset}>
                  <span className="btn-run-icon">↻</span>
                  Retake the survey
                </button>
              )}
            </div>

            <div className="tool-hero-trust">
              <span>🔒 100% private</span>
              <span>·</span>
              <span>Nothing sent to a server</span>
              <span>·</span>
              <span>Takes 3 minutes</span>
            </div>
          </div>

          <div className="tool-hero-card">
            <div className="score-stack">
              <ScoreRing value={submitted ? score : null} color={sColor} />
              <div className="score-stack-label">
                <span className="score-stack-label-main" style={{ color: sColor }}>{sLabel}</span>
                <span className="score-stack-label-sub">
                  {submitted ? `Across ${activeCategories.length} categories` : 'Answer all questions to see your score'}
                </span>
              </div>
            </div>

            {submitted && (
              <div className="score-breakdown">
                {activeCategories.slice(0, 4).map((c) => {
                  const v = byCategory[c.id]
                  const kind = v.score >= 80 ? 'pass' : v.score >= 60 ? 'warn' : 'fail'
                  return <BreakdownItem key={c.id} icon={c.icon} label={c.title} n={`${v.score}`} kind={kind} />
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="tool-body">
        {submitted && worstCategories.length > 0 && (
          <section className="rec-section" style={{ marginBottom: 40 }}>
            <div className="tool-section-head">
              <h2>Your weakest areas</h2>
              <p>Fixing these first will move your score the most.</p>
            </div>
            <div className="rec-list">
              {worstCategories.map((cid) => {
                const r = RECOMMENDATIONS[cid]
                if (!r) return null
                const sev = byCategory[cid].score < 40 ? 'fail' : 'warn'
                return (
                  <div key={cid} className={`rec-card rec-${sev}`}>
                    <div className="rec-icon">{r.icon}</div>
                    <div className="rec-body">
                      <h4>{r.title}</h4>
                      <p>{r.desc}</p>
                    </div>
                    <span className="rec-action" style={{ pointerEvents: 'none', background: 'transparent', color: 'var(--muted)' }}>
                      Score: <strong>{byCategory[cid].score}</strong>/100
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <div className="tool-section-head">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2>{submitted ? 'Your answers' : 'Quick habit survey'}</h2>
              <p>
                {submitted
                  ? 'Adjust any answer and your score updates live.'
                  : 'Pick the option closest to your reality — no judgement here.'}
              </p>
            </div>
            {!advancedLoaded && ADVANCED_CATEGORIES.length > 0 && (
              <button type="button" className="survey-pack-toggle" onClick={toggleAdvanced}>
                <span aria-hidden style={{ marginRight: 6 }}>＋</span>
                Load advanced pack
                <span className="survey-pack-meta">+{ADVANCED_CATEGORIES.length} categories · +{ADVANCED_CATEGORIES.reduce((s, c) => s + c.questions.length, 0)} questions</span>
              </button>
            )}
          </div>
        </div>

        {activeCategories.map((c) => {
          const isAdvanced = ADVANCED_CATEGORIES.some((ac) => ac.id === c.id)
          return (
            <section className="survey-category" key={c.id} id={`cat-${c.id}`}>
              <header className="survey-cat-head">
                <span className="survey-cat-icon">{c.icon}</span>
                <div>
                  <h3>
                    {c.title}
                    {isAdvanced && <span className="survey-cat-badge">Advanced</span>}
                  </h3>
                  <p>{c.desc}</p>
                </div>
                {submitted && (
                  <span className="survey-cat-score" style={{ color: scoreColor(byCategory[c.id].score), background: `${scoreColor(byCategory[c.id].score)}22` }}>
                    {byCategory[c.id].score}/100
                  </span>
                )}
              </header>
              <div className="survey-questions">
                {c.questions.map((q) => (
                  <div key={q.id} className="survey-question">
                    <div className="survey-question-text">{q.text}</div>
                    <div className="survey-options">
                      {q.options.map((o) => (
                        <button key={o.id} type="button" className={`survey-option ${answers[q.id] === o.id ? 'active' : ''}`} onClick={() => answer(q.id, o.id)}>
                          <span className="survey-option-dot" />
                          <span>{o.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        <section className="survey-bottom-bar">
          <div className="survey-bottom-meta">
            <span className="survey-bottom-progress-num">
              <strong>{answeredCount}</strong> / {totalQuestions}
            </span>
            <span className="survey-bottom-progress-label">
              {answeredCount === totalQuestions
                ? '✓ Every question answered'
                : `${totalQuestions - answeredCount} question${totalQuestions - answeredCount === 1 ? '' : 's'} remaining`}
            </span>
          </div>
          <div className="survey-bottom-actions">
            {ADVANCED_CATEGORIES.length > 0 && (
              <button type="button" className="survey-pack-toggle survey-pack-toggle-bottom" onClick={toggleAdvanced}>
                {advancedLoaded ? (
                  <><span aria-hidden style={{ marginRight: 6 }}>−</span>Remove advanced pack</>
                ) : (
                  <><span aria-hidden style={{ marginRight: 6 }}>＋</span>Add advanced pack</>
                )}
              </button>
            )}
            {!submitted ? (
              <button type="button" className="btn-run" disabled={answeredCount < totalQuestions} onClick={submit}>
                <span className="btn-run-icon">📊</span>
                {answeredCount < totalQuestions
                  ? `Answer ${totalQuestions - answeredCount} more to score`
                  : 'Calculate my score'}
              </button>
            ) : (
              <button type="button" className="btn-run" onClick={reset}>
                <span className="btn-run-icon">↻</span>
                Retake the survey
              </button>
            )}
          </div>
        </section>

        <section className="tool-cta-row">
          <div>
            <h3>Want even more granular checks?</h3>
            <p>Try our Browser Security Checker and Network Security Test for technical scans.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/tools/browser-security" className="btn-submit">Browser security →</Link>
            <Link to="/tools/network-security" className="btn-secondary">Network test</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
