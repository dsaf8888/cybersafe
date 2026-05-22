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
  platforms: [{
    id, name, icon, color, settingsUrl,
    items: [{ id, label, detail? }]
  }]
}
*/

export default function SocialEditor({ value, onChange }) {
  const platforms = value.platforms
  const setPlatforms = (next) => onChange({ ...value, platforms: next })

  function addPlatform() {
    const id = slugId('new-platform', platforms.map((p) => p.id))
    setPlatforms(arrAppend(platforms, {
      id, name: 'New platform', icon: '✨',
      color: 'linear-gradient(135deg,#6366f1,#ec4899)',
      settingsUrl: 'https://example.com/settings',
      items: [],
    }))
  }

  return (
    <div className="sc-editor">
      <Section
        title="Platforms"
        hint="Each platform gets its own privacy checklist tailored to that service."
        action={<AddBtn onClick={addPlatform}>Add platform</AddBtn>}
      >
        {platforms.length === 0 && <p className="sc-empty">No platforms yet.</p>}
        {platforms.map((p, pi) => (
          <ItemRow
            key={p.id + pi}
            title={<><span style={{ marginRight: 8 }}>{p.icon}</span>{p.name || '(untitled platform)'}</>}
            badge={`${p.items.length} check${p.items.length === 1 ? '' : 's'}`}
            onMoveUp={pi > 0 ? () => setPlatforms(arrMove(platforms, pi, -1)) : null}
            onMoveDown={pi < platforms.length - 1 ? () => setPlatforms(arrMove(platforms, pi, +1)) : null}
            onRemove={() => setPlatforms(arrRemove(platforms, pi))}
            defaultOpen={false}
          >
            <div className="sc-row-3">
              <Field label="ID (slug)" monospace value={p.id} onChange={(id) => setPlatforms(arrUpdate(platforms, pi, { id }))} />
              <Field label="Display name" value={p.name} onChange={(name) => setPlatforms(arrUpdate(platforms, pi, { name }))} />
              <Field label="Icon (letter / emoji)" value={p.icon} onChange={(icon) => setPlatforms(arrUpdate(platforms, pi, { icon }))} />
            </div>
            <div className="sc-row-2">
              <Field
                label="Brand color (CSS)"
                monospace
                value={p.color}
                onChange={(color) => setPlatforms(arrUpdate(platforms, pi, { color }))}
                placeholder="linear-gradient(135deg,#000,#fff)"
              />
              <Field
                label="Settings page URL"
                value={p.settingsUrl}
                onChange={(settingsUrl) => setPlatforms(arrUpdate(platforms, pi, { settingsUrl }))}
              />
            </div>

            <div className="sc-platform-preview">
              <span className="sc-platform-preview-icon" style={{ background: p.color }}>{p.icon}</span>
              <span><strong>{p.name}</strong> — {p.items.length} checks</span>
            </div>

            <PrivacyItemList
              items={p.items}
              onChange={(items) => setPlatforms(arrUpdate(platforms, pi, { items }))}
            />
          </ItemRow>
        ))}
      </Section>
    </div>
  )
}

function PrivacyItemList({ items, onChange }) {
  function add() {
    const id = slugId('item', items.map((it) => it.id))
    onChange(arrAppend(items, { id, label: 'New privacy check', detail: '' }))
  }
  return (
    <div className="sc-sub-section">
      <div className="sc-sub-section-head">
        <h4>Checklist items</h4>
        <AddBtn onClick={add}>Add item</AddBtn>
      </div>
      {items.length === 0 && <p className="sc-empty sc-empty-dense">No items yet.</p>}
      {items.map((it, ii) => (
        <ItemRow
          key={it.id + ii}
          level={2}
          title={it.label || '(untitled)'}
          badge={it.detail ? 'has detail' : null}
          onMoveUp={ii > 0 ? () => onChange(arrMove(items, ii, -1)) : null}
          onMoveDown={ii < items.length - 1 ? () => onChange(arrMove(items, ii, +1)) : null}
          onRemove={() => onChange(arrRemove(items, ii))}
          defaultOpen={false}
        >
          <div className="sc-row-2">
            <Field label="ID" monospace value={it.id} onChange={(id) => onChange(arrUpdate(items, ii, { id }))} />
            <Field label="Label" value={it.label} onChange={(label) => onChange(arrUpdate(items, ii, { label }))} />
          </div>
          <TextArea
            label="Detail (optional helper text)"
            value={it.detail || ''}
            rows={2}
            onChange={(detail) => onChange(arrUpdate(items, ii, { detail }))}
          />
        </ItemRow>
      ))}
    </div>
  )
}
