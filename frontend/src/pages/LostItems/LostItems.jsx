import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as lostItemService from '../../services/lostItemService'
import ItemCard from '../../components/ItemCard/ItemCard.jsx'
import Loading from '../../components/Loading/Loading.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import BackButton from '../../components/BackButton/BackButton.jsx'
import './LostItems.css'

const LostItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const mine = searchParams.get('mine') === 'true'

  useEffect(() => {
    fetchLostItems()
  }, [])

  const fetchLostItems = async () => {
    try {
      setLoading(true)
      const response = mine && user?.id
        ? await lostItemService.getLostItemsByUserId(user.id)
        : await lostItemService.getAllLostItems()
      setItems(response.data || [])
    } catch (error) {
      addToast(error.message || 'Failed to load lost items.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFindMatches = (id) => {
    navigate(`/matches/${id}`)
  }

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    const itemId = itemToDelete.id || itemToDelete._id
    if (!itemId) {
      addToast('Item ID is missing. Cannot delete.', 'error')
      setItemToDelete(null)
      return
    }

    try {
      await lostItemService.deleteLostItem(itemId)
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
      addToast('Lost item deleted successfully.', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to delete lost item.', 'error')
    } finally {
      setItemToDelete(null)
    }
  }

  return (
    <div className="page lost-items-page">
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="container">
        <div className="page-header">
          <div>
            <BackButton />
            <h1 className="page-title">{mine ? 'My Lost Items' : 'Lost Items'}</h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/report-lost')}
          >
            Report Lost Item
          </button>
        </div>

        {loading ? (
          <Loading message="Loading lost items..." />
        ) : items.length === 0 ? (
          <div className="empty-state card">
            <div className="card-body text-center">
              <h3 className="empty-title">No lost items yet</h3>
              <p className="empty-description">
                Be the first to report a lost item and let others help you find it.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/report-lost')}
              >
                Report Lost Item
              </button>
            </div>
          </div>
        ) : (
          <div className="items-grid grid grid-3">
            {items.map((item) => (
              <ItemCard
                key={item.id || item._id}
                item={item}
                type="lost"
                showMatchesButton
                onDelete={handleDeleteClick}
                onFindMatches={handleFindMatches}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Lost Item"
        message={`Are you sure you want to delete "${itemToDelete?.itemName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
        confirmText="Delete"
      />
    </div>
  )
}

export default LostItems
