import {
  Field,
  TextArea,
  Select,
  NumberField,
  ItemRow,
  AddBtn,
  Section,
} from './editor-primitives'
import { arrUpdate, arrRemove, arrAppend, arrMove, slugId } from './editor-utils'

/* Shape:
{
  questions: [{
    id, type: 'email'|'sms'|'url',
    isPhish: bool,
    from?: string, subject?: string, body?: string[],   // email/sms
    url?: string,                                        // url
    why: string,
    redFlags: string[]
  }],
  tiers: [{ min: number, label, color, desc }]
}
*/

const TYPE_OPTS = [
  { value: 'email', label: 'Email' },
  { value: 'sms',   label: 'SMS / text' },
  { value: 'url',   label: 'URL' },
]

const VERDICT_OPTS = [
  { value: 'true',  label: '🎣 Phishing (correct = user picked phishing)' },
  { value: 'false', label: '✅ Legitimate (correct = user picked legit)' },
]

export default function PhishingEditor({ value, onChange }) {
  const v = value
  const update = (patch) => onChange({ ...v, ...patch })

  function addQuestion() {
    const id = slugId('q-new', v.questions.map((q) => q.id))
    update({
      questions: arrAppend(v.questions, {
        id, type: 'email', isPhish: true,
        from: 'New Sender <hello@example.com>',
        subject: 'New scenario',
        body: ['Body line 1', 'Body line 2'],
        why: 'Explain to the user why this is or isn’t phishing.',
        redFlags: [],
      }),
    })
  }

  function addTier() {
    update({ tiers: arrAppend(v.tiers, { min: 0, label: 'New tier', color: '#64748b', desc: '' }) })
  }

  return (
    <div className="sc-editor">
      <Section
        title="Quiz scenarios"
        hint="Each scenario shows an email, SMS or URL artefact and asks the user: legit or phishing?"
        action={<AddBtn onClick={addQuestion}>Add scenario</AddBtn>}
      >
        {v.questions.length === 0 && <p className="sc-empty">No scenarios yet.</p>}
        {v.questions.map((q, qi) => (
          <ScenarioEditor
            key={q.id + qi}
            scenario={q}
            index={qi}
            onChange={(next) => update({ questions: arrUpdate(v.questions, qi, next) })}
            onRemove={() => update({ questions: arrRemove(v.questions, qi) })}
            onMoveUp={qi > 0 ? () => update({ questions: arrMove(v.questions, qi, -1) }) : null}
            onMoveDown={qi < v.questions.length - 1 ? () => update({ questions: arrMove(v.questions, qi, +1) }) : null}
          />
        ))}
      </Section>

      <Section
        title="Score tiers"
        hint="Map a minimum score (out of total questions) to a rank label, color and description. The first tier whose min is met wins — order them from highest min to lowest."
        action={<AddBtn onClick={addTier}>Add tier</AddBtn>}
      >
        {v.tiers.length === 0 && <p className="sc-empty">No tiers yet.</p>}
        {v.tiers.map((t, ti) => (
          <ItemRow
            key={ti}
            title={
              <>
                <span className="sc-tier-color" style={{ background: t.color }} />
                {t.label || '(untitled tier)'}
              </>
            }
            badge={`min ${t.min}`}
            onMoveUp={ti > 0 ? () => update({ tiers: arrMove(v.tiers, ti, -1) }) : null}
            onMoveDown={ti < v.tiers.length - 1 ? () => update({ tiers: arrMove(v.tiers, ti, +1) }) : null}
            onRemove={() => update({ tiers: arrRemove(v.tiers, ti) })}
            defaultOpen={false}
          >
            <div className="sc-row-3">
              <NumberField label="Min score" value={t.min} min={0} onChange={(min) => update({ tiers: arrUpdate(v.tiers, ti, { min }) })} />
              <Field label="Label" value={t.label} onChange={(label) => update({ tiers: arrUpdate(v.tiers, ti, { label }) })} />
              <Field label="Color (hex)" monospace value={t.color} onChange={(color) => update({ tiers: arrUpdate(v.tiers, ti, { color }) })} />
            </div>
            <TextArea label="Description" value={t.desc} rows={2} onChange={(desc) => update({ tiers: arrUpdate(v.tiers, ti, { desc }) })} />
          </ItemRow>
        ))}
      </Section>
    </div>
  )
}

/* ----------------------------------------------------------------- */
function ScenarioEditor({ scenario, index, onChange, onRemove, onMoveUp, onMoveDown }) {
  const s = scenario
  const set = (patch) => onChange({ ...s, ...patch })

  return (
    <ItemRow
      title={
        <>
          <span className={`sc-quiz-tag sc-quiz-tag-${s.isPhish ? 'phish' : 'safe'}`}>
            {s.isPhish ? '🎣 Phishing' : '✅ Legit'}
          </span>
          <span className="sc-quiz-type">{s.type.toUpperCase()}</span>
          {s.subject || s.url || (s.body && s.body[0]) || '(untitled)'}
        </>
      }
      badge={`#${index + 1}`}
      onRemove={onRemove}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      defaultOpen={false}
    >
      <div className="sc-row-3">
        <Field label="ID" monospace value={s.id} onChange={(id) => set({ id })} />
        <Select label="Type" value={s.type} options={TYPE_OPTS} onChange={(type) => set({ type })} />
        <Select
          label="Verdict"
          value={String(s.isPhish)}
          options={VERDICT_OPTS}
          onChange={(v) => set({ isPhish: v === 'true' })}
        />
      </div>

      {s.type === 'email' && (
        <>
          <div className="sc-row-2">
            <Field label="From" value={s.from || ''} onChange={(from) => set({ from })} placeholder="Sender Name <sender@domain.com>" />
            <Field label="Subject" value={s.subject || ''} onChange={(subject) => set({ subject })} />
          </div>
          <BodyLinesEditor body={s.body || []} onChange={(body) => set({ body })} />
        </>
      )}

      {s.type === 'sms' && (
        <>
          <Field label="From (number / sender)" value={s.from || ''} onChange={(from) => set({ from })} />
          <BodyLinesEditor body={s.body || []} onChange={(body) => set({ body })} label="SMS body" />
        </>
      )}

      {s.type === 'url' && (
        <Field label="URL to display" monospace value={s.url || ''} onChange={(url) => set({ url })} />
      )}

      <TextArea label="Explanation (why phishing / why legit)" rows={3} value={s.why} onChange={(why) => set({ why })} />

      <RedFlagsEditor flags={s.redFlags || []} onChange={(redFlags) => set({ redFlags })} />
    </ItemRow>
  )
}

function BodyLinesEditor({ body, onChange, label = 'Body — one paragraph per line' }) {
  return (
    <TextArea
      label={label}
      value={body.join('\n')}
      rows={5}
      onChange={(text) => onChange(text.split('\n'))}
    />
  )
}

function RedFlagsEditor({ flags, onChange }) {
  function add() { onChange(arrAppend(flags, 'New red flag')) }
  return (
    <div className="sc-sub-section">
      <div className="sc-sub-section-head sc-sub-section-head-tight">
        <h5>Red flags (one per row)</h5>
        <AddBtn onClick={add}>Add flag</AddBtn>
      </div>
      {flags.length === 0 && <p className="sc-empty sc-empty-dense">No red flags — that&apos;s OK for legit scenarios.</p>}
      {flags.map((f, i) => (
        <div key={i} className="sc-flag-row">
          <input
            className="sc-input"
            value={f}
            onChange={(e) => {
              const next = flags.slice()
              next[i] = e.target.value
              onChange(next)
            }}
          />
          <button type="button" className="sc-icon-btn" onClick={() => onChange(arrMove(flags, i, -1))} disabled={i === 0}>▲</button>
          <button type="button" className="sc-icon-btn" onClick={() => onChange(arrMove(flags, i, +1))} disabled={i === flags.length - 1}>▼</button>
          <button type="button" className="sc-icon-btn sc-icon-danger" onClick={() => onChange(arrRemove(flags, i))}>✕</button>
        </div>
      ))}
    </div>
  )
}
