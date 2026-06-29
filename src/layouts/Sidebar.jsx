import {
  LayoutDashboard, ArrowLeftRight, Target, Sparkles,
  Bell, Wallet, User, LogOut, TrendingUp
} from 'lucide-react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useApp } from '../hooks/useApp.js'

const NAV = [
  { id: 'dashboard',    path: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { id: 'transactions', path: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { id: 'budgets',      path: '/budgets',      icon: Target,          label: 'Budgets'      },
  { id: 'insights',     path: '/insights',     icon: Sparkles,        label: 'Insights'  },
  { id: 'alerts',       path: '/alerts',       icon: Bell,            label: 'Alerts'       },
  { id: 'wallet',       path: '/wallet',       icon: Wallet,          label: 'Wallet'       },
  { id: 'profile',      path: '/profile',      icon: User,            label: 'Profile'      },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useApp()
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`
  const currentPath = location.pathname

return (
  <div className="flex min-h-screen bg-obsidian-950 bg-grid-pattern bg-grid">

    <aside className="w-55 shrink-0 bg-obsidian-900 border-r border-obsidian-700 flex flex-col h-screen sticky top-0">
      
      {/* Logo */}
      <div className="px-5 py-6 border-b border-obsidian-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-neon-green">
            <TrendingUp size={15} className="text-obsidian-950 stroke-[2.5]" />
          </div>
          <span className="font-display font-bold text-base text-ink-900 tracking-tight">
            FinTrack
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 mb-3">Menu</p>

        {NAV.map(({ id, path, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => navigate(path)}
            className={`nav-item ${currentPath === path ? 'active' : ''}`}
          >
            <Icon size={16} className="shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-obsidian-700">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-obsidian-700 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-neon-purple to-neon-blue flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.avatar?.url
              ? <img src={user.avatar.url} className="w-full h-full rounded-full object-cover" alt="" />
              : initials}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-ink-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>

            <p className="text-[11px] text-ink-500 truncate">
              {user?.email}
            </p>
          </div>
        </button>

        <button
          onClick={logout}
          className="nav-item mt-1 text-neon-red/70 hover:text-neon-red hover:bg-neon-red/10"
        >
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>
    </aside>

    {/* PAGE CONTENT */}
    <main className="flex-1 overflow-y-auto">
      <div className=" px-8 py-8">
        <Outlet />
      </div>
    </main>

  </div>
)
}
