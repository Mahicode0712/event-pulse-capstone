import { memo, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { saveEvent, unsaveEvent } from '../features/saved/savedEventsSlice'
import { formatEventDate, getCategory, getVenue, pickEventImage } from '../utils/helpers'

const EventCard = ({ event, view = 'grid', index = 0, distanceText }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoggedIn } = useSelector((state) => state.auth)
  const isSaved = useSelector((state) => state.savedEvents.items.some((item) => item.id === event.id))
  const venue = getVenue(event)
  const [showPreview, setShowPreview] = useState(false)
  const [animText, setAnimText] = useState('')
  const [touchStart, setTouchStart] = useState(0)
  const [touchMove, setTouchMove] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const calendarUrl = useMemo(() => {
    const start = event?.dates?.start?.dateTime || event?.dates?.start?.localDate
    if (!start) return null
    const startDate = new Date(start)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
    const format = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.name,
    )}&dates=${format(startDate)}/${format(endDate)}&details=${encodeURIComponent(event.url || '')}&location=${encodeURIComponent(
      venue?.name || '',
    )}`
  }, [event, venue?.name])

  useEffect(() => {
    if (!showPreview) return undefined
    const onEscape = (e) => {
      if (e.key === 'Escape') setShowPreview(false)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [showPreview])

  const toggleSave = () => {
    if (!isLoggedIn) {
      toast((t) => (
        <div className="flex items-center gap-3">
          <span>Please login to save events</span>
          <button
            className="rounded-full border border-[#FF2D78] px-3 py-1 text-xs"
            onClick={() => {
              toast.dismiss(t.id)
              navigate('/login')
            }}
          >
            Login
          </button>
        </div>
      ))
      return
    }
    if (isSaved) {
      dispatch(unsaveEvent(event.id))
      setAnimText('-Removed')
      toast.success('Event removed from saved')
    } else {
      dispatch(saveEvent(event))
      setAnimText('+Saved!')
      toast((t) => (
        <button
          className="text-left text-sm"
          onClick={() => {
            toast.dismiss(t.id)
            navigate('/saved')
          }}
        >
          Event saved! View in Saved →
        </button>
      ))
    }
    setTimeout(() => setAnimText(''), 900)
  }

  if (dismissed) return null

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowPreview(true)}
        onKeyDown={(e) => e.key === 'Enter' && setShowPreview(true)}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchMove={(e) => setTouchMove(e.touches[0].clientX)}
        onTouchEnd={() => {
          const diff = touchMove - touchStart
          if (diff > 80) toggleSave()
          if (diff < -80) setDismissed(true)
          setTouchStart(0)
          setTouchMove(0)
        }}
        className={`card-enter group relative overflow-hidden rounded-2xl border border-[rgba(255,45,120,0.3)] bg-gradient-to-br from-[#1A0025] to-[#120020] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-[#FF2D78] hover:shadow-[0_0_20px_rgba(255,45,120,0.5),0_20px_40px_rgba(0,0,0,0.4)] ${
          view === 'list' ? 'flex gap-4' : ''
        }`}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {touchMove - touchStart > 20 ? (
          <div className="absolute inset-y-0 right-0 z-10 flex w-24 items-center justify-center bg-green-500/30 text-white">♥ Save</div>
        ) : null}
        {touchMove - touchStart < -20 ? (
          <div className="absolute inset-y-0 left-0 z-10 flex w-24 items-center justify-center bg-red-500/30 text-white">✕ Hide</div>
        ) : null}
        <div className={`relative overflow-hidden ${view === 'list' ? 'w-40 shrink-0' : ''}`}>
          <img
            src={pickEventImage(event.images)}
            alt={event.name}
            className={`${view === 'list' ? 'h-full min-h-[160px]' : 'h-[200px]'} w-full object-cover transition duration-500 group-hover:scale-110`}
            onError={(e) => {
              e.target.src = 'https://placehold.co/640x360?text=EventPulse'
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1A0025] to-transparent" />
        </div>
        <div className="space-y-1 p-4">
          <p className="line-clamp-2 text-base font-bold text-white">{event.name}</p>
          <div className="group/date relative w-fit">
            <a
              href={calendarUrl || '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-[#E0AEFF] underline-offset-2 hover:underline"
            >
              {formatEventDate(event)}
            </a>
            <span className="absolute -top-8 left-0 hidden whitespace-nowrap rounded bg-[#12001E] px-2 py-1 text-xs text-[#FF6EB4] group-hover/date:block">
              Add to Google Calendar
            </span>
          </div>
          <div className="group/venue relative w-fit">
            <p className="text-sm text-[#E0AEFF]">{venue?.name || 'Venue TBA'}</p>
            {venue?.address?.line1 ? (
              <span className="absolute -top-8 left-0 hidden whitespace-nowrap rounded bg-[#12001E] px-2 py-1 text-xs text-[#FF6EB4] group-hover/venue:block">
                {venue.address.line1}
              </span>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-[#FF2D78] bg-[rgba(255,45,120,0.2)] px-2 py-1 text-[11px] uppercase text-[#FF6EB4]">
              {getCategory(event)}
            </span>
            <span className="text-xs font-bold text-[#FF2D78]">
              {event?.priceRanges?.[0]
                ? `$${event.priceRanges[0].min} - $${event.priceRanges[0].max}`
                : 'Price TBA'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            {distanceText ? <span className="text-xs text-[#E0AEFF]">📍 {distanceText} km away</span> : <span />}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleSave()
              }}
              className={`relative rounded-full border px-3 py-1 text-xs transition ${
                isSaved
                  ? 'animate-[heartBeat_0.45s_ease] border-[#FF2D78] bg-[#FF2D78] text-white neon-glow'
                  : 'border-[#FF2D78] text-[#FF6EB4]'
              }`}
            >
              {isSaved ? <FaHeart className="inline" /> : <FaRegHeart className="inline" />} Save
              {animText ? (
                <span className="absolute -top-5 right-0 animate-[fadeInUp_0.8s_ease] text-[10px] text-[#FF6EB4]">{animText}</span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
      {showPreview ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 backdrop-blur-[8px] md:items-center"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="w-full max-w-2xl animate-[fadeInUp_0.3s_ease] rounded-2xl border border-[rgba(255,45,120,0.4)] bg-[#1A0025] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={pickEventImage(event.images)} alt={event.name} className="mb-3 h-52 w-full rounded-xl object-cover" />
            <h3 className="mb-1 text-xl font-bold text-white">{event.name}</h3>
            <p className="text-sm text-[#E0AEFF]">{formatEventDate(event)}</p>
            <p className="text-sm text-[#E0AEFF]">{venue?.name || 'Venue TBA'}</p>
            <p className="mb-3 mt-2 line-clamp-2 text-sm text-[#E0AEFF]">{event?.info || event?.pleaseNote || 'No description yet.'}</p>
            <p className="mb-3 text-xs text-[#FF6EB4]">{getCategory(event)}</p>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-full border border-[#FF2D78] px-4 py-2 text-sm text-[#FF6EB4]"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                View Full Details
              </button>
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="neon-glow rounded-full bg-gradient-to-r from-[#FF2D78] to-[#FF00FF] px-4 py-2 text-sm text-white"
              >
                Buy Tickets
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default memo(EventCard)
