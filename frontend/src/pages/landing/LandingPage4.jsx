import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CyberSafeLogo } from '../../components/landing/CyberSafeLogo'
import SiteNav from '../../components/layout/SiteNav'
import './cybershield.css'

const LANDING_NAV_LINKS = [
  { to: '#top',    label: 'Home' },
  { to: '#tools',  label: 'Tools' },
  { to: '/blog',   label: 'Blog' },
  { to: '/help',   label: 'Dashboard' },
  { to: '/about',  label: 'About Us' },
]

function ScoreCard() {
  return (
    <div className="score-card">
      <div className="score-header">
        <div className="score-gauge-wrap">
          <div className="score-gauge-title">Your Security Score</div>
          <div className="score-ring" aria-hidden>
            <svg className="ring-svg" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              <circle
                className="ring-track"
                cx="60"
                cy="60"
                r="50"
                fill="none"
                strokeWidth="10"
              />
              <circle
                className="ring-fill"
                cx="60"
                cy="60"
                r="50"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="314.16"
                strokeDashoffset="69.12"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="ring-score">
              <span className="ring-score-value">78</span>
              <span className="ring-score-max">/ 100</span>
              <span className="ring-score-label">Good</span>
            </div>
          </div>
          <p className="gauge-hint">
            You&apos;re doing well! Improve a few areas to be safer.
          </p>
          <button type="button" className="score-card-cta">View Full Report</button>
        </div>
        <div className="recent-col">
          <div className="recent-col-head">
            <span className="recent-title">Recent Scans</span>
            <a href="#scans" className="recent-link">View all</a>
          </div>
          <div className="scan-item">
            <div className="scan-icon blue-bg">📧</div>
            <div>
              <div className="scan-name">Email Breach Check</div>
              <div className="scan-sub">No breaches found</div>
            </div>
            <span className="badge safe">Safe</span>
          </div>
          <div className="scan-item">
            <div className="scan-icon green-bg">🔒</div>
            <div>
              <div className="scan-name">Password Strength</div>
              <div className="scan-sub">Strong</div>
            </div>
            <span className="badge good">Good</span>
          </div>
          <div className="scan-item">
            <div className="scan-icon blue-bg">🔗</div>
            <div>
              <div className="scan-name">URL Scanner</div>
              <div className="scan-sub">1 risk detected</div>
            </div>
            <span className="badge medium">Medium</span>
          </div>
          <div className="scan-item">
            <div className="scan-icon green-bg">🛡️</div>
            <div>
              <div className="scan-name">Phishing Test</div>
              <div className="scan-sub">4/5 Correct</div>
            </div>
            <span className="badge good">Good</span>
          </div>
        </div>
      </div>
      <div className="alert-bar">
        <span className="alert-icon">⚠️</span>
        <div className="alert-content">
          <span className="alert-tag">New Alert</span>
          <div className="alert-title">New phishing campaign detected</div>
          <div className="alert-sub">Fake login pages targeting email users.</div>
        </div>
        <span className="badge hr">High Risk</span>
      </div>
    </div>
  )
}

function BlogCard({ imgClass, imgStyle, emoji, badge, badgeClass, difficulty, title, desc, meta, readMoreClass }) {
  return (
    <div className="blog-card">
      <div className="blog-img">
        <div className={`blog-img-bg ${imgClass}`} style={imgStyle}>{emoji}</div>
        <span className={`blog-badge ${badgeClass}`}>{badge}</span>
      </div>
      <div className="blog-body">
        {difficulty && <span className={`blog-difficulty ${difficulty.className}`}>{difficulty.label}</span>}
        <div className="blog-title">{title}</div>
        <div className="blog-desc">{desc}</div>
        <div className="blog-meta">
          <span>{meta}</span>
          <span className={`blog-read-more ${readMoreClass || ''}`.trim()}>Read More →</span>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage4() {
  const [activeTab, setActiveTab] = useState('everyone')

  return (
    <div className="cs-home">
      <SiteNav links={LANDING_NAV_LINKS} activePath="#top" />

      <section id="top" className="hero">
        <div className="hero-left">
          <h1>
            Stay Safe Online.<br />
            <span className="blue">Know Your Risk</span><br />
            in Seconds.
          </h1>
          <p>
            Check your passwords, emails, links and more with powerful yet simple tools. Get instant results and easy recommendations to protect your digital life.
          </p>
          <div className="hero-btns">
            <button type="button" className="btn-hero-primary">Try Free Tools →</button>
            <button type="button" className="btn-hero-outline">Get Started</button>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              <div className="trust-avatar" />
              <div className="trust-avatar" />
              <div className="trust-avatar" />
              <div className="trust-avatar" />
            </div>
            <div>
              <strong>10,000+</strong><br />
              Users trust CyberSafe
            </div>
          </div>
        </div>
        <ScoreCard />
      </section>

      <div className="trust-bar">
        <div className="trust-item">
          <div className="trust-item-icon">🛡️</div>
          <div>
            <div className="trust-item-title">100% Secure</div>
            <div className="trust-item-sub">Your data stays private</div>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-item-icon">👤</div>
          <div>
            <div className="trust-item-title">No Sign-up Required</div>
            <div className="trust-item-sub">Try tools for free</div>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-item-icon">👥</div>
          <div>
            <div className="trust-item-title">Trusted by 10,000+ Users</div>
            <div className="trust-item-sub">Across India</div>
          </div>
        </div>
        <div className="trust-item">
          <div className="trust-item-icon">✅</div>
          <div>
            <div className="trust-item-title">Accurate & Reliable</div>
            <div className="trust-item-sub">Real-time threat data</div>
          </div>
        </div>
      </div>

      <section className="features">
        <div className="section-title">Everything You Need to Stay Secure</div>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <div className="feature-name">Instant Security Checks</div>
            <div className="feature-desc">Run multiple security tests in seconds.</div>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <div className="feature-name">Personalized Score</div>
            <div className="feature-desc">Get your security score and track improvement.</div>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💡</span>
            <div className="feature-name">Actionable Tips</div>
            <div className="feature-desc">Clear recommendations to fix issues fast.</div>
          </div>
          <div className="feature-card">
            <span className="feature-icon">👨‍👩‍👧‍👦</span>
            <div className="feature-name">For Everyone</div>
            <div className="feature-desc">Designed for students, employees and all internet users.</div>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔔</span>
            <div className="feature-name">Stay Updated</div>
            <div className="feature-desc">Cyber news, alerts and tips to stay ahead of threats.</div>
          </div>
        </div>
      </section>

      <section id="tools" className="tools">
        <div className="tools-intro">
          <div className="section-title">Powerful Tools at Your Fingertips</div>
          <p className="section-sub">Test what matters. Get instant results.</p>
        </div>
        <div className="tools-grid">
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: '#fff' }}>🛡️</div>
            <div className="tool-name">Network Security Test</div>
            <ul className="tool-checks">
              <li>Detect DNS &amp; WebRTC leaks</li>
              <li>Spot open ports &amp; weak TLS</li>
              <li>Get a security score &amp; fixes</li>
            </ul>
            <Link to="/tools/network-security" className="tool-link">Run Test →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img">🔐</div>
            <div className="tool-name">Password Strength</div>
            <ul className="tool-checks">
              <li>Check password strength</li>
              <li>Estimate crack time</li>
              <li>Get suggestions</li>
            </ul>
            <Link to="/tools/password-strength" className="tool-link">Try Now →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#fff7ed,#fed7aa)' }}>📧</div>
            <div className="tool-name">Email Breach Checker</div>
            <ul className="tool-checks">
              <li>Check if your email is leaked</li>
              <li>See breach sources</li>
              <li>Get recovery steps</li>
            </ul>
            <Link to="/tools/email-breach" className="tool-link">Check now →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#f0fdf4,#bbf7d0)' }}>🔗</div>
            <div className="tool-name">URL Safety Scanner</div>
            <ul className="tool-checks">
              <li>Detect phishing or unsafe sites</li>
              <li>Check HTTPS &amp; domain age</li>
              <li>Identify suspicious links</li>
            </ul>
            <Link to="/tools/url-scanner" className="tool-link">Scan URL →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#faf5ff,#e9d5ff)' }}>🎣</div>
            <div className="tool-name">Phishing Awareness Test</div>
            <ul className="tool-checks">
              <li>Test your awareness</li>
              <li>Learn from mistakes</li>
              <li>Improve your security habits</li>
            </ul>
            <Link to="/tools/phishing-quiz" className="tool-link">Take quiz →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#eff6ff,#bfdbfe)' }}>📊</div>
            <div className="tool-name">Account Security Score</div>
            <ul className="tool-checks">
              <li>Personal habit survey</li>
              <li>Get a 0–100 score</li>
              <li>See your weakest areas</li>
            </ul>
            <Link to="/tools/account-security-score" className="tool-link">Get my score →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#ecfeff,#a5f3fc)' }}>🌐</div>
            <div className="tool-name">Browser Security Checker</div>
            <ul className="tool-checks">
              <li>Detect outdated browsers</li>
              <li>Spot fingerprint leaks</li>
              <li>Audit privacy settings</li>
            </ul>
            <Link to="/tools/browser-security" className="tool-link">Auto-scan →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#fdf2f8,#fbcfe8)' }}>💬</div>
            <div className="tool-name">Scam Message Analyzer</div>
            <ul className="tool-checks">
              <li>Paste any SMS / email</li>
              <li>14 scam patterns detected</li>
              <li>Red flags highlighted inline</li>
            </ul>
            <Link to="/tools/scam-analyzer" className="tool-link">Analyze text →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#fff1f2,#fecdd3)' }}>📁</div>
            <div className="tool-name">File Safety Checker</div>
            <ul className="tool-checks">
              <li>Drag &amp; drop any file</li>
              <li>SHA-256 + extension check</li>
              <li>Spot disguised executables</li>
            </ul>
            <Link to="/tools/file-safety" className="tool-link">Scan file →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#f0f9ff,#bae6fd)' }}>📶</div>
            <div className="tool-name">WiFi Safety Checker</div>
            <ul className="tool-checks">
              <li>Home / Public / Office wizard</li>
              <li>Encryption + router checks</li>
              <li>Tailored hardening steps</li>
            </ul>
            <Link to="/tools/wifi-safety" className="tool-link">Check WiFi →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)' }}>🔐</div>
            <div className="tool-name">Social Media Privacy</div>
            <ul className="tool-checks">
              <li>Instagram, Facebook, X &amp; more</li>
              <li>Per-platform checklists</li>
              <li>Direct settings shortcuts</li>
            </ul>
            <Link to="/tools/social-privacy" className="tool-link">Audit privacy →</Link>
          </div>
          <div className="tool-card">
            <div className="tool-img" style={{ background: 'linear-gradient(135deg,#fff7ed,#fed7aa)' }}>⚡</div>
            <div className="tool-name">Website Performance</div>
            <ul className="tool-checks">
              <li>Real Lighthouse scores</li>
              <li>Core Web Vitals + opportunities</li>
              <li>Mobile &amp; desktop audit</li>
            </ul>
            <Link to="/tools/website-performance" className="tool-link">Run audit →</Link>
          </div>
        </div>
      </section>

      <section id="blog" className="blog">
        <div className="blog-header">
          <div className="blog-header-left">
            <h2>Latest Insights & Security Tips</h2>
            <p>Guides and deep-dives for everyone — from everyday users to developers.</p>
          </div>
          <button type="button" className="btn-view-all">View All Blogs</button>
        </div>

        <div className="blog-tabs">
          <button
            type="button"
            className={`blog-tab ${activeTab === 'everyone' ? 'active' : ''}`}
            onClick={() => setActiveTab('everyone')}
          >
            <span className="tab-icon">🛡️</span> For Everyone <span className="tab-count">13</span>
          </button>
          <button
            type="button"
            className={`blog-tab dev-tab ${activeTab === 'dev' ? 'active' : ''}`}
            onClick={() => setActiveTab('dev')}
          >
            <span className="tab-icon">👨‍💻</span> For Developers <span className="tab-count">8</span>
          </button>
          <button
            type="button"
            className={`blog-tab biz-tab ${activeTab === 'biz' ? 'active' : ''}`}
            onClick={() => setActiveTab('biz')}
          >
            <span className="tab-icon">🏢</span> For Businesses <span className="tab-count">6</span>
          </button>
        </div>

        <div className={`blog-panel ${activeTab === 'everyone' ? 'active' : ''}`} id="panel-everyone">
          <div className="blog-grid">
            <BlogCard imgClass="p1" emoji="💻" badge="For Everyone" badgeClass="everyone" title="Is Your Email Already Leaked?" desc="Learn how to check if your email has been exposed in known data breaches, which services were affected, and the exact steps to take next to secure your accounts before criminals exploit the leak." meta="May 15, 2026 · 5 min read" />
            <BlogCard imgClass="p2" emoji="🔒" badge="For Everyone" badgeClass="everyone" title="Top 5 Password Mistakes People Make" desc="Avoid these common password mistakes that make your accounts easy targets for hackers — from reuse and short passphrases to predictable patterns — plus practical fixes you can apply in under five minutes." meta="May 10, 2026 · 4 min read" />
            <BlogCard imgClass="p3" emoji="🎣" badge="For Everyone" badgeClass="everyone" title="How to Identify a Phishing Link" desc="Spot fake links and spoofed websites in seconds before you click. We walk through real-world examples, red flags in URLs and senders, and simple habits that stop phishing attacks cold." meta="May 5, 2026 · 6 min read" />
            <BlogCard imgClass="p4" emoji="📱" badge="For Everyone" badgeClass="everyone" title="5 Signs Your Phone May Be Compromised" desc="Unusual battery drain, mystery apps, and strange pop-ups can mean malware or spyware. Discover the warning signs, how to verify your device health, and what to do immediately if something looks wrong." meta="Apr 28, 2026 · 5 min read" />
          </div>
        </div>

        <div className={`blog-panel ${activeTab === 'dev' ? 'active' : ''}`} id="panel-dev">
          <div className="blog-grid">
            <BlogCard imgClass="d1" emoji="🔑" badge="Developer" badgeClass="dev" difficulty={{ className: 'intermediate', label: '⚡ Intermediate' }} title="How to Store Passwords Securely — Never Plain Text" desc="bcrypt, Argon2, salting explained with real code examples. The right way to handle user credentials in your app." meta="May 20, 2026 · 7 min read" readMoreClass="dev" />
            <BlogCard imgClass="d2" emoji="🔌" badge="Developer" badgeClass="dev" difficulty={{ className: 'advanced', label: '🔥 Advanced' }} title="Top 10 API Security Mistakes Developers Make" desc="From broken auth to mass assignment — real vulnerabilities found in production APIs and how to fix them." meta="May 16, 2026 · 9 min read" readMoreClass="dev" />
            <BlogCard imgClass="d3" emoji="💉" badge="Developer" badgeClass="dev" difficulty={{ className: 'beginner', label: '✅ Beginner' }} title="SQL Injection — How It Works & How to Prevent It" desc="A hands-on breakdown of SQL injection with live examples and parameterized query solutions in Python, Node & PHP." meta="May 12, 2026 · 8 min read" readMoreClass="dev" />
            <BlogCard imgClass="d1" imgStyle={{ background: 'linear-gradient(135deg,#1c1917,#1a1a2e,#0d0d2b)' }} emoji="🪙" badge="Developer" badgeClass="dev" difficulty={{ className: 'intermediate', label: '⚡ Intermediate' }} title="Securing JWTs: What Most Tutorials Get Wrong" desc={'Algorithm confusion, "none" attacks, insecure storage — the JWT pitfalls that silently break your auth layer.'} meta="May 8, 2026 · 6 min read" readMoreClass="dev" />
          </div>
          <div className="blog-grid second-row">
            <BlogCard imgClass="d2" imgStyle={{ background: 'linear-gradient(135deg,#0a2540,#1a3a5c,#0f2d44)' }} emoji="📋" badge="Developer" badgeClass="dev" difficulty={{ className: 'advanced', label: '🔥 Advanced' }} title="OWASP Top 10 Explained with Code Examples" desc="Every item on the OWASP list broken down with vulnerable code snippets and secure alternatives side-by-side." meta="May 3, 2026 · 12 min read" readMoreClass="dev" />
            <BlogCard imgClass="d3" imgStyle={{ background: 'linear-gradient(135deg,#052e16,#064e3b,#1a3a2a)' }} emoji="🔐" badge="Developer" badgeClass="dev" difficulty={{ className: 'beginner', label: '✅ Beginner' }} title="How to Set Up HTTPS the Right Way" desc="SSL/TLS configuration, HSTS headers, certificate pinning — a complete HTTPS checklist for your web app." meta="Apr 28, 2026 · 5 min read" readMoreClass="dev" />
          </div>
        </div>

        <div className={`blog-panel ${activeTab === 'biz' ? 'active' : ''}`} id="panel-biz">
          <div className="blog-grid">
            <BlogCard imgClass="b1" emoji="📜" badge="Business" badgeClass="biz" title="GDPR & Cybersecurity: What Your Business Must Know" desc="Data protection compliance isn't optional. Here's what GDPR requires from your security posture in 2026." meta="May 18, 2026 · 8 min read" readMoreClass="biz" />
            <BlogCard imgClass="b2" emoji="🚨" badge="Business" badgeClass="biz" title="Incident Response Plan: A Step-by-Step Template" desc="When a breach happens, every minute counts. Build a response plan before you need one with this ready-to-use template." meta="May 11, 2026 · 10 min read" readMoreClass="biz" />
            <BlogCard imgClass="b3" emoji="🧑‍💼" badge="Business" badgeClass="biz" title="Employee Security Training: Why It's Your Strongest Defense" desc="91% of breaches start with a phishing email. Here's how to build a security-aware culture in your organization." meta="May 4, 2026 · 6 min read" readMoreClass="biz" />
          </div>
        </div>
      </section>

      <section className="how">
        <div className="section-title">How CyberSafe Works</div>
        <p className="section-sub">4 simple steps to a safer you.</p>
        <div className="steps">
          <div className="step">
            <div className="step-circle">1</div>
            <div className="step-icon">📋</div>
            <div className="step-title">Enter Your Data</div>
            <div className="step-desc">
              Provide your email, password, URL, or other details you want checked. No sign-up required to try our free tools.
            </div>
          </div>
          <div className="step-arrow" aria-hidden>→</div>
          <div className="step">
            <div className="step-circle">2</div>
            <div className="step-icon">🔍</div>
            <div className="step-title">We Analyze Risks</div>
            <div className="step-desc">
              Our tools run smart checks against threat databases and analyze patterns to surface risks you might miss.
            </div>
          </div>
          <div className="step-arrow" aria-hidden>→</div>
          <div className="step">
            <div className="step-circle">3</div>
            <div className="step-icon">🛡️</div>
            <div className="step-title">Get Results & Fixes</div>
            <div className="step-desc">
              See your security score, clear explanations, and step-by-step fixes ranked so you know what to tackle first.
            </div>
          </div>
          <div className="step-arrow" aria-hidden>→</div>
          <div className="step">
            <div className="step-circle">4</div>
            <div className="step-icon">📈</div>
            <div className="step-title">Track & Stay Protected</div>
            <div className="step-desc">
              Monitor improvements over time, get alerts on new threats, and build habits that keep your digital life secure every day.
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-left">
          <h2>Ready to Secure Your Digital Life?</h2>
          <p>Check your digital security now. It takes less than 60 seconds!</p>
          <button type="button" className="btn-hero-primary">Try Free Tools Now →</button>
        </div>
        <div className="newsletter">
          <h3>Stay Updated</h3>
          <p>Subscribe to get the latest cyber alerts and safety tips.</p>
          <div className="email-row">
            <input className="email-input" type="email" placeholder="Enter your email" aria-label="Email" />
            <button type="button" className="btn-subscribe">Subscribe</button>
          </div>
          <div className="no-spam">No spam. Unsubscribe anytime.</div>
        </div>
        <div className="contact-form">
          <h3>Contact Us</h3>
          <div className="contact-note">Have questions or suggestions? We&apos;d love to hear from you.</div>
          <div className="form-row">
            <input className="form-input" type="text" placeholder="Your Name" aria-label="Name" />
            <input className="form-input" type="email" placeholder="Your Email" aria-label="Email" />
          </div>
          <textarea className="form-textarea" placeholder="Your Message" aria-label="Message" />
          <button type="button" className="btn-send">Send Message</button>
        </div>
      </section>

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
              <li><a href="#top">Home</a></li>
              <li><a href="#tools">Tools</a></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/help">Dashboard</Link></li>
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
            </ul>
          </div>
          <div className="footer-col">
            <h4>&nbsp;</h4>
            <div className="footer-secure">
              <span>🔒</span>
              <div className="footer-secure-text">
                Secure & Trusted<br />
                <span className="footer-secure-sub">Your data is encrypted and never shared.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2024 CyberSafe. All rights reserved.</div>
      </footer>
    </div>
  )
}
