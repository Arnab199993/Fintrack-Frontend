import { useApp } from '../../context/AppContext.jsx'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const CONFIG = {
  success: { icon: CheckCircle,  border: 'border-l-neon-green',  iconClass: 'text-neon-green'  },
  error:   { icon: XCircle,      border: 'border-l-neon-red',    iconClass: 'text-neon-red'    },
  warning: { icon: AlertTriangle,border: 'border-l-neon-yellow', iconClass: 'text-neon-yellow' },
  info:    { icon: Info,         border: 'border-l-neon-blue',   iconClass: 'text-neon-blue'   },
}

export default function Toast() {
  const { toast } = useApp()
  if (!toast) return null

  const cfg  = CONFIG[toast.type] ?? CONFIG.info
  const Icon = cfg.icon

  return (
    <div className="fixed top-5 right-5 z-[9999] animate-slide-in-right fill-both pointer-events-none">
      <div className={`flex items-center gap-3 bg-obsidian-700 border border-obsidian-500 border-l-4 ${cfg.border} rounded-xl px-4 py-3.5 shadow-card min-w-[280px] max-w-sm pointer-events-auto`}>
        <Icon size={15} className={cfg.iconClass} />
        <span className="text-sm text-ink-900 font-medium">{toast.message}</span>
      </div>
    </div>
  )
}
