import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLES = {
  applied: 'bg-blue-50 text-blue-600 border-blue-100',
  interview: 'bg-amber-50 text-amber-600 border-amber-100',
  offer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  rejected: 'bg-red-50 text-red-500 border-red-100',
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const timeAgo = (date) => {
  const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`)
      setJob(data.job)
    } catch (err) {
      setError('Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this application?')) return
    try {
      await api.delete(`/jobs/${id}`)
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to delete job')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-gray-950 min-h-screen p-6 fixed top-0 left-0">
        <div className="mb-10">
          <span className="text-white font-bold text-xl tracking-tight">JobTracker</span>
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
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs">Job Seeker</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left text-gray-400 hover:text-white text-sm transition px-1">
            Sign out
          </button>
        </div>
      </aside>

      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-gray-950 px-6 py-4 flex justify-between items-center z-10">
        <span className="text-white font-bold text-lg">JobTracker</span>
        <Link to="/dashboard" className="text-gray-400 text-sm hover:text-white transition">Back</Link>
      </nav>

      <main className="flex-1 lg:ml-64 px-6 py-8 pt-20 lg:pt-8 max-w-3xl">
        <Link to="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition mb-6 inline-block">
          Back to dashboard
        </Link>

        {loading && (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        {!loading && !error && job && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{job.company}</p>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{job.position}</h1>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize border ${STATUS_STYLES[job.status]}`}>
                    {job.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/jobs/${id}/edit`}
                    className="text-sm font-medium text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="text-sm font-medium text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Details</p>
              <div className="grid grid-cols-2 gap-6">
                {job.location && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Location</p>
                    <p className="text-gray-900 font-medium">{job.location}</p>
                  </div>
                )}
                {job.salary && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Salary</p>
                    <p className="text-gray-900 font-medium">{job.salary}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Applied on</p>
                  <p className="text-gray-900 font-medium">{formatDate(job.appliedAt || job.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Time elapsed</p>
                  <p className="text-gray-900 font-medium">{timeAgo(job.appliedAt || job.createdAt)}</p>
                </div>
              </div>

              {job.jobUrl && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Job Posting</p>
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline underline-offset-2 transition"
                  >
                    View original posting
                  </a>
                </div>
              )}
            </div>

            {job.notes && (
              <div className="bg-white border border-gray-100 rounded-2xl p-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Notes</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.notes}</p>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Timeline</p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Application created</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(job.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last updated</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(job.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}