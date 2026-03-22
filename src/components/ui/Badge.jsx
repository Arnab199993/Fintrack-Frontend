const VARIANTS = {
  green:  'bg-neon-green/10 text-neon-green border border-neon-green/20',
  red:    'bg-neon-red/10 text-neon-red border border-neon-red/20',
  yellow: 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20',
  blue:   'bg-neon-blue/10 text-neon-blue border border-neon-blue/20',
  purple: 'bg-neon-purple/10 text-neon-purple border border-neon-purple/20',
  gray:   'bg-obsidian-600 text-ink-700 border border-obsidian-500',
  orange: 'bg-neon-orange/10 text-neon-orange border border-neon-orange/20',
}

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`badge ${VARIANTS[variant] ?? VARIANTS.gray} ${className}`}>
      {children}
    </span>
  )
}
