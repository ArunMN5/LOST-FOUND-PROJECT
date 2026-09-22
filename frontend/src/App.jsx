import { useState } from 'react'
import { Routes, Route, Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { Menu } from 'lucide-react'
import Navbar from './components/Navbar/Navbar.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Login/Login.jsx'
import Register from './pages/Register/Register.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Profile from './pages/Profile/Profile.jsx'
import SearchItems from './pages/SearchItems/SearchItems.jsx'
import ReportItem from './pages/ReportItem/ReportItem.jsx'
import LostItems from './pages/LostItems/LostItems.jsx'
import FoundItems from './pages/FoundItems/FoundItems.jsx'
import LostItemDetails from './pages/LostItemDetails/LostItemDetails.jsx'
import FoundItemDetails from './pages/FoundItemDetails/FoundItemDetails.jsx'
import AddLostItem from './pages/AddLostItem/AddLostItem.jsx'
import AddFoundItem from './pages/AddFoundItem/AddFoundItem.jsx'
import Matches from './pages/Matches/Matches.jsx'
import Claims from './pages/Claims/Claims.jsx'
import Notifications from './pages/Notifications/Notifications.jsx'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard.jsx'
import AdminUsers from './pages/AdminUsers/AdminUsers.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import './App.css'

const AuthenticatedLayout = () => {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className="app-layout-content">
        <header className="app-topbar">
          <button
            className="topbar-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="app-topbar-actions"></div>
        </header>

        <div className="app-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function App() {
  const { loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  const hideNavbar = ['/login', '/register'].includes(location.pathname)

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={`app-main ${hideNavbar ? 'app-main-full' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search-items" element={<SearchItems />} />
              <Route path="/report-item" element={<ReportItem />} />
              <Route path="/report-lost" element={<ReportItem defaultTab="lost" />} />
              <Route path="/report-found" element={<ReportItem defaultTab="found" />} />
              <Route path="/lost-items" element={<LostItems />} />
              <Route path="/found-items" element={<FoundItems />} />
              <Route path="/lost-items/:id" element={<LostItemDetails />} />
              <Route path="/found-items/:id" element={<FoundItemDetails />} />
              <Route path="/lost-items/:id/edit" element={<AddLostItem />} />
              <Route path="/found-items/:id/edit" element={<AddFoundItem />} />
              <Route path="/matches/:lostItemId" element={<Matches />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
