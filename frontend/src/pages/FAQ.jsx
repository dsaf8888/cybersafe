import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout, { PageHero } from '../components/layout/PageLayout'

const FAQS = [
  {
    cat: 'general',
    q: 'What is CyberSafe?',
    a: 'CyberSafe is a free suite of online security tools — password strength checks, email breach lookups, URL safety scans, and phishing-awareness training — that helps everyday users understand and reduce their digital risk.',
  },
  {
    cat: 'general',
    q: 'Do I need to create an account to use the tools?',
    a: 'No. Every free tool runs without an account. Creating an account is optional and only unlocks features like saving reports, scheduling re-scans, and email alerts.',
  },
  {
    cat: 'general',
    q: 'How much does CyberSafe cost?',
    a: 'All core tools are free, forever. A paid Pro plan exists for power users (unlimited URL scans, team dashboards, API access), but you do not need it for personal use.',
  },
  {
    cat: 'general',
    q: 'Is CyberSafe available outside India?',
    a: 'Yes. We serve users in 40+ countries. The interface is in English, with Hindi and Tamil currently in beta.',
  },

  {
    cat: 'privacy',
    q: 'Do you store the passwords I check?',
    a: "Never. Passwords are hashed with SHA-1 in your browser, and only the first 5 hex characters of that hash are sent to the breach API — a technique called k-anonymity. The full password and full hash never leave your device.",
  },
  {
    cat: 'privacy',
    q: 'Do you sell my data?',
    a: 'No. We do not sell, rent, or trade user data. Our revenue comes from the Pro subscription, not advertising. See our Privacy Policy for the full data-flow.',
  },
  {
    cat: 'privacy',
    q: 'What happens to the email I check for breaches?',
    a: "Your email is hashed and queried against the Have I Been Pwned API. We don't retain the plaintext email or the search history.",
  },
  {
    cat: 'privacy',
    q: 'Can I delete my data?',
    a: 'Absolutely. If you have an account, you can delete it from Settings → Account → Delete. All associated data is wiped within 30 days. For anonymous users, simply clear your browser data.',
  },

  {
    cat: 'tools',
    q: 'How accurate is the URL Safety Scanner?',
    a: 'We combine Google Safe Browsing, a domain-age check, SSL certificate inspection, and our own heuristics. Accuracy on known threats is over 98%, but no scanner catches everything — always use judgment.',
  },
  {
    cat: 'tools',
    q: 'Where do breach results come from?',
    a: 'Primarily from the Have I Been Pwned database (12+ billion compromised credentials), supplemented by our own research feed for newly disclosed leaks.',
  },
  {
    cat: 'tools',
    q: 'How is my Security Score calculated?',
    a: 'It looks at password strength, breach exposure, MFA coverage on connected accounts, browser hygiene, and recent scan results. Each factor is weighted and combined into a 0–100 score.',
  },
  {
    cat: 'tools',
    q: "What does 'Strong' password actually mean?",
    a: "A strong password is at least 12 characters, mixes letters/numbers/symbols, isn't on a known breach list, and isn't a common pattern (like 'Password123!'). We estimate the time a modern GPU array would take to crack it — strong = years or more.",
  },

  {
    cat: 'account',
    q: 'How do I reset my password?',
    a: "Click 'Log In' → 'Forgot password?' and enter your email. We'll send you a one-time reset link valid for 30 minutes.",
  },
  {
    cat: 'account',
    q: 'Can I enable two-factor authentication?',
    a: 'Yes — and you should. Go to Settings → Security → Two-Factor Authentication. We support TOTP apps (Google Authenticator, Authy) and hardware keys (YubiKey, Titan).',
  },
  {
    cat: 'account',
    q: 'I think my account is compromised — what should I do?',
    a: 'Immediately reset your password from a trusted device, sign out all sessions (Settings → Devices), enable 2FA if not already, and email security@cybersafe.app so we can investigate access logs.',
  },

  {
    cat: 'business',
    q: 'Do you offer a plan for teams or schools?',
    a: 'Yes — CyberSafe for Business includes a team dashboard, employee training tracking, and bulk-scan APIs. Educational institutions get a 60% discount.',
  },
  {
    cat: 'business',
    q: 'Can I integrate CyberSafe via API?',
    a: 'Pro and Business plans include a REST API with rate limits up to 10k requests/day. SDKs are available for Python, Node.js, and Go.',
  },
  {
    cat: 'business',
    q: 'Do you sign Data Processing Agreements (DPAs)?',
    a: 'Yes. We provide a GDPR-compliant DPA on request for Business customers — write to legal@cybersafe.app.',
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'general', label: 'General' },
  { id: 'privacy', label: 'Privacy & Data' },
  { id: 'tools', label: 'Tools & Scans' },
  { id: 'account', label: 'Account' },
  { id: 'business', label: 'Business & API' },
]

export default function FAQ() {
  const [category, setCategory] = useState('all')
  const [openIdx, setOpenIdx] = useState(0)

  const filtered = useMemo(
    () => (category === 'all' ? FAQS : FAQS.filter((f) => f.cat === category)),
    [category],
  )

  return (
    <PageLayout>
      <PageHero
        badge="Help"
        title="Frequently Asked Questions"
        subtitle="Answers to the most common questions about CyberSafe — how the tools work, what we do with your data, and how to get the most out of our service."
      />

      <main className="page-body narrow">
        <div className="faq-tabs" role="tablist">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              className={`faq-tab ${category === c.id ? 'active' : ''}`}
              onClick={() => {
                setCategory(c.id)
                setOpenIdx(0)
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="faq-list">
          {filtered.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div className={`faq-item ${isOpen ? 'open' : ''}`} key={`${category}-${idx}`}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                >
                  <span>{item.q}</span>
                  <span className="faq-toggle" aria-hidden>+</span>
                </button>
                {isOpen && <div className="faq-a">{item.a}</div>}
              </div>
            )
          })}
        </div>

        <div className="faq-help-cta">
          <div>
            <h3>Still need help?</h3>
            <p>Our team usually responds within 24 hours. Or browse our Help Center for guides.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/help" className="score-card-cta" style={{ maxWidth: 'none' }}>Visit Help Center</Link>
            <Link to="/report-issue" className="btn-submit">Contact Support</Link>
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
