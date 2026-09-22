import axios from 'axios'

const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Let axios set multipart boundary automatically for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    if (status === 403) {
      return Promise.reject(new Error(message || 'You are not authorized to perform this action.'))
    }

    if (status === 404) {
      return Promise.reject(new Error(message || 'The requested resource was not found.'))
    }

    if (status >= 500) {
      const backendError = error.response?.data?.error || error.response?.statusText || 'Internal Server Error'
      return Promise.reject(new Error(`${backendError}. Please try again later.`))
    }

    return Promise.reject(new Error(message || error.message || 'An unexpected error occurred.'))
  }
)

export default api
