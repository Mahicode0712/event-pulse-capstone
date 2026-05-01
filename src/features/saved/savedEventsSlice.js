import { createSlice } from '@reduxjs/toolkit'

const getSaved = () => JSON.parse(localStorage.getItem('eventpulse_saved') || '[]')

const savedEventsSlice = createSlice({
  name: 'savedEvents',
  initialState: { items: getSaved() },
  reducers: {
    saveEvent: (state, action) => {
      if (!state.items.find((event) => event.id === action.payload.id)) {
        state.items.push(action.payload)
      }
      localStorage.setItem('eventpulse_saved', JSON.stringify(state.items))
    },
    unsaveEvent: (state, action) => {
      state.items = state.items.filter((event) => event.id !== action.payload)
      localStorage.setItem('eventpulse_saved', JSON.stringify(state.items))
    },
  },
})

export const { saveEvent, unsaveEvent } = savedEventsSlice.actions
export default savedEventsSlice.reducer
