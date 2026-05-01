import { useEffect, useState } from 'react'
import { fetchClassifications } from '../api/ticketmaster'

const FilterPanel = ({ filters, onFilterChange }) => {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const activeFilters = [
    filters.classificationName && { key: 'classificationName', label: `🎵 ${filters.classificationName}` },
    filters.startDateTime && { key: 'startDateTime', label: `📅 ${filters.startDateTime}` },
    filters.endDateTime && { key: 'endDateTime', label: `📅 ${filters.endDateTime}` },
    filters.priceType !== 'all' && { key: 'priceType', label: `💰 ${filters.priceType}` },
    filters.sort !== 'relevance,desc' && { key: 'sort', label: `↕ ${filters.sort}` },
  ].filter(Boolean)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchClassifications()
        setCategories((data?._embedded?.classifications ?? []).map((c) => c.segment?.name).filter(Boolean))
      } catch {
        setCategories([])
      }
    }
    load()
  }, [])

  const applyDateShortcut = (type) => {
    const now = new Date()
    const toDate = (date) => date.toISOString().slice(0, 10)
    if (type === 'today') {
      const today = toDate(now)
      onFilterChange('startDateTime', today)
      onFilterChange('endDateTime', today)
    }
    if (type === 'week') {
      const end = new Date(now)
      end.setDate(end.getDate() + 7)
      onFilterChange('startDateTime', toDate(now))
      onFilterChange('endDateTime', toDate(end))
    }
    if (type === 'weekend') {
      const day = now.getDay()
      const diff = (6 - day + 7) % 7
      const start = new Date(now)
      start.setDate(now.getDate() + diff)
      const end = new Date(start)
      end.setDate(start.getDate() + 1)
      onFilterChange('startDateTime', toDate(start))
      onFilterChange('endDateTime', toDate(end))
    }
    if (type === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      onFilterChange('startDateTime', toDate(start))
      onFilterChange('endDateTime', toDate(end))
    }
  }

  return (
    <div className="sticky top-20 rounded-2xl border border-[rgba(255,45,120,0.2)] bg-[rgba(26,0,37,0.8)] p-6">
      <button
        className="mb-3 rounded-full border border-[rgba(255,45,120,0.4)] bg-[rgba(255,45,120,0.2)] px-4 py-1 text-sm font-semibold text-[#FF6EB4] md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Hide Filters' : `Filters (${activeFilters.length})`}
      </button>
      <div className={`space-y-3 ${open ? 'block' : 'hidden md:block'}`}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyDateShortcut('today')}
            className="rounded-md border border-[rgba(255,45,120,0.35)] px-2 py-1 text-xs text-[#FF6EB4]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => applyDateShortcut('weekend')}
            className="rounded-md border border-[rgba(255,45,120,0.35)] px-2 py-1 text-xs text-[#FF6EB4]"
          >
            This Weekend
          </button>
          <button
            type="button"
            onClick={() => applyDateShortcut('week')}
            className="rounded-md border border-[rgba(255,45,120,0.35)] px-2 py-1 text-xs text-[#FF6EB4]"
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => applyDateShortcut('month')}
            className="rounded-md border border-[rgba(255,45,120,0.35)] px-2 py-1 text-xs text-[#FF6EB4]"
          >
            This Month
          </button>
        </div>
        <select
          value={filters.classificationName}
          onChange={(e) => onFilterChange('classificationName', e.target.value)}
          className="w-full rounded-xl border border-[rgba(255,45,120,0.3)] bg-[#12001E] px-3 py-2 text-white focus:border-[#FF2D78] focus:outline-none focus:ring-2 focus:ring-[rgba(255,45,120,0.25)]"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.startDateTime}
          onChange={(e) => onFilterChange('startDateTime', e.target.value)}
          className="w-full rounded-xl border border-[rgba(255,45,120,0.3)] bg-[#12001E] px-3 py-2 text-white focus:border-[#FF2D78] focus:outline-none focus:ring-2 focus:ring-[rgba(255,45,120,0.25)]"
        />
        <input
          type="date"
          value={filters.endDateTime}
          onChange={(e) => onFilterChange('endDateTime', e.target.value)}
          className="w-full rounded-xl border border-[rgba(255,45,120,0.3)] bg-[#12001E] px-3 py-2 text-white focus:border-[#FF2D78] focus:outline-none focus:ring-2 focus:ring-[rgba(255,45,120,0.25)]"
        />
        <select
          value={filters.priceType}
          onChange={(e) => onFilterChange('priceType', e.target.value)}
          className="w-full rounded-xl border border-[rgba(255,45,120,0.3)] bg-[#12001E] px-3 py-2 text-white focus:border-[#FF2D78] focus:outline-none focus:ring-2 focus:ring-[rgba(255,45,120,0.25)]"
        >
          <option value="all">All Prices</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className="w-full rounded-xl border border-[rgba(255,45,120,0.3)] bg-[#12001E] px-3 py-2 text-white focus:border-[#FF2D78] focus:outline-none focus:ring-2 focus:ring-[rgba(255,45,120,0.25)]"
        >
          <option value="relevance,desc">Relevance</option>
          <option value="date,asc">Date</option>
          <option value="price,asc">Price</option>
          <option value="distance,asc">Nearest to Me</option>
        </select>
        {activeFilters.length > 0 ? (
          <div className="space-y-2 pt-2">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => onFilterChange(chip.key, chip.key === 'priceType' ? 'all' : chip.key === 'sort' ? 'relevance,desc' : '')}
                  className="rounded-full border border-[rgba(255,45,120,0.45)] bg-[rgba(255,45,120,0.12)] px-3 py-1 text-xs text-[#FF6EB4]"
                >
                  {chip.label} ✕
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                onFilterChange('classificationName', '')
                onFilterChange('startDateTime', '')
                onFilterChange('endDateTime', '')
                onFilterChange('priceType', 'all')
                onFilterChange('sort', 'relevance,desc')
              }}
              className="text-xs text-[#FF2D78] underline"
            >
              Clear All Filters
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default FilterPanel
