import { useEffect, useState } from 'react'
import * as userService from '../../services/userService'
import Loading from '../../components/Loading/Loading.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import { Users, Pencil, Trash2, Shield, User, X, Eye, Mail, Phone } from 'lucide-react'
import './AdminUsers.css'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: 'USER' })
  const [saving, setSaving] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAllUsers()
      setUsers(response.data || [])
    } catch (error) {
      addToast(error.message || 'Failed to load users.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      await userService.deleteUser(userToDelete.id)
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      addToast('User deleted successfully.', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to delete user.', 'error')
    } finally {
      setUserToDelete(null)
    }
  }

  const startEdit = (user) => {
    setEditingUser(user)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'USER'
    })
  }

  const handleViewUser = async (id) => {
    try {
      setViewLoading(true)
      const response = await userService.getUserById(id)
      if (response.status && response.data) {
        setViewingUser(response.data)
      } else {
        addToast(response.message || 'Failed to load user details.', 'error')
      }
    } catch (error) {
      addToast(error.message || 'Failed to load user details.', 'error')
    } finally {
      setViewLoading(false)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingUser) return

    if (!editForm.name.trim() || !editForm.email.trim()) {
      addToast('Name and email are required.', 'error')
      return
    }

    try {
      setSaving(true)
      await userService.updateUser(editingUser.id, editForm)
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...editForm } : u))
      )
      addToast('User updated successfully.', 'success')
      setEditingUser(null)
    } catch (error) {
      addToast(error.message || 'Failed to update user.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-users-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="admin-users-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage registered users and their roles.</p>
        </div>
        <div className="admin-users-count">
          <Users size={20} />
          <span>{users.length} users</span>
        </div>
      </div>

      <div className="admin-users-content card">
        <div className="card-body">
          {loading ? (
            <Loading message="Loading users..." />
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Users size={48} />
              </div>
              <h3 className="empty-title">No users found</h3>
              <p className="empty-description">There are no registered users yet.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-user-info">
                          <div className="admin-user-avatar">
                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="admin-user-name">{user.name || 'Unnamed'}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-lost' : 'badge-found'}`}>
                          {user.role || 'USER'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewUser(user.id)}
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => startEdit(user)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setUserToDelete(user)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit User</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    value={editForm.phone}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    className="form-select"
                    value={editForm.role}
                    onChange={handleEditChange}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingUser && (
        <div className="modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">User Details</h3>
              <button className="modal-close" onClick={() => setViewingUser(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {viewLoading ? (
                <Loading message="Loading user details..." />
              ) : (
                <div className="profile-fields">
                  <div className="profile-field">
                    <div className="profile-field-icon">
                      <User size={20} />
                    </div>
                    <div className="profile-field-info">
                      <span className="profile-field-label">Full Name</span>
                      <span className="profile-field-value">{viewingUser.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="profile-field">
                    <div className="profile-field-icon">
                      <Mail size={16} />
                    </div>
                    <div className="profile-field-info">
                      <span className="profile-field-label">Email</span>
                      <span className="profile-field-value">{viewingUser.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="profile-field">
                    <div className="profile-field-icon">
                      <Phone size={16} />
                    </div>
                    <div className="profile-field-info">
                      <span className="profile-field-label">Phone</span>
                      <span className="profile-field-value">{viewingUser.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="profile-field">
                    <div className="profile-field-icon">
                      <Shield size={16} />
                    </div>
                    <div className="profile-field-info">
                      <span className="profile-field-label">Role</span>
                      <span className="profile-field-value">{viewingUser.role || 'USER'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${userToDelete?.name || userToDelete?.email}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setUserToDelete(null)}
        confirmText="Delete"
      />
    </div>
  )
}

export default AdminUsers
