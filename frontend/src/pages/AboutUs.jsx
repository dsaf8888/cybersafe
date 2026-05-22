import { Link } from 'react-router-dom'
import PageLayout, { PageHero } from '../components/layout/PageLayout'

const VALUES = [
  {
    icon: '🛡️',
    title: 'Security First',
    desc: "Every feature ships with a security review. We don't store what we don't need.",
  },
  {
    icon: '🤝',
    title: 'Built for Everyone',
    desc: "Tools so simple your grandparent can use them, and so accurate that pros trust them.",
  },
  {
    icon: '🔍',
    title: 'Radical Transparency',
    desc: "Open methodology, public audit reports, and a permanent bug-bounty program.",
  },
  {
    icon: '🌱',
    title: 'Free Forever',
    desc: "Core safety tools will always be free. We believe security is a right, not a paywall.",
  },
  {
    icon: '🇮🇳',
    title: 'Local Roots, Global Reach',
    desc: "Born in Bengaluru, helping users in 40+ countries identify and avoid online threats.",
  },
  {
    icon: '📚',
    title: 'Education by Default',
    desc: "Every scan comes with plain-language explanations and fix-it steps you can follow.",
  },
]

const TEAM = [
  { initials: 'AS', name: 'Aarav Sharma', role: 'Co-founder & CEO', bio: 'Former application security engineer with 9+ years protecting fintech platforms.' },
  { initials: 'PM', name: 'Priya Mehta', role: 'Co-founder & CTO', bio: 'Built threat-intel systems at scale; loves explaining crypto with food analogies.' },
  { initials: 'RK', name: 'Rohan Kapoor', role: 'Head of Research', bio: 'Tracks emerging phishing campaigns and publishes our weekly threat digest.' },
  { initials: 'SD', name: 'Sara D&apos;Souza', role: 'Lead Designer', bio: 'Designs for clarity. Believes good security UX disappears into the background.' },
  { initials: 'VN', name: 'Vikram Nair', role: 'Security Engineer', bio: 'Owns our infra hardening, audits, and the public bug-bounty program.' },
  { initials: 'IK', name: 'Ishita Khan', role: 'Community Manager', bio: 'Runs workshops with schools and small businesses across India.' },
]

export default function AboutUs() {
  return (
    <PageLayout>
      <PageHero
        badge="About"
        title="Cybersecurity, made simple for everyone."
        subtitle="We build free, trustworthy tools that help everyday people understand and reduce their digital risk — no jargon, no tracking, no catch."
      />

      <main className="page-body">
        <section className="about-mission">
          <div>
            <h2>Our Mission</h2>
            <p>
              Hackers don&apos;t need to be clever to win — they just need to find someone who never
              learned the basics. We started CyberSafe because cybersecurity education was either
              locked behind enterprise contracts or hidden in dense technical docs.
            </p>
            <p>
              Our mission is to put real, actionable security checks in the hands of every internet
              user, regardless of their background. From a college student in Pune to a small-shop
              owner in Texas — same tools, same protection, zero cost.
            </p>
            <p>
              We measure success not by sign-ups, but by the number of breaches our community
              avoids.
            </p>
          </div>
          <div className="about-mission-visual" aria-hidden>🛡️</div>
        </section>

        <section className="stat-row" aria-label="Impact statistics">
          <div className="stat"><strong>2.4M+</strong><span>Tools run last month</span></div>
          <div className="stat"><strong>140k</strong><span>Breaches prevented</span></div>
          <div className="stat"><strong>40+</strong><span>Countries served</span></div>
          <div className="stat"><strong>0</strong><span>User passwords stored</span></div>
        </section>

        <section className="page-section">
          <div className="page-section-head">
            <h2>What we stand for</h2>
            <p>The principles that guide every product decision we make.</p>
          </div>
          <div className="about-grid">
            {VALUES.map((v) => (
              <div className="about-card" key={v.title}>
                <div className="about-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="page-section">
          <div className="page-section-head">
            <h2>Meet the team</h2>
            <p>A small group of builders, researchers, and educators based in Bengaluru, India.</p>
          </div>
          <div className="team-grid">
            {TEAM.map((m) => (
              <div className="team-card" key={m.name}>
                <div className="team-avatar">{m.initials}</div>
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <div className="team-bio">{m.bio}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="page-section" id="contact">
          <div className="faq-help-cta">
            <div>
              <h3>Want to work with us?</h3>
              <p>We&apos;re hiring researchers, engineers, and content writers. Or just say hi.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a className="btn-submit" href="mailto:hello@cybersafe.app">hello@cybersafe.app</a>
              <Link to="/report-issue" className="score-card-cta" style={{ maxWidth: 'none' }}>Send Feedback</Link>
            </div>
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
