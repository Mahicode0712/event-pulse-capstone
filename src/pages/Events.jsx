import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaClock, FaFire, FaList, FaThLarge } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import EventCard from '../components/EventCard'
import FilterPanel from '../components/FilterPanel'
import SkeletonCard from '../components/SkeletonCard'
import { fetchEvents } from '../features/events/eventsSlice'
import { setFilter, setPage } from '../features/filters/filtersSlice'
import useGeolocation from '../hooks/useGeolocation'

const POPULAR = ['Taylor Swift', 'EDM Festival', 'Comedy Night', 'Jazz', 'Rock Concert']
const SEARCH_STORAGE = 'eventpulse_searches'
const VIEW_STORAGE = 'eventpulse_view_mode'

const Events = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const filters = useSelector((state) => state.filters)
  const { items, loading, page, error } = useSelector((state) => state.events)
  const [searchInput, setSearchInput] = useState(filters.keyword || 'music')
  const [searchOpen, setSearchOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => JSON.parse(localStorage.getItem(SEARCH_STORAGE) || '[]'))
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_STORAGE) || 'grid')
  const [infinite, setInfinite] = useState(false)
  const [showTechError, setShowTechError] = useState(false)
  const sentinelRef = useRef(null)
  const pullStartRef = useRef(null)
  const { coords } = useGeolocation()

  const debounceSearch = useCallback(
    (value) => {
      const timer = setTimeout(() => {
        dispatch(setFilter({ key: 'keyword', value }))
      }, 300)
      return () => clearTimeout(timer)
    },
    [dispatch],
  )

  useEffect(() => debounceSearch(searchInput), [searchInput, debounceSearch])

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE, viewMode)
  }, [viewMode])

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  const runFetch = useCallback(() => {
    dispatch(
      fetchEvents({
        keyword: filters.keyword || 'music',
        city: filters.city,
        startDate: filters.startDateTime,
        endDate: filters.endDateTime,
        page: filters.page,
        size: 20,
        classificationName: filters.classificationName,
        sort: filters.sort,
      }),
    )
      .unwrap()
      .then((response) => {
        console.log('Events API full response:', response)
      })
      .catch(() => {})
  }, [dispatch, filters])

  useEffect(() => {
    runFetch()
  }, [runFetch])

  useEffect(() => {
    if (!infinite || !sentinelRef.current) return undefined
    const node = sentinelRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries[0]
        if (hit.isIntersecting && !loading && filters.page < page.totalPages - 1) {
          dispatch(setPage(filters.page + 1))
        }
      },
      { threshold: 0.8 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [infinite, loading, filters.page, page.totalPages, dispatch])

  useEffect(() => {
    const onPrev = () => dispatch(setPage(Math.max(filters.page - 1, 0)))
    const onNext = () => dispatch(setPage(Math.min(filters.page + 1, page.totalPages - 1)))
    window.addEventListener('eventpulse:page-prev', onPrev)
    window.addEventListener('eventpulse:page-next', onNext)
    return () => {
      window.removeEventListener('eventpulse:page-prev', onPrev)
      window.removeEventListener('eventpulse:page-next', onNext)
    }
  }, [dispatch, filters.page, page.totalPages])

  const onFilterChange = useCallback(
    (key, value) => {
      dispatch(setFilter({ key, value }))
    },
    [dispatch],
  )

  const saveSearchTerm = useCallback((term) => {
    if (!term?.trim()) return
    const next = [term.trim(), ...recentSearches.filter((item) => item !== term.trim())].slice(0, 5)
    setRecentSearches(next)
    localStorage.setItem(SEARCH_STORAGE, JSON.stringify(next))
  }, [recentSearches])

  const suggestions = useMemo(() => {
    const q = searchInput.toLowerCase()
    const recent = recentSearches
      .filter((item) => item.toLowerCase().includes(q))
      .map((label) => ({ label, type: 'recent' }))
    const popular = POPULAR.filter((item) => item.toLowerCase().includes(q))
      .filter((item) => !recent.some((rec) => rec.label === item))
      .map((label) => ({ label, type: 'popular' }))
    return [...recent, ...popular].slice(0, 6)
  }, [searchInput, recentSearches])

  const getDistance = useCallback((event) => {
    if (!coords) return null
    const lat = Number(event?._embedded?.venues?.[0]?.location?.latitude)
    const lon = Number(event?._embedded?.venues?.[0]?.location?.longitude)
    if (!lat || !lon) return null
    const toRad = (v) => (v * Math.PI) / 180
    const dLat = toRad(lat - coords.latitude)
    const dLon = toRad(lon - coords.longitude)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coords.latitude)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return (6371 * c).toFixed(1)
  }, [coords])

  const effectiveItems = items
  const cards = useMemo(
    () =>
      effectiveItems.map((event, index) => (
        <EventCard key={event.id} event={event} index={index} view={viewMode} distanceText={getDistance(event)} />
      )),
    [effectiveItems, viewMode, getDistance],
  )

  const countText = useMemo(() => {
    const base = `Showing ${effectiveItems.length} events`
    const queryBits = []
    if (filters.keyword) queryBits.push(`for "${filters.keyword}"`)
    if (filters.city) queryBits.push(`in "${filters.city}"`)
    return queryBits.length ? `${base} ${queryBits.join(' ')}` : base
  }, [effectiveItems.length, filters.keyword, filters.city])

  const onTouchStart = (e) => {
    if (window.scrollY === 0) pullStartRef.current = e.touches[0].clientY
  }
  const onTouchEnd = (e) => {
    if (pullStartRef.current === null) return
    const diff = e.changedTouches[0].clientY - pullStartRef.current
    if (diff > 80) {
      toast.loading('Refreshing events...', { id: 'refresh-events' })
      dispatch(setPage(0))
      runFetch()
      toast.dismiss('refresh-events')
    }
    pullStartRef.current = null
  }

  return (
    <div
      className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[280px_1fr]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <FilterPanel filters={filters} onFilterChange={onFilterChange} />
      <section className="space-y-4">
        <div className="relative">
          <input
            id="global-search-input"
            value={searchInput}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setSearchOpen(true)
            }}
            placeholder="Search events..."
            disabled={loading}
            className="w-full rounded-full border-2 border-[rgba(255,45,120,0.3)] bg-[rgba(255,45,120,0.05)] px-6 py-3 pr-12 text-white placeholder:text-[rgba(255,110,180,0.5)] focus:border-[#FF2D78] focus:outline-none focus:ring-4 focus:ring-[rgba(255,45,120,0.2)] disabled:opacity-60"
          />
          {loading ? (
            <div className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin rounded-full border-2 border-[#FF2D78] border-t-transparent" />
          ) : null}
          {searchOpen && suggestions.length > 0 ? (
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-[rgba(255,45,120,0.4)] bg-[#12001E] p-2 shadow-xl">
              <div className="mb-2 flex items-center justify-between px-2 text-xs text-[#E0AEFF]">
                <span>Suggestions</span>
                <button
                  type="button"
                  className="text-[#FF6EB4]"
                  onClick={() => {
                    setRecentSearches([])
                    localStorage.removeItem(SEARCH_STORAGE)
                  }}
                >
                  Clear history
                </button>
              </div>
              {suggestions.map((item) => (
                <button
                  key={`${item.type}-${item.label}`}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white hover:bg-[rgba(255,45,120,0.15)]"
                  onClick={() => {
                    setSearchInput(item.label)
                    dispatch(setFilter({ key: 'keyword', value: item.label }))
                    saveSearchTerm(item.label)
                    setSearchOpen(false)
                  }}
                >
                  {item.type === 'recent' ? <FaClock className="text-[#FF6EB4]" /> : <FaFire className="text-[#FF2D78]" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#E0AEFF]">{countText}</p>
          <div className="flex items-center gap-2">
            <button
              className={`rounded-md border px-2 py-1 ${viewMode === 'grid' ? 'border-[#FF2D78] text-[#FF2D78]' : 'border-[rgba(255,45,120,0.3)] text-[#E0AEFF]'}`}
              onClick={() => setViewMode('grid')}
            >
              <FaThLarge />
            </button>
            <button
              className={`rounded-md border px-2 py-1 ${viewMode === 'list' ? 'border-[#FF2D78] text-[#FF2D78]' : 'border-[rgba(255,45,120,0.3)] text-[#E0AEFF]'}`}
              onClick={() => setViewMode('list')}
            >
              <FaList />
            </button>
          </div>
        </div>
        {error && <p className="flex items-center gap-2 text-[#FF6EB4]">⚠ {error}</p>}
        {error ? (
          <div className="rounded-xl border border-[rgba(255,45,120,0.35)] bg-[rgba(255,45,120,0.06)] p-4">
            <button className="text-[#FF6EB4] underline" onClick={runFetch}>
              Something went wrong. Tap to retry →
            </button>
            <button className="ml-4 text-xs text-[#E0AEFF]" onClick={() => setShowTechError((p) => !p)}>
              {showTechError ? 'Hide technical details' : 'Show technical details'}
            </button>
            {showTechError ? <pre className="mt-2 whitespace-pre-wrap text-xs text-[#E0AEFF]">{error}</pre> : null}
          </div>
        ) : null}
        {loading ? (
          <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : cards.length ? (
          <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>{cards}</div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[rgba(255,45,120,0.3)] bg-[rgba(255,45,120,0.03)] p-10 text-center text-[#E0AEFF]">
            <p className="text-3xl">🎭</p>
            <p className="mt-2 text-lg font-semibold">No events found 🎭</p>
            <p className="text-sm">Try different keywords or clear your filters</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  dispatch(setFilter({ key: 'classificationName', value: '' }))
                  dispatch(setFilter({ key: 'startDateTime', value: '' }))
                  dispatch(setFilter({ key: 'endDateTime', value: '' }))
                  dispatch(setFilter({ key: 'priceType', value: 'all' }))
                }}
                className="rounded-full border border-[#FF2D78] px-4 py-2 text-sm text-[#FF6EB4]"
              >
                Clear Filters
              </button>
              <button
                onClick={() => navigate('/events')}
                className="rounded-full bg-gradient-to-r from-[#FF2D78] to-[#FF00FF] px-4 py-2 text-sm text-white"
              >
                Browse All Events
              </button>
            </div>
          </div>
        )}
        {!infinite ? (
          <div className="flex items-center justify-between text-[#E0AEFF]">
            <button
              onClick={() => dispatch(setPage(Math.max(filters.page - 1, 0)))}
              disabled={filters.page === 0}
              className="rounded-lg border border-[rgba(255,45,120,0.4)] px-4 py-2 text-[#FF2D78] transition hover:bg-[#FF2D78] hover:text-white hover:shadow-[0_0_14px_rgba(255,45,120,0.45)] disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page.number + 1} / {Math.max(1, page.totalPages)}
            </span>
            <button
              onClick={() => dispatch(setPage(Math.min(filters.page + 1, page.totalPages - 1)))}
              disabled={filters.page >= page.totalPages - 1}
              className="rounded-lg border border-[rgba(255,45,120,0.4)] px-4 py-2 text-[#FF2D78] transition hover:bg-[#FF2D78] hover:text-white hover:shadow-[0_0_14px_rgba(255,45,120,0.45)] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setInfinite((prev) => !prev)
              dispatch(setPage(0))
            }}
            className="text-sm text-[#FF6EB4] underline"
          >
            {infinite ? 'Switch to Pagination' : 'Switch to Infinite Scroll'}
          </button>
          {infinite && loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FF2D78] border-t-transparent" /> : null}
        </div>
        {infinite ? <div ref={sentinelRef} className="h-10" /> : null}
      </section>
    </div>
  )
}

export default Events
