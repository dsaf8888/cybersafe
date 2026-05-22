import { configureStore } from '@reduxjs/toolkit'
import blogReducer, { persistUserPosts } from './blogSlice'
import guidesReducer, { persistUserGuides } from './guidesSlice'
import contentReducer, { persistToolContent } from './contentSlice'

export const store = configureStore({
  reducer: {
    blog: blogReducer,
    guides: guidesReducer,
    toolContent: contentReducer,
  },
})

let lastUserPosts    = store.getState().blog.userPosts
let lastUserGuides   = store.getState().guides.userGuides
let lastOverrides    = store.getState().toolContent.overrides

store.subscribe(() => {
  const state = store.getState()
  if (state.blog.userPosts !== lastUserPosts) {
    persistUserPosts(state.blog.userPosts)
    lastUserPosts = state.blog.userPosts
  }
  if (state.guides.userGuides !== lastUserGuides) {
    persistUserGuides(state.guides.userGuides)
    lastUserGuides = state.guides.userGuides
  }
  if (state.toolContent.overrides !== lastOverrides) {
    persistToolContent(state.toolContent.overrides)
    lastOverrides = state.toolContent.overrides
  }
})
