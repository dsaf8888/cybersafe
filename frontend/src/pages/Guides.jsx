import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout, { PageHero } from '../components/layout/PageLayout'
import { GUIDES } from '../data/guides'

const LEVELS = [
  { id: 'all', label: 'All Guides' },
  { id: 'beginner', label: '✅ Beginner' },
  { id: 'intermediate', label: '⚡ Intermediate' },
  { id: 'advanced', label: '🔥 Advanced' },
]

export default function Guides() {
  const [level, setLevel] = useState('all')
  const filtered = useMemo(
    () => (level === 'all' ? GUIDES : GUIDES.filter((g) => g.level === level)),
    [level],
  )

  return (
    <PageLayout>
      <PageHero
        badge="Learn"
        title="Step-by-step Security Guides"
        subtitle="From locking down your phone to setting up DNS-level ad blocking — practical, hands-on walkthroughs for every skill level."
      />

      <main className="page-body">
        <div className="faq-tabs">
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

        <div className="resource-grid">
          {filtered.map((g) => (
            <Link className="resource-card" key={g.slug} to={`/guides/${g.slug}`}>
              <div className={`resource-cover ${g.cover}`} aria-hidden>{g.icon}</div>
              <div className="resource-body">
                <span className={`resource-tag ${g.tagClass}`}>{g.tag}</span>
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
      </main>
    </PageLayout>
  )
}
