import api from './api'

const buildFoundItemFormData = (data) => {
  const formData = new FormData()
  formData.append('itemName', data.itemName)
  formData.append('description', data.description)
  formData.append('category', data.category)
  formData.append('location', data.location)
  formData.append('foundDate', data.foundDate)

  if (data.image && data.image instanceof File) {
    formData.append('image', data.image)
  }

  return formData
}

export const addFoundItem = async (data) => {
  const response = await api.post('/found/add', buildFoundItemFormData(data))
  return response.data
}

export const getFoundItemById = async (id) => {
  const response = await api.get(`/found/${id}`)
  return response.data
}

export const getAllFoundItems = async () => {
  const response = await api.get('/found/all')
  return response.data
}

export const updateFoundItem = async (id, data) => {
  const response = await api.put(`/found/${id}`, buildFoundItemFormData(data))
  return response.data
}

export const deleteFoundItem = async (id) => {
  const response = await api.delete(`/found/${id}`)
  return response.data
}

export const findMatchingFoundItems = async (lostItemId) => {
  const response = await api.get(`/found/match/${lostItemId}`)
  return response.data
}

export const getFoundItemsByUserId = async (userId) => {
  const response = await api.get(`/found/user/${userId}`)
  return response.data
}