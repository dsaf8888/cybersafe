import { configureStore } from '@reduxjs/toolkit'
import blogReducer, { persistUserPosts } from './blogSlice'
import guidesReducer, { persistUserGuides } from './guidesSlice'

export const store = configureStore({
  reducer: {
    blog: blogReducer,
    guides: guidesReducer,
  },
})

let lastUserPosts = store.getState().blog.userPosts
let lastUserGuides = store.getState().guides.userGuides
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
})
