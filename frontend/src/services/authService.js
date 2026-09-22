import api from './api'

export const register = async (userData) => {
  const response = await api.post('/user/register', userData)
  return response.data
}

export const login = async (credentials) => {
  const response = await api.post('/user/login', credentials)
  return response.data
}
