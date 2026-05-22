import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import PageLayout from '../../components/layout/PageLayout'
import {
  setToolContent,
  resetTool,
  resetAllTools,
  selectAllOverrides,
} from '../../store/contentSlice'
import {
  ACCOUNT_BASIC_DEFAULT,
  ACCOUNT_ADVANCED_DEFAULT,
  ACCOUNT_RECOMMENDATIONS_DEFAULT,
  WIFI_NETWORK_TYPES_DEFAULT,
  WIFI_QUESTIONS_DEFAULT,
  WIFI_RECS_DEFAULT,
  SOCIAL_PLATFORMS_DEFAULT,
  SCAM_PATTERNS_DEFAULT,
  SCAM_EXAMPLES_DEFAULT,
  PHISHING_QUESTIONS_DEFAULT,
  PHISHING_TIERS_DEFAULT,
} from '../../data/toolContent'
import AccountScoreEditor from './editors/AccountScoreEditor'
import WiFiEditor         from './editors/WiFiEditor'
import SocialEditor       from './editors/SocialEditor'
import ScamEditor         from './editors/ScamEditor'
import PhishingEditor     from './editors/PhishingEditor'
import './set-content.css'

const TOOLS = [
  {
    id: 'accountScore',
    label: 'Account Security Score',
    short: 'Account Score',
    icon: '📊',
    tagline: 'Habit survey · 0–100 score',
    path: '/tools/account-security-score',
    defaults: () => ({
      basic: ACCOUNT_BASIC_DEFAULT,
      advanced: ACCOUNT_ADVANCED_DEFAULT,
      recommendations: ACCOUNT_RECOMMENDATIONS_DEFAULT,
    }),
    Editor: AccountScoreEditor,
  },
  {
    id: 'wifiSafety',
    label: 'WiFi Safety Checker',
    short: 'WiFi Safety',
    icon: '📶',
    tagline: 'Per-network type questions',
    path: '/tools/wifi-safety',
    defaults: () => ({
      networkTypes: WIFI_NETWORK_TYPES_DEFAULT,
      questions: WIFI_QUESTIONS_DEFAULT,
      recs: WIFI_RECS_DEFAULT,
    }),
    Editor: WiFiEditor,
  },
  {
    id: 'socialPrivacy',
    label: 'Social Media Privacy',
    short: 'Social Privacy',
    icon: '🔐',
    tagline: 'Per-platform privacy checklist',
    path: '/tools/social-privacy',
    defaults: () => ({ platforms: SOCIAL_PLATFORMS_DEFAULT }),
    Editor: SocialEditor,
  },
  {
    id: 'scamAnalyzer',
    label: 'Scam Message Analyzer',
    short: 'Scam Analyzer',
    icon: '💬',
    tagline: 'Regex pattern library',
    path: '/tools/scam-analyzer',
    defaults: () => ({
      patterns: SCAM_PATTERNS_DEFAULT,
      examples: SCAM_EXAMPLES_DEFAULT,
    }),
    Editor: ScamEditor,
  },
  {
    id: 'phishingQuiz',
    label: 'Phishing Awareness Quiz',
    short: 'Phishing Quiz',
    icon: '🎣',
    tagline: 'Real-world scenarios',
    path: '/tools/phishing-quiz',
    defaults: () => ({
      questions: PHISHING_QUESTIONS_DEFAULT,
      tiers: PHISHING_TIERS_DEFAULT,
    }),
    Editor: PhishingEditor,
  },
]

export default function SetContent() {
  const dispatch  = useDispatch()
  const overrides = useSelector(selectAllOverrides)
  const [activeId, setActiveId] = useState(TOOLS[0].id)
  const [confirmReset, setConfirmReset] = useState(null) // toolId | 'all' | null

  const activeTool   = useMemo(() => TOOLS.find((t) => t.id === activeId), [activeId])
  const ActiveEditor = activeTool.Editor
  const activeContent = overrides[activeId] || activeTool.defaults()
  const isOverridden  = overrides[activeId] != null
  const overrideCount = Object.keys(overrides).length

  function onSave(nextContent) {
    dispatch(setToolContent({ toolId: activeId, content: nextContent }))
  }
  function onReset(toolId = activeId) {
    dispatch(resetTool({ toolId }))
    setConfirmReset(null)
  }
  function onResetAll() {
    dispatch(resetAllTools())
    setConfirmReset(null)
  }

  return (
    <PageLayout>
      <div className="sc-page">
        {/* === HEADER === */}
        <header className="sc-page-head">
          <div className="sc-page-head-text">
            <span className="sc-eyebrow">Admin · Tool content</span>
            <h1>Set Content</h1>
            <p>
              Edit the questions, options, patterns, scenarios and recommendations that power
              our tools. Changes are saved in Redux + <code>localStorage</code> and take effect
              immediately for everyone using this browser.
            </p>
          </div>
          <div className="sc-page-actions">
            <Link to="/" className="sc-btn-ghost">← Back to site</Link>
            <button
              type="button"
              className="sc-btn-danger"
              disabled={overrideCount === 0}
              onClick={() => setConfirmReset('all')}
            >
              Reset all tools{overrideCount > 0 && ` (${overrideCount})`}
            </button>
          </div>
        </header>

        {/* === TOOL TAB STRIP === */}
        <div className="sc-tools-strip" role="tablist" aria-label="Choose tool to edit">
          {TOOLS.map((t) => {
            const overridden = overrides[t.id] != null
            const active     = activeId === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`sc-tools-tab ${active ? 'active' : ''}`}
                onClick={() => setActiveId(t.id)}
              >
                <span className="sc-tools-tab-icon">{t.icon}</span>
                <span className="sc-tools-tab-text">
                  <strong>{t.short}</strong>
                  <em>{t.tagline}</em>
                </span>
                {overridden && (
                  <span className="sc-tools-tab-dot" title="Has custom content" aria-label="Custom" />
                )}
              </button>
            )
          })}
        </div>

        {/* === EDITOR CARD === */}
        <main className="sc-editor-card">
          <header className="sc-editor-head">
            <div className="sc-editor-title">
              <span className="sc-editor-icon">{activeTool.icon}</span>
              <div>
                <h2>{activeTool.label}</h2>
                <div className="sc-editor-sub">
                  {isOverridden ? (
                    <span className="sc-badge sc-badge-custom">● Custom content</span>
                  ) : (
                    <span className="sc-badge">○ Using defaults</span>
                  )}
                  <span className="sc-sub-divider">·</span>
                  <span className="sc-sub-meta">
                    Live on <Link to={activeTool.path}>{activeTool.path}</Link>
                  </span>
                </div>
              </div>
            </div>
            <div className="sc-editor-actions">
              <Link
                to={activeTool.path}
                target="_blank"
                rel="noreferrer"
                className="sc-btn-ghost"
              >
                Preview ↗
              </Link>
              <button
                type="button"
                className="sc-btn-danger sc-btn-ghost"
                disabled={!isOverridden}
                onClick={() => setConfirmReset(activeTool.id)}
              >
                Reset to default
              </button>
            </div>
          </header>

          <ActiveEditor
            key={activeTool.id /* remount when tool changes */}
            value={activeContent}
            onChange={onSave}
            defaults={activeTool.defaults()}
          />
        </main>

        {/* === CONFIRM RESET MODAL === */}
        {confirmReset && (
          <div className="sc-modal-back" onClick={() => setConfirmReset(null)}>
            <div
              className="sc-modal"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>
                {confirmReset === 'all'
                  ? 'Reset content for all tools?'
                  : `Reset ${TOOLS.find((t) => t.id === confirmReset)?.label} to defaults?`}
              </h3>
              <p>
                Your custom edits will be permanently lost. This affects every visitor using
                this browser.
              </p>
              <div className="sc-modal-actions">
                <button
                  type="button"
                  className="sc-btn-ghost"
                  onClick={() => setConfirmReset(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="sc-btn-danger"
                  onClick={() => (confirmReset === 'all' ? onResetAll() : onReset(confirmReset))}
                >
                  {confirmReset === 'all' ? 'Reset everything' : 'Reset this tool'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
