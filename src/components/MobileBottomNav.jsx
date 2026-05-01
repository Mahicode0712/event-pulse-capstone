import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/events', label: 'Events', icon: '🎵' },
  { to: '/search', label: 'Search', icon: '🔍' },
  { to: '/saved', label: 'Saved', icon: '🔖' },
]

const MobileBottomNav = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(255,45,120,0.25)] bg-[#12001E]/95 p-2 md:hidden">
    <div className="grid grid-cols-4 gap-1">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center rounded-lg py-2 text-xs ${
              isActive ? 'text-[#FF2D78] [text-shadow:0_0_10px_#FF2D78]' : 'text-gray-400'
            }`
          }
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </div>
  </div>
)

export default MobileBottomNav
