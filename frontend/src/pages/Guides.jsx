import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageLayout, { PageHero } from '../components/layout/PageLayout'
import { GUIDES } from '../data/guides'
import { selectUserGuides } from '../store/guidesSlice'

const LEVELS = [
  { id: 'all', label: 'All Guides' },
  { id: 'beginner', label: '✅ Beginner' },
  { id: 'intermediate', label: '⚡ Intermediate' },
  { id: 'advanced', label: '🔥 Advanced' },
]

export default function Guides() {
  const [level, setLevel] = useState('all')
  const userGuides = useSelector(selectUserGuides)

  const allGuides = useMemo(() => [...userGuides, ...GUIDES], [userGuides])
  const filtered = useMemo(
    () => (level === 'all' ? allGuides : allGuides.filter((g) => g.level === level)),
    [level, allGuides],
  )

  return (
    <PageLayout>
      <PageHero
        badge="Learn"
        title="Step-by-step Security Guides"
        subtitle="From locking down your phone to setting up DNS-level ad blocking — practical, hands-on walkthroughs for every skill level."
      />

      <main className="page-body">
        <div className="guides-toolbar">
          <div className="faq-tabs" style={{ margin: 0 }}>
            {LEVELS.map((l) => (
              <button
                type="button"
                key={l.id}
                className={`faq-tab ${level === l.id ? 'active' : ''}`}
                onClick={() => setLevel(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link to="/guides/create" className="btn-create-guide">
            <span aria-hidden style={{ marginRight: 6 }}>+</span>
            New Guide
          </Link>
        </div>

        <div className="resource-grid">
          {filtered.map((g) => (
            <Link className="resource-card" key={g.slug} to={`/guides/${g.slug}`}>
              <div className={`resource-cover ${g.cover}`} aria-hidden>{g.icon}</div>
              <div className="resource-body">
                <div className="resource-tag-row">
                  <span className={`resource-tag ${g.tagClass}`}>{g.tag}</span>
                  {g.isUserCreated && <span className="resource-tag user-tag">Yours</span>}
                </div>
                <div className="resource-title">{g.title}</div>
                <div className="resource-desc">{g.desc}</div>
                <div className="resource-meta">
                  <span>{g.meta}</span>
                  <span className="read-arrow">Read →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>📚</div>
            <h3 style={{ marginBottom: 6 }}>No guides at this level yet</h3>
            <p>Try a different filter, or <Link to="/guides/create">write the first one</Link>.</p>
          </div>
        )}
      </main>
    </PageLayout>
  )
}
