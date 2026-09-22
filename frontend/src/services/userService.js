import api from './api'

export const getProfile = async () => {
  const response = await api.get('/user/profile')
  return response.data
}

export const updateProfile = async (userData) => {
  const response = await api.put('/user/profile', userData)
  return response.data
}

export const getAllUsers = async () => {
  const response = await api.get('/user/admin/all')
  return response.data
}

export const getUserById = async (id) => {
  const response = await api.get(`/user/admin/${id}`)
  return response.data
}

export const updateUser = async (id, userData) => {
  const response = await api.put(`/user/admin/${id}`, userData)
  return response.data
}

export const deleteUser = async (id) => {
  const response = await api.delete(`/user/admin/${id}`)
  return response.data
}
