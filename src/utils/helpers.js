export const pickEventImage = (images = []) => images?.[0]?.url || 'https://placehold.co/640x360?text=EventPulse'

export const formatEventDate = (event) => {
  const date = event?.dates?.start?.dateTime || event?.dates?.start?.localDate
  if (!date) return 'Date TBA'
  return new Date(date).toLocaleString()
}

export const getCategory = (event) =>
  event?.classifications?.[0]?.segment?.name || event?.classifications?.[0]?.genre?.name || 'General'

export const getVenue = (event) => event?._embedded?.venues?.[0]
