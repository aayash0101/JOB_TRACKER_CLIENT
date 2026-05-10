import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import JobForm from './pages/JobForm'

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  return token ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  return !token ? children : <Navigate to="/dashboard" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/jobs/new" element={<PrivateRoute><JobForm /></PrivateRoute>} />
      <Route path="/jobs/:id/edit" element={<PrivateRoute><JobForm /></PrivateRoute>} />
    </Routes>
  )
}