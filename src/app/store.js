import { configureStore } from '@reduxjs/toolkit'
import eventsReducer from '../features/events/eventsSlice'
import savedEventsReducer from '../features/saved/savedEventsSlice'
import authReducer from '../features/auth/authSlice'
import filtersReducer from '../features/filters/filtersSlice'
import themeReducer from '../features/theme/themeSlice'

export const store = configureStore({
  reducer: {
    events: eventsReducer,
    savedEvents: savedEventsReducer,
    auth: authReducer,
    filters: filtersReducer,
    theme: themeReducer,
  },
})
