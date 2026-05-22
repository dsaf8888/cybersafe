import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PageLayout from '../components/layout/PageLayout'
import { GUIDES, LEVEL_META, getGuideBySlug, getRelatedGuides } from '../data/guides'
import { deleteGuide, selectUserGuideBySlug, selectUserGuides } from '../store/guidesSlice'

const STORAGE_KEY = 'cs:completed-guides'

/* ---------------------------------------------------------------
   Content-block renderer (mirrors BlogPost so guides feel familiar)
   --------------------------------------------------------------- */
function Block({ block }) {
  switch (block.type) {
    case 'p':  return <p>{block.text}</p>
    case 'h':  return <h3>{block.text}</h3>
    case 'ul': return <ul>{block.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
    case 'ol': return <ol>{block.items.map((it, i) => <li key={i}>{it}</li>)}</ol>
    case 'callout':
      return (
        <div className={`guide-callout guide-callout-${block.kind || 'info'}`}>
          {block.title && <span className="guide-callout-title">{block.title}</span>}
          <p>{block.text}</p>
        </div>
      )
    case 'code':
      return (
        <div className="guide-code">
          {block.language && <span className="guide-code-lang">{block.language}</span>}
          <pre><code>{block.text}</code></pre>
        </div>
      )
    default: return null
  }
}

/* ---------------------------------------------------------------
   localStorage helpers for "mark as complete"
   --------------------------------------------------------------- */
function readCompleted() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}
function writeCompleted(list) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch { /* noop */ }
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function GuideView() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userGuide = useSelector(selectUserGuideBySlug(slug))
  const userGuides = useSelector(selectUserGuides)
  const guide = useMemo(() => userGuide || getGuideBySlug(slug), [userGuide, slug])

  const [activeStep, setActiveStep] = useState(0)
  const [completed, setCompleted] = useState(() => readCompleted())
  const [prevSlug, setPrevSlug] = useState(slug)
  const isCompleted = guide ? completed.includes(guide.slug) : false
  const articleRef = useRef(null)

  /* Reset activeStep when slug changes (React-recommended in-render pattern) */
  if (slug !== prevSlug) {
    setPrevSlug(slug)
    setActiveStep(0)
  }

  /* keep activeStep in sync with scroll */
  useEffect(() => {
    if (!guide) return
    const root = articleRef.current
    if (!root) return
    const els = guide.steps.map((_, i) => root.querySelector(`#step-${i + 1}`)).filter(Boolean)
    if (els.length === 0) return

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const idx = els.indexOf(visible.target)
          if (idx !== -1) setActiveStep(idx)
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.4, 0.8] },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [guide])

  /* scroll to top on slug change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [slug])

  /* Related — keep this hook BEFORE the early return to satisfy rules of hooks */
  const related = useMemo(() => {
    if (!guide) return []
    if (guide.isUserCreated) {
      const others = userGuides.filter((g) => g.slug !== guide.slug).slice(0, 2)
      const staticPicks = GUIDES.slice(0, 3 - others.length)
      return [...others, ...staticPicks]
    }
    return getRelatedGuides(guide.slug)
  }, [guide, userGuides])

  if (!guide) {
    return (
      <PageLayout>
        <main className="page-body" style={{ textAlign: 'center', padding: '120px 24px' }}>
          <h1 style={{ marginBottom: 12 }}>Guide not found</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
            The guide you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link to="/guides" className="btn-submit">← Back to all guides</Link>
        </main>
      </PageLayout>
    )
  }

  const levelMeta = LEVEL_META[guide.level]
  const progressPct = Math.round(((activeStep + 1) / guide.steps.length) * 100)

  function toggleComplete() {
    const next = isCompleted
      ? completed.filter((s) => s !== guide.slug)
      : [...completed, guide.slug]
    setCompleted(next)
    writeCompleted(next)
  }

  function handleDelete() {
    if (!guide.isUserCreated) return
    if (!window.confirm(`Delete "${guide.title}"? This can't be undone.`)) return
    dispatch(deleteGuide(guide.slug))
    navigate('/guides')
  }

  function jumpToStep(idx) {
    const el = articleRef.current?.querySelector(`#step-${idx + 1}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const publishedDate = new Date(guide.publishedAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <PageLayout>
      {/* ===== BREADCRUMB ===== */}
      <div className="guide-breadcrumb">
        <Link to="/guides">← All guides</Link>
        <span className="bc-sep">·</span>
        <span className="bc-current">{guide.tag}</span>
      </div>

      {/* ===== HERO ===== */}
      <header className={`guide-hero guide-cover-${guide.cover}`}>
        <div className="guide-hero-inner">
          <div className="guide-hero-pills">
            <span className="guide-level-pill" style={{ background: levelMeta.color }}>
              {levelMeta.icon} {levelMeta.label}
            </span>
            <span className={`resource-tag ${guide.tagClass}`}>{guide.tag}</span>
            {guide.isUserCreated && <span className="resource-tag user-tag">Yours</span>}
          </div>
          <div className="guide-hero-icon" aria-hidden>{guide.icon}</div>
          <h1>{guide.title}</h1>
          <p className="guide-hero-desc">{guide.desc}</p>
          <div className="guide-hero-meta">
            <span>⏱ {guide.readTime} min read</span>
            <span>·</span>
            <span>📚 {guide.steps.length} steps</span>
            <span>·</span>
            <span>👤 {guide.author.name}, {guide.author.role}</span>
            <span>·</span>
            <span>📅 Updated {publishedDate}</span>
          </div>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <main className="guide-shell">
        {/* ─── Sticky sidebar ─── */}
        <aside className="guide-sidebar">
          <div className="guide-progress-card">
            <div className="guide-progress-head">
              <span>Your progress</span>
              <strong>{progressPct}%</strong>
            </div>
            <div className="guide-progress-bar">
              <div className="guide-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="guide-progress-sub">
              Step <strong>{activeStep + 1}</strong> of {guide.steps.length}
            </div>
          </div>

          <nav className="guide-toc" aria-label="Steps">
            <span className="guide-toc-label">Table of contents</span>
            <ol>
              {guide.steps.map((s, i) => (
                <li key={i} className={i === activeStep ? 'active' : i < activeStep ? 'done' : ''}>
                  <button type="button" onClick={() => jumpToStep(i)}>
                    <span className="guide-toc-num">{i < activeStep ? '✓' : i + 1}</span>
                    <span className="guide-toc-title">{s.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <button
            type="button"
            className={`guide-complete-btn ${isCompleted ? 'done' : ''}`}
            onClick={toggleComplete}
          >
            {isCompleted ? '✓ Completed' : 'Mark as complete'}
          </button>

          {guide.isUserCreated && (
            <button
              type="button"
              className="guide-delete-btn"
              onClick={handleDelete}
              title="Delete this guide"
            >
              🗑 Delete guide
            </button>
          )}
        </aside>

        {/* ─── Article ─── */}
        <article className="guide-article" ref={articleRef}>
          {/* What you'll learn + Prerequisites */}
          <div className="guide-info-grid">
            <section className="guide-info-card">
              <header><span aria-hidden>🎯</span><h2>What you&apos;ll learn</h2></header>
              <ul>
                {guide.learnings.map((l) => <li key={l}>{l}</li>)}
              </ul>
            </section>
            <section className="guide-info-card guide-info-card-prereq">
              <header><span aria-hidden>📋</span><h2>Before you start</h2></header>
              <ul>
                {guide.prerequisites.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </section>
          </div>

          {/* Steps timeline */}
          <div className="guide-steps">
            {guide.steps.map((step, i) => (
              <section key={i} id={`step-${i + 1}`} className="guide-step">
                <header className="guide-step-head">
                  <div className="guide-step-num">{i + 1}</div>
                  <div>
                    <span className="guide-step-time">⏱ {step.time}</span>
                    <h2>{step.title}</h2>
                  </div>
                </header>
                <div className="guide-step-body">
                  {step.blocks.map((b, j) => <Block key={j} block={b} />)}
                </div>
              </section>
            ))}
          </div>

          {/* Completion banner */}
          <section className={`guide-finish ${isCompleted ? 'done' : ''}`}>
            <div className="guide-finish-emoji" aria-hidden>{isCompleted ? '🏆' : '🎉'}</div>
            <h2>{isCompleted ? "You've already completed this guide" : 'You made it to the end!'}</h2>
            <p>
              {isCompleted
                ? 'Want a refresher, or ready to tackle the next one?'
                : 'Mark this guide as complete to track your progress, then explore the related guides below.'}
            </p>
            <div className="guide-finish-actions">
              <button type="button" className="btn-submit" onClick={toggleComplete}>
                {isCompleted ? 'Unmark complete' : '✓ Mark as complete'}
              </button>
              <Link to="/guides" className="btn-secondary">Browse more guides</Link>
            </div>
          </section>

          {/* Related guides */}
          {related.length > 0 && (
            <section className="guide-related">
              <header>
                <h2>Continue your training</h2>
                <p>Hand-picked guides that pair well with this one.</p>
              </header>
              <div className="guide-related-grid">
                {related.map((g) => (
                  <Link to={`/guides/${g.slug}`} key={g.slug} className="guide-related-card">
                    <div className={`guide-related-cover guide-cover-${g.cover}`} aria-hidden>{g.icon}</div>
                    <div className="guide-related-body">
                      <span className={`resource-tag ${g.tagClass}`}>{g.tag}</span>
                      <h3>{g.title}</h3>
                      <span className="guide-related-meta">{g.meta}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Prev/Next inside the static guide list (skip for user-created guides) */}
          {!guide.isUserCreated && <GuideNav currentSlug={guide.slug} navigate={navigate} />}
        </article>
      </main>
    </PageLayout>
  )
}

/* Adjacent guides (within the same level if possible) */
function GuideNav({ currentSlug, navigate }) {
  const idx = GUIDES.findIndex((g) => g.slug === currentSlug)
  const prev = idx > 0 ? GUIDES[idx - 1] : null
  const next = idx < GUIDES.length - 1 ? GUIDES[idx + 1] : null
  if (!prev && !next) return null

  return (
    <nav className="guide-pager">
      {prev ? (
        <button type="button" className="guide-pager-btn" onClick={() => navigate(`/guides/${prev.slug}`)}>
          <span>← Previous guide</span>
          <strong>{prev.title}</strong>
        </button>
      ) : <span />}
      {next ? (
        <button type="button" className="guide-pager-btn guide-pager-next" onClick={() => navigate(`/guides/${next.slug}`)}>
          <span>Next guide →</span>
          <strong>{next.title}</strong>
        </button>
      ) : <span />}
    </nav>
  )
}
