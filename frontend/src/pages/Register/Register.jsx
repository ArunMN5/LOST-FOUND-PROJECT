import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { User, Mail, Lock, Eye, EyeOff, Phone, Package } from 'lucide-react'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import './Register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.phone.trim()) {
      addToast('Please fill in all fields.', 'error')
      return
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error')
      return
    }

    setIsLoading(true)

    try {
      await register(formData)
      addToast('Registration successful. Please log in.', 'success')
      navigate('/login')
    } catch (error) {
      addToast(error.message || 'Registration failed. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page register-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="auth-hero">
        <div className="auth-hero-overlay" />
        <div className="auth-hero-content">
          <div className="auth-hero-logo">
            <Package size={40} />
            <span>Lost & Found</span>
          </div>
          <h1 className="auth-hero-title">Join Our Community</h1>
          <p className="auth-hero-description">
            Create an account to report lost items, share found items, and help reunite people with their belongings.
          </p>
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full btn-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
