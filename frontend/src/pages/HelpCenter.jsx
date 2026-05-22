import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout, { PageHero } from '../components/layout/PageLayout'

const CATEGORIES = [
  { icon: '🚀', title: 'Getting Started', desc: 'New to CyberSafe? Start here for the basics.', count: 8 },
  { icon: '🔧', title: 'Using the Tools', desc: 'How each scanner works and how to read results.', count: 14 },
  { icon: '🔐', title: 'Account & Security', desc: 'Sign-in, 2FA, recovery, and device management.', count: 11 },
  { icon: '💳', title: 'Billing & Pro Plan', desc: 'Upgrades, invoices, refunds, team seats.', count: 6 },
  { icon: '🛡️', title: 'Privacy & Data', desc: 'What we store, how to export, and how to delete.', count: 9 },
  { icon: '🧰', title: 'API & Integrations', desc: 'For developers using the CyberSafe REST API.', count: 12 },
  { icon: '🏢', title: 'For Business', desc: 'Team dashboards, training programs, and DPAs.', count: 7 },
  { icon: '⚠️', title: 'Troubleshooting', desc: 'Common errors and how to resolve them.', count: 15 },
]

const ARTICLES = [
  { title: 'How to run your first security check', meta: 'Getting Started · 3 min', q: 'first security check getting started' },
  { title: 'Reading your CyberSafe security score', meta: 'Using the Tools · 5 min', q: 'security score reading interpret' },
  { title: 'Setting up two-factor authentication', meta: 'Account & Security · 6 min', q: '2fa two factor authentication setup' },
  { title: 'Why does the URL Scanner say "Unknown"?', meta: 'Troubleshooting · 4 min', q: 'url scanner unknown troubleshoot' },
  { title: 'Exporting all the data we have about you', meta: 'Privacy & Data · 4 min', q: 'export data privacy gdpr' },
  { title: 'Upgrading to Pro and managing your subscription', meta: 'Billing · 5 min', q: 'upgrade pro subscription billing' },
  { title: 'Inviting team members and assigning roles', meta: 'For Business · 7 min', q: 'invite team members business' },
  { title: 'Generating an API key and your first request', meta: 'API · 8 min', q: 'api key generate request integration' },
  { title: 'What to do if you suspect your account is compromised', meta: 'Account & Security · 6 min', q: 'compromised account hacked security' },
  { title: 'How email breach checks work behind the scenes', meta: 'Using the Tools · 6 min', q: 'email breach check how works' },
]

export default function HelpCenter() {
  const [query, setQuery] = useState('')

  const filteredArticles = useMemo(() => {
    if (!query.trim()) return ARTICLES
    const q = query.toLowerCase()
    return ARTICLES.filter(
      (a) => a.title.toLowerCase().includes(q) || a.q.includes(q),
    )
  }, [query])

  return (
    <PageLayout>
      <PageHero
        badge="Help Center"
        title="How can we help?"
        subtitle="Search our knowledge base, browse by category, or chat with our support team — whatever works fastest for you."
      />

      <div className="page-body">
        <div className="help-search" role="search">
          <span aria-hidden style={{ fontSize: 20 }}>🔍</span>
          <input
            type="text"
            placeholder="Search articles — e.g. 'reset password' or 'API rate limits'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search help articles"
          />
          <button type="button" onClick={() => setQuery(query)}>Search</button>
        </div>

        <section className="page-section" style={{ marginTop: 40 }}>
          <div className="page-section-head">
            <h2>Browse by category</h2>
            <p>Pick the area you need help with.</p>
          </div>
          <div className="help-categories">
            {CATEGORIES.map((c) => (
              <a className="help-cat" key={c.title} href="#category">
                <div className="help-cat-icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <span className="help-cat-count">{c.count} articles →</span>
              </a>
            ))}
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-head">
            <h2>{query ? `Results for "${query}"` : 'Popular articles'}</h2>
            <p>{filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found</p>
          </div>
          {filteredArticles.length === 0 ? (
            <div className="doc-callout amber">
              <strong>No articles matched your search.</strong> Try different keywords, or {' '}
              <Link to="/report-issue" style={{ color: 'inherit', textDecoration: 'underline' }}>
                contact support
              </Link>.
            </div>
          ) : (
            <div className="help-articles">
              {filteredArticles.map((a) => (
                <a className="help-article" key={a.title} href="#article">
                  <div>
                    <div className="ha-title">{a.title}</div>
                    <div className="ha-meta">{a.meta}</div>
                  </div>
                  <span className="ha-arrow">→</span>
                </a>
              ))}
            </div>
          )}
        </section>

        <div className="faq-help-cta">
          <div>
            <h3>Can&apos;t find what you need?</h3>
            <p>Our team responds within one business day — usually much sooner.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/faq" className="score-card-cta" style={{ maxWidth: 'none' }}>Check the FAQ</Link>
            <Link to="/report-issue" className="btn-submit">Contact Support</Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
