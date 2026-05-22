import { useState } from 'react'
import {
  Field,
  TextArea,
  Select,
  ItemRow,
  AddBtn,
  Section,
} from './editor-primitives'
import { arrUpdate, arrRemove, arrAppend, arrMove, slugId } from './editor-utils'

/* Shape:
{
  patterns: [{ id, cat, label, severity: 'low'|'med'|'high', pattern: string, flags: string, why }],
  examples: { scam: string, legit: string }
}
*/

const SEVERITY_OPTS = [
  { value: 'low',  label: 'Low — informational' },
  { value: 'med',  label: 'Med — suspicious' },
  { value: 'high', label: 'High — strong scam signal' },
]

export default function ScamEditor({ value, onChange }) {
  const v = value
  const update = (patch) => onChange({ ...v, ...patch })

  function addPattern() {
    const id = slugId('new-pattern', v.patterns.map((p) => p.id))
    update({
      patterns: arrAppend(v.patterns, {
        id, cat: 'New category', label: 'New pattern', severity: 'med',
        pattern: 'example', flags: 'gi',
        why: 'Why this is suspicious — explain in 1–2 sentences.',
      }),
    })
  }

  return (
    <div className="sc-editor">
      <Section
        title="Regex pattern library"
        hint="Each pattern is matched against the user's pasted message and contributes to the score."
        action={<AddBtn onClick={addPattern}>Add pattern</AddBtn>}
      >
        {v.patterns.length === 0 && <p className="sc-empty">No patterns yet.</p>}
        {v.patterns.map((p, pi) => (
          <PatternEditor
            key={p.id + pi}
            pattern={p}
            onChange={(next) => update({ patterns: arrUpdate(v.patterns, pi, next) })}
            onRemove={() => update({ patterns: arrRemove(v.patterns, pi) })}
            onMoveUp={pi > 0 ? () => update({ patterns: arrMove(v.patterns, pi, -1) }) : null}
            onMoveDown={pi < v.patterns.length - 1 ? () => update({ patterns: arrMove(v.patterns, pi, +1) }) : null}
          />
        ))}
      </Section>

      <Section
        title="Demo messages"
        hint="Loaded by the tool's “Load example” buttons. Useful for showing visitors what to expect."
      >
        <TextArea
          label="Scam example"
          rows={6}
          value={v.examples?.scam || ''}
          monospace
          onChange={(scam) => update({ examples: { ...(v.examples || {}), scam } })}
        />
        <TextArea
          label="Legit example"
          rows={5}
          value={v.examples?.legit || ''}
          monospace
          onChange={(legit) => update({ examples: { ...(v.examples || {}), legit } })}
        />
      </Section>
    </div>
  )
}

/* ----------------------------------------------------------------- */
function PatternEditor({ pattern, onChange, onRemove, onMoveUp, onMoveDown }) {
  const [testText, setTestText] = useState('')

  const compileError = (() => {
    try { new RegExp(pattern.pattern, pattern.flags || 'gi'); return null }
    catch (err) { return err.message }
  })()

  let matches = []
  if (!compileError && testText) {
    try {
      const re = new RegExp(pattern.pattern, pattern.flags || 'gi')
      let m
      let count = 0
      while ((m = re.exec(testText)) !== null && count < 50) {
        matches.push(m[0]); count++
        if (m.index === re.lastIndex) re.lastIndex++
      }
    } catch { /* already shown above */ }
  }

  const sevColor = pattern.severity === 'high' ? '#ef4444' : pattern.severity === 'med' ? '#f59e0b' : '#64748b'

  return (
    <ItemRow
      title={
        <>
          <span className="sc-pat-sev" style={{ background: sevColor }}>{pattern.severity}</span>
          {pattern.label || '(untitled pattern)'}
        </>
      }
      badge={pattern.cat}
      onRemove={onRemove}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      defaultOpen={false}
    >
      <div className="sc-row-3">
        <Field label="ID" monospace value={pattern.id} onChange={(id) => onChange({ ...pattern, id })} />
        <Field label="Category" value={pattern.cat} onChange={(cat) => onChange({ ...pattern, cat })} />
        <Select
          label="Severity"
          value={pattern.severity}
          options={SEVERITY_OPTS}
          onChange={(severity) => onChange({ ...pattern, severity })}
        />
      </div>
      <Field label="Display label" value={pattern.label} onChange={(label) => onChange({ ...pattern, label })} />

      <div className="sc-row-2">
        <Field
          label="Regex pattern (no leading / )"
          monospace
          value={pattern.pattern}
          onChange={(p) => onChange({ ...pattern, pattern: p })}
        />
        <Field
          label="Flags"
          monospace
          value={pattern.flags}
          onChange={(flags) => onChange({ ...pattern, flags })}
          placeholder="gi"
        />
      </div>
      {compileError && (
        <p className="sc-warn-inline">⚠️ Regex invalid: {compileError}</p>
      )}

      <TextArea
        label="Why this is suspicious"
        value={pattern.why}
        rows={2}
        onChange={(why) => onChange({ ...pattern, why })}
      />

      <div className="sc-pat-test">
        <TextArea
          label="Test against sample text"
          value={testText}
          rows={2}
          placeholder="Type something here to test if your regex matches…"
          onChange={setTestText}
        />
        {testText && !compileError && (
          <div className="sc-pat-test-result">
            {matches.length === 0
              ? <span className="sc-pat-test-miss">No matches.</span>
              : (
                <>
                  <span className="sc-pat-test-hit">{matches.length} match{matches.length === 1 ? '' : 'es'}:</span>
                  {matches.slice(0, 10).map((m, i) => <code key={i}>{m}</code>)}
                </>
              )}
          </div>
        )}
      </div>
    </ItemRow>
  )
}
