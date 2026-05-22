import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CyberSafeLogo } from '../landing/CyberSafeLogo'
import '../../pages/landing/cybershield.css'
import './page-layout.css'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/#tools', label: 'Tools' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About Us' },
]

export default function PageLayout({ children, activePath, noFooter = false, fillViewport = false }) {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
    }
  }, [location.pathname, location.hash])

  return (
    <div className={`cs-home cs-page ${fillViewport ? 'cs-page-fill' : ''}`}>
      <nav>
        <Link to="/" className="nav-brand">
          <CyberSafeLogo />
          Cyber<span>Safe</span>
        </Link>
        <ul className="nav-links">
          {NAV_LINKS.map((link) => {
            const isActive =
              (activePath && activePath === link.to) ||
              (!activePath && location.pathname === link.to && !location.hash)
            return (
              <li key={link.to}>
                {link.to.startsWith('/#') ? (
                  <Link to={link.to} className={isActive ? 'active' : ''}>
                    {link.label}
                  </Link>
                ) : (
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive: routerActive }) =>
                      routerActive || isActive ? 'active' : ''
                    }
                  >
                    {link.label}
                  </NavLink>
                )}
              </li>
            )
          })}
        </ul>
        <div className="nav-actions">
          <button type="button" className="btn-ghost">Log In</button>
          <button type="button" className="btn-blue">Get Started</button>
        </div>
      </nav>

      {children}

      {!noFooter && <SiteFooter />}
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <CyberSafeLogo size={20} />
            CyberSafe
          </div>
          <div className="footer-tagline">
            Making cybersecurity simple<br />
            for everyone.
          </div>
          <div className="footer-socials">
            <div className="social-icon">f</div>
            <div className="social-icon">𝕏</div>
            <div className="social-icon">in</div>
            <div className="social-icon">📷</div>
          </div>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/#tools">Tools</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><Link to="/safety-tips">Safety Tips</Link></li>
            <li><Link to="/guides">Guides</Link></li>
            <li><Link to="/faq">FAQs</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><Link to="/about#contact">Contact Us</Link></li>
            <li><Link to="/report-issue">Report an Issue</Link></li>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/set-content">⚙️ Set Tool Content</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>&nbsp;</h4>
          <div className="footer-secure">
            <span>🔒</span>
            <div className="footer-secure-text">
              Secure &amp; Trusted<br />
              <span className="footer-secure-sub">Your data is encrypted and never shared.</span>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">© 2024 CyberSafe. All rights reserved.</div>
    </footer>
  )
}

export function PageHero({ eyebrow, title, subtitle, badge }) {
  return (
    <header className="page-hero">
      <div className="page-hero-inner">
        {badge && <span className="page-hero-badge">{badge}</span>}
        {eyebrow && <div className="page-hero-eyebrow">{eyebrow}</div>}
        <h1 className="page-hero-title">{title}</h1>
        {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
      </div>
    </header>
  )
}
