import { createSlice } from '@reduxjs/toolkit'

const getUser = () => JSON.parse(localStorage.getItem('eventpulse_user') || 'null')

const authSlice = createSlice({
  name: 'auth',
  initialState: { isLoggedIn: !!getUser(), user: getUser() },
  reducers: {
    loginSuccess: (state, action) => {
      state.isLoggedIn = true
      state.user = action.payload
      localStorage.setItem('eventpulse_user', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.user = null
      localStorage.removeItem('eventpulse_user')
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
