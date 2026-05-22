import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'cs.blog.userPosts.v1'

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

export function persistUserPosts(posts) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  } catch {
    /* quota / disabled storage — ignore */
  }
}

const initialState = {
  userPosts: loadFromStorage(),
}

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    addPost: {
      reducer(state, action) {
        state.userPosts.unshift(action.payload)
      },
      prepare(post) {
        return {
          payload: {
            ...post,
            createdAt: post.createdAt || new Date().toISOString(),
            isUserCreated: true,
          },
        }
      },
    },
    updatePost(state, action) {
      const idx = state.userPosts.findIndex((p) => p.slug === action.payload.slug)
      if (idx !== -1) state.userPosts[idx] = { ...state.userPosts[idx], ...action.payload }
    },
    deletePost(state, action) {
      state.userPosts = state.userPosts.filter((p) => p.slug !== action.payload)
    },
    clearAll(state) {
      state.userPosts = []
    },
  },
})

export const { addPost, updatePost, deletePost, clearAll } = blogSlice.actions

export const selectUserPosts = (state) => state.blog.userPosts
export const selectUserPostBySlug = (slug) => (state) =>
  state.blog.userPosts.find((p) => p.slug === slug)

export default blogSlice.reducer
