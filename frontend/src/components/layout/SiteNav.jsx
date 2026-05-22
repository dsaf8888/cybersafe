import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CyberSafeLogo } from '../landing/CyberSafeLogo'

/**
 * Shared site navigation used by both the landing page and the
 * PageLayout shell. Renders a flex desktop nav and collapses into
 * a slide-in drawer with hamburger button on small screens.
 *
 * Props:
 *   links      Array<{ to: string, label: string, end?: boolean }>
 *              `to` may be a route, an in-page hash (`#tools`), or a
 *              hashed route (`/#tools`).
 *   activePath Optional explicit active path for highlight matching
 *              (used by PageLayout's hash-aware nav).
 */
export default function SiteNav({ links, activePath }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isFirstRender = useRef(true)

  /* Auto-close on route / hash change (skip the first run so we don't
     cause a no-op cascading render on mount) */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setOpen(false)
  }, [location.pathname, location.hash])

  /* Prevent background scroll when drawer is open */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  /* Close on Escape */
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Toggle a subtle elevation/shadow on the sticky nav once the page
     scrolls past the very top. Uses passive listener + rAF throttling
     to keep scrolling buttery on low-end devices. */
  useEffect(() => {
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 4)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navClass = [
    open && 'nav-open',
    scrolled && 'is-scrolled',
  ].filter(Boolean).join(' ')

  return (
    <>
      <nav className={navClass}>
        <Link to="/" className="nav-brand">
          <CyberSafeLogo />
          Cyber<span>Safe</span>
        </Link>

        <div className={`nav-drawer ${open ? 'open' : ''}`}>
          <ul className="nav-links">
            {links.map((link) => {
              const isHashOnly = link.to.startsWith('#')
              const isPathHash = link.to.startsWith('/#')
              const explicitActive =
                (activePath && activePath === link.to) ||
                (!activePath && location.pathname === link.to && !location.hash)

              if (isHashOnly || isPathHash) {
                /* In-page anchor — use plain <a> so router doesn't intercept */
                return (
                  <li key={link.to}>
                    <a href={link.to} className={explicitActive ? 'active' : ''}>
                      {link.label}
                    </a>
                  </li>
                )
              }

              return (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive: routerActive }) =>
                      routerActive || explicitActive ? 'active' : ''
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="nav-actions">
            <button type="button" className="btn-ghost">Log In</button>
            <button type="button" className="btn-blue">Get Started</button>
          </div>
        </div>

        <button
          type="button"
          className={`nav-toggle ${open ? 'open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} />}
    </>
  )
}
