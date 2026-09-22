import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as foundItemService from '../../services/foundItemService'
import ItemCard from '../../components/ItemCard/ItemCard.jsx'
import Loading from '../../components/Loading/Loading.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import BackButton from '../../components/BackButton/BackButton.jsx'
import './FoundItems.css'

const FoundItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const mine = searchParams.get('mine') === 'true'

  useEffect(() => {
    fetchFoundItems()
  }, [])

  const fetchFoundItems = async () => {
    try {
      setLoading(true)
      const response = mine && user?.id
        ? await foundItemService.getFoundItemsByUserId(user.id)
        : await foundItemService.getAllFoundItems()
      setItems(response.data || [])
    } catch (error) {
      addToast(error.message || 'Failed to load found items.', 'error')
    } finally {
      setLoading(false)
    }
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
      await foundItemService.deleteFoundItem(itemId)
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
      addToast('Found item deleted successfully.', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to delete found item.', 'error')
    } finally {
      setItemToDelete(null)
    }
  }

  return (
    <div className="page found-items-page">
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="container">
        <div className="page-header">
          <div>
            <BackButton />
            <h1 className="page-title">{mine ? 'My Found Items' : 'Found Items'}</h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/report-found')}
          >
            Report Found Item
          </button>
        </div>

        {loading ? (
          <Loading message="Loading found items..." />
        ) : items.length === 0 ? (
          <div className="empty-state card">
            <div className="card-body text-center">
              <h3 className="empty-title">No found items yet</h3>
              <p className="empty-description">
                Be the first to report a found item and help someone recover their belongings.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/report-found')}
              >
                Report Found Item
              </button>
            </div>
          </div>
        ) : (
          <div className="items-grid grid grid-3">
            {items.map((item) => (
              <ItemCard
                key={item.id || item._id}
                item={item}
                type="found"
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Found Item"
        message={`Are you sure you want to delete "${itemToDelete?.itemName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
        confirmText="Delete"
      />
    </div>
  )
}

export default FoundItems
