import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as userService from '../../services/userService'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import { Mail, Phone, Shield, User, Pencil, Check, X } from 'lucide-react'
import './Profile.css'

const Profile = () => {
  const { user, setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })
  const { toasts, addToast, removeToast } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    setIsEditing(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim()) {
      addToast('Name and email are required.', 'error')
      return
    }

    try {
      setSaving(true)
      const response = await userService.updateProfile(formData)
      if (response.status && response.data) {
        const updatedUser = { ...user, ...response.data }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        addToast('Profile updated successfully.', 'success')
        setIsEditing(false)
      } else {
        addToast(response.message || 'Failed to update profile.', 'error')
      }
    } catch (error) {
      addToast(error.message || 'Failed to update profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const profileFields = [
    { icon: User, label: 'Full Name', value: user?.name || 'N/A', name: 'name' },
    { icon: Mail, label: 'Email Address', value: user?.email || 'N/A', name: 'email' },
    { icon: Phone, label: 'Phone Number', value: user?.phone || 'N/A', name: 'phone' },
    { icon: Shield, label: 'Account Role', value: user?.role || 'USER', name: 'role', readOnly: true }
  ]

  return (
    <div className="profile-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="profile-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information.</p>
        </div>
        {!isEditing && (
          <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-card card">
        <div className="profile-banner">
          <div className="profile-avatar-large">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="profile-banner-info">
            <h2 className="profile-name">{user?.name || user?.email}</h2>
            <span className={`badge ${user?.role === 'ADMIN' ? 'badge-lost' : 'badge-found'}`}>
              {user?.role || 'USER'}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-fields">
              {profileFields.map((field) => {
                const Icon = field.icon
                return (
                  <div key={field.label} className="profile-field">
                    <div className="profile-field-icon">
                      <Icon size={20} />
                    </div>
                    <div className="profile-field-info">
                      <label className="profile-field-label">{field.label}</label>
                      {field.readOnly ? (
                        <span className="profile-field-value">{field.value}</span>
                      ) : (
                        <input
                          type={field.name === 'email' ? 'email' : 'text'}
                          name={field.name}
                          className="form-input"
                          value={formData[field.name]}
                          onChange={handleChange}
                          required={field.name !== 'phone'}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="profile-form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={16} />
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Check size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-fields">
            {profileFields.map((field) => {
              const Icon = field.icon
              return (
                <div key={field.label} className="profile-field">
                  <div className="profile-field-icon">
                    <Icon size={20} />
                  </div>
                  <div className="profile-field-info">
                    <span className="profile-field-label">{field.label}</span>
                    <span className="profile-field-value">{field.value}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
