import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageLayout, { PageHero } from '../components/layout/PageLayout'

const ISSUE_TYPES = [
  'Bug in a tool',
  'Inaccurate scan result',
  'Security vulnerability',
  'Account / login problem',
  'Content suggestion',
  'Other',
]

const SEVERITY = ['Low — small annoyance', 'Medium — feature partially broken', 'High — blocks me from using a tool', 'Critical — security issue or data exposure']

export default function ReportIssue() {
  const [form, setForm] = useState({
    type: ISSUE_TYPES[0],
    severity: SEVERITY[1],
    name: '',
    email: '',
    url: '',
    summary: '',
    steps: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [referenceId, setReferenceId] = useState('')

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const ref = 'CS-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    setReferenceId(ref)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageLayout>
      <PageHero
        badge="Support"
        title="Report an Issue"
        subtitle="Found a bug, an inaccurate result, or a possible security flaw? Tell us about it — we read every report and respond within one business day."
      />

      <main className="page-body narrow">
        {submitted ? (
          <div className="form-card">
            <div className="form-success">
              <div style={{ fontSize: 22 }}>✅</div>
              <div>
                <strong>Your report was received — thank you!</strong>
                We&apos;ll review it and follow up at <em>{form.email || 'the email you provided'}</em> within 1 business day.
                Reference ID: <code>{referenceId}</code>
              </div>
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="button" className="btn-submit" onClick={() => setSubmitted(false)}>Submit another report</button>
              <Link to="/help" className="score-card-cta" style={{ maxWidth: 'none' }}>Visit Help Center</Link>
            </div>
          </div>
        ) : (
          <div className="form-grid">
            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="type">Issue type</label>
                <select id="type" value={form.type} onChange={update('type')}>
                  {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="severity">Severity</label>
                <select id="severity" value={form.severity} onChange={update('severity')}>
                  {SEVERITY.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-field">
                  <label htmlFor="name">Your name (optional)</label>
                  <input id="name" type="text" placeholder="Aarav S." value={form.name} onChange={update('name')} />
                </div>
                <div className="form-field">
                  <label htmlFor="email">Email <span style={{ color: '#dc2626' }}>*</span></label>
                  <input id="email" type="email" required placeholder="you@example.com" value={form.email} onChange={update('email')} />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="url">Page / tool URL (if applicable)</label>
                <input id="url" type="url" placeholder="https://cybersafe.app/tools/url-scanner" value={form.url} onChange={update('url')} />
              </div>

              <div className="form-field">
                <label htmlFor="summary">Short summary <span style={{ color: '#dc2626' }}>*</span></label>
                <input id="summary" type="text" required maxLength={120} placeholder="Eg. URL Scanner returns Safe for a phishing site" value={form.summary} onChange={update('summary')} />
                <span className="field-hint">{form.summary.length}/120 characters</span>
              </div>

              <div className="form-field">
                <label htmlFor="steps">Detailed description &amp; steps to reproduce <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea
                  id="steps"
                  required
                  placeholder={'1. Go to the URL Scanner page\n2. Submit https://example-phish.test\n3. Expected: Risk detected\n4. Actual: Marked as Safe'}
                  value={form.steps}
                  onChange={update('steps')}
                />
                <span className="field-hint">The more detail, the faster we can fix it.</span>
              </div>

              <button type="submit" className="btn-submit">Submit Report</button>
            </form>

            <aside>
              <div className="doc-callout">
                <strong>Found a security vulnerability?</strong>
                Please use our coordinated disclosure channel instead of this form:&nbsp;
                <a href="mailto:security@cybersafe.app">security@cybersafe.app</a>. Eligible reports
                are rewarded under our public bug-bounty program.
              </div>

              <div className="doc-section" style={{ marginTop: 18 }}>
                <h3>Before submitting</h3>
                <ul>
                  <li>Check the <Link to="/faq">FAQ</Link> — your issue may already be answered.</li>
                  <li>Try a different browser or clear cache to rule out local issues.</li>
                  <li>Include screenshots in a follow-up email once you have your reference ID.</li>
                </ul>
              </div>

              <div className="doc-section">
                <h3>Response times</h3>
                <ul>
                  <li><strong>Critical:</strong> within 4 hours</li>
                  <li><strong>High:</strong> within 1 business day</li>
                  <li><strong>Medium / Low:</strong> within 3 business days</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>
    </PageLayout>
  )
}
