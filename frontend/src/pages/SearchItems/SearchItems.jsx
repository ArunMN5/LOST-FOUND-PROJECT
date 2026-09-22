import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as lostItemService from '../../services/lostItemService'
import * as foundItemService from '../../services/foundItemService'
import ItemCard from '../../components/ItemCard/ItemCard.jsx'
import Loading from '../../components/Loading/Loading.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import { Search, Filter } from 'lucide-react'
import BackButton from '../../components/BackButton/BackButton.jsx'
import './SearchItems.css'

const SearchItems = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    category: '',
    location: '',
    search: searchParams.get('search') || ''
  })
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    const params = {}
    if (filters.type && filters.type !== 'all') params.type = filters.type
    if (filters.search.trim()) params.search = filters.search.trim()
    if (filters.category.trim()) params.category = filters.category.trim()
    if (filters.location.trim()) params.location = filters.location.trim()
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const [lostResponse, foundResponse] = await Promise.all([
        lostItemService.getAllLostItems(),
        foundItemService.getAllFoundItems()
      ])
      const lostItems = (lostResponse.data || []).map((item) => ({ ...item, itemType: 'lost' }))
      const foundItems = (foundResponse.data || []).map((item) => ({ ...item, itemType: 'found' }))
      setItems([...lostItems, ...foundItems])
    } catch (error) {
      addToast(error.message || 'Failed to load items.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
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
      if (itemToDelete.itemType === 'lost') {
        await lostItemService.deleteLostItem(itemId)
      } else {
        await foundItemService.deleteFoundItem(itemId)
      }
      setItems((prev) => prev.filter((item) => (item.id || item._id) !== itemId))
      addToast('Item deleted successfully.', 'success')
    } catch (error) {
      addToast(error.message || 'Failed to delete item.', 'error')
    } finally {
      setItemToDelete(null)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesType = filters.type === 'all' || item.itemType === filters.type
    const matchesCategory = !filters.category || item.category?.toLowerCase().includes(filters.category.toLowerCase())
    const matchesLocation = !filters.location || item.location?.toLowerCase().includes(filters.location.toLowerCase())
    const matchesSearch =
      !filters.search ||
      item.itemName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.description?.toLowerCase().includes(filters.search.toLowerCase())
    return matchesType && matchesCategory && matchesLocation && matchesSearch
  })

  return (
    <div className="page search-items-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="search-items-header">
        <div>
          <BackButton />
          <h1 className="page-title">Search Items</h1>
          <p className="page-subtitle">Find lost or found items based on your preferences.</p>
        </div>
      </div>

      <div className="search-filter-bar card">
        <div className="card-body">
          <div className="search-main">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                name="search"
                className="search-input"
                placeholder="Search by item name, category, location..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                const params = {}
                if (filters.type && filters.type !== 'all') params.type = filters.type
                if (filters.search.trim()) params.search = filters.search.trim()
                if (filters.category.trim()) params.category = filters.category.trim()
                if (filters.location.trim()) params.location = filters.location.trim()
                setSearchParams(params, { replace: true })
              }}
            >
              <Search size={18} />
              Search
            </button>
          </div>

          <div className="search-filters">
            <div className="filter-group">
              <label className="filter-label">Item Type</label>
              <select name="type" className="form-select" value={filters.type} onChange={handleFilterChange}>
                <option value="all">All</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <input
                type="text"
                name="category"
                className="form-input"
                placeholder="All"
                value={filters.category}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="All"
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Date Range</label>
              <input type="date" className="form-input" readOnly />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading items..." />
      ) : filteredItems.length === 0 ? (
        <div className="empty-state card">
          <div className="card-body">
            <h3 className="empty-title">No items found</h3>
            <p className="empty-description">Try adjusting your filters or search terms.</p>
          </div>
        </div>
      ) : (
        <div className="items-grid grid grid-4">
          {filteredItems.map((item) => (
            <ItemCard
              key={`${item.itemType}-${item.id || item._id}`}
              item={item}
              type={item.itemType}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.itemName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
        confirmText="Delete"
      />
    </div>
  )
}

export default SearchItems
