import {
  LayoutDashboard, ArrowLeftRight, Target, Sparkles,
  Bell, Wallet, User, LogOut, TrendingUp
} from 'lucide-react'
import { useApp } from '../hooks/useApp.js'

const NAV = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { id: 'transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { id: 'budgets',      icon: Target,          label: 'Budgets'      },
  { id: 'insights',     icon: Sparkles,        label: 'AI Insights'  },
  { id: 'alerts',       icon: Bell,            label: 'Alerts'       },
  { id: 'wallet',       icon: Wallet,          label: 'Wallet'       },
  { id: 'profile',      icon: User,            label: 'Profile'      },
]

export default function Sidebar({ unreadAlerts = 0 }) {
  const { page, navigate, user, logout } = useApp()
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`

  return (
    <aside className="w-[220px] shrink-0 bg-obsidian-900 border-r border-obsidian-700 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-obsidian-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-neon-green">
            <TrendingUp size={15} className="text-obsidian-950 stroke-[2.5]" />
          </div>
          <span className="font-display font-bold text-base text-ink-900 tracking-tight">FinTrack</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 mb-3">Menu</p>
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className={`nav-item ${page === id ? 'active' : ''}`}
          >
            <Icon size={16} className="shrink-0" />
            <span>{label}</span>
            {id === 'alerts' && unreadAlerts > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-neon-red/20 text-neon-red border border-neon-red/20 rounded-full px-1.5 py-0.5">
                {unreadAlerts}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-obsidian-700">
        <button
          onClick={() => navigate('profile')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-obsidian-700 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.avatar?.url
              ? <img src={user.avatar.url} className="w-full h-full rounded-full object-cover" alt="" />
              : initials
            }
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-ink-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[11px] text-ink-500 truncate">{user?.email}</p>
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
  )
}
