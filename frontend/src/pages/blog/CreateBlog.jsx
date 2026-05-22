import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PageLayout, { PageHero } from '../../components/layout/PageLayout'
import { addPost, selectUserPosts } from '../../store/blogSlice'
import { BLOG_POSTS, CATEGORY_META } from '../../data/blogPosts'
import './blog.css'

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const COVER_PRESETS = ['📝', '🛡️', '🔒', '💡', '⚠️', '🔑', '📧', '🔗', '🎣', '📱', '👨‍💻', '🏢', '📜', '🚨', '🔧', '🌐', '💾', '🎯']

const BLOCK_TYPES = [
  { id: 'p', label: 'Paragraph' },
  { id: 'h2', label: 'Heading (H2)' },
  { id: 'h3', label: 'Sub-heading (H3)' },
  { id: 'ul', label: 'Bullet list' },
  { id: 'ol', label: 'Numbered list' },
  { id: 'callout', label: 'Callout box' },
  { id: 'code', label: 'Code block' },
  { id: 'quote', label: 'Quote' },
]

const CALLOUT_KINDS = [
  { id: 'info', label: 'Info (blue)' },
  { id: 'success', label: 'Success (green)' },
  { id: 'warn', label: 'Warning (orange)' },
]

const CODE_LANGUAGES = ['js', 'ts', 'py', 'php', 'sql', 'shell', 'http', 'json', 'html', 'css']

const DIFFICULTIES = [
  { id: '', label: 'None' },
  { id: 'beginner', label: '✅ Beginner' },
  { id: 'intermediate', label: '⚡ Intermediate' },
  { id: 'advanced', label: '🔥 Advanced' },
]

function defaultBlock(type) {
  switch (type) {
    case 'ul':
    case 'ol':
      return { type, items: [''] }
    case 'callout':
      return { type, kind: 'info', title: '', text: '' }
    case 'code':
      return { type, language: 'js', text: '' }
    case 'quote':
      return { type, text: '', by: '' }
    default:
      return { type, text: '' }
  }
}

export default function CreateBlog() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userPosts = useSelector(selectUserPosts)

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('everyone')
  const [coverEmoji, setCoverEmoji] = useState('📝')
  const [readTime, setReadTime] = useState('5 min read')
  const [difficulty, setDifficulty] = useState('')
  const [tags, setTags] = useState('')
  const [authorName, setAuthorName] = useState('Anonymous Writer')
  const [authorRole, setAuthorRole] = useState('Contributor')
  const [blocks, setBlocks] = useState([
    { type: 'p', text: '' },
  ])
  const [error, setError] = useState('')

  const slug = useMemo(() => slugify(title), [title])
  const slugTaken = useMemo(() => {
    const all = [...userPosts.map((p) => p.slug), ...BLOG_POSTS.map((p) => p.slug)]
    return slug && all.includes(slug)
  }, [slug, userPosts])

  function authorInitials() {
    const parts = authorName.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'A'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  /* ---------- BLOCK HANDLERS ---------- */
  function addBlock(type) {
    setBlocks((b) => [...b, defaultBlock(type)])
  }
  function removeBlock(idx) {
    setBlocks((b) => b.filter((_, i) => i !== idx))
  }
  function moveBlock(idx, delta) {
    setBlocks((b) => {
      const next = [...b]
      const target = idx + delta
      if (target < 0 || target >= next.length) return b
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }
  function updateBlock(idx, patch) {
    setBlocks((b) => b.map((blk, i) => (i === idx ? { ...blk, ...patch } : blk)))
  }
  function updateListItem(idx, itemIdx, value) {
    setBlocks((b) =>
      b.map((blk, i) => {
        if (i !== idx) return blk
        const items = [...(blk.items || [])]
        items[itemIdx] = value
        return { ...blk, items }
      }),
    )
  }
  function addListItem(idx) {
    setBlocks((b) =>
      b.map((blk, i) => (i === idx ? { ...blk, items: [...(blk.items || []), ''] } : blk)),
    )
  }
  function removeListItem(idx, itemIdx) {
    setBlocks((b) =>
      b.map((blk, i) => {
        if (i !== idx) return blk
        const items = (blk.items || []).filter((_, j) => j !== itemIdx)
        return { ...blk, items: items.length ? items : [''] }
      }),
    )
  }

  /* ---------- SUBMIT ---------- */
  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) return setError('Title is required.')
    if (!excerpt.trim()) return setError('A short excerpt is required.')
    if (slugTaken) return setError('A post with this title already exists. Try a different title.')

    const cleanBlocks = blocks
      .map((b) => {
        if (b.type === 'ul' || b.type === 'ol') {
          const items = (b.items || []).map((s) => s.trim()).filter(Boolean)
          return items.length ? { ...b, items } : null
        }
        if (b.type === 'callout') {
          const text = (b.text || '').trim()
          return text ? { ...b, title: (b.title || '').trim(), text } : null
        }
        if (b.type === 'code') {
          const text = (b.text || '').trim()
          return text ? { ...b, text } : null
        }
        if (b.type === 'quote') {
          const text = (b.text || '').trim()
          return text ? { ...b, text, by: (b.by || '').trim() } : null
        }
        const text = (b.text || '').trim()
        return text ? { ...b, text } : null
      })
      .filter(Boolean)

    if (cleanBlocks.length === 0) return setError('Add at least one content block.')

    const post = {
      slug: slug || `post-${Date.now()}`,
      title: title.trim(),
      excerpt: excerpt.trim(),
      category,
      cover: { emoji: coverEmoji || '📝', class: 'user' },
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      readTime: readTime.trim() || '5 min read',
      difficulty: category === 'dev' && difficulty ? difficulty : undefined,
      author: {
        name: authorName.trim() || 'Anonymous',
        role: authorRole.trim() || 'Contributor',
        initials: authorInitials(),
      },
      tags: tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      body: cleanBlocks,
    }

    dispatch(addPost(post))
    navigate(`/blog/${post.slug}`)
  }

  return (
    <PageLayout>
      <PageHero
        badge="Write"
        title="Create a New Post"
        subtitle="Add a new article to the CyberSafe blog. Your post is saved locally (Redux + localStorage) and immediately appears in the blog listing."
      />

      <main className="page-body" style={{ maxWidth: 1080 }}>
        <form onSubmit={handleSubmit} className="create-form">
          {/* ===== METADATA ===== */}
          <div className="form-card create-section">
            <h2 className="create-section-title">📋 Post details</h2>

            <div className="form-field">
              <label htmlFor="title">Title <span className="req">*</span></label>
              <input
                id="title"
                type="text"
                placeholder="Eg. How to spot a phishing link in seconds"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className="field-hint">
                URL slug: <code>/blog/{slug || 'your-post-slug'}</code>
                {slugTaken && <span style={{ color: '#dc2626', marginLeft: 8 }}>· Already taken!</span>}
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="excerpt">Excerpt <span className="req">*</span></label>
              <textarea
                id="excerpt"
                rows={2}
                maxLength={200}
                placeholder="A 1–2 sentence summary that appears on the blog listing card."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
              />
              <span className="field-hint">{excerpt.length}/200 characters</span>
            </div>

            <div className="form-row-3">
              <div className="form-field">
                <label>Category <span className="req">*</span></label>
                <div className="cat-pick">
                  {Object.values(CATEGORY_META).map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`cat-pick-item ${category === c.id ? 'active' : ''}`}
                    >
                      <span className="cat-pick-icon">{c.icon}</span>
                      <span>{c.short}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="readTime">Read time</label>
                <input
                  id="readTime"
                  type="text"
                  placeholder="5 min read"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                />
              </div>

              {category === 'dev' && (
                <div className="form-field">
                  <label htmlFor="difficulty">Difficulty</label>
                  <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    {DIFFICULTIES.map((d) => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-field">
              <label>Cover emoji</label>
              <div className="emoji-pick">
                {COVER_PRESETS.map((e) => (
                  <button
                    type="button"
                    key={e}
                    className={`emoji-pick-item ${coverEmoji === e ? 'active' : ''}`}
                    onClick={() => setCoverEmoji(e)}
                  >
                    {e}
                  </button>
                ))}
                <input
                  type="text"
                  maxLength={4}
                  className="emoji-pick-input"
                  value={coverEmoji}
                  onChange={(e) => setCoverEmoji(e.target.value)}
                  placeholder="🎨"
                  aria-label="Custom emoji"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                id="tags"
                type="text"
                placeholder="phishing, beginner, email"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* ===== AUTHOR ===== */}
          <div className="form-card create-section">
            <h2 className="create-section-title">👤 Author</h2>
            <div className="form-row-2">
              <div className="form-field">
                <label htmlFor="authorName">Name</label>
                <input
                  id="authorName"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="authorRole">Role</label>
                <input
                  id="authorRole"
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ===== CONTENT BLOCKS ===== */}
          <div className="form-card create-section">
            <h2 className="create-section-title">📝 Content</h2>
            <p className="create-section-sub">Add content blocks below — paragraphs, headings, lists, callouts, code, or quotes.</p>

            <div className="blocks-list">
              {blocks.map((block, idx) => (
                <div key={idx} className="block-editor">
                  <div className="block-header">
                    <span className="block-type-pill">
                      {BLOCK_TYPES.find((t) => t.id === block.type)?.label || block.type}
                    </span>
                    <div className="block-actions">
                      <button type="button" onClick={() => moveBlock(idx, -1)} disabled={idx === 0} title="Move up">↑</button>
                      <button type="button" onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1} title="Move down">↓</button>
                      <button type="button" onClick={() => removeBlock(idx)} title="Remove">✕</button>
                    </div>
                  </div>

                  <div className="block-body">
                    {(block.type === 'p' || block.type === 'h2' || block.type === 'h3') && (
                      <textarea
                        rows={block.type === 'p' ? 4 : 2}
                        placeholder={
                          block.type === 'p'
                            ? 'Write a paragraph…'
                            : block.type === 'h2'
                              ? 'Section heading'
                              : 'Sub-heading'
                        }
                        value={block.text}
                        onChange={(e) => updateBlock(idx, { text: e.target.value })}
                      />
                    )}

                    {(block.type === 'ul' || block.type === 'ol') && (
                      <div className="list-editor">
                        {block.items?.map((item, ii) => (
                          <div key={ii} className="list-editor-row">
                            <span className="list-bullet">
                              {block.type === 'ol' ? `${ii + 1}.` : '•'}
                            </span>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updateListItem(idx, ii, e.target.value)}
                              placeholder="List item…"
                            />
                            <button type="button" onClick={() => removeListItem(idx, ii)} title="Remove item">✕</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addListItem(idx)} className="add-item-btn">
                          + Add item
                        </button>
                      </div>
                    )}

                    {block.type === 'callout' && (
                      <div className="callout-editor">
                        <div className="callout-row">
                          <select value={block.kind || 'info'} onChange={(e) => updateBlock(idx, { kind: e.target.value })}>
                            {CALLOUT_KINDS.map((k) => (
                              <option key={k.id} value={k.id}>{k.label}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Title (optional)"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(idx, { title: e.target.value })}
                          />
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Callout text…"
                          value={block.text}
                          onChange={(e) => updateBlock(idx, { text: e.target.value })}
                        />
                      </div>
                    )}

                    {block.type === 'code' && (
                      <div className="code-editor">
                        <select value={block.language} onChange={(e) => updateBlock(idx, { language: e.target.value })}>
                          {CODE_LANGUAGES.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                        <textarea
                          rows={6}
                          className="code-textarea"
                          placeholder="// your code…"
                          value={block.text}
                          onChange={(e) => updateBlock(idx, { text: e.target.value })}
                        />
                      </div>
                    )}

                    {block.type === 'quote' && (
                      <div className="quote-editor">
                        <textarea
                          rows={3}
                          placeholder="Quote text…"
                          value={block.text}
                          onChange={(e) => updateBlock(idx, { text: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Attribution (optional)"
                          value={block.by || ''}
                          onChange={(e) => updateBlock(idx, { by: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="add-block-bar">
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600, marginRight: 8 }}>
                Add block:
              </span>
              {BLOCK_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className="add-block-btn"
                  onClick={() => addBlock(t.id)}
                >
                  + {t.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="form-error">
              <strong>⚠ {error}</strong>
            </div>
          )}

          <div className="create-actions">
            <Link to="/blog" className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-submit" disabled={slugTaken || !title.trim() || !excerpt.trim()}>
              Publish Post
            </button>
          </div>
        </form>
      </main>
    </PageLayout>
  )
}
