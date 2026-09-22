import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authService from '../services/authService'
import * as userService from '../services/userService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await userService.getProfile()
      if (response.status && response.data) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      } else {
        logout()
      }
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
    loadUser()
  }, [loadUser])

  const login = async (credentials) => {
    const response = await authService.login(credentials)

    if (!response.status || !response.data?.token) {
      throw new Error(response.message || 'Login failed. Please try again.')
    }

    const token = response.data.token
    localStorage.setItem('token', token)

    const profileResponse = await userService.getProfile()
    if (profileResponse.status && profileResponse.data) {
      setUser(profileResponse.data)
      localStorage.setItem('user', JSON.stringify(profileResponse.data))
    } else {
      throw new Error(profileResponse.message || 'Failed to load profile.')
    }

    return profileResponse.data
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    if (!response.status) {
      throw new Error(response.message || 'Registration failed. Please try again.')
    }
    return response
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'ADMIN'

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    loadUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
