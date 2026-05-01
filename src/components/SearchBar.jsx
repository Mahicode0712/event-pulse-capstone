import { useEffect, useMemo, useState } from 'react'
import { FaClock, FaFire, FaTimes } from 'react-icons/fa'

const POPULAR = ['Taylor Swift', 'EDM Festival', 'Comedy Night', 'Jazz', 'Rock Concert']
const STORAGE_KEY = 'eventpulse_searches'

const SearchBar = ({ value, onChange, city, onCityChange, onSubmit, loading = false }) => {
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

  const suggestions = useMemo(() => {
    const q = value?.toLowerCase() || ''
    const recents = recent.filter((item) => item.toLowerCase().includes(q)).map((label) => ({ type: 'recent', label }))
    const popular = POPULAR.filter((item) => item.toLowerCase().includes(q))
      .filter((item) => !recents.some((r) => r.label === item))
      .map((label) => ({ type: 'popular', label }))
    return [...recents, ...popular].slice(0, 6)
  }, [recent, value])

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  const saveSearch = (term) => {
    if (!term?.trim()) return
    const next = [term.trim(), ...recent.filter((item) => item !== term.trim())].slice(0, 5)
    setRecent(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const submit = (e) => {
    saveSearch(value)
    onSubmit(e)
    setOpen(false)
  }

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
      <div className="relative md:col-span-2">
        <input
          id="global-search-input"
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          placeholder="Search events, artists, venues..."
          disabled={loading}
          className="w-full rounded-full border-2 border-[rgba(255,45,120,0.3)] bg-[rgba(255,45,120,0.05)] px-6 py-3 pr-12 text-white placeholder:text-[rgba(255,110,180,0.5)] focus:border-[#FF2D78] focus:outline-none focus:ring-4 focus:ring-[rgba(255,45,120,0.2)] disabled:opacity-60"
        />
        {loading ? (
          <div className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin rounded-full border-2 border-[#FF2D78] border-t-transparent" />
        ) : null}
        {open && suggestions.length > 0 ? (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-[rgba(255,45,120,0.4)] bg-[#12001E] p-2 shadow-xl">
            <div className="mb-2 flex items-center justify-between px-2 text-xs text-[#E0AEFF]">
              <span>Suggestions</span>
              <button
                type="button"
                className="flex items-center gap-1 text-[#FF6EB4]"
                onClick={() => {
                  setRecent([])
                  localStorage.removeItem(STORAGE_KEY)
                }}
              >
                <FaTimes /> Clear history
              </button>
            </div>
            {suggestions.map((item) => (
              <button
                key={`${item.type}-${item.label}`}
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-[rgba(255,45,120,0.15)]"
                onClick={() => {
                  onChange(item.label)
                  saveSearch(item.label)
                  setOpen(false)
                }}
              >
                {item.type === 'recent' ? <FaClock className="text-[#FF6EB4]" /> : <FaFire className="text-[#FF2D78]" />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <input
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        placeholder="City"
        className="rounded-full border-2 border-[rgba(255,45,120,0.3)] bg-[rgba(255,45,120,0.05)] px-6 py-3 text-white placeholder:text-[rgba(255,110,180,0.5)] focus:border-[#FF2D78] focus:outline-none focus:ring-4 focus:ring-[rgba(255,45,120,0.2)]"
      />
      <button
        type="submit"
        className="neon-glow rounded-full bg-gradient-to-r from-[#FF2D78] to-[#FF00FF] px-6 py-3 font-bold text-white transition hover:scale-105 md:col-span-3"
      >
        Search
      </button>
    </form>
  )
}

export default SearchBar
