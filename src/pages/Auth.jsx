import { useState, useRef } from 'react'
import { TrendingUp, ArrowRight, Eye, EyeOff, Shield, BarChart3, Zap } from 'lucide-react'
import { FormGroup, Input } from '../components/ui/Form.jsx'
import { useApp } from '../context/AppContext.jsx'

const FEATURES = [
  { icon: BarChart3, text: 'Category-wise spending charts'     },
  { icon: Zap,       text: 'AI-powered financial insights'     },
  { icon: Shield,    text: '2-step email OTP verification'     },
  { icon: TrendingUp,text: 'Smart budget alerts & tracking'    },
]

function AuthLeft() {
  return (
    <div className="hidden lg:flex flex-col justify-center px-14 py-16 bg-obsidian-900 border-r border-obsidian-700 relative overflow-hidden">
      {/* bg glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-neon-green/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-neon-blue/5 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-neon-green">
            <TrendingUp size={18} className="text-obsidian-950 stroke-[2.5]" />
          </div>
          <span className="font-display font-bold text-2xl text-ink-900 tracking-tight">FinTrack</span>
        </div>

        <h1 className="font-display font-bold text-4xl text-ink-900 leading-tight tracking-tight mb-4">
          Your money,<br />
          <span className="text-neon-green">fully visible.</span>
        </h1>
        <p className="text-ink-500 text-base leading-relaxed mb-10 max-w-sm">
          Track spending, manage budgets, and get AI-powered insights — all in one clean dashboard.
        </p>

        <div className="space-y-4">
          {FEATURES.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 animate-slide-up fill-both" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-8 h-8 rounded-xl bg-obsidian-700 border border-obsidian-600 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-neon-green" />
              </div>
              <span className="text-sm text-ink-700">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OtpInput({ onComplete, loading }) {
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

export default function Auth() {
  const { navigate, showToast } = useApp()
  const [view, setView]       = useState('login')      // login | register | otp
  const [otpEmail, setOtpEmail] = useState('')
  const [otpPurpose, setOtpPurpose] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)

  const [loginForm, setLoginForm]   = useState({ email: '', password: '' })
  const [regForm, setRegForm]       = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })

  const simulateRequest = (fn) => {
    setLoading(true)
    setTimeout(() => { setLoading(false); fn() }, 1000)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    simulateRequest(() => {
      setOtpEmail(loginForm.email)
      setOtpPurpose('login')
      setView('otp')
      showToast('OTP sent to ' + loginForm.email, 'info')
    })
  }

  const handleRegister = (e) => {
    e.preventDefault()
    simulateRequest(() => {
      setOtpEmail(regForm.email)
      setOtpPurpose('verify')
      setView('otp')
      showToast('Account created! Check your email.', 'success')
    })
  }

  const handleOtp = (code) => {
    if (code.length < 6) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast('Welcome to FinTrack!', 'success')
      navigate('dashboard')
    }, 900)
  }

  const handleResend = () => {
    showToast('New code sent to ' + otpEmail, 'info')
  }

  return (
    <div className="min-h-screen bg-obsidian-950 grid lg:grid-cols-2">
      <AuthLeft />

      {/* Right panel */}
      <div className="flex items-center justify-center px-8 py-12 bg-obsidian-950">
        <div className="w-full max-w-sm animate-slide-up fill-both">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
              <TrendingUp size={15} className="text-obsidian-950 stroke-[2.5]" />
            </div>
            <span className="font-display font-bold text-xl text-ink-900">FinTrack</span>
          </div>

          {/* ── Login ─────────────────────────────── */}
          {view === 'login' && (
            <>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">Welcome back</h2>
              <p className="text-sm text-ink-500 mb-7">Sign in to your account</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <FormGroup label="Email">
                  <Input type="email" placeholder="you@example.com" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} required />
                </FormGroup>
                <FormGroup label="Password">
                  <div className="relative">
                    <Input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-10"
                      value={loginForm.password}
                      onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormGroup>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2 gap-2 justify-center py-3">
                  {loading ? 'Sending OTP…' : <> Continue <ArrowRight size={15} /> </>}
                </button>
              </form>
              <p className="text-center text-sm text-ink-500 mt-6">
                No account?{' '}
                <button onClick={() => setView('register')} className="text-neon-green font-semibold hover:underline">
                  Create one
                </button>
              </p>
            </>
          )}

          {/* ── Register ──────────────────────────── */}
          {view === 'register' && (
            <>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">Create account</h2>
              <p className="text-sm text-ink-500 mb-7">Start tracking your finances today</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormGroup label="First Name">
                    <Input placeholder="Aditya" value={regForm.firstName} onChange={e => setRegForm(f => ({ ...f, firstName: e.target.value }))} required />
                  </FormGroup>
                  <FormGroup label="Last Name">
                    <Input placeholder="Sharma" value={regForm.lastName} onChange={e => setRegForm(f => ({ ...f, lastName: e.target.value }))} required />
                  </FormGroup>
                </div>
                <FormGroup label="Email">
                  <Input type="email" placeholder="you@example.com" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} required />
                </FormGroup>
                <FormGroup label="Password">
                  <div className="relative">
                    <Input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min 8 chars, upper + symbol"
                      className="pr-10"
                      value={regForm.password}
                      onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormGroup>
                <FormGroup label="Phone (optional)">
                  <Input type="tel" placeholder="+1234567890" value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} />
                </FormGroup>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2 gap-2 justify-center py-3">
                  {loading ? 'Creating account…' : <> Create Account <ArrowRight size={15} /> </>}
                </button>
              </form>
              <p className="text-center text-sm text-ink-500 mt-6">
                Have an account?{' '}
                <button onClick={() => setView('login')} className="text-neon-green font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* ── OTP ───────────────────────────────── */}
          {view === 'otp' && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-5">
                <Shield size={20} className="text-neon-green" />
              </div>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">
                {otpPurpose === 'login' ? 'Verify your identity' : 'Verify your email'}
              </h2>
              <p className="text-sm text-ink-500 mb-1">
                Enter the 6-digit code sent to
              </p>
              <p className="text-sm font-semibold text-neon-blue mb-2">{otpEmail}</p>

              <OtpInput onComplete={handleOtp} loading={loading} />

              {loading && (
                <p className="text-center text-sm text-neon-green animate-pulse mb-4">Verifying…</p>
              )}

              <p className="text-center text-sm text-ink-500 mt-2">
                Didn't receive it?{' '}
                <button onClick={handleResend} className="text-neon-green font-semibold hover:underline">
                  Resend code
                </button>
              </p>
              <button onClick={() => setView('login')} className="w-full text-center text-sm text-ink-500 hover:text-ink-700 mt-4 transition-colors">
                ← Back to sign in
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
