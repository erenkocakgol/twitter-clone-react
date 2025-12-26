import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Layout
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'

// Pages
import Home from './pages/Home'
import Profile from './pages/Profile'
import Search from './pages/Search'
import PostPage from './pages/PostPage'
import Settings from './pages/Settings'
import Messages from './pages/Messages'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'

// Admin Pages
import Dashboard from './components/admin/Dashboard'
import UserManagement from './components/admin/UserManagement'
import PostManagement from './components/admin/PostManagement'
import ReportManagement from './components/admin/ReportManagement'
import SiteSettings from './components/admin/SiteSettings'
import SEOSettings from './components/admin/SEOSettings'
import AdsenseSettings from './components/admin/AdsenseSettings'

// Loading Spinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-twitter-blue border-t-transparent rounded-full animate-spin"></div>
  </div>
)

// Protected Route Component (requires login)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />

  return children
}

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user || !isAdmin) return <Navigate to="/" replace />

  return children
}

// Guest Route Component (redirect if logged in)
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to="/" replace />

  return children
}

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute>
          <Register />
        </GuestRoute>
      } />
      <Route path="/forgot-password" element={
        <GuestRoute>
          <ForgotPassword />
        </GuestRoute>
      } />
      <Route path="/reset-password/:token" element={
        <GuestRoute>
          <ResetPassword />
        </GuestRoute>
      } />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Main App Routes - Guest accessible */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="profile/:username" element={<Profile />} />
        <Route path="search" element={<Search />} />
        <Route path="post/:slug" element={<PostPage />} />
        <Route path="settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="messages/:conversationId" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="posts" element={<PostManagement />} />
        <Route path="reports" element={<ReportManagement />} />
        <Route path="settings" element={<SiteSettings />} />
        <Route path="seo" element={<SEOSettings />} />
        <Route path="adsense" element={<AdsenseSettings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
