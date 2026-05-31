import { useEffect, useRef, useState } from 'react'
import { Camera, Save, Lock, Bell, Palette, Shield } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import { FormGroup, Input, Select } from '../components/ui/Form.jsx'
import { useApp } from '../hooks/useApp.js'
import { api } from '../utils/api.js'
import { fmt } from '../utils/helpers.js'
import PrimaryBtn from '../constant/PrimaryBtn.jsx'
import { useDispatch } from 'react-redux'
import { initializeAuth } from '../store/slices/userSlice.js'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD', 'JPY']
const TABS = [
  { id: 'profile',   icon: Shield,  label: 'Profile'   },
  { id: 'security',  icon: Lock,    label: 'Security'  },
]

export default function Profile() {
  const fileInputRef = useRef(null)
  const { user, setUser, showToast } = useApp()
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', currency: 'USD' })
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : ''
  const dispatch = useDispatch()

  useEffect(() => {
    if (!user) return
    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      currency: user.currency ?? 'USD',
    })
  }, [user])

const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('avatar', file)
  try {
    await api.users.updateAvatar(formData)
    await dispatch(initializeAuth()).unwrap()
    showToast('Avatar updated', 'success')
  } catch (err) {
    showToast(err.message || 'Upload failed', 'error')
  }
}


  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const result = await api.users.updateProfile(form)
      const updated = result.data?.user ?? result.user
      if (updated) {
        setUser(updated)
      }
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      showToast(error.message || 'Unable to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (passForm.newPass !== passForm.confirm) return showToast('Passwords do not match', 'error')
    if (passForm.newPass.length < 8) return showToast('Password must be at least 8 characters', 'error')

    setSaving(true)
    try {
      await api.users.changePassword({ currentPassword: passForm.current, newPassword: passForm.newPass })
      setPassForm({ current: '', newPass: '', confirm: '' })
      showToast('Password changed successfully', 'success')
    } catch (error) {
      showToast(error.message || 'Unable to change password', 'error')
    } finally {
      setSaving(false)
    }
  }

  console.log("userrrr",user)

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your account settings" />

      {/* Avatar + name hero */}
      <div className="card p-6 flex items-center gap-6 animate-slide-up fill-both">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-neon-purple to-neon-blue flex items-center justify-center text-2xl font-display font-bold text-white overflow-hidden">
            {user.avatar?.url ? (
              <img
                src={user.avatar.url}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              initials
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-obsidian-600 border-2 border-obsidian-800 flex items-center justify-center text-ink-500 hover:text-ink-900 transition-colors"
          >
            <Camera size={11} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="flex-1">
          <h2 className="font-display font-bold text-xl text-ink-900">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-sm text-ink-500">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="green">Active</Badge>
            <Badge variant="blue">Email Verified</Badge>
          </div>
        </div>
        <div className="text-right hidden lg:block">
          <p className="section-label mb-1">Wallet Balance</p>
          <p className="font-display font-bold text-2xl text-neon-green">
            {fmt(user.walletBalance)}
          </p>
          <p className="text-xs text-ink-500">{user.currency} account</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-obsidian-800 border border-obsidian-700 p-1 rounded-xl w-fit">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id
                ? "bg-obsidian-600 text-ink-900 shadow-card"
                : "text-ink-500 hover:text-ink-700"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="card p-6 animate-slide-up fill-both">
          <h3 className="font-display font-semibold text-base text-ink-900 mb-5">
            Personal Information
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="First Name">
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                  required
                />
              </FormGroup>
              <FormGroup label="Last Name">
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                  required
                />
              </FormGroup>
            </div>
            <FormGroup
              label="Email"
              hint="Changing email requires re-verification"
            >
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </FormGroup>
            <FormGroup label="Phone (optional)">
              <Input
                type="tel"
                placeholder="+1234567890"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </FormGroup>
            <FormGroup label="Currency">
              <Select
                value={form.currency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, currency: e.target.value }))
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <div className="pt-2">
              <PrimaryBtn type="submit" disabled={saving}>
                <Save size={14} className={saving ? "animate-pulse" : ""} />
                {saving ? "Saving…" : "Save Changes"}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div className="space-y-4 animate-slide-up fill-both">
          <div className="card p-6">
            <h3 className="font-display font-semibold text-base text-ink-900 mb-1">
              Change Password
            </h3>
            <p className="text-sm text-ink-500 mb-5">
              Use a strong password with uppercase, lowercase, numbers and
              symbols.
            </p>
            <form onSubmit={handlePasswordSave} className="space-y-4 max-w-lg">
              <FormGroup label="Current Password">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passForm.current}
                  onChange={(e) =>
                    setPassForm((f) => ({ ...f, current: e.target.value }))
                  }
                  required
                />
              </FormGroup>
              <FormGroup label="New Password">
                <Input
                  type="password"
                  placeholder="Min 8 chars with special character"
                  value={passForm.newPass}
                  onChange={(e) =>
                    setPassForm((f) => ({ ...f, newPass: e.target.value }))
                  }
                  required
                />
              </FormGroup>
              <FormGroup label="Confirm New Password">
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  value={passForm.confirm}
                  onChange={(e) =>
                    setPassForm((f) => ({ ...f, confirm: e.target.value }))
                  }
                  required
                />
              </FormGroup>
              <div className="pt-2">
                <PrimaryBtn type="submit" disabled={saving}>
                  <Lock size={14} />
                  {saving ? "Updating…" : "Change Password"}
                </PrimaryBtn>
              </div>
            </form>
          </div>

          <div className="card p-6">
            <h3 className="font-display font-semibold text-base text-ink-900 mb-1">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-ink-500 mb-4">
              Every login requires a 6-digit code sent to your email.
            </p>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-neon-green/5 border border-neon-green/20">
              <div className="w-9 h-9 rounded-xl bg-neon-green/10 flex items-center justify-center">
                <Shield size={16} className="text-neon-green" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neon-green">
                  2FA is enabled
                </p>
                <p className="text-xs text-ink-500">
                  Email OTP is sent on every sign-in
                </p>
              </div>
              <Badge variant="green" className="ml-auto">
                Active
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
