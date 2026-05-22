import { Link } from 'react-router-dom'
import PageLayout, { PageHero } from '../components/layout/PageLayout'

const TIPS_GROUPS = [
  {
    title: 'Passwords',
    icon: '🔑',
    tips: [
      { h: 'Use a unique password per site', p: 'One leak should never compromise your other accounts. A password manager makes this painless.' },
      { h: 'Aim for length over complexity', p: 'A 16-character passphrase like "blue-moose-rides-cycling" beats "P@ssw0rd!" every time.' },
      { h: 'Turn on 2FA wherever possible', p: 'Even a leaked password is useless without the second factor. Prefer TOTP apps over SMS.' },
      { h: 'Check your passwords against known leaks', p: "Use CyberSafe's Password Strength tool — it never sends your actual password to the server." },
    ],
  },
  {
    title: 'Email',
    icon: '📧',
    tips: [
      { h: 'Hover before you click any link', p: 'The visible text and the real URL can differ. Hover to see the real destination before clicking.' },
      { h: 'Check the sender domain carefully', p: '"support@payp-al.com" is not the same as "support@paypal.com". A single character matters.' },
      { h: 'Be skeptical of urgency', p: '"Your account will be closed in 24 hours" is a classic social-engineering pattern. Slow down.' },
      { h: 'Never share OTPs over phone or email', p: 'Legitimate companies will never ask for your one-time password. Treat any such request as fraud.' },
    ],
  },
  {
    title: 'Browsing',
    icon: '🌐',
    tips: [
      { h: 'Look for HTTPS and a valid certificate', p: 'The padlock alone is not enough — a phishing site can have HTTPS too. Verify the domain spelling.' },
      { h: 'Keep your browser updated', p: 'Browser updates ship security patches almost every week. Enable auto-update and restart promptly.' },
      { h: 'Use a tracker-blocking extension', p: 'uBlock Origin or Brave shields stop most ads and cross-site trackers automatically.' },
      { h: 'Avoid public Wi-Fi for sensitive tasks', p: "Use mobile data or a trusted VPN when banking or signing in from coffee shops and airports." },
    ],
  },
  {
    title: 'Mobile',
    icon: '📱',
    tips: [
      { h: 'Install apps only from official stores', p: 'Sideloaded APKs are the #1 vector for Android malware. If it must be sideloaded, verify the publisher.' },
      { h: 'Review app permissions periodically', p: 'A flashlight app does not need your contacts. Revoke permissions you no longer use.' },
      { h: 'Enable device encryption and a strong PIN', p: 'A 6-digit PIN takes ~22 hours to brute-force; a 4-digit one takes ~7 minutes.' },
      { h: 'Use the official app for banking — not the browser', p: 'Mobile apps include certificate pinning and tamper detection that browsers do not.' },
    ],
  },
  {
    title: 'Social Media',
    icon: '👥',
    tips: [
      { h: 'Limit what you share publicly', p: 'Travel plans, birthdays, and your hometown are great social-engineering material — keep them off public profiles.' },
      { h: 'Review connected apps quarterly', p: 'Old games and quizzes often have access to your account. Revoke anything you no longer use.' },
      { h: 'Be cautious with quizzes asking personal trivia', p: '"What was your first pet\'s name?" is also a common password reset question. Coincidence?' },
    ],
  },
  {
    title: 'Backups & Recovery',
    icon: '💾',
    tips: [
      { h: 'Follow the 3-2-1 rule', p: '3 copies of your data, on 2 different media, with 1 copy off-site (e.g. cloud).' },
      { h: 'Test your backups every few months', p: 'A backup you have never restored from is not a backup — it is hope.' },
      { h: 'Keep recovery codes printed and offline', p: 'Print your 2FA recovery codes and store them in a safe place. Phones get lost.' },
    ],
  },
]

export default function SafetyTips() {
  return (
    <PageLayout>
      <PageHero
        badge="Safety"
        title="Everyday Cybersecurity Tips"
        subtitle="Simple, no-jargon habits that block 90% of common attacks. Pick a category, adopt one tip a week, and you'll be safer than most internet users."
      />

      <main className="page-body">
        {TIPS_GROUPS.map((group) => (
          <section className="page-section" key={group.title}>
            <div className="page-section-head">
              <h2>
                <span style={{ marginRight: 8 }}>{group.icon}</span>
                {group.title}
              </h2>
              <p>Adopt these habits and your {group.title.toLowerCase()} attack surface drops dramatically.</p>
            </div>
            <div className="tip-list">
              {group.tips.map((t, i) => (
                <div className="tip-item" key={t.h}>
                  <div className="tip-num">{i + 1}</div>
                  <div className="tip-content">
                    <h4>{t.h}</h4>
                    <p>{t.p}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="faq-help-cta">
          <div>
            <h3>Want deeper, hands-on walkthroughs?</h3>
            <p>Our Guides section has step-by-step tutorials for everything above — with screenshots.</p>
          </div>
          <Link to="/guides" className="btn-submit">Browse Guides</Link>
        </div>
      </main>
    </PageLayout>
  )
}
