import { createSlice } from '@reduxjs/toolkit'

const getInitialTheme = () => localStorage.getItem('eventpulse_theme') || 'light'

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: getInitialTheme() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('eventpulse_theme', state.mode)
    },
    setTheme: (state, action) => {
      state.mode = action.payload
      localStorage.setItem('eventpulse_theme', state.mode)
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
