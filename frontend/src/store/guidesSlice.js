import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'cs.guides.userGuides.v1'

function loadFromStorage() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function persistUserGuides(guides) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guides))
  } catch {
    /* quota / disabled storage — ignore */
  }
}

const initialState = {
  userGuides: loadFromStorage(),
}

const guidesSlice = createSlice({
  name: 'guides',
  initialState,
  reducers: {
    addGuide: {
      reducer(state, action) {
        state.userGuides.unshift(action.payload)
      },
      prepare(guide) {
        return {
          payload: {
            ...guide,
            createdAt: guide.createdAt || new Date().toISOString(),
            publishedAt: guide.publishedAt || new Date().toISOString(),
            isUserCreated: true,
          },
        }
      },
    },
    updateGuide(state, action) {
      const idx = state.userGuides.findIndex((g) => g.slug === action.payload.slug)
      if (idx !== -1) state.userGuides[idx] = { ...state.userGuides[idx], ...action.payload }
    },
    deleteGuide(state, action) {
      state.userGuides = state.userGuides.filter((g) => g.slug !== action.payload)
    },
    clearAllGuides(state) {
      state.userGuides = []
    },
  },
})

export const { addGuide, updateGuide, deleteGuide, clearAllGuides } = guidesSlice.actions

export const selectUserGuides = (state) => state.guides.userGuides
export const selectUserGuideBySlug = (slug) => (state) =>
  state.guides.userGuides.find((g) => g.slug === slug)

export default guidesSlice.reducer
