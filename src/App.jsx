import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import MobileBottomNav from './components/MobileBottomNav'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'

const Home = lazy(() => import('./pages/Home'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Search = lazy(() => import('./pages/Search'))
const Saved = lazy(() => import('./pages/Saved'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  const { mode } = useSelector((state) => state.theme)
  const navigate = useNavigate()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const gSequenceRef = useRef(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === '?') setShowShortcuts(true)
      if (e.key === '/') {
        e.preventDefault()
        const input = document.getElementById('global-search-input')
        if (input) input.focus()
      }
      if (e.key === 'Escape') setShowShortcuts(false)
      if (e.key.toLowerCase() === 'g') {
        gSequenceRef.current = true
        return
      }
      if (gSequenceRef.current) {
        const next = e.key.toLowerCase()
        if (next === 'h') navigate('/')
        if (next === 'e') navigate('/events')
        if (next === 's') navigate('/saved')
        gSequenceRef.current = false
      }
      if (e.key === 'ArrowLeft') window.dispatchEvent(new CustomEvent('eventpulse:page-prev'))
      if (e.key === 'ArrowRight') window.dispatchEvent(new CustomEvent('eventpulse:page-next'))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <Navbar />
      <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <Suspense fallback={<div className="p-8">Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}

export default App
