import api from './api'

const buildLostItemFormData = (data) => {
  const formData = new FormData()
  formData.append('itemName', data.itemName)
  formData.append('description', data.description)
  formData.append('category', data.category)
  formData.append('location', data.location)
  formData.append('lostDate', data.lostDate)

  if (data.image && data.image instanceof File) {
    formData.append('image', data.image)
  }

  return formData
}

export const addLostItem = async (data) => {
  const response = await api.post('/lost/add', buildLostItemFormData(data))
  return response.data
}

export const getLostItemById = async (id) => {
  const response = await api.get(`/lost/${id}`)
  return response.data
}

export const getAllLostItems = async () => {
  const response = await api.get('/lost/all')
  return response.data
}

export const updateLostItem = async (id, data) => {
  const response = await api.put(`/lost/${id}`, buildLostItemFormData(data))
  return response.data
}

export const deleteLostItem = async (id) => {
  const response = await api.delete(`/lost/${id}`)
  return response.data
}

export const getLostItemsByUserId = async (userId) => {
  const response = await api.get(`/lost/user/${userId}`)
  return response.data
}