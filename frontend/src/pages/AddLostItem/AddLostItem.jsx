import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as lostItemService from '../../services/lostItemService'
import Loading from '../../components/Loading/Loading.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import './AddLostItem.css'

const initialFormData = {
  itemName: '',
  description: '',
  category: '',
  location: '',
  lostDate: '',
  image: null
}

const AddLostItem = ({ embedded = false }) => {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialFormData)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [loading, setLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    if (!isEditMode) return

    const fetchItem = async () => {
      try {
        const response = await lostItemService.getLostItemById(id)
        const item = response.data
        if (!item) {
          addToast('Lost item not found.', 'error')
          navigate('/search-items')
          return
        }

        setFormData({
          itemName: item.itemName || '',
          description: item.description || '',
          category: item.category || '',
          location: item.location || '',
          lostDate: item.lostDate || '',
          image: null
        })
        setExistingImageUrl(item.imageUrl || null)
      } catch (error) {
        addToast(error.message || 'Failed to load lost item.', 'error')
        navigate('/search-items')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, isEditMode, navigate, addToast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFormData((prev) => ({ ...prev, image: file }))
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setPreviewUrl(null)
    setExistingImageUrl(null)
  }

  const validate = () => {
    if (!formData.itemName.trim()) return 'Item name is required.'
    if (!formData.description.trim()) return 'Description is required.'
    if (!formData.category.trim()) return 'Category is required.'
    if (!formData.location.trim()) return 'Location is required.'
    if (!formData.lostDate) return 'Lost date is required.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const error = validate()
    if (error) {
      addToast(error, 'error')
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode) {
        await lostItemService.updateLostItem(id, formData)
        addToast('Lost item updated successfully.', 'success')
      } else {
        await lostItemService.addLostItem(formData)
        addToast('Lost item reported successfully.', 'success')
      }
      navigate('/search-items')
    } catch (error) {
      addToast(error.message || `Failed to ${isEditMode ? 'update' : 'report'} lost item.`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <Loading message="Loading lost item..." />
  }

  const displayImage = previewUrl || existingImageUrl

  const formContent = (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <form onSubmit={handleSubmit} className="form card">
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="itemName" className="form-label">Item Name</label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                className="form-input"
                placeholder="e.g., Black Leather Wallet"
                value={formData.itemName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                placeholder="Describe the item, color, brand, distinguishing marks, etc."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-row grid grid-2">
              <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="form-input"
                  placeholder="e.g., Wallet, Phone, Keys"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  placeholder="e.g., Bangalore Railway Station"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lostDate" className="form-label">Lost Date</label>
              <input
                type="date"
                id="lostDate"
                name="lostDate"
                className="form-input"
                value={formData.lostDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">Item Image</label>
              <input
                type="file"
                id="image"
                name="image"
                className="form-input"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="form-hint">Upload a clear image of the lost item. Max size depends on server limits.</p>

              {displayImage && (
                <div className="image-preview-wrapper">
                  <img src={displayImage} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm image-remove-btn"
                    onClick={handleRemoveImage}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/search-items')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Lost Item' : 'Report Lost Item')}
              </button>
            </div>
          </div>
        </form>
    </>
  )

  if (embedded) {
    return formContent
  }

  return (
    <div className="page add-lost-item-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            {isEditMode ? 'Edit Lost Item' : 'Report Lost Item'}
          </h1>
        </div>
        {formContent}
      </div>
    </div>
  )
}

export default AddLostItem
