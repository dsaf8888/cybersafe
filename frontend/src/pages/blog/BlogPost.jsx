import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PageLayout from '../../components/layout/PageLayout'
import { BLOG_POSTS, CATEGORY_META, getRelatedPosts } from '../../data/blogPosts'
import { deletePost, selectUserPostBySlug, selectUserPosts } from '../../store/blogSlice'
import './blog.css'

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function CalloutBlock({ kind = 'info', title, text }) {
  return (
    <div className={`post-callout ${kind}`}>
      {title && <span className="callout-title">{title}</span>}
      {text}
    </div>
  )
}

function CodeBlock({ language, text }) {
  return (
    <div className="post-code">
      {language && <span className="code-lang">{language}</span>}
      <pre><code>{text}</code></pre>
    </div>
  )
}

function ListBlock({ ordered, items }) {
  return ordered ? (
    <ol>
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ol>
  ) : (
    <ul>
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  )
}

function Block({ block, idForHeading }) {
  switch (block.type) {
    case 'p':       return <p>{block.text}</p>
    case 'h2':      return <h2 id={idForHeading}>{block.text}</h2>
    case 'h3':      return <h3 id={idForHeading}>{block.text}</h3>
    case 'ul':      return <ListBlock items={block.items} />
    case 'ol':      return <ListBlock ordered items={block.items} />
    case 'callout': return <CalloutBlock kind={block.kind} title={block.title} text={block.text} />
    case 'code':    return <CodeBlock language={block.language} text={block.text} />
    case 'quote':   return (
      <div className="post-quote">
        {block.text}
        {block.by && <span className="quote-by">— {block.by}</span>}
      </div>
    )
    default:        return null
  }
}

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userPost = useSelector(selectUserPostBySlug(slug))
  const userPosts = useSelector(selectUserPosts)

  const post = useMemo(() => {
    if (userPost) return userPost
    return BLOG_POSTS.find((p) => p.slug === slug)
  }, [userPost, slug])

  const related = useMemo(() => {
    if (!post) return []
    if (post.isUserCreated) {
      const merged = [...userPosts, ...BLOG_POSTS]
      return merged.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3)
    }
    return getRelatedPosts(post)
  }, [post, userPosts])

  const [activeId, setActiveId] = useState(null)

  function handleDelete() {
    if (!post?.isUserCreated) return
    if (window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      dispatch(deletePost(post.slug))
      navigate('/blog')
    }
  }

  const tocItems = useMemo(() => {
    if (!post) return []
    return post.body
      .filter((b) => b.type === 'h2')
      .map((b) => ({ id: slugify(b.text), text: b.text }))
  }, [post])

  useEffect(() => {
    if (!post) return
    if (tocItems.length === 0) return

    const scrollRoot = document.querySelector('.post-article-scroll')
    if (!scrollRoot) return

    const headings = tocItems
      .map((t) => document.getElementById(t.id))
      .filter(Boolean)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.target.offsetTop - b.target.offsetTop)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { root: scrollRoot, rootMargin: '0px 0px -65% 0px', threshold: 0 },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [post, tocItems])

  if (!post) {
    return (
      <PageLayout>
        <div className="not-found">
          <h1>Post not found</h1>
          <p>The article you were looking for does not exist or has been moved.</p>
          <Link to="/blog" className="btn-submit" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Back to Blog
          </Link>
        </div>
      </PageLayout>
    )
  }

  const cat = CATEGORY_META[post.category]

  return (
    <PageLayout fillViewport noFooter>
      <div className="post-page post-page-split">
        {/* TOC SIDEBAR — scrolls independently */}
        <aside className="post-toc post-toc-scroll">
          <div className="post-toc-inner">
            <Link to="/blog" className="post-back">← All articles</Link>
            {post.isUserCreated && (
              <button
                type="button"
                onClick={handleDelete}
                className="post-delete-btn"
                title="Delete this post"
              >
                🗑 Delete post
              </button>
            )}
            {tocItems.length > 0 && (
              <>
                <h4>On this page</h4>
                <ol>
                  {tocItems.map((t) => (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        className={activeId === t.id ? 'active' : ''}
                        onClick={(e) => {
                          e.preventDefault()
                          const el = document.getElementById(t.id)
                          if (el) {
                            const container = document.querySelector('.post-article-scroll')
                            if (container) {
                              container.scrollTo({
                                top: el.offsetTop - 24,
                                behavior: 'smooth',
                              })
                            }
                          }
                        }}
                      >
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </aside>

        {/* ARTICLE — scrolls independently in its own pane */}
        <article className="post-article post-article-scroll">
          <div className="post-article-inner">
          <div className={`post-hero ${post.category}`} aria-hidden>
            {post.cover.emoji}
          </div>

          <header className="post-header">
            <div className="post-badge-row">
              <span className={`post-badge ${post.category}`} style={{ position: 'static' }}>
                {cat.icon} {cat.short}
              </span>
              {post.difficulty && (
                <span className={`post-difficulty ${post.difficulty}`} style={{ position: 'static' }}>
                  {post.difficulty === 'beginner' && '✅ Beginner'}
                  {post.difficulty === 'intermediate' && '⚡ Intermediate'}
                  {post.difficulty === 'advanced' && '🔥 Advanced'}
                </span>
              )}
            </div>
            <h1>{post.title}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              {post.excerpt}
            </p>

            <div className="post-author-row">
              <div className="author-avatar">{post.author.initials}</div>
              <div className="author-info">
                <div className="author-name">{post.author.name}</div>
                <div className="author-role">{post.author.role}</div>
              </div>
              <div className="post-stats">{post.date} · {post.readTime}</div>
            </div>
          </header>

          <div className="post-content">
            {post.body.map((block, idx) => {
              const id =
                block.type === 'h2' || block.type === 'h3'
                  ? slugify(block.text)
                  : undefined
              return <Block key={idx} block={block} idForHeading={id} />
            })}
          </div>

          {post.tags?.length > 0 && (
            <div className="post-tag-row">
              <span className="tag-label">Tags:</span>
              {post.tags.map((t) => (
                <Link key={t} to={`/blog?tag=${t}`} className="tag-chip">#{t}</Link>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <section className="post-related">
              <h3>Related articles</h3>
              <div className="related-grid">
                {related.map((p) => (
                  <Link key={p.slug} to={`/blog/${p.slug}`} className="post-card">
                    <div className={`post-cover ${p.category}`} style={{ height: 110, fontSize: '2.2rem' }}>
                      {p.cover.emoji}
                    </div>
                    <div className="post-body" style={{ padding: '14px 16px 16px' }}>
                      <div className="post-title" style={{ fontSize: '0.95rem' }}>{p.title}</div>
                      <div className="post-meta">
                        <span>{p.readTime}</span>
                        <span className="read-more">Read →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          </div>
        </article>
      </div>
    </PageLayout>
  )
}
