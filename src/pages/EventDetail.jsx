import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchEventById, fetchEvents, setRelatedEvents } from '../features/events/eventsSlice'
import { saveEvent, unsaveEvent } from '../features/saved/savedEventsSlice'
import EventCard from '../components/EventCard'
import { getCategory, getVenue, pickEventImage } from '../utils/helpers'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { selectedEvent, related, loading } = useSelector((state) => state.events)
  const { isLoggedIn } = useSelector((state) => state.auth)
  const saved = useSelector((state) => state.savedEvents.items.find((event) => event.id === id))

  useEffect(() => {
    dispatch(fetchEventById(id)).then((res) => {
      const category = getCategory(res.payload)
      dispatch(fetchEvents({ classificationName: category })).then((relatedRes) => {
        dispatch(
          setRelatedEvents((relatedRes.payload?._embedded?.events || []).filter((event) => event.id !== id).slice(0, 4)),
        )
      })
    })
  }, [dispatch, id])

  if (loading || !selectedEvent) return <div className="p-8">Loading event details...</div>
  const venue = getVenue(selectedEvent)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <img src={pickEventImage(selectedEvent.images)} alt={selectedEvent.name} className="h-80 w-full rounded-xl object-cover" />
      <h1 className="text-3xl font-bold">{selectedEvent.name}</h1>
      <p>{venue?.name} - {venue?.city?.name}</p>
      <p>{selectedEvent.info || selectedEvent.pleaseNote || 'Details coming soon.'}</p>
      <div className="flex gap-3">
        <a href={selectedEvent.url} target="_blank" rel="noreferrer" className="rounded bg-violet-600 px-4 py-2 text-white">
          Buy Tickets
        </a>
        <button
          onClick={() => {
            if (!isLoggedIn) {
              return toast((t) => (
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
            }
            if (saved) {
              dispatch(unsaveEvent(id))
              toast.success('Event removed from saved')
            } else {
              dispatch(saveEvent(selectedEvent))
              toast.success('Event saved successfully')
            }
          }}
          className="rounded border border-violet-600 px-4 py-2"
        >
          {saved ? 'Unsave Event' : 'Save Event'}
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied to clipboard!')
          }}
          className="rounded border px-4 py-2"
        >
          Share
        </button>
      </div>
      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Related Events</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default EventDetail
