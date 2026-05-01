import { FaMoon, FaSun, FaUserCircle } from 'react-icons/fa'
import { Link, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/theme/themeSlice'
import { logout } from '../features/auth/authSlice'

const Navbar = () => {
  const dispatch = useDispatch()
  const { mode } = useSelector((state) => state.theme)
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const savedCount = useSelector((state) => state.savedEvents.items.length)

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,45,120,0.3)] bg-[rgba(13,0,20,0.85)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="logo neon-text text-xl font-extrabold tracking-wide text-[#FF2D78]">
          EventPulse
        </Link>
        <div className="hidden gap-5 md:flex">
          {['/', '/events', '/search', '/saved'].map((path) => (
            <NavLink
              key={path}
              to={path}
              className="text-sm font-medium text-white transition hover:text-[#FF2D78] hover:[text-shadow:0_0_10px_#FF2D78]"
            >
              {path === '/' ? 'Home' : path === '/saved' ? 'Saved' : path.slice(1)}
              {path === '/saved' ? (
                <span
                  className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#FF2D78] px-1 text-[10px] text-[#FF6EB4] ${savedCount > 0 ? 'animate-pulse' : ''}`}
                >
                  {savedCount}
                </span>
              ) : null}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="rounded-full border border-[rgba(255,45,120,0.4)] bg-[rgba(255,45,120,0.2)] p-2 text-[#FF2D78]"
          >
            {mode === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          {isLoggedIn ? (
            <>
              <span className="hidden text-sm text-[#E0AEFF] md:block">{user?.name || user?.email}</span>
              <FaUserCircle className="text-2xl text-[#FF6EB4]" />
              <button
                onClick={() => dispatch(logout())}
                className="neon-glow rounded-full bg-gradient-to-r from-[#FF2D78] to-[#FF00FF] px-4 py-1.5 text-sm font-semibold text-white transition hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="neon-glow rounded-full bg-gradient-to-r from-[#FF2D78] to-[#FF00FF] px-4 py-1.5 text-sm font-semibold text-white transition hover:scale-105"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
