import { useMemo, useState } from 'react'
import {
  Field,
  TextArea,
  ItemRow,
  AddBtn,
  Section,
} from './editor-primitives'
import { arrUpdate, arrRemove, arrAppend, arrMove, slugId } from './editor-utils'

/* Shape:
{
  networkTypes: [{ id, icon, label, desc }],
  questions: { [networkTypeId]: [{ id, q, opts: [{ id, label, score }] }] },
  recs: { [questionId]: { title, desc } },
}
*/

export default function WiFiEditor({ value, onChange }) {
  const v = value
  const update = (patch) => onChange({ ...v, ...patch })
  const [activeType, setActiveType] = useState(v.networkTypes[0]?.id || null)

  /* Make sure activeType stays valid as the user adds/removes types */
  const safeActiveType = useMemo(() => {
    if (v.networkTypes.find((n) => n.id === activeType)) return activeType
    return v.networkTypes[0]?.id || null
  }, [v.networkTypes, activeType])

  return (
    <div className="sc-editor">
      <NetworkTypesEditor
        networkTypes={v.networkTypes}
        questionsByType={v.questions}
        onChange={(networkTypes, nextQuestions) =>
          update({ networkTypes, questions: nextQuestions ?? v.questions })
        }
      />

      <Section
        title="Question bank per network type"
        hint="Each network type has its own questions tailored to that context."
        action={
          v.networkTypes.length > 0 && (
            <div className="sc-tab-strip">
              {v.networkTypes.map((nt) => (
                <button
                  key={nt.id}
                  type="button"
                  className={`sc-tab ${safeActiveType === nt.id ? 'active' : ''}`}
                  onClick={() => setActiveType(nt.id)}
                >
                  <span aria-hidden style={{ marginRight: 6 }}>{nt.icon}</span>
                  {nt.label}
                  <span className="sc-tab-count">{(v.questions[nt.id] || []).length}</span>
                </button>
              ))}
            </div>
          )
        }
      >
        {safeActiveType ? (
          <WiFiQuestionList
            questions={v.questions[safeActiveType] || []}
            onChange={(next) =>
              update({ questions: { ...v.questions, [safeActiveType]: next } })
            }
          />
        ) : (
          <p className="sc-empty">Add a network type above to begin.</p>
        )}
      </Section>

      <RecsEditor
        recs={v.recs}
        knownQuestionIds={useMemo(() => Object.values(v.questions).flat().map((q) => q.id), [v.questions])}
        onChange={(recs) => update({ recs })}
      />
    </div>
  )
}

/* ----------------------------------------------------------------- */
function NetworkTypesEditor({ networkTypes, questionsByType, onChange }) {
  function add() {
    const id = slugId('new-type', networkTypes.map((n) => n.id))
    onChange(arrAppend(networkTypes, { id, icon: '📡', label: 'New type', desc: '' }), { ...questionsByType, [id]: [] })
  }
  function remove(idx) {
    const removed = networkTypes[idx]
    const nextQ = { ...questionsByType }
    delete nextQ[removed.id]
    onChange(arrRemove(networkTypes, idx), nextQ)
  }
  function updateField(idx, patch, oldId) {
    if (patch.id && patch.id !== oldId) {
      /* Rename: move the matching questions array under the new key */
      const nextQ = { ...questionsByType, [patch.id]: questionsByType[oldId] || [] }
      delete nextQ[oldId]
      onChange(arrUpdate(networkTypes, idx, patch), nextQ)
    } else {
      onChange(arrUpdate(networkTypes, idx, patch))
    }
  }

  return (
    <Section
      title="Network types"
      hint="These are the cards the user picks from before answering."
      action={<AddBtn onClick={add}>Add network type</AddBtn>}
    >
      {networkTypes.length === 0 && <p className="sc-empty">No network types defined.</p>}
      {networkTypes.map((nt, ni) => (
        <ItemRow
          key={nt.id + ni}
          title={`${nt.icon || '·'}  ${nt.label || '(untitled)'}`}
          badge={`${(questionsByType[nt.id] || []).length} questions`}
          onMoveUp={ni > 0 ? () => onChange(arrMove(networkTypes, ni, -1)) : null}
          onMoveDown={ni < networkTypes.length - 1 ? () => onChange(arrMove(networkTypes, ni, +1)) : null}
          onRemove={() => remove(ni)}
          defaultOpen={false}
        >
          <div className="sc-row-4">
            <Field label="ID (slug)" monospace value={nt.id} onChange={(id) => updateField(ni, { id }, nt.id)} />
            <Field label="Icon" value={nt.icon} onChange={(icon) => updateField(ni, { icon }, nt.id)} />
            <Field label="Label" value={nt.label} onChange={(label) => updateField(ni, { label }, nt.id)} />
            <Field label="Description" value={nt.desc} onChange={(desc) => updateField(ni, { desc }, nt.id)} />
          </div>
        </ItemRow>
      ))}
    </Section>
  )
}

/* ----------------------------------------------------------------- */
function WiFiQuestionList({ questions, onChange }) {
  function add() {
    const id = slugId('q-new', questions.map((q) => q.id))
    onChange(arrAppend(questions, {
      id, q: 'New question?',
      opts: [
        { id: 'good', label: 'Best answer',  score: 10 },
        { id: 'mid',  label: 'OK answer',    score: 5 },
        { id: 'bad',  label: 'Risky answer', score: 0 },
      ],
    }))
  }
  return (
    <div className="sc-sub-section">
      <div className="sc-sub-section-head">
        <h4>Questions</h4>
        <AddBtn onClick={add}>Add question</AddBtn>
      </div>
      {questions.length === 0 && <p className="sc-empty sc-empty-dense">No questions yet.</p>}
      {questions.map((q, qi) => (
        <ItemRow
          key={q.id + qi}
          level={2}
          title={q.q || '(untitled question)'}
          badge={`${q.opts.length} option${q.opts.length === 1 ? '' : 's'}`}
          onMoveUp={qi > 0 ? () => onChange(arrMove(questions, qi, -1)) : null}
          onMoveDown={qi < questions.length - 1 ? () => onChange(arrMove(questions, qi, +1)) : null}
          onRemove={() => onChange(arrRemove(questions, qi))}
          defaultOpen={false}
        >
          <div className="sc-row-2">
            <Field label="Question ID" monospace value={q.id} onChange={(id) => onChange(arrUpdate(questions, qi, { id }))} />
            <Field label="Question text" value={q.q} onChange={(qx) => onChange(arrUpdate(questions, qi, { q: qx }))} />
          </div>
          <OptionsTable
            options={q.opts}
            onChange={(opts) => onChange(arrUpdate(questions, qi, { opts }))}
          />
        </ItemRow>
      ))}
    </div>
  )
}

function OptionsTable({ options, onChange }) {
  function add() {
    const id = slugId('opt', options.map((o) => o.id))
    onChange(arrAppend(options, { id, label: 'New option', score: 5 }))
  }
  return (
    <div className="sc-sub-section">
      <div className="sc-sub-section-head sc-sub-section-head-tight">
        <h5>Options</h5>
        <AddBtn onClick={add}>Add option</AddBtn>
      </div>
      <table className="sc-table">
        <thead>
          <tr><th style={{ width: 110 }}>ID</th><th>Label</th><th style={{ width: 90 }}>Score</th><th style={{ width: 80 }} /></tr>
        </thead>
        <tbody>
          {options.map((o, oi) => (
            <tr key={o.id + oi}>
              <td><input className="sc-input sc-input-mono" value={o.id} onChange={(e) => onChange(arrUpdate(options, oi, { id: e.target.value }))} /></td>
              <td><input className="sc-input" value={o.label} onChange={(e) => onChange(arrUpdate(options, oi, { label: e.target.value }))} /></td>
              <td><input type="number" className="sc-input" min={0} max={10} value={o.score} onChange={(e) => onChange(arrUpdate(options, oi, { score: Number(e.target.value) }))} /></td>
              <td className="sc-table-actions">
                <button type="button" className="sc-icon-btn" onClick={() => onChange(arrMove(options, oi, -1))} disabled={oi === 0}>▲</button>
                <button type="button" className="sc-icon-btn" onClick={() => onChange(arrMove(options, oi, +1))} disabled={oi === options.length - 1}>▼</button>
                <button type="button" className="sc-icon-btn sc-icon-danger" onClick={() => onChange(arrRemove(options, oi))}>✕</button>
              </td>
            </tr>
          ))}
          {options.length === 0 && <tr><td colSpan={4} className="sc-table-empty">No options yet.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

/* ----------------------------------------------------------------- */
function RecsEditor({ recs, knownQuestionIds, onChange }) {
  const recIds = Object.keys(recs)
  function add() {
    let id = 'new-rec'; let n = 2
    while (recs[id]) { id = `new-rec-${n}`; n += 1 }
    onChange({ ...recs, [id]: { title: 'New tip', desc: '' } })
  }
  function update(oldId, patch, newId) {
    const next = { ...recs }
    const merged = { ...next[oldId], ...patch }
    delete next[oldId]
    next[newId ?? oldId] = merged
    onChange(next)
  }
  function remove(id) {
    const next = { ...recs }
    delete next[id]
    onChange(next)
  }
  return (
    <Section
      title="Per-question recommendations"
      hint="Shown to users when their answer scores below 7. Match the ID to a question ID."
      action={<AddBtn onClick={add}>Add recommendation</AddBtn>}
    >
      {recIds.length === 0 && <p className="sc-empty">No recommendations yet.</p>}
      {recIds.map((rid) => {
        const r = recs[rid]
        const isLinked = knownQuestionIds.includes(rid)
        return (
          <ItemRow
            key={rid}
            title={r.title || '(untitled)'}
            badge={isLinked ? `→ ${rid}` : 'unused'}
            onRemove={() => remove(rid)}
            defaultOpen={false}
          >
            <div className="sc-row-2">
              <Field label="Question ID to match" monospace value={rid} onChange={(id) => update(rid, {}, id)} />
              <Field label="Title" value={r.title} onChange={(title) => update(rid, { title })} />
            </div>
            <TextArea label="Description" value={r.desc} rows={2} onChange={(desc) => update(rid, { desc })} />
            {!isLinked && (
              <p className="sc-warn-inline">
                ⚠️ No question currently has the ID <code>{rid}</code>.
              </p>
            )}
          </ItemRow>
        )
      })}
    </Section>
  )
}
