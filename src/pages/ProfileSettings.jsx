import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function ProfileSettings() {
  const { user, logout, updateProfile } = useAuth()
  const navigate = useNavigate()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)

    try {
      const { data } = await api.put('/auth/profile', {
        name: profileForm.name,
        email: profileForm.email
      })
      updateProfile(data.user)
      setProfileSuccess('Profile updated successfully')
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setPasswordLoading(true)

    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordSuccess('Password changed successfully')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-950 min-h-screen p-6 fixed top-0 left-0">
        <div className="mb-10">
          <span className="text-white font-bold text-xl tracking-tight">⬡ JobTracker</span>
        </div>
        <div className="flex-1">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-4 font-medium">Menu</p>
          <Link to="/dashboard" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            <span>📋</span> Applications
          </Link>
          <Link to="/profile" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            <span>👤</span> Profile
          </Link>
        </div>
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center text-gray-950 font-bold text-sm">
              {getInitials(user?.name)}
            </div>
            <div>
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs">Job Seeker</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left text-gray-400 hover:text-white text-sm transition px-1">
            → Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-gray-950 px-6 py-4 flex justify-between items-center z-10">
        <span className="text-white font-bold text-lg">⬡ JobTracker</span>
        <Link to="/dashboard" className="text-gray-400 text-sm hover:text-white transition">← Back</Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 px-6 py-8 pt-20 lg:pt-8 max-w-2xl">
        <Link to="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition mb-6 inline-block">
          ← Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account information</p>
        </div>

        {/* Avatar Section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-emerald-400 flex items-center justify-center text-gray-950 font-bold text-2xl">
              {getInitials(user?.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Update Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Update Profile</h3>

            {profileError && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl text-sm mb-4">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm mb-4">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-gray-950 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Password Change Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Change Password</h3>

            {passwordError && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl text-sm mb-4">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm mb-4">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-gray-950 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}