import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageLayout, { PageHero } from '../../components/layout/PageLayout'
import { BLOG_POSTS, CATEGORY_META } from '../../data/blogPosts'
import { selectUserPosts } from '../../store/blogSlice'
import './blog.css'

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'shortest', label: 'Quickest reads' },
  { id: 'longest', label: 'Longest reads' },
]

function parseReadMinutes(s) {
  const m = String(s).match(/(\d+)/)
  return m ? Number(m[1]) : 0
}

function parseDate(s) {
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? 0 : d.getTime()
}

export default function Blog() {
  const [category, setCategory] = useState('all')
  const [activeTag, setActiveTag] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  const userPosts = useSelector(selectUserPosts)
  const allPosts = useMemo(() => [...userPosts, ...BLOG_POSTS], [userPosts])

  const counts = useMemo(() => {
    return allPosts.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        acc.all += 1
        return acc
      },
      { all: 0 },
    )
  }, [allPosts])

  const allTags = useMemo(() => {
    const tagSet = new Set()
    allPosts.forEach((p) => p.tags?.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [allPosts])

  const filtered = useMemo(() => {
    let list = allPosts

    if (category !== 'all') list = list.filter((p) => p.category === category)
    if (activeTag) list = list.filter((p) => p.tags?.includes(activeTag))
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.includes(q)),
      )
    }

    const sorted = [...list]
    switch (sort) {
      case 'oldest':
        sorted.sort((a, b) => parseDate(a.date) - parseDate(b.date))
        break
      case 'shortest':
        sorted.sort((a, b) => parseReadMinutes(a.readTime) - parseReadMinutes(b.readTime))
        break
      case 'longest':
        sorted.sort((a, b) => parseReadMinutes(b.readTime) - parseReadMinutes(a.readTime))
        break
      default:
        sorted.sort((a, b) => parseDate(b.date) - parseDate(a.date))
    }
    return sorted
  }, [allPosts, category, activeTag, search, sort])

  function resetFilters() {
    setCategory('all')
    setActiveTag(null)
    setSearch('')
  }

  return (
    <PageLayout>
      <PageHero
        badge="Blog"
        title="Cybersecurity Insights & Tutorials"
        subtitle="Guides and deep-dives for everyone — from everyday internet users to engineers and business leaders. New posts every week."
      />

      <div className="blog-page">
        {/* ---------- SIDEBAR ---------- */}
        <aside className="blog-sidebar" aria-label="Blog filters">
          <div className="sidebar-section">
            <div className="sidebar-heading">Search</div>
            <div className="sidebar-search">
              <span className="icon" aria-hidden>🔍</span>
              <input
                type="text"
                placeholder="Search posts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search blog posts"
              />
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-heading">Categories</div>
            <ul className="cat-list">
              <li>
                <button
                  type="button"
                  className={`cat-item ${category === 'all' ? 'active' : ''}`}
                  onClick={() => setCategory('all')}
                >
                  <span className="cat-icon">📚</span>
                  <span className="cat-label">All Posts</span>
                  <span className="cat-count">{counts.all}</span>
                </button>
              </li>
              {Object.values(CATEGORY_META).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className={`cat-item cat-${cat.id} ${category === cat.id ? 'active' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-label">{cat.label}</span>
                    <span className="cat-count">{counts[cat.id] || 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-heading">Popular Tags</div>
            <div className="tag-cloud">
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`tag-chip ${activeTag === t ? 'active' : ''}`}
                  onClick={() => setActiveTag(activeTag === t ? null : t)}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-cta">
            <h4>Weekly digest</h4>
            <p>Get the best of CyberSafe blog delivered every Friday. No spam.</p>
            <button type="button">Subscribe</button>
          </div>
        </aside>

        {/* ---------- LISTING ---------- */}
        <main className="blog-main">
          <div className="blog-toolbar">
            <div className="blog-toolbar-title">
              <h2>
                {category === 'all' ? 'All Articles' : CATEGORY_META[category].label}
                {activeTag && <span style={{ color: 'var(--blue)' }}> · #{activeTag}</span>}
              </h2>
              <p>
                {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
                {category !== 'all' && ` in ${CATEGORY_META[category].short}`}
                {search.trim() && ` matching "${search.trim()}"`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <label className="blog-sort">
                Sort by:
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </label>
              <Link to="/blog/create" className="btn-create-post">
                <span aria-hidden style={{ marginRight: 6 }}>+</span>
                New Post
              </Link>
            </div>
          </div>

          <div className="blog-scroll">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon" aria-hidden>📭</div>
                <h3>No posts found</h3>
                <p>Try a different category, clear the tag, or change your search.</p>
                <button type="button" onClick={resetFilters}>Reset filters</button>
              </div>
            ) : (
              <div className="post-grid">
                {filtered.map((p) => (
                  <Link key={p.slug} to={`/blog/${p.slug}`} className="post-card">
                    <div className={`post-cover ${p.category}`} aria-hidden>
                      {p.cover.emoji}
                      <span className={`post-badge ${p.category}`}>
                        {CATEGORY_META[p.category].short}
                      </span>
                      {p.difficulty && (
                        <span className={`post-difficulty ${p.difficulty}`}>
                          {p.difficulty === 'beginner' && '✅ Beginner'}
                          {p.difficulty === 'intermediate' && '⚡ Intermediate'}
                          {p.difficulty === 'advanced' && '🔥 Advanced'}
                        </span>
                      )}
                    </div>
                    <div className="post-body">
                      <div className="post-title">{p.title}</div>
                      <div className="post-excerpt">{p.excerpt}</div>
                      <div className="post-meta">
                        <span>{p.date} · {p.readTime}</span>
                        <span className="read-more">Read →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </PageLayout>
  )
}
