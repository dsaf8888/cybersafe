import { useMemo, useState } from 'react'
import PageLayout, { PageHero } from '../components/layout/PageLayout'

const GUIDES = [
  {
    level: 'beginner',
    icon: '🔑',
    cover: 'blue',
    tag: 'Passwords',
    tagClass: '',
    title: 'How to Build a Strong Password You Can Actually Remember',
    desc: 'A passphrase approach that beats most password managers — without the sticky-notes.',
    meta: '12 min · Beginner',
  },
  {
    level: 'beginner',
    icon: '📧',
    cover: 'amber',
    tag: 'Email',
    tagClass: 'amber',
    title: 'Spot a Phishing Email in 30 Seconds',
    desc: 'The 5 red flags every phishing message gives away, with real-world examples.',
    meta: '8 min · Beginner',
  },
  {
    level: 'beginner',
    icon: '🔐',
    cover: 'green',
    tag: 'Setup',
    tagClass: 'green',
    title: 'Turn On Two-Factor Authentication Everywhere',
    desc: 'Step-by-step screenshots for Gmail, Instagram, banking apps, WhatsApp, and more.',
    meta: '15 min · Beginner',
  },
  {
    level: 'intermediate',
    icon: '🌐',
    cover: 'purple',
    tag: 'Browsing',
    tagClass: 'purple',
    title: 'Configure Your Browser for Privacy & Speed',
    desc: 'Recommended Chrome, Firefox, Brave, and Edge settings to block trackers and ads.',
    meta: '20 min · Intermediate',
  },
  {
    level: 'intermediate',
    icon: '📱',
    cover: 'rose',
    tag: 'Mobile',
    tagClass: 'rose',
    title: 'Lock Down Your Smartphone in 10 Steps',
    desc: 'Permissions, app review, encrypted backups, and the one toggle most people miss.',
    meta: '18 min · Intermediate',
  },
  {
    level: 'intermediate',
    icon: '💾',
    cover: 'slate',
    tag: 'Backup',
    tagClass: '',
    title: 'A Sane Backup Strategy for Personal Data',
    desc: 'The 3-2-1 rule explained with free tools — never lose photos or documents again.',
    meta: '14 min · Intermediate',
  },
  {
    level: 'advanced',
    icon: '🛡️',
    cover: 'green',
    tag: 'Network',
    tagClass: 'green',
    title: 'Set Up DNS-Level Ad and Tracker Blocking',
    desc: 'Use NextDNS, Pi-hole, or AdGuard Home to protect every device on your network.',
    meta: '35 min · Advanced',
  },
  {
    level: 'advanced',
    icon: '🔓',
    cover: 'rose',
    tag: 'Recovery',
    tagClass: 'rose',
    title: 'What to Do If Your Email Account Is Hacked',
    desc: 'A 60-minute emergency runbook to regain access and contain the damage.',
    meta: '25 min · Advanced',
  },
  {
    level: 'advanced',
    icon: '👨‍💻',
    cover: 'purple',
    tag: 'Developer',
    tagClass: 'purple',
    title: 'Storing Secrets Securely in Modern Apps',
    desc: 'Environment variables, secret managers, and rotating keys — done the right way.',
    meta: '30 min · Advanced',
  },
]

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
            <a className="resource-card" key={g.title} href="#guide">
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
            </a>
          ))}
        </div>
      </main>
    </PageLayout>
  )
}
