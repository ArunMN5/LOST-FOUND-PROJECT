import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import useNotificationCount from '../../hooks/useNotificationCount.js'
import {
  LayoutGrid,
  FilePlus,
  Package,
  Search,
  FileCheck,
  Bell,
  Shield,
  Users,
  LogOut,
  X
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, isAdmin, logout } = useAuth()
  const location = useLocation()
  const notificationCount = useNotificationCount()

  const navItems = [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/report-item', icon: FilePlus, label: 'Report Item' },
    { to: '/search-items', icon: Search, label: 'Search Items' },
    { to: '/claims', icon: FileCheck, label: 'My Claims' },
    { to: '/notifications', icon: Bell, label: 'Notifications' }
  ]

  if (isAdmin) {
    navItems.push({ to: '/admin', icon: Shield, label: 'Admin' })
    navItems.push({ to: '/admin/users', icon: Users, label: 'Users' })
  }

  const getInitials = () => {
    const name = user?.name || user?.email || 'U'
    return name.charAt(0).toUpperCase()
  }

  const isActive = (path) => {
    if (path === '/search-items') {
      return (
        location.pathname === path ||
        location.pathname.startsWith('/lost-items') ||
        location.pathname.startsWith('/found-items') ||
        location.pathname.startsWith('/matches')
      )
    }
    if (path === '/report-item') {
      return (
        location.pathname === path ||
        location.pathname === '/report-lost' ||
        location.pathname === '/report-found'
      )
    }
    return location.pathname === path
  }

  return (
    <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Package size={22} />
          </div>
          <span className="sidebar-logo-text">Lost & Found</span>
        </div>
        <button className="sidebar-close" onClick={onCloseMobile} aria-label="Close menu">
          <X size={22} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-link ${active ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.to === '/notifications' && notificationCount > 0 && (
                <span className="sidebar-badge">{notificationCount}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{getInitials()}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || user?.email}</span>
            <span className="sidebar-user-role">{user?.role || 'User'}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
