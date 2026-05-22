import { useState } from 'react'

/* Small text input */
export function Field({ label, value, onChange, placeholder, monospace }) {
  return (
    <label className="sc-field">
      {label && <span className="sc-field-label">{label}</span>}
      <input
        type="text"
        className={`sc-input ${monospace ? 'sc-input-mono' : ''}`}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

/* Multi-line textarea */
export function TextArea({ label, value, onChange, rows = 3, placeholder, monospace }) {
  return (
    <label className="sc-field">
      {label && <span className="sc-field-label">{label}</span>}
      <textarea
        className={`sc-input sc-textarea ${monospace ? 'sc-input-mono' : ''}`}
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

/* Number input */
export function NumberField({ label, value, onChange, min, max, step }) {
  return (
    <label className="sc-field sc-field-num">
      {label && <span className="sc-field-label">{label}</span>}
      <input
        type="number"
        className="sc-input"
        value={value ?? ''}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    </label>
  )
}

/* Select */
export function Select({ label, value, options, onChange }) {
  return (
    <label className="sc-field">
      {label && <span className="sc-field-label">{label}</span>}
      <select
        className="sc-input sc-select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

/* Item card row with reorder + remove */
export function ItemRow({ title, badge, onMoveUp, onMoveDown, onRemove, children, collapsible = true, defaultOpen = true, level = 1 }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`sc-item sc-item-l${level} ${open ? '' : 'collapsed'}`}>
      <header className="sc-item-head">
        <button
          type="button"
          className="sc-item-toggle"
          onClick={() => collapsible && setOpen((o) => !o)}
          disabled={!collapsible}
          aria-expanded={open}
        >
          {collapsible && <span className="sc-item-caret" aria-hidden>{open ? '▾' : '▸'}</span>}
          <span className="sc-item-title">{title}</span>
          {badge && <span className="sc-item-badge">{badge}</span>}
        </button>
        <div className="sc-item-actions">
          {onMoveUp && <button type="button" className="sc-icon-btn" onClick={onMoveUp} title="Move up">▲</button>}
          {onMoveDown && <button type="button" className="sc-icon-btn" onClick={onMoveDown} title="Move down">▼</button>}
          {onRemove && <button type="button" className="sc-icon-btn sc-icon-danger" onClick={onRemove} title="Remove">✕</button>}
        </div>
      </header>
      {open && <div className="sc-item-body">{children}</div>}
    </div>
  )
}

/* Generic add button */
export function AddBtn({ children, onClick }) {
  return (
    <button type="button" className="sc-add-btn" onClick={onClick}>
      <span>＋</span> {children}
    </button>
  )
}

/* Section wrapper */
export function Section({ title, hint, children, action }) {
  return (
    <section className="sc-section">
      <header className="sc-section-head">
        <div>
          <h3>{title}</h3>
          {hint && <p>{hint}</p>}
        </div>
        {action}
      </header>
      <div className="sc-section-body">{children}</div>
    </section>
  )
}

