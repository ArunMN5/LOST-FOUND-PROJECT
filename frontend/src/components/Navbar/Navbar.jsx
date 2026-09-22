import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ChevronDown, User, Bell } from 'lucide-react'
import useNotificationCount from '../../hooks/useNotificationCount.js'
import './Navbar.css'

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const notificationCount = useNotificationCount()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev)
  const closeMenu = () => setMobileMenuOpen(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-logo">Lost & Found</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          <span className={`navbar-toggle-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`navbar-toggle-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`navbar-toggle-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="navbar-links">
            <li>
              <Link to="/" onClick={closeMenu}>Home</Link>
            </li>

            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                </li>
                <li>
                  <Link to="/search-items" onClick={closeMenu}>Search Items</Link>
                </li>
                <li>
                  <Link to="/report-item" onClick={closeMenu}>Report Item</Link>
                </li>
                <li>
                  <Link to="/notifications" onClick={closeMenu} className="navbar-link-with-badge" title="Notifications">
                    <Bell size={20} />
                    {notificationCount > 0 && (
                      <span className="navbar-badge">{notificationCount}</span>
                    )}
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="/admin" onClick={closeMenu}>Admin</Link>
                  </li>
                )}
              </>
            ) : null}
          </ul>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                <div className="navbar-user-menu" ref={userMenuRef}>
                  <button
                    className="navbar-user-menu-toggle"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="navbar-user">Hi, {user?.name || user?.email}</span>
                    <ChevronDown size={16} className={`navbar-user-chevron ${userMenuOpen ? 'open' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="navbar-user-dropdown">
                      <Link
                        to="/profile"
                        className="navbar-user-dropdown-item"
                        onClick={() => {
                          closeMenu()
                          setUserMenuOpen(false)
                        }}
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </Link>
                      <button
                        className="navbar-user-dropdown-item navbar-user-dropdown-logout"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
