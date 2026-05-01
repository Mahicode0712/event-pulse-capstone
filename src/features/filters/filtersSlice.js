import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  keyword: 'music',
  city: '',
  classificationName: '',
  startDateTime: '',
  endDateTime: '',
  priceType: 'all',
  sort: 'relevance,desc',
  page: 0,
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state[action.payload.key] = action.payload.value
      if (action.payload.key !== 'page') state.page = 0
    },
    setPage: (state, action) => {
      state.page = action.payload
    },
    clearFilters: () => initialState,
  },
})

export const { setFilter, setPage, clearFilters } = filtersSlice.actions
export default filtersSlice.reducer
