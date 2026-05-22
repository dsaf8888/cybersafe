import PageLayout, { PageHero } from '../../components/layout/PageLayout'

const SECTIONS = [
  { id: 'overview', title: 'Overview' },
  { id: 'data-we-collect', title: 'Data We Collect' },
  { id: 'how-we-use', title: 'How We Use It' },
  { id: 'data-we-dont', title: "Data We Don't Collect" },
  { id: 'cookies', title: 'Cookies & Local Storage' },
  { id: 'third-parties', title: 'Third-Party Services' },
  { id: 'security', title: 'How We Secure Data' },
  { id: 'your-rights', title: 'Your Rights' },
  { id: 'children', title: 'Children & Minors' },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact Us' },
]

export default function PrivacyPolicy() {
  return (
    <PageLayout>
      <PageHero
        badge="Legal"
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your information when you use CyberSafe — written in plain language so you actually know what you're agreeing to."
      />

      <main className="page-body narrow">
        <div className="doc-meta">
          <span><strong>Effective:</strong> May 1, 2026</span>
          <span><strong>Last updated:</strong> May 20, 2026</span>
          <span><strong>Version:</strong> 2.3</span>
        </div>

        <div className="legal-toc">
          <h4>On this page</h4>
          <ol>
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{i + 1}. {s.title}</a>
              </li>
            ))}
          </ol>
        </div>

        <section id="overview" className="doc-section">
          <h2><span className="doc-num">1</span> Overview</h2>
          <p>
            CyberSafe (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) provides free
            cybersecurity tools — password strength checks, email breach lookups, URL safety
            scans, and phishing-awareness training — to help everyday users stay safe online.
            This Privacy Policy explains what information we collect, how we use it, who we
            share it with, and the rights you have to control your data.
          </p>
          <div className="doc-callout green">
            <strong>The short version:</strong> we are built on a &ldquo;no-account, no-tracking&rdquo;
            philosophy. Most of our tools run in your browser. We never sell your data, and
            anything sensitive (like passwords) is hashed locally before it leaves your device.
          </div>
        </section>

        <section id="data-we-collect" className="doc-section">
          <h2><span className="doc-num">2</span> Data We Collect</h2>
          <h3>2.1 Information you provide</h3>
          <ul>
            <li><strong>Tool inputs:</strong> the email address, URL, password hash, or text you submit to a tool.</li>
            <li><strong>Contact form messages:</strong> name, email and the content of your message when you write to us.</li>
            <li><strong>Account info</strong> (optional): if you create an account, your display name and email.</li>
          </ul>
          <h3>2.2 Information collected automatically</h3>
          <ul>
            <li>Anonymous usage metrics (page views, tool runs, response codes) to improve our service.</li>
            <li>Approximate location at the country level, derived from your IP.</li>
            <li>Device and browser type for compatibility debugging.</li>
          </ul>
        </section>

        <section id="how-we-use" className="doc-section">
          <h2><span className="doc-num">3</span> How We Use It</h2>
          <ul>
            <li>To run the security check you requested and return the result.</li>
            <li>To detect abuse (e.g. rate-limit a single IP hammering the URL scanner).</li>
            <li>To improve detection accuracy and add new tools based on real demand.</li>
            <li>To respond to your support messages.</li>
          </ul>
        </section>

        <section id="data-we-dont" className="doc-section">
          <h2><span className="doc-num">4</span> Data We Don&apos;t Collect</h2>
          <ul>
            <li>We never store the plaintext of passwords you check — they are SHA-1 hashed in your browser and only a prefix of that hash is sent to the breach API (k-anonymity).</li>
            <li>We do not sell, rent, or trade your personal information.</li>
            <li>We do not run advertising trackers, fingerprinting scripts, or social-media pixels.</li>
            <li>We do not require an account to use the free tools.</li>
          </ul>
        </section>

        <section id="cookies" className="doc-section">
          <h2><span className="doc-num">5</span> Cookies &amp; Local Storage</h2>
          <p>
            We use only essential cookies and a small amount of <code>localStorage</code> for:
          </p>
          <ul>
            <li>Remembering your dark-mode and language preference.</li>
            <li>Keeping you signed in if you create an account.</li>
            <li>Privacy-respecting analytics (no cross-site tracking) to count tool usage.</li>
          </ul>
          <p>You can clear all CyberSafe data at any time from your browser settings.</p>
        </section>

        <section id="third-parties" className="doc-section">
          <h2><span className="doc-num">6</span> Third-Party Services</h2>
          <p>We work with a small number of trusted services. Each is listed below with the data they receive:</p>
          <ul>
            <li><strong>Have I Been Pwned</strong> — receives the first 5 hex characters of a password hash; never the full hash or the password itself.</li>
            <li><strong>Google Safe Browsing</strong> — receives the URL you submit to the URL scanner.</li>
            <li><strong>Cloudflare</strong> — provides our CDN and DDoS protection; sees only IP and request metadata.</li>
          </ul>
        </section>

        <section id="security" className="doc-section">
          <h2><span className="doc-num">7</span> How We Secure Data</h2>
          <ul>
            <li>HTTPS/TLS 1.3 is enforced on every endpoint.</li>
            <li>Passwords are hashed with bcrypt (cost factor 12) at rest, never stored in plaintext.</li>
            <li>Production databases are encrypted at rest and only accessible from inside our private network.</li>
            <li>We run quarterly third-party security audits and publish a public bug-bounty program.</li>
          </ul>
        </section>

        <section id="your-rights" className="doc-section">
          <h2><span className="doc-num">8</span> Your Rights</h2>
          <p>Wherever you live, you can:</p>
          <ul>
            <li>Request a copy of the data we hold about you.</li>
            <li>Ask us to correct or delete that data.</li>
            <li>Object to or restrict certain types of processing.</li>
            <li>Withdraw consent at any time without affecting prior processing.</li>
          </ul>
          <p>To exercise any of these rights, email <a href="mailto:privacy@cybersafe.app">privacy@cybersafe.app</a>. We respond within 30 days.</p>
        </section>

        <section id="children" className="doc-section">
          <h2><span className="doc-num">9</span> Children &amp; Minors</h2>
          <p>
            CyberSafe is not directed at children under 13. We do not knowingly collect personal
            data from anyone under 13. If you believe we have, please contact us and we will delete it.
          </p>
        </section>

        <section id="changes" className="doc-section">
          <h2><span className="doc-num">10</span> Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy as our service evolves. Material changes will be
            posted on this page and, where appropriate, announced via email or in-app banner at
            least 14 days before they take effect.
          </p>
        </section>

        <section id="contact" className="doc-section">
          <h2><span className="doc-num">11</span> Contact Us</h2>
          <p>
            Privacy questions, data requests, or concerns?
          </p>
          <div className="doc-callout">
            <strong>Email:</strong> <a href="mailto:privacy@cybersafe.app">privacy@cybersafe.app</a><br />
            <strong>Postal:</strong> CyberSafe Privacy Office, 14 Sector Plaza, Bengaluru 560001, India
          </div>
        </section>
      </main>
    </PageLayout>
  )
}
