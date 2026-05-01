import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import EventCard from '../components/EventCard'
import { getCategory } from '../utils/helpers'

const Saved = () => {
  const items = useSelector((state) => state.savedEvents.items)
  const [sortBy, setSortBy] = useState('recent')
  const [query, setQuery] = useState('')
  const sharedIds = new URLSearchParams(window.location.search).get('shared')?.split(',').filter(Boolean) || null

  const visibleItems = useMemo(() => {
    const source = sharedIds ? items.filter((event) => sharedIds.includes(event.id)) : items
    const filtered = source.filter((event) => {
      const text = `${event.name} ${event?._embedded?.venues?.[0]?.name || ''}`.toLowerCase()
      return text.includes(query.toLowerCase())
    })
    if (sortBy === 'date') {
      return [...filtered].sort(
        (a, b) =>
          new Date(a?.dates?.start?.dateTime || a?.dates?.start?.localDate || 0) -
          new Date(b?.dates?.start?.dateTime || b?.dates?.start?.localDate || 0),
      )
    }
    if (sortBy === 'category') {
      return [...filtered].sort((a, b) => getCategory(a).localeCompare(getCategory(b)))
    }
    return filtered
  }, [items, sortBy, query, sharedIds])

  const chartData = useMemo(() => {
    const grouped = visibleItems.reduce((acc, event) => {
      const category = getCategory(event)
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
    return Object.entries(grouped).map(([category, count]) => ({ category, count }))
  }, [visibleItems])

  const exportCSV = () => {
    const headers = ['Event Name', 'Date', 'Venue', 'City', 'Price', 'URL']
    const rows = visibleItems.map((event) => [
      event.name,
      event?.dates?.start?.dateTime || event?.dates?.start?.localDate || '',
      event?._embedded?.venues?.[0]?.name || '',
      event?._embedded?.venues?.[0]?.city?.name || '',
      event?.priceRanges?.[0] ? `${event.priceRanges[0].min}-${event.priceRanges[0].max}` : 'TBA',
      event.url || '',
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'eventpulse-saved-events.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const shareList = () => {
    const ids = visibleItems.map((item) => item.id).join(',')
    const url = `${window.location.origin}${window.location.pathname}?shared=${encodeURIComponent(ids)}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <h1 className="text-3xl font-bold">Saved Events</h1>
      <div className="grid gap-3 rounded-xl border border-[rgba(255,45,120,0.25)] bg-[#12001E] p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved events"
          className="rounded-lg border border-[rgba(255,45,120,0.3)] bg-[#1A0025] px-3 py-2 text-white"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-[rgba(255,45,120,0.3)] bg-[#1A0025] px-3 py-2 text-white"
        >
          <option value="recent">Recently Saved</option>
          <option value="date">By Date</option>
          <option value="category">By Category</option>
        </select>
        <button onClick={exportCSV} className="rounded-lg border border-[#FF2D78] px-3 py-2 text-[#FF6EB4]">
          Export to CSV
        </button>
        <button onClick={shareList} className="rounded-lg bg-gradient-to-r from-[#FF2D78] to-[#FF00FF] px-3 py-2 text-white">
          Share My List
        </button>
      </div>
      <div className="h-72 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#7C3AED" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((event, index) => (
          <EventCard key={event.id} event={event} index={index} />
        ))}
      </div>
    </div>
  )
}

export default Saved
