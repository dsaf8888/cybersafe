import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PageLayout, { PageHero } from '../components/layout/PageLayout'
import { addGuide, selectUserGuides } from '../store/guidesSlice'
import { GUIDES, LEVEL_META } from '../data/guides'
import './blog/blog.css'
import './create-guide.css'

/* ---------- helpers ---------- */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const ICON_PRESETS = ['🔑', '📧', '🔐', '🌐', '📱', '💾', '🛡️', '🔓', '👨‍💻', '🏢', '🔧', '🚨', '📜', '💡', '🎯', '⚠️']

const COVERS = [
  { id: 'blue',   label: 'Blue',   color: '#c7d2fe', tagClass: '' },
  { id: 'green',  label: 'Green',  color: '#86efac', tagClass: 'green' },
  { id: 'amber',  label: 'Amber',  color: '#fdba74', tagClass: 'amber' },
  { id: 'purple', label: 'Purple', color: '#d8b4fe', tagClass: 'purple' },
  { id: 'rose',   label: 'Rose',   color: '#fda4af', tagClass: 'rose' },
  { id: 'slate',  label: 'Slate',  color: '#94a3b8', tagClass: '' },
]

const BLOCK_TYPES = [
  { id: 'p',       label: 'Paragraph' },
  { id: 'h',       label: 'Sub-heading' },
  { id: 'ul',      label: 'Bullet list' },
  { id: 'ol',      label: 'Numbered list' },
  { id: 'callout', label: 'Callout' },
  { id: 'code',    label: 'Code block' },
]

const CALLOUT_KINDS = [
  { id: 'tip',  label: 'Tip (green)' },
  { id: 'info', label: 'Info (blue)' },
  { id: 'warn', label: 'Warning (red)' },
]

const CODE_LANGUAGES = ['plaintext', 'bash', 'javascript', 'typescript', 'python', 'json', 'yaml', 'html', 'css', 'sql']

function defaultBlock(type) {
  switch (type) {
    case 'ul':
    case 'ol':      return { type, items: [''] }
    case 'callout': return { type, kind: 'tip', title: '', text: '' }
    case 'code':    return { type, language: 'plaintext', text: '' }
    default:        return { type, text: '' }
  }
}

function emptyStep() {
  return { title: '', time: '3 min', blocks: [{ type: 'p', text: '' }] }
}

/* =============================================================== */
/*  PAGE                                                            */
/* =============================================================== */

export default function CreateGuide() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userGuides = useSelector(selectUserGuides)

  /* ─── metadata ─── */
  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [tag, setTag]           = useState('')
  const [level, setLevel]       = useState('beginner')
  const [icon, setIcon]         = useState('🔑')
  const [cover, setCover]       = useState('blue')
  const [readTime, setReadTime] = useState(10)
  const [authorName, setAuthorName] = useState('Anonymous Author')
  const [authorRole, setAuthorRole] = useState('Contributor')

  /* ─── learnings + prerequisites ─── */
  const [learnings, setLearnings] = useState([''])
  const [prereqs, setPrereqs]     = useState([''])

  /* ─── steps ─── */
  const [steps, setSteps] = useState([emptyStep()])

  /* ─── ui ─── */
  const [error, setError] = useState('')
  const [expandedStep, setExpandedStep] = useState(0)

  const slug = useMemo(() => slugify(title), [title])
  const slugTaken = useMemo(() => {
    const all = [...userGuides.map((g) => g.slug), ...GUIDES.map((g) => g.slug)]
    return slug && all.includes(slug)
  }, [slug, userGuides])

  /* ───────── learnings / prereqs ───────── */
  function updateList(list, setter, idx, value) {
    setter(list.map((it, i) => (i === idx ? value : it)))
  }
  function addListItem(list, setter) {
    setter([...list, ''])
  }
  function removeListItem(list, setter, idx) {
    const next = list.filter((_, i) => i !== idx)
    setter(next.length ? next : [''])
  }

  /* ───────── steps ───────── */
  function addStep() {
    setSteps((s) => [...s, emptyStep()])
    setExpandedStep(steps.length)
  }
  function removeStep(idx) {
    setSteps((s) => {
      const next = s.filter((_, i) => i !== idx)
      return next.length ? next : [emptyStep()]
    })
  }
  function moveStep(idx, delta) {
    setSteps((s) => {
      const next = [...s]
      const t = idx + delta
      if (t < 0 || t >= next.length) return s
      ;[next[idx], next[t]] = [next[t], next[idx]]
      return next
    })
  }
  function updateStep(idx, patch) {
    setSteps((s) => s.map((st, i) => (i === idx ? { ...st, ...patch } : st)))
  }

  /* ───────── blocks inside a step ───────── */
  function addBlock(stepIdx, type) {
    setSteps((s) =>
      s.map((st, i) => (i === stepIdx ? { ...st, blocks: [...st.blocks, defaultBlock(type)] } : st)),
    )
  }
  function removeBlock(stepIdx, blockIdx) {
    setSteps((s) =>
      s.map((st, i) =>
        i === stepIdx ? { ...st, blocks: st.blocks.filter((_, j) => j !== blockIdx) } : st,
      ),
    )
  }
  function moveBlock(stepIdx, blockIdx, delta) {
    setSteps((s) =>
      s.map((st, i) => {
        if (i !== stepIdx) return st
        const next = [...st.blocks]
        const t = blockIdx + delta
        if (t < 0 || t >= next.length) return st
        ;[next[blockIdx], next[t]] = [next[t], next[blockIdx]]
        return { ...st, blocks: next }
      }),
    )
  }
  function updateBlock(stepIdx, blockIdx, patch) {
    setSteps((s) =>
      s.map((st, i) => {
        if (i !== stepIdx) return st
        return { ...st, blocks: st.blocks.map((b, j) => (j === blockIdx ? { ...b, ...patch } : b)) }
      }),
    )
  }
  function updateBlockItem(stepIdx, blockIdx, itemIdx, value) {
    setSteps((s) =>
      s.map((st, i) => {
        if (i !== stepIdx) return st
        const blocks = st.blocks.map((b, j) => {
          if (j !== blockIdx) return b
          const items = [...(b.items || [])]
          items[itemIdx] = value
          return { ...b, items }
        })
        return { ...st, blocks }
      }),
    )
  }
  function addBlockItem(stepIdx, blockIdx) {
    setSteps((s) =>
      s.map((st, i) => {
        if (i !== stepIdx) return st
        const blocks = st.blocks.map((b, j) =>
          j === blockIdx ? { ...b, items: [...(b.items || []), ''] } : b,
        )
        return { ...st, blocks }
      }),
    )
  }
  function removeBlockItem(stepIdx, blockIdx, itemIdx) {
    setSteps((s) =>
      s.map((st, i) => {
        if (i !== stepIdx) return st
        const blocks = st.blocks.map((b, j) => {
          if (j !== blockIdx) return b
          const items = (b.items || []).filter((_, k) => k !== itemIdx)
          return { ...b, items: items.length ? items : [''] }
        })
        return { ...st, blocks }
      }),
    )
  }

  /* ───────── submit ───────── */
  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim())  return setError('Title is required.')
    if (!desc.trim())   return setError('Description is required.')
    if (!tag.trim())    return setError('Tag is required (eg. "Passwords", "Email").')
    if (slugTaken)      return setError('A guide with this title already exists.')

    const cleanLearnings = learnings.map((l) => l.trim()).filter(Boolean)
    const cleanPrereqs   = prereqs.map((p) => p.trim()).filter(Boolean)

    if (cleanLearnings.length === 0) return setError('Add at least one "What you\'ll learn" item.')
    if (cleanPrereqs.length === 0)   return setError('Add at least one prerequisite (or "None required").')

    /* clean each step's blocks the same way blog does */
    const cleanSteps = steps
      .map((st) => {
        const blocks = (st.blocks || [])
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
            const text = (b.text || '').trim()
            return text ? { ...b, text } : null
          })
          .filter(Boolean)
        return {
          title: (st.title || '').trim(),
          time: (st.time || '').trim() || '3 min',
          blocks,
        }
      })
      .filter((st) => st.title && st.blocks.length > 0)

    if (cleanSteps.length === 0) {
      return setError('Add at least one step with a title and one block of content.')
    }

    const coverDef = COVERS.find((c) => c.id === cover) || COVERS[0]
    const levelMeta = LEVEL_META[level]
    const minutes = Number(readTime) || 10

    const guide = {
      slug: slug || `guide-${Date.now()}`,
      level,
      icon: icon || '📘',
      cover: coverDef.id,
      tag: tag.trim(),
      tagClass: coverDef.tagClass,
      title: title.trim(),
      desc: desc.trim(),
      meta: `${minutes} min · ${levelMeta.label}`,
      readTime: minutes,
      author: { name: authorName.trim() || 'Anonymous', role: authorRole.trim() || 'Contributor' },
      learnings: cleanLearnings,
      prerequisites: cleanPrereqs,
      steps: cleanSteps,
      relatedSlugs: [],
    }

    dispatch(addGuide(guide))
    navigate(`/guides/${guide.slug}`)
  }

  const totalBlocks = steps.reduce((sum, st) => sum + (st.blocks?.length || 0), 0)

  return (
    <PageLayout>
      <PageHero
        badge="Author"
        title="Create a New Guide"
        subtitle="Share a step-by-step security guide with the community. Your guide is saved locally (Redux + localStorage) and immediately appears in the Guides listing."
      />

      <main className="page-body" style={{ maxWidth: 1080 }}>
        <form onSubmit={handleSubmit} className="create-form">
          {/* ===== METADATA ===== */}
          <div className="form-card create-section">
            <h2 className="create-section-title">📋 Guide details</h2>

            <div className="form-field">
              <label htmlFor="title">Title <span className="req">*</span></label>
              <input
                id="title"
                type="text"
                placeholder="Eg. How to Configure a Hardware Security Key"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className="field-hint">
                URL: <code>/guides/{slug || 'your-guide-slug'}</code>
                {slugTaken && <span style={{ color: '#dc2626', marginLeft: 8 }}>· Already taken!</span>}
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="desc">Short description <span className="req">*</span></label>
              <textarea
                id="desc"
                rows={2}
                maxLength={180}
                placeholder="1–2 sentence summary shown on the listing card."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
              <span className="field-hint">{desc.length}/180 characters</span>
            </div>

            <div className="form-row-3">
              <div className="form-field">
                <label htmlFor="tag">Tag <span className="req">*</span></label>
                <input
                  id="tag"
                  type="text"
                  placeholder="Passwords, Email, Network…"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="readTime">Read time (minutes)</label>
                <input
                  id="readTime"
                  type="number"
                  min="1"
                  max="120"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="level">Level</label>
                <select id="level" value={level} onChange={(e) => setLevel(e.target.value)}>
                  {Object.entries(LEVEL_META).map(([id, m]) => (
                    <option key={id} value={id}>{m.icon} {m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Cover color</label>
              <div className="cover-pick">
                {COVERS.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={`cover-pick-item ${cover === c.id ? 'active' : ''}`}
                    onClick={() => setCover(c.id)}
                    title={c.label}
                  >
                    <span className={`cover-swatch guide-cover-${c.id}`} aria-hidden />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>Icon</label>
              <div className="emoji-pick">
                {ICON_PRESETS.map((e) => (
                  <button
                    type="button"
                    key={e}
                    className={`emoji-pick-item ${icon === e ? 'active' : ''}`}
                    onClick={() => setIcon(e)}
                  >
                    {e}
                  </button>
                ))}
                <input
                  type="text"
                  maxLength={4}
                  className="emoji-pick-input"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🎨"
                  aria-label="Custom icon"
                />
              </div>
            </div>
          </div>

          {/* ===== AUTHOR ===== */}
          <div className="form-card create-section">
            <h2 className="create-section-title">👤 Author</h2>
            <div className="form-row-2">
              <div className="form-field">
                <label htmlFor="authorName">Name</label>
                <input id="authorName" type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="authorRole">Role / Title</label>
                <input id="authorRole" type="text" value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ===== LEARNINGS + PREREQS ===== */}
          <div className="form-card create-section">
            <h2 className="create-section-title">🎯 What readers will learn</h2>
            <p className="create-section-sub">Bullet points shown at the top of the guide.</p>
            <ListBuilder
              items={learnings}
              onUpdate={(idx, v) => updateList(learnings, setLearnings, idx, v)}
              onAdd={() => addListItem(learnings, setLearnings)}
              onRemove={(idx) => removeListItem(learnings, setLearnings, idx)}
              placeholder="Eg. How to set up DNS-over-HTTPS"
            />
          </div>

          <div className="form-card create-section">
            <h2 className="create-section-title">📋 Prerequisites</h2>
            <p className="create-section-sub">What readers should have ready before starting.</p>
            <ListBuilder
              items={prereqs}
              onUpdate={(idx, v) => updateList(prereqs, setPrereqs, idx, v)}
              onAdd={() => addListItem(prereqs, setPrereqs)}
              onRemove={(idx) => removeListItem(prereqs, setPrereqs, idx)}
              placeholder="Eg. A router with admin access"
            />
          </div>

          {/* ===== STEPS ===== */}
          <div className="form-card create-section">
            <div className="steps-section-head">
              <div>
                <h2 className="create-section-title" style={{ marginBottom: 4 }}>📚 Steps</h2>
                <p className="create-section-sub" style={{ marginTop: 0 }}>
                  {steps.length} step{steps.length === 1 ? '' : 's'} · {totalBlocks} block{totalBlocks === 1 ? '' : 's'} of content.
                </p>
              </div>
              <button type="button" className="add-step-btn" onClick={addStep}>
                + Add step
              </button>
            </div>

            <div className="steps-builder">
              {steps.map((step, sIdx) => {
                const isOpen = expandedStep === sIdx
                return (
                  <div key={sIdx} className={`step-card ${isOpen ? 'open' : ''}`}>
                    <header
                      className="step-card-head"
                      onClick={() => setExpandedStep(isOpen ? -1 : sIdx)}
                    >
                      <span className="step-card-num">{sIdx + 1}</span>
                      <div className="step-card-titlebox">
                        <span className="step-card-title">
                          {step.title || <em style={{ color: 'var(--muted)' }}>Untitled step</em>}
                        </span>
                        <span className="step-card-sub">
                          {step.time} · {step.blocks.length} block{step.blocks.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="step-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => moveStep(sIdx, -1)} disabled={sIdx === 0} title="Move up">↑</button>
                        <button type="button" onClick={() => moveStep(sIdx, 1)} disabled={sIdx === steps.length - 1} title="Move down">↓</button>
                        <button type="button" onClick={() => removeStep(sIdx)} title="Remove step">✕</button>
                        <span className="step-card-toggle">{isOpen ? '▴' : '▾'}</span>
                      </div>
                    </header>

                    {isOpen && (
                      <div className="step-card-body">
                        <div className="form-row-2">
                          <div className="form-field" style={{ marginBottom: 0 }}>
                            <label>Step title <span className="req">*</span></label>
                            <input
                              type="text"
                              placeholder="Eg. Install an authenticator app"
                              value={step.title}
                              onChange={(e) => updateStep(sIdx, { title: e.target.value })}
                            />
                          </div>
                          <div className="form-field" style={{ marginBottom: 0 }}>
                            <label>Estimated time</label>
                            <input
                              type="text"
                              placeholder="3 min"
                              value={step.time}
                              onChange={(e) => updateStep(sIdx, { time: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* blocks for this step */}
                        <div className="step-blocks">
                          {step.blocks.map((block, bIdx) => (
                            <div key={bIdx} className="block-editor">
                              <div className="block-header">
                                <span className="block-type-pill">
                                  {BLOCK_TYPES.find((t) => t.id === block.type)?.label || block.type}
                                </span>
                                <div className="block-actions">
                                  <button type="button" onClick={() => moveBlock(sIdx, bIdx, -1)} disabled={bIdx === 0}>↑</button>
                                  <button type="button" onClick={() => moveBlock(sIdx, bIdx, 1)} disabled={bIdx === step.blocks.length - 1}>↓</button>
                                  <button type="button" onClick={() => removeBlock(sIdx, bIdx)}>✕</button>
                                </div>
                              </div>

                              <div className="block-body">
                                {(block.type === 'p' || block.type === 'h') && (
                                  <textarea
                                    rows={block.type === 'p' ? 4 : 2}
                                    placeholder={block.type === 'p' ? 'Write a paragraph…' : 'Sub-heading text'}
                                    value={block.text}
                                    onChange={(e) => updateBlock(sIdx, bIdx, { text: e.target.value })}
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
                                          onChange={(e) => updateBlockItem(sIdx, bIdx, ii, e.target.value)}
                                          placeholder="List item…"
                                        />
                                        <button type="button" onClick={() => removeBlockItem(sIdx, bIdx, ii)}>✕</button>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => addBlockItem(sIdx, bIdx)} className="add-item-btn">
                                      + Add item
                                    </button>
                                  </div>
                                )}

                                {block.type === 'callout' && (
                                  <div className="callout-editor">
                                    <div className="callout-row">
                                      <select value={block.kind || 'tip'} onChange={(e) => updateBlock(sIdx, bIdx, { kind: e.target.value })}>
                                        {CALLOUT_KINDS.map((k) => (
                                          <option key={k.id} value={k.id}>{k.label}</option>
                                        ))}
                                      </select>
                                      <input
                                        type="text"
                                        placeholder="Title (optional)"
                                        value={block.title || ''}
                                        onChange={(e) => updateBlock(sIdx, bIdx, { title: e.target.value })}
                                      />
                                    </div>
                                    <textarea
                                      rows={3}
                                      placeholder="Callout text…"
                                      value={block.text}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { text: e.target.value })}
                                    />
                                  </div>
                                )}

                                {block.type === 'code' && (
                                  <div className="code-editor">
                                    <select value={block.language} onChange={(e) => updateBlock(sIdx, bIdx, { language: e.target.value })}>
                                      {CODE_LANGUAGES.map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                      ))}
                                    </select>
                                    <textarea
                                      rows={6}
                                      className="code-textarea"
                                      placeholder="// your code…"
                                      value={block.text}
                                      onChange={(e) => updateBlock(sIdx, bIdx, { text: e.target.value })}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="add-block-bar">
                          <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 600, marginRight: 8 }}>
                            Add block to step {sIdx + 1}:
                          </span>
                          {BLOCK_TYPES.map((t) => (
                            <button
                              type="button"
                              key={t.id}
                              className="add-block-btn"
                              onClick={() => addBlock(sIdx, t.id)}
                            >
                              + {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="form-error">
              <strong>⚠ {error}</strong>
            </div>
          )}

          <div className="create-actions">
            <Link to="/guides" className="btn-secondary">Cancel</Link>
            <button
              type="submit"
              className="btn-submit"
              disabled={slugTaken || !title.trim() || !desc.trim() || !tag.trim()}
            >
              Publish Guide
            </button>
          </div>
        </form>
      </main>
    </PageLayout>
  )
}

/* ---------- Reusable list builder for learnings / prereqs ---------- */
function ListBuilder({ items, onUpdate, onAdd, onRemove, placeholder }) {
  return (
    <div className="list-editor">
      {items.map((item, idx) => (
        <div key={idx} className="list-editor-row">
          <span className="list-bullet">•</span>
          <input
            type="text"
            value={item}
            onChange={(e) => onUpdate(idx, e.target.value)}
            placeholder={placeholder}
          />
          <button type="button" onClick={() => onRemove(idx)} title="Remove">✕</button>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="add-item-btn">
        + Add item
      </button>
    </div>
  )
}
