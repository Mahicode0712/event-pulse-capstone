import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchEventById as fetchEventByIdApi, fetchEvents as fetchEventsApi } from '../../api/ticketmaster'

export const fetchEvents = createAsyncThunk('events/fetchEvents', async (params, { rejectWithValue }) => {
  try {
    return await fetchEventsApi(params)
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch events')
  }
})

export const fetchEventById = createAsyncThunk('events/fetchEventById', async (id, { rejectWithValue }) => {
  try {
    return await fetchEventByIdApi(id)
  } catch (error) {
    return rejectWithValue(error?.message || 'Failed to fetch event details')
  }
})

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    featured: [],
    selectedEvent: null,
    related: [],
    loading: false,
    error: null,
    page: { number: 0, totalPages: 0, size: 20, totalElements: 0 },
  },
  reducers: {
    setFeaturedEvents: (state, action) => {
      state.featured = action.payload
    },
    setRelatedEvents: (state, action) => {
      state.related = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?._embedded?.events ?? []
        const page = action.payload?.page ?? {}
        state.page = {
          size: page.size ?? 20,
          totalElements: page.totalElements ?? 0,
          totalPages: page.totalPages ?? 0,
          number: page.number ?? 0,
        }
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch events'
      })
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedEvent = action.payload
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch event details'
      })
  },
})

export const { setFeaturedEvents, setRelatedEvents } = eventsSlice.actions
export default eventsSlice.reducer
