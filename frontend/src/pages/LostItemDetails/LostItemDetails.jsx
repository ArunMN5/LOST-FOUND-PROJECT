import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as lostItemService from '../../services/lostItemService'
import * as foundItemService from '../../services/foundItemService'
import { useAuth } from '../../context/AuthContext.jsx'
import Loading from '../../components/Loading/Loading.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import { MapPin, Calendar, User, Package, ArrowLeft, Pencil, Trash2, Search } from 'lucide-react'
import './LostItemDetails.css'

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

const LostItemDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [item, setItem] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const [itemResponse, matchesResponse] = await Promise.all([
          lostItemService.getLostItemById(id),
          foundItemService.findMatchingFoundItems(id)
        ])
        setItem(itemResponse.data)
        const matchData = matchesResponse.data || []
        setMatches(Array.isArray(matchData) ? matchData.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3) : [])
      } catch (error) {
        addToast(error.message || 'Failed to load lost item details.', 'error')
        navigate('/search-items')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, navigate, addToast])

  const handleDelete = async () => {
    try {
      await lostItemService.deleteLostItem(id)
      addToast('Lost item deleted successfully.', 'success')
      navigate('/search-items')
    } catch (error) {
      addToast(error.message || 'Failed to delete lost item.', 'error')
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
        <h2 className="page-title">Lost item not found</h2>
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
              <span className="badge badge-lost">Lost</span>
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
                  <span className="info-value">{formatDate(item.lostDate)}</span>
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
              <button className="btn btn-primary" onClick={() => navigate(`/matches/${item.id}`)}>
                <Search size={18} />
                Find Matches
              </button>
              {canManage && (
                <>
                  <Link to={`/lost-items/${item.id}/edit`} className="btn btn-secondary">
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

      {matches.length > 0 && (
        <div className="possible-matches-section">
          <h2 className="section-title">Possible Matches</h2>
          <div className="matches-grid grid grid-3">
            {matches.map((match) => (
              <div key={match.id} className="match-card card">
                <div className="match-image-wrapper">
                  {match.imageUrl ? (
                    <img src={match.imageUrl} alt={match.itemName} className="match-image" />
                  ) : (
                    <div className="match-no-image">No Image</div>
                  )}
                </div>
                <div className="match-body">
                  <div className="match-score">{match.matchScore}% Match</div>
                  <h3 className="match-title">{match.itemName}</h3>
                  <p className="match-meta">{match.location} · {formatDate(match.foundDate)}</p>
                  <button
                    className="btn btn-primary w-full"
                    onClick={() => navigate(`/found-items/${match.id}`)}
                  >
                    View Match
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Lost Item"
        message={`Are you sure you want to delete "${item.itemName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText="Delete"
      />
    </div>
  )
}

export default LostItemDetails
