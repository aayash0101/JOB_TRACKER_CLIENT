import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const STATUS_COLORS = {
  applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-yellow-100 text-yellow-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [search, statusFilter])

  const fetchJobs = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get('/jobs', { params })
      setJobs(data.jobs)
    } catch (err) {
      setError('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

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

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interview: jobs.filter(j => j.status === 'interview').length,
    offer: jobs.filter(j => j.status === 'offer').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">JobTracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['applied', 'interview', 'offer', 'rejected'].map(status => (
            <div key={status} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{stats[status]}</p>
              <p className="text-sm text-gray-500 capitalize">{status}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            All Applications <span className="text-gray-400 text-base">({stats.total})</span>
          </h2>
          <Link
            to="/jobs/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add Job
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by company or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {/* Jobs List */}
        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No applications found</p>
            <p className="text-sm mt-1">Try a different search or add a new job</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job._id} className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{job.position}</h3>
                  <p className="text-gray-500 text-sm">{job.company}</p>
                  {job.location && <p className="text-gray-400 text-xs mt-1">{job.location}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_COLORS[job.status]}`}>
                    {job.status}
                  </span>
                  <Link to={`/jobs/${job._id}/edit`} className="text-sm text-blue-500 hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(job._id)} className="text-sm text-red-400 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}