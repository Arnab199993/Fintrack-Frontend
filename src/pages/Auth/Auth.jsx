import { useEffect, useState } from 'react'
import { TrendingUp, ArrowRight, Eye, EyeOff, Shield, BarChart3, Zap, KeyRound } from 'lucide-react'
import { FormGroup, Input } from '../../components/ui/Form.jsx'
import { useApp } from '../../hooks/useApp.js'
import { api } from '../../utils/api.js'
import fintrack from "../../assets/fintrack.png"

const FEATURES = [
  { icon: BarChart3, text: 'Category-wise spending charts'},
  { icon: Zap,       text: 'financial insights'},
  { icon: Shield,    text: '2-step email OTP verification'},
  { icon: TrendingUp,text: 'Smart budget alerts & tracking'},
]

import OtpInput from './OtpInput.jsx'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SessionHelper from '../../utils/SessionHelper.js'

const Auth = () => {

  const navigate = useNavigate()
const [searchParams] = useSearchParams()

  const { showToast, setUser, setUserToken } = useApp()
  const [view, setView]       = useState('login') 
  const [otpEmail, setOtpEmail] = useState('')
  const [otpPurpose, setOtpPurpose] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)

  const [loginForm, setLoginForm]   = useState({ email: '', password: '' })
  const [regForm, setRegForm]       = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [forgotForm, setForgotForm] = useState({ email: '' })
  const [resetForm, setResetForm]   = useState({ token: '', newPassword: '', confirmPassword: '' })

  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp]     = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.auth.login({ email: loginForm.email, password: loginForm.password })
      setOtpEmail(loginForm.email)
      setOtpPurpose('login')
      setView('otp')
      showToast('OTP sent to ' + loginForm.email, 'info')
    } catch (error) {
      showToast(error.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.auth.register(regForm)
      setOtpEmail(regForm.email)
      setOtpPurpose('verify')
      setView('otp')
      showToast('Check your email for verification code', 'success')
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async (code) => {
    if (code.length < 6) return
    setLoading(true)

    try {
      if (otpPurpose === 'login') {
        const result = await api.auth.verifyLogin({ email: otpEmail, otp: code })
        const user = result.data?.user ?? result.user
        const token = result.data?.accessToken ?? result.accessToken

        if (token) {
          setUserToken(token)
        }

        if (user) {
          setUser(user)
          showToast('Welcome back!', 'success')
          navigate('/dashboard')
          SessionHelper.setUserDetails(user)
          return
        }

        throw new Error('Unable to authenticate user')
      } else {
        await api.auth.verifyEmail({ email: otpEmail, otp: code })
        showToast('Email verified successfully. Please sign in.', 'success')
        setView('login')
      }
    } catch (error) {
      showToast(error.message || 'OTP verification failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!otpEmail) return
    setLoading(true)

    try {
      await api.auth.resendOtp({ email: otpEmail })
      showToast('OTP resent to ' + otpEmail, 'info')
    } catch (error) {
      showToast(error.message || 'Unable to resend OTP', 'error')
    } finally {
      setLoading(false)
    }
  }

const handleForgotPasswordRequest = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.auth.forgotPassword({ email: resetEmail })
      showToast('Verification code dispatched to your email.', 'success')
      setView('reset')
    } catch (error) {
      showToast(error.message || 'Unable to request password reset', 'error')
    } finally {
      setLoading(false)
    }
  }

const handlePasswordResetVerify = async (e) => {
    e.preventDefault()
    if (resetOtp.length < 6) {
      showToast('Please enter a valid 6-digit code', 'error')
      return
    }
    setLoading(true)
    try {
      await api.auth.resetPassword({ 
        email: resetEmail, 
        token: resetOtp, 
        newPassword 
      })
      showToast('Password updated successfully. Please sign in.', 'success')
      setView('login')
      setResetOtp('')
      setNewPassword('')
    } catch (error) {
      showToast(error.message || 'Verification failed', 'error')
    } finally {
      setLoading(false)
    }
}
const handleResetPasswordFromUrl = () => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const email = params.get('email')

    console.log('URL Params:', { token, email })
    console.log("tokennnnn",token)
    
    if (token && email) {
      setResetEmail(email)
      setResetOtp(token)
      setView('reset')
      console.log('Setting view to reset')
    }
}

  useEffect(() => {
    handleResetPasswordFromUrl();
  }, []);

  useEffect(() => {
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  console.log('React Router URL Params:', { token, email }) 
  
  if (token && email) {
    setResetEmail(email)
    setResetOtp(token)  
    setView('reset')
    console.log('Setting view to reset via hook successfully!')
  }
}, [searchParams])
  return (
    <div className="min-h-screen bg-obsidian-950 grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center px-14 py-16 bg-obsidian-900 border-r border-obsidian-700 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-neon-green/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-neon-blue/5 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-neon-green">
              {/* <TrendingUp
                size={18}
                className="text-obsidian-950 stroke-[2.5]"
              /> */}
              <img src={fintrack} sizes='18' lassName="text-obsidian-950 stroke-[2.5]" />
            </div>
            <span className="font-display font-bold text-2xl text-ink-900 tracking-tight">
              FinTrack
            </span>
          </div>

          <h1 className="font-display font-bold text-4xl text-ink-900 leading-tight tracking-tight mb-4">
            Your money,
            <br />
            <span className="text-neon-green">fully visible.</span>
          </h1>
          <p className="text-ink-500 text-base leading-relaxed mb-10 max-w-sm">
            Track spending, manage budgets, and financial insights — all in one
            clean dashboard.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 animate-slide-up fill-both"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-8 h-8 rounded-xl bg-obsidian-700 border border-obsidian-600 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-neon-green" />
                </div>
                <span className="text-sm text-ink-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-8 py-12 bg-obsidian-950">
        <div className="w-full max-w-sm animate-slide-up fill-both">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-neon-green to-neon-blue flex items-center justify-center">
              {/* <TrendingUp
                size={15}
                className="text-obsidian-950 stroke-[2.5]"
              /> */}
              <img src={fintrack} sizes='18' lassName="text-obsidian-950 stroke-[2.5]" />
            </div>
            <span className="font-display font-bold text-xl text-ink-900">
              FinTrack
            </span>
          </div>

          {view === "login" && (
            <>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-ink-500 mb-7">
                Sign in to your account
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <FormGroup label="Email">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </FormGroup>
                <FormGroup label="Password">
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormGroup>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2 gap-2 justify-center py-3"
                >
                  {loading ? (
                    "Sending OTP…"
                  ) : (
                    <div className="flex justify-center items-center">
                      {" "}
                      Continue <ArrowRight size={15} />{" "}
                    </div>
                  )}
                </button>
              </form>
              <div className="flex items-center justify-between mt-4">
                <p className="text-center text-sm text-ink-500 flex-1">
                  No account?{" "}
                  <button
                    onClick={() => setView("register")}
                    className="text-neon-green font-semibold hover:underline"
                  >
                    Create one
                  </button>
                </p>
              </div>
              <p className="text-center text-sm mt-4">
                <button
                  onClick={() => setView("forgot")}
                  className="text-neon-blue font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </p>
            </>
          )}

          {view === "register" && (
            <>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">
                Create account
              </h2>
              <p className="text-sm text-ink-500 mb-7">
                Start tracking your finances today
              </p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormGroup label="First Name">
                    <Input
                      placeholder="Aditya"
                      value={regForm.firstName}
                      onChange={(e) =>
                        setRegForm((f) => ({ ...f, firstName: e.target.value }))
                      }
                      required
                    />
                  </FormGroup>
                  <FormGroup label="Last Name">
                    <Input
                      placeholder="Sharma"
                      value={regForm.lastName}
                      onChange={(e) =>
                        setRegForm((f) => ({ ...f, lastName: e.target.value }))
                      }
                      required
                    />
                  </FormGroup>
                </div>
                <FormGroup label="Email">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={regForm.email}
                    onChange={(e) =>
                      setRegForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </FormGroup>
                <FormGroup label="Password">
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Min 8 chars, upper + symbol"
                      className="pr-10"
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm((f) => ({ ...f, password: e.target.value }))
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormGroup>
                <FormGroup label="Phone (optional)">
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={regForm.phone}
                    onChange={(e) =>
                      setRegForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </FormGroup>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2 gap-2 justify-center py-3"
                >
                  {loading ? (
                    "Creating account…"
                  ) : (
                    <div className="flex justify-center items-center">
                      {" "}
                      Create Account <ArrowRight size={15} />{" "}
                    </div>
                  )}
                </button>
              </form>
              <p className="text-center text-sm text-ink-500 mt-6">
                Have an account?{" "}
                <button
                  onClick={() => setView("login")}
                  className="text-neon-green font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {view === "otp" && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-5">
                <Shield size={20} className="text-neon-green" />
              </div>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">
                {otpPurpose === "login"
                  ? "Verify your identity"
                  : "Verify your email"}
              </h2>
              <p className="text-sm text-ink-500 mb-1">
                Enter the 6-digit code sent to
              </p>
              <p className="text-sm font-semibold text-neon-blue mb-2">
                {otpEmail}
              </p>

              <OtpInput onComplete={handleOtp} loading={loading} />

              {loading && (
                <p className="text-center text-sm text-neon-green animate-pulse mb-4">
                  Verifying…
                </p>
              )}

              <p className="text-center text-sm text-ink-500 mt-2">
                Didn't receive it?{" "}
                <button
                  onClick={handleResend}
                  className="text-neon-green font-semibold hover:underline"
                >
                  Resend code
                </button>
              </p>
              <button
                onClick={() => setView("login")}
                className="w-full text-center text-sm text-ink-500 hover:text-ink-700 mt-4 transition-colors"
              >
                ← Back to sign in
              </button>
            </>
          )}

          {view === "forgot" && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-5">
                <KeyRound size={20} className="text-neon-green" />
              </div>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">
                Forgot Password
              </h2>
              <p className="text-sm text-ink-500 mb-7">
                Enter your email address to receive a 6-digit recovery code
              </p>
              <form
                onSubmit={handleForgotPasswordRequest}
                className="space-y-4"
              >
                <FormGroup label="Email Address">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </FormGroup>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2 gap-2 justify-center py-3"
                >
                  {loading ? (
                    "Requesting code…"
                  ) : (
                    <div className="flex justify-center items-center">
                      {" "}
                      Send Verification Code <ArrowRight size={15} />{" "}
                    </div>
                  )}
                </button>
              </form>
              <button
                onClick={() => setView("login")}
                className="w-full text-center text-sm text-ink-500 hover:text-ink-700 mt-6 transition-colors"
              >
                ← Back to sign in
              </button>
            </>
          )}

          {view === "reset" && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-5">
                <Shield size={20} className="text-neon-green" />
              </div>
              <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">
                Reset Password
              </h2>
              <p className="text-sm text-ink-500 mb-1">
                Enter the recovery code sent to:
              </p>
              <p className="text-sm font-semibold text-neon-blue mb-6">
                {resetEmail}
              </p>

              <form onSubmit={handlePasswordResetVerify} className="space-y-5">
                <FormGroup label="6-Digit Reset Code">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="000000"
                    value={resetOtp}
                    onChange={(e) =>
                      setResetOtp(e.target.value.replace(/\D/g, ""))
                    }
                    required
                  />
                </FormGroup>

                <FormGroup label="New Secure Password">
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-700"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormGroup>

                <button
                  type="submit"
                  disabled={loading || resetOtp.length < 6}
                  className="btn-primary w-full mt-2 gap-2 justify-center py-3"
                >
                  {loading ? (
                    "Updating Password…"
                  ) : (
                    <div className="flex justify-center items-center">
                      {" "}
                      Change Password <ArrowRight size={15} />{" "}
                    </div>
                  )}
                </button>
              </form>
              <button
                onClick={() => setView("login")}
                className="w-full text-center text-sm text-ink-500 hover:text-ink-700 mt-6 transition-colors"
              >
                ← Cancel and sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth