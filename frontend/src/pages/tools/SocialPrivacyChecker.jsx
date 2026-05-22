import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageLayout from '../../components/layout/PageLayout'
import { ScoreRing } from './toolComponents'
import { scoreColor, scoreLabel } from './toolHelpers'
import { selectSocialPrivacy } from '../../store/contentSlice'
import { SOCIAL_PLATFORMS_DEFAULT } from '../../data/toolContent'
import './tools.css'

/* =============================================================== */
/*  PAGE — content from Redux override or imported defaults         */
/* =============================================================== */

export default function SocialPrivacyChecker() {
  const override  = useSelector(selectSocialPrivacy)
  const PLATFORMS = override?.platforms || SOCIAL_PLATFORMS_DEFAULT

  const [platformId, setPlatformId] = useState(null)
  const [answers, setAnswers] = useState({})

  const platform = PLATFORMS.find((p) => p.id === platformId)
  const items    = useMemo(() => platform?.items || [], [platform])
  const answered = items.filter((it) => answers[it.id]).length
  const done     = items.length > 0 && answered === items.length

  const stats = useMemo(() => {
    if (!platform) return { yes: 0, no: 0, na: 0, score: null }
    const yes = items.filter((it) => answers[it.id] === 'yes').length
    const no  = items.filter((it) => answers[it.id] === 'no').length
    const na  = items.filter((it) => answers[it.id] === 'na').length
    const counted = yes + no
    const score = counted === 0 ? null : Math.round((yes / counted) * 100)
    return { yes, no, na, score }
  }, [items, answers, platform])

  const sColor = scoreColor(done ? stats.score : null)
  const sLabel = scoreLabel(done ? stats.score : null)

  function pick(id)         { setPlatformId(id); setAnswers({}) }
  function answer(id, value){ setAnswers((a) => ({ ...a, [id]: value })) }
  function markAll(value) {
    const next = {}
    items.forEach((it) => { next[it.id] = value })
    setAnswers(next)
  }

  const fixes = items.filter((it) => answers[it.id] === 'no')

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
            <span className="tool-hero-tag">🔐 Social Media Privacy Checker · Free Tool</span>
            <h1>How private is your <span className="accent">social media?</span></h1>
            <p>
              Pick a platform. We walk you through the privacy and security settings most people miss
              — from 2FA to ad personalisation — and tell you exactly where to fix what.
            </p>

            {!platform && (
              <div className="platform-pick">
                {PLATFORMS.map((p) => (
                  <button key={p.id} type="button" className="platform-card platform-card-brand" onClick={() => pick(p.id)}>
                    <span className="platform-icon platform-icon-brand" style={{ background: p.color }}>
                      {p.icon}
                    </span>
                    <strong>{p.name}</strong>
                    <span className="platform-desc">{p.items.length} privacy checks</span>
                  </button>
                ))}
              </div>
            )}

            {platform && (
              <>
                <div className="wifi-context-banner">
                  <span aria-hidden className="platform-icon platform-icon-brand" style={{ background: platform.color, width: 40, height: 40, fontSize: '1.1rem' }}>
                    {platform.icon}
                  </span>
                  <div>
                    <strong>{platform.name}</strong>
                    <span>{items.length} checks · auto-saves as you go</span>
                  </div>
                  <button type="button" className="wifi-context-change" onClick={() => pick(null)}>Switch platform</button>
                </div>

                <div className="survey-progress">
                  <div className="survey-progress-row">
                    <span><strong>{answered}</strong> / {items.length} answered</span>
                    <span>{Math.round((answered / items.length) * 100)}%</span>
                  </div>
                  <div className="survey-progress-bar">
                    <div className="survey-progress-fill" style={{ width: `${(answered / items.length) * 100}%` }} />
                  </div>
                </div>
              </>
            )}

            <div className="tool-hero-trust">
              <span>🔒 Nothing saved server-side</span>
              <span>·</span>
              <span>Free</span>
              <span>·</span>
              <span>Takes 2 minutes</span>
            </div>
          </div>

          <div className="tool-hero-card">
            <div className="score-stack">
              <ScoreRing value={done ? stats.score : null} color={sColor} />
              <div className="score-stack-label">
                <span className="score-stack-label-main" style={{ color: sColor }}>{sLabel}</span>
                <span className="score-stack-label-sub">
                  {!platform && 'Pick a platform to start'}
                  {platform && !done && `${answered} / ${items.length} answered`}
                  {done && `Across ${items.length} privacy checks`}
                </span>
              </div>
            </div>
            {platform && (
              <div className="social-summary">
                <div className="social-summary-row social-yes"><span>✅ Configured</span><strong>{stats.yes}</strong></div>
                <div className="social-summary-row social-no"><span>🚨 Needs fixing</span><strong>{stats.no}</strong></div>
                <div className="social-summary-row social-na"><span>– N/A</span><strong>{stats.na}</strong></div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="tool-body">
        {!platform && (
          <div className="rec-celebrate" style={{ marginBottom: 0 }}>
            <div className="rec-celebrate-emoji" aria-hidden>👆</div>
            <h3>Choose your platform above</h3>
            <p>Each platform has its own privacy settings — we tailor the checklist to match.</p>
          </div>
        )}

        {platform && (
          <>
            <div className="tool-section-head">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2>{platform.name} privacy checklist</h2>
                  <p>Mark each one as ✓ done, ✗ not done, or – not applicable.</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="msg-example-btn" onClick={() => markAll('yes')}>Mark all ✓</button>
                  <button type="button" className="msg-example-btn" onClick={() => markAll('no')}>Mark all ✗</button>
                  <button type="button" className="msg-example-btn msg-clear" onClick={() => setAnswers({})}>Reset</button>
                </div>
              </div>
            </div>

            <div className="social-checklist">
              {items.map((it) => {
                const val = answers[it.id]
                return (
                  <div key={it.id} className={`social-item social-item-${val || 'unanswered'}`}>
                    <div className="social-item-body">
                      <strong>{it.label}</strong>
                      {it.detail && <span>{it.detail}</span>}
                    </div>
                    <div className="social-item-actions">
                      <button type="button" className={`social-btn ${val === 'yes' ? 'active yes' : ''}`} onClick={() => answer(it.id, 'yes')}>✓ Done</button>
                      <button type="button" className={`social-btn ${val === 'no' ? 'active no' : ''}`} onClick={() => answer(it.id, 'no')}>✗ Not yet</button>
                      <button type="button" className={`social-btn ${val === 'na' ? 'active na' : ''}`} onClick={() => answer(it.id, 'na')}>– N/A</button>
                    </div>
                  </div>
                )
              })}
            </div>

            {done && fixes.length > 0 && (
              <section className="rec-section" style={{ marginTop: 40 }}>
                <div className="tool-section-head">
                  <h2>Your action list for {platform.name}</h2>
                  <p>Open the settings page and knock these out — most are 1 toggle away.</p>
                </div>
                <div className="rec-list">
                  {fixes.map((f) => (
                    <div key={f.id} className="rec-card rec-warn">
                      <div className="rec-icon">⚠️</div>
                      <div className="rec-body">
                        <h4>{f.label}</h4>
                        {f.detail && <p>{f.detail}</p>}
                      </div>
                      <a href={platform.settingsUrl} target="_blank" rel="noopener noreferrer" className="rec-action">
                        Open settings →
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {done && fixes.length === 0 && (
              <section className="rec-section">
                <div className="rec-celebrate">
                  <div className="rec-celebrate-emoji" aria-hidden>🏆</div>
                  <h3>Your {platform.name} privacy looks great!</h3>
                  <p>Every check is in the green. Re-run after any major app update or annual review.</p>
                </div>
              </section>
            )}
          </>
        )}

        <section className="tool-cta-row">
          <div>
            <h3>Want to do this for all your accounts?</h3>
            <p>Run the Account Security Score for a 360° look at your overall posture.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/tools/account-security-score" className="btn-submit">Account security score →</Link>
            <Link to="/tools/email-breach" className="btn-secondary">Check email breaches</Link>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
