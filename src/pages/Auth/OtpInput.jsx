import { useRef, useState } from "react"

const OtpInput = ({ onComplete, loading }) => {
  const refs = useRef([])
  const [vals, setVals] = useState(['', '', '', '', '', ''])

  const update = (idx, val) => {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...vals]
    next[idx] = v
    setVals(next)
    if (v && idx < 5) refs.current[idx + 1]?.focus()
    if (next.every(c => c !== '')) onComplete(next.join(''))
  }

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace' && !vals[idx] && idx > 0) refs.current[idx - 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const next = pasted.split('')
      setVals(next)
      refs.current[5]?.focus()
      onComplete(pasted)
    }
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 justify-center my-6">
      {vals.map((v, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => update(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={loading}
          className={`w-12 h-14 text-center font-display font-bold text-2xl rounded-xl border transition-all duration-150 outline-none
            bg-obsidian-700 text-ink-900
            ${v ? 'border-neon-green/50 shadow-neon-green' : 'border-obsidian-500'}
            focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/10
            disabled:opacity-50`}
        />
      ))}
    </div>
  )
}
export default OtpInput