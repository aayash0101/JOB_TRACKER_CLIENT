import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StatsChart from '../components/StatsChart'
import KanbanBoard from '../components/KanbanBoard'

const STATUS_STYLES = {
  applied: 'bg-blue-50 text-blue-600',
  interview: 'bg-amber-50 text-amber-600',
  offer: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-red-50 text-red-500',
}

const STATUS_DOT = {
  applied: 'bg-blue-500',
  interview: 'bg-amber-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-red-500',
}

const STAT_CARDS = [
  { key: 'applied', label: 'Applied', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  { key: 'interview', label: 'Interview', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  { key: 'offer', label: 'Offer', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { key: 'rejected', label: 'Rejected', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [chartStats, setChartStats] = useState([])
  const [view, setView] = useState(() => localStorage.getItem('dashboardView') || 'list')

  const fetchJobs = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get('/jobs', { params })
      setJobs(data.jobs)
    } catch {
      setError('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [search, statusFilter])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/jobs/stats')
        setChartStats(data.stats)
      } catch (err) {
        console.error('Failed to fetch stats')
      }
    }
    fetchStats()
  }, [jobs])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return
    try {
      await api.delete(`/jobs/${id}`)
      setJobs(jobs.filter(job => job._id !== id))
    } catch (err) {
      setError('Failed to delete job')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleViewChange = (newView) => {
    setView(newView)
    localStorage.setItem('dashboardView', newView)
  }

  const handleJobStatusUpdate = (jobId, newStatus) => {
    setJobs(jobs.map(job =>
      job._id === jobId ? { ...job, status: newStatus } : job
    ))
  }

  const stats = {
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    offer: jobs.filter(j => j.status === 'offer').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
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
          <div className="space-y-1">
            <div className="flex items-center gap-3 bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium">
              <span>📋</span> Applications
            </div>
            <Link to="/profile" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
              <span>👤</span> Profile
            </Link>
          </div>
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
          <button
            onClick={handleLogout}
            className="w-full text-left text-gray-400 hover:text-white text-sm transition px-1"
          >
            → Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-gray-950 px-6 py-4 flex justify-between items-center z-10">
        <span className="text-white font-bold text-lg">⬡ JobTracker</span>
        <button onClick={handleLogout} className="text-gray-400 text-sm hover:text-white transition">Sign out</button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 px-6 py-8 pt-20 lg:pt-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Good to see you, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here's your job search at a glance</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map(({ key, label, bg, text, border }) => (
            <div key={key} className={`${bg} border ${border} rounded-2xl p-4`}>
              <p className={`text-3xl font-bold ${text}`}>{stats[key]}</p>
              <p className={`text-sm font-medium ${text} opacity-70 mt-1`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <StatsChart stats={chartStats} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">..</span>
            <input
              type="text"
              placeholder="Search company or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
          >
            <option value="">All Status</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => handleViewChange('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                view === 'list'
                  ? 'bg-gray-950 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => handleViewChange('board')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                view === 'board'
                  ? 'bg-gray-950 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Board
            </button>
          </div>

          <Link
            to="/jobs/new"
            className="bg-gray-950 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition whitespace-nowrap text-center"
          >
            + Add Job
          </Link>
        </div>

        {/* Section Title */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            Applications ({jobs.length})
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

        {/* Jobs List/Board */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No applications found</p>
            <p className="text-gray-300 text-sm mt-1">Add your first job to get started</p>
          </div>
        ) : view === 'board' ? (
          <KanbanBoard
            jobs={jobs}
            onJobUpdate={handleJobStatusUpdate}
            onJobDelete={handleDelete}
          />
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job._id} className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex justify-between items-center hover:border-gray-200 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[job.status]}`} />
                  <div>
                    <Link to={`/jobs/${job._id}`} className="font-semibold text-gray-900 hover:text-gray-600 transition">
                      {job.position}
                    </Link>
                    <p className="text-gray-500 text-sm">{job.company}{job.location ? ` · ${job.location}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize ${STATUS_STYLES[job.status]}`}>
                    {job.status}
                  </span>
                  <Link
                    to={`/jobs/${job._id}/edit`}
                    className="text-xs font-medium text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="text-xs font-medium text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}