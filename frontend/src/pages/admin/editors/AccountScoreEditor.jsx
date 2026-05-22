import { useMemo } from 'react'
import {
  Field,
  TextArea,
  NumberField,
  ItemRow,
  AddBtn,
  Section,
} from './editor-primitives'
import { arrUpdate, arrRemove, arrAppend, arrMove, slugId } from './editor-utils'

/* Shape:
{
  basic: [{ id, icon, title, desc, questions: [{ id, text, options: [{ id, label, score }] }] }],
  advanced: [ same shape ],
  recommendations: { [categoryId]: { icon, title, desc } }
}
*/

export default function AccountScoreEditor({ value, onChange }) {
  const v = value
  const update = (patch) => onChange({ ...v, ...patch })

  return (
    <div className="sc-editor">
      <CategoryListEditor
        title="Basic question pack"
        hint="Shown on first load. Aim for 3–6 categories with 2–4 questions each."
        categories={v.basic}
        onChange={(basic) => update({ basic })}
      />

      <CategoryListEditor
        title="Advanced question pack"
        hint="Loaded when the user clicks ＋ Load advanced pack. Optional."
        categories={v.advanced}
        onChange={(advanced) => update({ advanced })}
      />

      <RecommendationsEditor
        recommendations={v.recommendations}
        knownCategoryIds={useMemo(
          () => [...v.basic, ...v.advanced].map((c) => c.id),
          [v.basic, v.advanced],
        )}
        onChange={(recommendations) => update({ recommendations })}
      />
    </div>
  )
}

/* ----------------------------------------------------------------- */
function CategoryListEditor({ title, hint, categories, onChange }) {
  function addCategory() {
    const id = slugId('new-category', categories.map((c) => c.id))
    onChange(arrAppend(categories, {
      id, icon: '✨', title: 'New category', desc: '',
      questions: [],
    }))
  }
  return (
    <Section title={title} hint={hint} action={<AddBtn onClick={addCategory}>Add category</AddBtn>}>
      {categories.length === 0 && <EmptyHint label="No categories yet. Add one to get started." />}
      {categories.map((cat, ci) => (
        <ItemRow
          key={cat.id + ci}
          title={`${cat.icon || '·'}  ${cat.title || '(untitled category)'}`}
          badge={`${cat.questions.length} question${cat.questions.length === 1 ? '' : 's'}`}
          onMoveUp   ={ci > 0 ? () => onChange(arrMove(categories, ci, -1)) : null}
          onMoveDown ={ci < categories.length - 1 ? () => onChange(arrMove(categories, ci, +1)) : null}
          onRemove   ={() => onChange(arrRemove(categories, ci))}
          defaultOpen={false}
        >
          <div className="sc-row-3">
            <Field
              label="Icon (emoji)"
              value={cat.icon}
              onChange={(icon) => onChange(arrUpdate(categories, ci, { icon }))}
              placeholder="🔑"
            />
            <Field
              label="Title"
              value={cat.title}
              onChange={(t) => onChange(arrUpdate(categories, ci, { title: t }))}
            />
            <Field
              label="ID (slug)"
              value={cat.id}
              monospace
              onChange={(id) => onChange(arrUpdate(categories, ci, { id }))}
            />
          </div>
          <TextArea
            label="Description"
            value={cat.desc}
            rows={2}
            onChange={(desc) => onChange(arrUpdate(categories, ci, { desc }))}
          />

          <QuestionListEditor
            questions={cat.questions}
            onChange={(questions) => onChange(arrUpdate(categories, ci, { questions }))}
          />
        </ItemRow>
      ))}
    </Section>
  )
}

/* ----------------------------------------------------------------- */
function QuestionListEditor({ questions, onChange }) {
  function addQuestion() {
    const id = slugId('q-new', questions.map((q) => q.id))
    onChange(arrAppend(questions, {
      id, text: 'New question?',
      options: [
        { id: 'good', label: 'Best answer', score: 10 },
        { id: 'ok',   label: 'OK answer',   score: 5 },
        { id: 'bad',  label: 'Risky answer', score: 0 },
      ],
    }))
  }
  return (
    <div className="sc-sub-section">
      <div className="sc-sub-section-head">
        <h4>Questions</h4>
        <AddBtn onClick={addQuestion}>Add question</AddBtn>
      </div>
      {questions.length === 0 && <EmptyHint label="No questions yet." dense />}
      {questions.map((q, qi) => (
        <ItemRow
          key={q.id + qi}
          level={2}
          title={q.text || '(untitled question)'}
          badge={`${q.options.length} option${q.options.length === 1 ? '' : 's'}`}
          onMoveUp   ={qi > 0 ? () => onChange(arrMove(questions, qi, -1)) : null}
          onMoveDown ={qi < questions.length - 1 ? () => onChange(arrMove(questions, qi, +1)) : null}
          onRemove   ={() => onChange(arrRemove(questions, qi))}
          defaultOpen={false}
        >
          <div className="sc-row-2">
            <Field label="Question ID" monospace value={q.id} onChange={(id) => onChange(arrUpdate(questions, qi, { id }))} />
            <Field label="Question text" value={q.text} onChange={(text) => onChange(arrUpdate(questions, qi, { text }))} />
          </div>

          <OptionListEditor
            options={q.options}
            onChange={(options) => onChange(arrUpdate(questions, qi, { options }))}
          />
        </ItemRow>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------- */
function OptionListEditor({ options, onChange }) {
  function addOpt() {
    const id = slugId('opt', options.map((o) => o.id))
    onChange(arrAppend(options, { id, label: 'New option', score: 5 }))
  }
  return (
    <div className="sc-sub-section">
      <div className="sc-sub-section-head sc-sub-section-head-tight">
        <h5>Options (score 0–10)</h5>
        <AddBtn onClick={addOpt}>Add option</AddBtn>
      </div>
      <table className="sc-table">
        <thead>
          <tr>
            <th style={{ width: 110 }}>ID</th>
            <th>Label</th>
            <th style={{ width: 90 }}>Score</th>
            <th style={{ width: 80 }}></th>
          </tr>
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
          {options.length === 0 && (
            <tr><td colSpan={4} className="sc-table-empty">No options yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/* ----------------------------------------------------------------- */
function RecommendationsEditor({ recommendations, knownCategoryIds, onChange }) {
  const recIds = Object.keys(recommendations)
  function add() {
    let id = 'new-rec'
    let n = 2
    while (recommendations[id]) { id = `new-rec-${n}`; n += 1 }
    onChange({ ...recommendations, [id]: { icon: '💡', title: 'New recommendation', desc: '' } })
  }
  function update(oldId, patch, newId) {
    const next = { ...recommendations }
    const merged = { ...next[oldId], ...patch }
    delete next[oldId]
    next[newId ?? oldId] = merged
    onChange(next)
  }
  function remove(id) {
    const next = { ...recommendations }
    delete next[id]
    onChange(next)
  }
  return (
    <Section
      title="Recommendations per category"
      hint="Shown to users whose category score is below 70. Match the ID to a category ID."
      action={<AddBtn onClick={add}>Add recommendation</AddBtn>}
    >
      {recIds.length === 0 && <EmptyHint label="No recommendations yet." />}
      {recIds.map((rid) => {
        const r = recommendations[rid]
        const usedByCat = knownCategoryIds.includes(rid)
        return (
          <ItemRow
            key={rid}
            title={`${r.icon || '·'}  ${r.title || '(untitled)'}`}
            badge={usedByCat ? `→ ${rid}` : 'unused'}
            onRemove={() => remove(rid)}
            defaultOpen={false}
          >
            <div className="sc-row-3">
              <Field
                label="Category ID to match"
                monospace
                value={rid}
                onChange={(nextId) => update(rid, {}, nextId)}
              />
              <Field
                label="Icon"
                value={r.icon}
                onChange={(icon) => update(rid, { icon })}
              />
              <Field
                label="Title"
                value={r.title}
                onChange={(title) => update(rid, { title })}
              />
            </div>
            <TextArea
              label="Description"
              value={r.desc}
              rows={2}
              onChange={(desc) => update(rid, { desc })}
            />
            {!usedByCat && (
              <p className="sc-warn-inline">
                ⚠️ No category currently uses the ID <code>{rid}</code>. This recommendation won&apos;t show
                until a category with that ID exists.
              </p>
            )}
          </ItemRow>
        )
      })}
    </Section>
  )
}

function EmptyHint({ label, dense }) {
  return <p className={`sc-empty ${dense ? 'sc-empty-dense' : ''}`}>{label}</p>
}

/* NumberField kept exported in case sub-editors want it later */
export { NumberField }
