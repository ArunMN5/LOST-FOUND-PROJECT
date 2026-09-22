import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import * as lostItemService from '../../services/lostItemService'
import * as foundItemService from '../../services/foundItemService'
import * as userService from '../../services/userService'
import Loading from '../../components/Loading/Loading.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import { Package, FileCheck, ShieldCheck, Users, Trash2, Eye, ArrowRight } from 'lucide-react'
import './AdminDashboard.css'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('reports')
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [itemToDelete, setItemToDelete] = useState(null)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [lostResponse, foundResponse, usersResponse] = await Promise.all([
          lostItemService.getAllLostItems(),
          foundItemService.getAllFoundItems(),
          userService.getAllUsers()
        ])
        setLostItems(lostResponse.data || [])
        setFoundItems(foundResponse.data || [])
        setUsers(usersResponse.data || [])
      } catch (error) {
        addToast(error.message || 'Failed to load admin data.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [addToast])

  const handleDeleteLost = async () => {
    if (!itemToDelete) return
    const itemId = itemToDelete.id || itemToDelete._id
    if (!itemId) {
      addToast('Item ID is missing. Cannot delete.', 'error')
      setItemToDelete(null)
      return
    }
    try {
      await lostItemService.deleteLostItem(itemId)
      setLostItems((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
      addToast('Lost item deleted successfully.', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to delete lost item.', 'error')
    } finally {
      setItemToDelete(null)
    }
  }

  const handleDeleteFound = async () => {
    if (!itemToDelete) return
    const itemId = itemToDelete.id || itemToDelete._id
    if (!itemId) {
      addToast('Item ID is missing. Cannot delete.', 'error')
      setItemToDelete(null)
      return
    }
    try {
      await foundItemService.deleteFoundItem(itemId)
      setFoundItems((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
      addToast('Found item deleted successfully.', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to delete found item.', 'error')
    } finally {
      setItemToDelete(null)
    }
  }

  const allReports = [
    ...lostItems.map((item) => ({ ...item, type: 'lost' })),
    ...foundItems.map((item) => ({ ...item, type: 'found' }))
  ].sort((a, b) => new Date(b.lostDate || b.foundDate) - new Date(a.lostDate || a.foundDate))

  const statCards = [
    { label: 'Total Items', value: allReports.length, icon: Package, color: 'primary' },
    { label: 'Pending Claims', value: 0, icon: FileCheck, color: 'warning' },
    { label: 'Verified Items', value: 0, icon: ShieldCheck, color: 'success' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'info' }
  ]

  const recentClaims = [
    { id: 1, itemName: 'Black Wallet', userName: 'Arun M N', type: 'lost', status: 'Pending', date: '2026-09-08' },
    { id: 2, itemName: 'Blue Backpack', userName: 'Sheela R', type: 'lost', status: 'Approved', date: '2026-09-08' },
    { id: 3, itemName: 'iPhone 14', userName: 'Vikram S', type: 'lost', status: 'Pending', date: '2026-09-07' }
  ]

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'badge-approved'
      case 'pending':
        return 'badge-pending'
      case 'closed':
        return 'badge-closed'
      default:
        return 'badge-pending'
    }
  }

  return (
    <div className="admin-dashboard-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="admin-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Overview of the platform activities.</p>
        </div>
        <Link to="/admin/users" className="btn btn-secondary">
          Manage Users
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="admin-stats-grid grid grid-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`admin-stat-card admin-stat-${card.color}`}>
              <div className="admin-stat-icon">
                <Icon size={24} />
              </div>
              <div className="admin-stat-info">
                <span className="admin-stat-value">{card.value}</span>
                <span className="admin-stat-label">{card.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Recent Reports
        </button>
        <button
          className={`admin-tab ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          Recent Claims
        </button>
      </div>

      <div className="admin-content card">
        <div className="card-body">
          {loading ? (
            <Loading message="Loading items..." />
          ) : activeTab === 'reports' ? (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allReports.slice(0, 8).map((item) => (
                    <tr key={`${item.type}-${item.id || item._id}`}>
                      <td>
                        <div className="admin-table-item">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.itemName} className="admin-thumb" />
                          ) : (
                            <div className="admin-thumb-placeholder">No Image</div>
                          )}
                          <span>{item.itemName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${item.type}`}>{item.type}</span>
                      </td>
                      <td>{item.category}</td>
                      <td>{item.location}</td>
                      <td>{formatDate(item.lostDate || item.foundDate)}</td>
                      <td>
                        <span className={`badge badge-${item.type}`}>
                          {item.status || (item.type === 'lost' ? 'LOST' : 'FOUND')}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <Link
                            to={`/${item.type}-items/${item.id || item._id}`}
                            className="btn btn-secondary btn-sm"
                            title="View"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setItemToDelete({ ...item, itemType: item.type })}
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
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td>{claim.itemName}</td>
                      <td>{claim.userName}</td>
                      <td>
                        <span className={`badge badge-${claim.type}`}>{claim.type}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td>{formatDate(claim.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        title={`Delete ${itemToDelete?.itemType === 'lost' ? 'Lost' : 'Found'} Item`}
        message={`Are you sure you want to delete "${itemToDelete?.itemName}"? This action cannot be undone.`}
        onConfirm={itemToDelete?.itemType === 'lost' ? handleDeleteLost : handleDeleteFound}
        onCancel={() => setItemToDelete(null)}
        confirmText="Delete"
      />
    </div>
  )
}

export default AdminDashboard
