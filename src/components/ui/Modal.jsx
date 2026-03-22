import { useEffect } from 'react'
import { X } from 'lucide-react'

export const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) =>{
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${maxWidth} bg-obsidian-800 border border-obsidian-500 rounded-2xl shadow-card animate-slide-up fill-both overflow-hidden max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-700 shrink-0">
          <h2 className="font-display font-bold text-base text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-obsidian-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
export default Modal;