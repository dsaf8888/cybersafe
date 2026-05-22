import PageLayout, { PageHero } from '../../components/layout/PageLayout'

const SECTIONS = [
  { id: 'agreement', title: 'Agreement to Terms' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'accounts', title: 'Accounts & Security' },
  { id: 'acceptable-use', title: 'Acceptable Use' },
  { id: 'prohibited', title: 'Prohibited Activities' },
  { id: 'tools-disclaimer', title: 'Tool Results & Disclaimers' },
  { id: 'ip', title: 'Intellectual Property' },
  { id: 'user-content', title: 'User Submitted Content' },
  { id: 'third-party', title: 'Third-Party Services' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'termination', title: 'Suspension & Termination' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'changes', title: 'Changes to Terms' },
  { id: 'contact', title: 'Contact' },
]

export default function TermsAndConditions() {
  return (
    <PageLayout>
      <PageHero
        badge="Legal"
        title="Terms & Conditions"
        subtitle="The rules of the road for using CyberSafe. Please read these terms carefully — by using our service you agree to them."
      />

      <main className="page-body narrow">
        <div className="doc-meta">
          <span><strong>Effective:</strong> May 1, 2026</span>
          <span><strong>Last updated:</strong> May 18, 2026</span>
          <span><strong>Version:</strong> 1.7</span>
        </div>

        <div className="legal-toc">
          <h4>Contents</h4>
          <ol>
            {SECTIONS.map((s, i) => (
              <li key={s.id}><a href={`#${s.id}`}>{i + 1}. {s.title}</a></li>
            ))}
          </ol>
        </div>

        <section id="agreement" className="doc-section">
          <h2><span className="doc-num">1</span> Agreement to Terms</h2>
          <p>
            These Terms and Conditions (the &ldquo;Terms&rdquo;) form a legally binding agreement
            between you (&ldquo;you&rdquo;, &ldquo;user&rdquo;) and CyberSafe Technologies Pvt. Ltd.
            (&ldquo;CyberSafe&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) governing your access to and
            use of the CyberSafe website, tools, APIs, and any related services (collectively, the
            &ldquo;Service&rdquo;).
          </p>
          <p>By using the Service, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.</p>
        </section>

        <section id="eligibility" className="doc-section">
          <h2><span className="doc-num">2</span> Eligibility</h2>
          <p>You must be at least 13 years old to use the Service. If you are under 18, you must have permission from a parent or legal guardian. By using the Service, you represent that you meet these requirements.</p>
        </section>

        <section id="accounts" className="doc-section">
          <h2><span className="doc-num">3</span> Accounts &amp; Security</h2>
          <ul>
            <li>You are responsible for keeping your login credentials secure.</li>
            <li>You agree to notify us immediately of any unauthorized access to your account.</li>
            <li>We may suspend or terminate accounts that show suspicious activity.</li>
            <li>One person or legal entity may maintain only one free account.</li>
          </ul>
        </section>

        <section id="acceptable-use" className="doc-section">
          <h2><span className="doc-num">4</span> Acceptable Use</h2>
          <p>You agree to use CyberSafe for lawful, personal or business cybersecurity-awareness purposes. You may:</p>
          <ul>
            <li>Check email addresses, passwords, and URLs that belong to you or that you are authorized to test.</li>
            <li>Use our educational content for personal learning or internal employee training.</li>
            <li>Share article links and reports with attribution.</li>
          </ul>
        </section>

        <section id="prohibited" className="doc-section">
          <h2><span className="doc-num">5</span> Prohibited Activities</h2>
          <p>You may <strong>not</strong>:</p>
          <ul>
            <li>Use the Service to attack, probe, or harm any third party without explicit consent.</li>
            <li>Submit data you do not have a legal right to submit (e.g. other people&apos;s passwords).</li>
            <li>Reverse-engineer, scrape, or attempt to extract our source code, models, or rule sets.</li>
            <li>Interfere with or disrupt the Service, including via DDoS, automated bots beyond rate limits, or vulnerability fuzzing.</li>
            <li>Resell, sublicense, or white-label the Service without a written commercial agreement.</li>
          </ul>
          <div className="doc-callout amber">
            <strong>Violation may result</strong> in immediate suspension, IP block, and — where applicable — referral to law enforcement.
          </div>
        </section>

        <section id="tools-disclaimer" className="doc-section">
          <h2><span className="doc-num">6</span> Tool Results &amp; Disclaimers</h2>
          <p>
            CyberSafe tools provide best-effort guidance based on publicly available data and
            recognized cybersecurity practices. Results are <strong>informational only</strong> and do
            not constitute professional security advice or a guarantee of safety.
          </p>
          <ul>
            <li>A &ldquo;Safe&rdquo; result does not mean a site or password is risk-free.</li>
            <li>A &ldquo;Breached&rdquo; result reflects known data; private breaches may exist that we cannot see.</li>
            <li>You remain solely responsible for the security decisions you make.</li>
          </ul>
        </section>

        <section id="ip" className="doc-section">
          <h2><span className="doc-num">7</span> Intellectual Property</h2>
          <p>
            All site code, content, branding, designs, and tool outputs are owned by CyberSafe or
            its licensors and are protected by copyright, trademark, and other intellectual property
            laws. You may not copy, modify, or distribute them without written permission, except
            where allowed under fair-use or our open-source licenses.
          </p>
        </section>

        <section id="user-content" className="doc-section">
          <h2><span className="doc-num">8</span> User-Submitted Content</h2>
          <p>
            By submitting feedback, bug reports, comments, or other content (&ldquo;User Content&rdquo;),
            you grant CyberSafe a worldwide, royalty-free, perpetual license to use, reproduce, and
            create derivative works of that content for the purpose of operating and improving the
            Service. You retain ownership of your User Content.
          </p>
        </section>

        <section id="third-party" className="doc-section">
          <h2><span className="doc-num">9</span> Third-Party Services</h2>
          <p>
            The Service integrates with third-party APIs (e.g. breach databases, URL reputation
            services). We are not responsible for the availability, accuracy, or content of those
            third parties. Their use is governed by their own terms.
          </p>
        </section>

        <section id="liability" className="doc-section">
          <h2><span className="doc-num">10</span> Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, CyberSafe and its affiliates, employees, and
            partners shall not be liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or revenues, arising out of your use of the
            Service. Our total aggregate liability shall not exceed the greater of (a) the fees you
            paid to us in the 12 months before the claim, or (b) US&nbsp;$100.
          </p>
        </section>

        <section id="indemnification" className="doc-section">
          <h2><span className="doc-num">11</span> Indemnification</h2>
          <p>
            You agree to indemnify and hold CyberSafe harmless from any claim, demand, loss, or
            expense (including reasonable attorney fees) arising out of your breach of these Terms
            or your misuse of the Service.
          </p>
        </section>

        <section id="termination" className="doc-section">
          <h2><span className="doc-num">12</span> Suspension &amp; Termination</h2>
          <p>
            We may suspend or terminate your access at any time, with or without notice, if we
            reasonably believe you have violated these Terms or pose a security risk. You may stop
            using the Service at any time. Sections that by their nature should survive termination
            will survive.
          </p>
        </section>

        <section id="governing-law" className="doc-section">
          <h2><span className="doc-num">13</span> Governing Law</h2>
          <p>
            These Terms are governed by the laws of India, without regard to its conflict-of-laws
            principles. Any dispute shall be resolved exclusively in the courts of Bengaluru,
            Karnataka, except where prohibited by applicable consumer-protection laws.
          </p>
        </section>

        <section id="changes" className="doc-section">
          <h2><span className="doc-num">14</span> Changes to Terms</h2>
          <p>
            We may revise these Terms from time to time. Material updates will be announced via
            email or an in-app banner at least 14 days before they take effect. Continued use of the
            Service after the effective date constitutes acceptance.
          </p>
        </section>

        <section id="contact" className="doc-section">
          <h2><span className="doc-num">15</span> Contact</h2>
          <p>
            For questions about these Terms, write to{' '}
            <a href="mailto:legal@cybersafe.app">legal@cybersafe.app</a>.
          </p>
        </section>
      </main>
    </PageLayout>
  )
}
