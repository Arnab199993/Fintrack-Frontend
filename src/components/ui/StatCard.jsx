const ACCENTS = {
  green:  { bar: 'bg-neon-green',  val: 'text-neon-green',  glow: 'hover:shadow-neon-green' },
  blue:   { bar: 'bg-neon-blue',   val: 'text-neon-blue',   glow: 'hover:shadow-neon-blue'  },
  red:    { bar: 'bg-neon-red',    val: 'text-neon-red',    glow: '' },
  yellow: { bar: 'bg-neon-yellow', val: 'text-neon-yellow', glow: '' },
  purple: { bar: 'bg-neon-purple', val: 'text-neon-purple', glow: '' },
}

export default function StatCard({ label, value, sub, icon: Icon, accent = 'green', delay = 0 }) {
  const a = ACCENTS[accent] ?? ACCENTS.green
  return (
    <div
      className={`card p-5 relative overflow-hidden animate-slide-up fill-both group transition-all duration-200 hover:-translate-y-0.5 hover:border-obsidian-500 ${a.glow}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${a.bar}`} />
      <div className="flex items-start justify-between mb-3">
        <p className="section-label">{label}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-obsidian-700 border border-obsidian-500 flex items-center justify-center text-ink-500 group-hover:text-ink-700 transition-colors">
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className={`font-display font-bold text-2xl tracking-tight ${a.val}`}>{value}</p>
      {sub && <p className="text-xs text-ink-500 mt-1.5">{sub}</p>}
    </div>
  )
}
