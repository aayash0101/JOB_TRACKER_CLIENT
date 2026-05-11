import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function JobForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    company: '',
    position: '',
    status: 'applied',
    location: '',
    salary: '',
    jobUrl: '',
    followUpDate: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditing) fetchJob()
  }, [id])

  const fetchJob = useCallback(async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`)
      const { company, position, status, location, salary, jobUrl, followUpDate, notes } = data.job
      setForm({
        company,
        position,
        status,
        location: location || '',
        salary: salary || '',
        jobUrl: jobUrl || '',
        followUpDate: followUpDate ? followUpDate.split('T')[0] : '',
        notes: notes || ''
      })
    } catch (_err) {
      setError('Failed to load job')
    }
  }, [id])

  useEffect(() => {
    if (isEditing) fetchJob()
  }, [isEditing, fetchJob])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEditing) {
        await api.put(`/jobs/${id}`, form)
      } else {
        await api.post('/jobs', form)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
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
      </aside>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-gray-950 px-6 py-4 flex justify-between items-center z-10">
        <span className="text-white font-bold text-lg">⬡ JobTracker</span>
        <Link to="/dashboard" className="text-gray-400 text-sm hover:text-white transition">← Back</Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex items-center justify-center px-6 py-8 pt-20 lg:pt-8">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition mb-4 inline-block">
              ← Back to dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Application' : 'New Application'}
            </h1>
            <p className="text-gray-500 mt-1">{isEditing ? 'Update the details below' : 'Fill in the details below'}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                    placeholder="Google"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                    placeholder="Backend Developer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                    placeholder="Remote / Kathmandu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                  <input
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                    placeholder="$80k - $100k"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job URL</label>
                <input
                  name="jobUrl"
                  value={form.jobUrl}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow Up By</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none"
                  placeholder="Any notes about this application..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-950 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}