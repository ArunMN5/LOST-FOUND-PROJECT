import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { MapPin, Calendar, ChevronRight, Pencil, Trash2, Search } from 'lucide-react'
import './ItemCard.css'

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

const ItemCard = ({
  item,
  type,
  onDelete,
  onFindMatches,
  showMatchesButton = false
}) => {
  const { user, isAdmin } = useAuth()
  const isOwner = item.userId === user?.id
  const canManage = isAdmin || isOwner

  const itemId = item.id || item._id
  const detailPath = type === 'lost' ? `/lost-items/${itemId}` : `/found-items/${itemId}`
  const editPath = type === 'lost' ? `/lost-items/${itemId}/edit` : `/found-items/${itemId}/edit`
  const dateValue = type === 'lost' ? item.lostDate : item.foundDate
  const statusClass = type === 'lost' ? 'badge-lost' : 'badge-found'

  return (
    <div className="item-card card">
      <div className="item-card-image-wrapper">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.itemName} className="item-card-image" />
        ) : (
          <div className="item-card-no-image">
            <span>No Image</span>
          </div>
        )}
        <span className={`item-card-status badge ${statusClass}`}>
          {item.status || (type === 'lost' ? 'LOST' : 'FOUND')}
        </span>
      </div>

      <div className="item-card-body">
        <h3 className="item-card-title">{item.itemName}</h3>
        <p className="item-card-description">{item.description}</p>

        <div className="item-card-meta">
          <div className="item-card-meta-row">
            <MapPin size={14} />
            <span>{item.location}</span>
          </div>
          <div className="item-card-meta-row">
            <Calendar size={14} />
            <span>{formatDate(dateValue)}</span>
          </div>
        </div>

        <div className="item-card-actions">
          <Link to={detailPath} className="btn btn-primary btn-sm item-card-view">
            View Details
            <ChevronRight size={14} />
          </Link>
          {showMatchesButton && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onFindMatches?.(itemId)}
              title="Find Matches"
            >
              <Search size={16} />
            </button>
          )}
          {canManage && (
            <>
              <Link to={editPath} className="btn btn-secondary btn-sm" title="Edit">
                <Pencil size={16} />
              </Link>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete?.(item)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ItemCard
