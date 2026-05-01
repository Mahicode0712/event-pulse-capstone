import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import EventCard from '../components/EventCard'
import { fetchEvents, setFeaturedEvents } from '../features/events/eventsSlice'
import { setFilter } from '../features/filters/filtersSlice'
import useGeolocation from '../hooks/useGeolocation'

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { featured, loading } = useSelector((state) => state.events)
  const filters = useSelector((state) => state.filters)
  const { coords } = useGeolocation()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [carouselPage, setCarouselPage] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [statsStarted, setStatsStarted] = useState(false)
  const [stats, setStats] = useState([0, 0, 0, 0])
  const statsRef = useRef(null)

  useEffect(() => {
    dispatch(fetchEvents({ keyword: 'concert' })).then((res) => {
      dispatch(setFeaturedEvents(res.payload?._embedded?.events?.slice(0, 8) || []))
    })
  }, [dispatch])

  useEffect(() => {
    if (coords) dispatch(setFilter({ key: 'city', value: 'Current Location' }))
    if (coords) toast.success('Location detected: Current Location')
  }, [coords, dispatch])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!statsRef.current) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsStarted(true)
    })
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!statsStarted) return undefined
    const targets = [10000, 500, 200, 100]
    const timer = setInterval(() => {
      setStats((prev) => prev.map((v, i) => Math.min(targets[i], v + Math.ceil(targets[i] / 25))))
    }, 50)
    return () => clearInterval(timer)
  }, [statsStarted])

  useEffect(() => {
    if (paused) return undefined
    const timer = setInterval(() => {
      setCarouselPage((prev) => (prev + 1) % Math.max(1, Math.ceil(featured.length / 3)))
    }, 4000)
    return () => clearInterval(timer)
  }, [paused, featured.length])

  const categoryMap = useMemo(
    () => [
      { label: 'All', emoji: '✨' },
      { label: 'Music', emoji: '🎵' },
      { label: 'Sports', emoji: '🏅' },
      { label: 'Arts & Theatre', emoji: '🎭' },
      { label: 'Comedy', emoji: '😂' },
      { label: 'Family', emoji: '👨‍👩‍👧' },
      { label: 'Film', emoji: '🎬' },
      { label: 'Food & Drink', emoji: '🍹' },
    ],
    [],
  )

  const filteredFeatured = useMemo(() => {
    if (selectedCategory === 'All') return featured
    return featured.filter((event) => {
      const segment = event?.classifications?.[0]?.segment?.name
      return segment?.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0])
    })
  }, [featured, selectedCategory])

  const carouselItems = filteredFeatured.slice(carouselPage * 3, carouselPage * 3 + 3)

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <section className="hero-grid space-y-4 rounded-2xl border border-[rgba(255,45,120,0.3)] bg-gradient-to-br from-[#0D0014] via-[#1A0025] to-[#0D0014] p-8 text-white neon-border">
        <h1 className="typing-cursor text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05]">
          Find <span className="neon-text text-[#FF2D78]">Concerts</span> Near You
        </h1>
        <p className="text-[#E0AEFF]">Discover the pulse of your city with live gigs, sports, theatre, and comedy.</p>
        <SearchBar
          value={filters.keyword}
          city={filters.city}
          onChange={(value) => dispatch(setFilter({ key: 'keyword', value }))}
          onCityChange={(value) => dispatch(setFilter({ key: 'city', value }))}
          onSubmit={(e) => {
            e.preventDefault()
            navigate('/search')
          }}
          loading={loading}
        />
      </section>
      <section ref={statsRef} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          `🎵 ${stats[0].toLocaleString()}+ Events`,
          `🌆 ${stats[1]}+ Cities`,
          `🎤 ${stats[2]}+ Artists`,
          `🎟 ${stats[3]}% Free to Browse`,
        ].map((stat) => (
          <div key={stat} className="rounded-xl border border-[rgba(255,45,120,0.25)] bg-[#12001E] p-4 text-center text-[#E0AEFF]">
            {stat}
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-[#E0AEFF]">Browse by Category</h3>
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
          {categoryMap.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setSelectedCategory(item.label)
                setCarouselPage(0)
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                selectedCategory === item.label
                  ? 'neon-glow border border-[#FF2D78] bg-[rgba(255,45,120,0.25)] text-white'
                  : 'border border-[rgba(255,45,120,0.35)] bg-[rgba(255,45,120,0.05)] text-[#E0AEFF]'
              }`}
            >
              {item.emoji} {item.label}
            </button>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Featured Events</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCarouselPage((prev) => Math.max(prev - 1, 0))}
              className="rounded-full border border-[rgba(255,45,120,0.4)] p-2 text-[#FF6EB4]"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={() => setCarouselPage((prev) => Math.min(prev + 1, Math.max(0, Math.ceil(filteredFeatured.length / 3) - 1)))}
              className="rounded-full border border-[rgba(255,45,120,0.4)] p-2 text-[#FF6EB4]"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        <div
          className="grid gap-4 md:grid-cols-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {carouselItems.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} />
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: Math.max(1, Math.ceil(filteredFeatured.length / 3)) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCarouselPage(i)}
              className={`h-2 w-2 rounded-full ${i === carouselPage ? 'bg-[#FF2D78]' : 'bg-[rgba(255,45,120,0.3)]'}`}
            />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-[#E0AEFF]">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {['Music', 'Sports', 'Arts', 'Comedy', 'Theatre', 'Family'].map((category) => (
            <Link
              key={category}
              to="/events"
              onClick={() => dispatch(setFilter({ key: 'classificationName', value: category }))}
              className="rounded-full border border-[rgba(255,45,120,0.4)] bg-[rgba(255,45,120,0.1)] px-4 py-1 text-[#FF6EB4] transition hover:bg-[#FF2D78] hover:text-white"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-[#E0AEFF]">Trending Cities</h3>
        <div className="flex flex-wrap gap-2">
          {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'].map((city) => (
            <Link
              key={city}
              to="/events"
              onClick={() => dispatch(setFilter({ key: 'city', value: city }))}
              className="rounded-full border border-[rgba(255,45,120,0.4)] bg-[rgba(255,45,120,0.05)] px-4 py-1 text-[#E0AEFF] transition hover:bg-[#FF2D78] hover:text-white"
            >
              {city}
            </Link>
          ))}
        </div>
      </section>
      {showTop ? (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="neon-glow fixed bottom-20 right-4 rounded-full bg-[#FF2D78] p-3 text-white"
        >
          ↑
        </button>
      ) : null}
    </div>
  )
}

export default Home
