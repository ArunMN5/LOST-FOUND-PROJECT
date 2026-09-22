import api from './api'

export const createClaim = async (claimData) => {
  const response = await api.post('/claim/create', claimData)
  return response.data
}

export const getClaimById = async (id) => {
  const response = await api.get(`/claim/${id}`)
  return response.data
}

export const getMyClaims = async () => {
  const response = await api.get('/claim/my')
  return response.data
}

export const getReceivedClaims = async () => {
  const response = await api.get('/claim/received')
  return response.data
}

export const approveClaim = async (id) => {
  const response = await api.put(`/claim/${id}/approve`)
  return response.data
}

export const rejectClaim = async (id) => {
  const response = await api.put(`/claim/${id}/reject`)
  return response.data
}
