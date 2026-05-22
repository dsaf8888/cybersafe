import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'cybersafe.toolContent.v1'

/* Shape:
{
  accountScore:  { basic: [...], advanced: [...], recommendations: {...} } | null
  wifiSafety:    { networkTypes: [...], questions: {...}, recs: {...} }    | null
  socialPrivacy: { platforms: [...] }                                       | null
  scamAnalyzer:  { patterns: [...], examples: { scam, legit } }             | null
  phishingQuiz:  { questions: [...], tiers: [...] }                         | null
}
*/

const EMPTY_STATE = {
  accountScore:  null,
  wifiSafety:    null,
  socialPrivacy: null,
  scamAnalyzer:  null,
  phishingQuiz:  null,
}

function loadFromStorage() {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw)
    return { ...EMPTY_STATE, ...parsed }
  } catch {
    return EMPTY_STATE
  }
}

export function persistToolContent(overrides) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    /* ignore quota errors */
  }
}

const contentSlice = createSlice({
  name: 'toolContent',
  initialState: { overrides: loadFromStorage() },
  reducers: {
    setToolContent(state, action) {
      const { toolId, content } = action.payload
      state.overrides[toolId] = content
    },
    resetTool(state, action) {
      const { toolId } = action.payload
      state.overrides[toolId] = null
    },
    resetAllTools(state) {
      state.overrides = { ...EMPTY_STATE }
    },
  },
})

export const { setToolContent, resetTool, resetAllTools } = contentSlice.actions

/* === SELECTORS === */
export const selectAllOverrides   = (state) => state.toolContent.overrides
export const selectToolOverride   = (toolId) => (state) => state.toolContent.overrides[toolId]

export const selectAccountScore   = (state) => state.toolContent.overrides.accountScore
export const selectWifiSafety     = (state) => state.toolContent.overrides.wifiSafety
export const selectSocialPrivacy  = (state) => state.toolContent.overrides.socialPrivacy
export const selectScamAnalyzer   = (state) => state.toolContent.overrides.scamAnalyzer
export const selectPhishingQuiz   = (state) => state.toolContent.overrides.phishingQuiz

export default contentSlice.reducer
