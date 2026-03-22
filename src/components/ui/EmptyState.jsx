const EmptyState =({ icon = '📭', title, sub, action }) =>{
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3 opacity-40">{icon}</div>
      <p className="font-semibold text-ink-900 mb-1">{title}</p>
      {sub && <p className="text-sm text-ink-500 max-w-xs">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
export default EmptyState
