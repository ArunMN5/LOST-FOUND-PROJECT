import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as foundItemService from '../../services/foundItemService'
import { useAuth } from '../../context/AuthContext.jsx'
import Loading from '../../components/Loading/Loading.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import { MapPin, Calendar, User, Package, ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import './FoundItemDetails.css'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const FoundItemDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await foundItemService.getFoundItemById(id)
        setItem(response.data)
      } catch (error) {
        addToast(error.message || 'Failed to load found item details.', 'error')
        navigate('/search-items')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, navigate, addToast])

  const handleDelete = async () => {
    try {
      await foundItemService.deleteFoundItem(id)
      addToast('Found item deleted successfully.', 'success')
      navigate('/search-items')
    } catch (error) {
      addToast(error.message || 'Failed to delete found item.', 'error')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return <Loading message="Loading item details..." />
  }

  if (!item) {
    return (
      <div className="item-details-empty">
        <h2 className="page-title">Found item not found</h2>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/search-items')}>
          Back to Search
        </button>
      </div>
    )
  }

  const canManage = isAdmin || item.userId === user?.id

  return (
    <div className="item-details-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <button className="btn btn-ghost back-btn" onClick={() => navigate('/search-items')}>
        <ArrowLeft size={18} />
        Back to Search
      </button>

      <div className="item-details-grid grid grid-2">
        <div className="item-image-card card">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.itemName} className="item-details-image" />
          ) : (
            <div className="item-details-no-image">
              <Package size={64} />
              <span>No Image Available</span>
            </div>
          )}
        </div>

        <div className="item-info-card card">
          <div className="card-body">
            <div className="item-info-header">
              <span className="badge badge-found">Found</span>
              <h1 className="item-info-title">{item.itemName}</h1>
            </div>

            <div className="item-info-meta">
              <div className="info-row">
                <MapPin size={18} />
                <div>
                  <span className="info-label">Location</span>
                  <span className="info-value">{item.location}</span>
                </div>
              </div>
              <div className="info-row">
                <Calendar size={18} />
                <div>
                  <span className="info-label">Date</span>
                  <span className="info-value">{formatDate(item.foundDate)}</span>
                </div>
              </div>
              <div className="info-row">
                <User size={18} />
                <div>
                  <span className="info-label">Reported By</span>
                  <span className="info-value">{item.reportedByName || user?.name || 'User'}</span>
                </div>
              </div>
            </div>

            <div className="item-description">
              <h3 className="description-title">Description</h3>
              <p>{item.description}</p>
            </div>

            <div className="item-info-actions">
              {canManage && (
                <>
                  <Link to={`/found-items/${item.id}/edit`} className="btn btn-secondary">
                    <Pencil size={18} />
                    Edit
                  </Link>
                  <button className="btn btn-danger" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 size={18} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Found Item"
        message={`Are you sure you want to delete "${item.itemName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText="Delete"
      />
    </div>
  )
}

export default FoundItemDetails
