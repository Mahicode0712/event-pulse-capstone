import axios from 'axios'

const BASE_URL = import.meta.env.DEV ? '/api/ticketmaster' : 'https://app.ticketmaster.com/discovery/v2'
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY || 'ExGmo2mjjNzFC6fi5ef0i0WMwNaxNlVA'

if (!API_KEY || !String(API_KEY).trim()) {
  console.warn('Ticketmaster API key is missing! Check your .env file.')
}

const normalizeDate = (value, isEnd = false) => {
  if (!value) return ''
  if (value.includes('T')) return value
  return `${value}${isEnd ? 'T23:59:59Z' : 'T00:00:00Z'}`
}

const mapApiErrorMessage = (error) => {
  if (error?.response?.status === 429) return 'Too many requests, try again later'
  return (
    error?.response?.data?.errors?.[0]?.detail ||
    error?.response?.data?.fault?.faultstring ||
    error?.message ||
    'Unable to fetch data right now'
  )
}

export const fetchEvents = async ({
  keyword,
  city,
  startDate,
  endDate,
  page,
  size,
  classificationName,
  sort,
} = {}) => {
  const params = {
    apikey: API_KEY,
    keyword: keyword || '',
    city: city || '',
    startDateTime: normalizeDate(startDate),
    endDateTime: normalizeDate(endDate, true),
    classificationName: classificationName || '',
    sort: sort || 'relevance,desc',
    page: page ?? 0,
    size: size ?? 20,
  }

  console.log('API Key:', API_KEY)
  console.log('Request params:', params)

  try {
    const response = await axios.get(`${BASE_URL}/events.json`, { params })
    console.log('Response:', response.data)
    return response.data
  } catch (error) {
    throw new Error(mapApiErrorMessage(error), { cause: error })
  }
}

export const fetchEventById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/events/${id}.json`, {
      params: { apikey: API_KEY },
    })
    return response.data
  } catch (error) {
    throw new Error(mapApiErrorMessage(error), { cause: error })
  }
}

export const fetchClassifications = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/classifications.json`, {
      params: { apikey: API_KEY },
    })
    return response.data
  } catch (error) {
    throw new Error(mapApiErrorMessage(error), { cause: error })
  }
}
