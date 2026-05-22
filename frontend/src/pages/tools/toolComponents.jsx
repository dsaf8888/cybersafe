/**
 * Shared UI atoms for tool pages.
 * Pure components only — helpers live in toolHelpers.js.
 */

import { STATUS_META } from './toolHelpers'

export function ScoreRing({ value, color, size = 124 }) {
  const display = value == null ? '—' : value
  const pct = value == null ? 0 : Math.min(100, Math.max(0, value))
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)
  return (
    <div className="score-ring" aria-label={`Score ${display}`}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#eef2f7" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="score-ring-text">
        <span className="score-ring-value">{display}</span>
        <span className="score-ring-max">/ 100</span>
      </div>
    </div>
  )
}

export function BreakdownItem({ icon, label, n, kind }) {
  return (
    <div className={`bd-item bd-${kind}`}>
      <span className="bd-icon">{icon}</span>
      <div className="bd-info">
        <span className="bd-num">{n}</span>
        <span className="bd-label">{label}</span>
      </div>
    </div>
  )
}

export function CheckCard({ check, result, isActive }) {
  const meta = STATUS_META[result.status]
  const isResult = ['pass', 'warn', 'fail', 'info'].includes(result.status)
  return (
    <article
      data-check-id={check.id}
      className={`check-card status-${meta.className} ${isActive ? 'active' : ''}`}
    >
      <header className="check-card-head">
        <span className="check-card-icon">{check.icon}</span>
        <span className={`status-badge ${meta.className}`}>
          {result.status === 'running' && <span className="status-spinner" />}
          {meta.label}
        </span>
      </header>
      <h3>{check.title}</h3>
      <p className="check-desc">{check.desc}</p>

      {isResult && (
        <div className="check-result">
          <div className="check-result-value">{result.value}</div>
          {result.detail && <div className="check-result-detail">{result.detail}</div>}
        </div>
      )}

      {result.status === 'running' && (
        <div className="check-result running">
          <div className="scan-bars" aria-hidden>
            <span /><span /><span /><span />
          </div>
          <div className="check-result-detail">Probing…</div>
        </div>
      )}

      {result.status === 'idle' && (
        <div className="check-result idle">
          <div className="check-result-detail">Waiting to scan…</div>
        </div>
      )}
    </article>
  )
}
