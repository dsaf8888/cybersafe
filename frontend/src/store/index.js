import { configureStore } from '@reduxjs/toolkit'
import blogReducer, { persistUserPosts } from './blogSlice'

export const store = configureStore({
  reducer: {
    blog: blogReducer,
  },
})

let lastUserPosts = store.getState().blog.userPosts
store.subscribe(() => {
  const next = store.getState().blog.userPosts
  if (next !== lastUserPosts) {
    persistUserPosts(next)
    lastUserPosts = next
  }
})
