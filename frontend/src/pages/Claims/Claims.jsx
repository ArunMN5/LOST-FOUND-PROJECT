import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as claimService from '../../services/claimService.js'
import * as lostItemService from '../../services/lostItemService.js'
import * as foundItemService from '../../services/foundItemService.js'
import Loading from '../../components/Loading/Loading.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import { FileCheck, CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react'
import BackButton from '../../components/BackButton/BackButton.jsx'
import './Claims.css'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadge = (status) => {
  switch (status) {
    case 'APPROVED':
      return <span className="badge badge-success"><CheckCircle size={14} /> Approved</span>
    case 'REJECTED':
      return <span className="badge badge-danger"><XCircle size={14} /> Rejected</span>
    default:
      return <span className="badge badge-warning"><Clock size={14} /> Pending</span>
  }
}

const Claims = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('my')
  const [claims, setClaims] = useState([])
  const [lostItemsMap, setLostItemsMap] = useState({})
  const [foundItemsMap, setFoundItemsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [viewingClaim, setViewingClaim] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const fetchItems = async (claimsList) => {
    try {
      const lostIds = [...new Set(claimsList.map((c) => c.lostItemId).filter(Boolean))]
      const foundIds = [...new Set(claimsList.map((c) => c.foundItemId).filter(Boolean))]

      const [lostResponse, foundResponse] = await Promise.all([
        lostItemService.getAllLostItems(),
        foundItemService.getAllFoundItems()
      ])

      const lostItems = lostResponse.data || []
      const foundItems = foundResponse.data || []

      const lostMap = {}
      const foundMap = {}

      lostItems.forEach((item) => {
        if (lostIds.includes(item.id)) {
          lostMap[item.id] = item
        }
      })

      foundItems.forEach((item) => {
        if (foundIds.includes(item.id)) {
          foundMap[item.id] = item
        }
      })

      setLostItemsMap(lostMap)
      setFoundItemsMap(foundMap)
    } catch (error) {
      addToast(error.message || 'Failed to load item details.', 'error')
    }
  }

  const fetchClaims = async () => {
    try {
      setLoading(true)
      const response = activeTab === 'my'
        ? await claimService.getMyClaims()
        : await claimService.getReceivedClaims()

      const claimsList = response.data || []
      setClaims(claimsList)
      await fetchItems(claimsList)
    } catch (error) {
      addToast(error.message || 'Failed to load claims.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [activeTab])

  const handleApprove = async (id) => {
    try {
      setProcessingId(id)
      const response = await claimService.approveClaim(id)
      if (response.status) {
        addToast('Claim approved successfully.', 'success')
        fetchClaims()
      } else {
        addToast(response.message || 'Failed to approve claim.', 'error')
      }
    } catch (error) {
      addToast(error.message || 'Failed to approve claim.', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id) => {
    try {
      setProcessingId(id)
      const response = await claimService.rejectClaim(id)
      if (response.status) {
        addToast('Claim rejected successfully.', 'success')
        fetchClaims()
      } else {
        addToast(response.message || 'Failed to reject claim.', 'error')
      }
    } catch (error) {
      addToast(error.message || 'Failed to reject claim.', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleViewClaim = async (id) => {
    try {
      setViewLoading(true)
      const response = await claimService.getClaimById(id)
      if (response.status && response.data) {
        setViewingClaim(response.data)
      } else {
        addToast(response.message || 'Failed to load claim details.', 'error')
      }
    } catch (error) {
      addToast(error.message || 'Failed to load claim details.', 'error')
    } finally {
      setViewLoading(false)
    }
  }

  return (
    <div className="page claims-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="claims-header">
        <div>
          <BackButton />
          <h1 className="page-title">My Claims</h1>
          <p className="page-subtitle">Track and manage your item claims.</p>
        </div>
      </div>

      <div className="claims-tabs">
        <button
          className={`claim-tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          My Claims
        </button>
        <button
          className={`claim-tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Received Claims
        </button>
      </div>

      {loading ? (
        <Loading message="Loading claims..." />
      ) : claims.length === 0 ? (
        <div className="empty-state card">
          <div className="card-body">
            <div className="empty-icon">
              <FileCheck size={48} />
            </div>
            <h3 className="empty-title">No claims yet</h3>
            <p className="empty-description">
              {activeTab === 'my'
                ? 'When you find a matching item, you can submit a claim request here.'
                : 'Claims submitted on items you found will appear here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="claims-list card">
          {claims.map((claim) => (
            <div key={claim.id} className="claim-list-item">
              <div className="claim-list-content">
                <div className="claim-list-info">
                  <h3 className="claim-list-title">
                    {activeTab === 'my'
                      ? `Claim for ${foundItemsMap[claim.foundItemId]?.itemName || `Found Item #${claim.foundItemId}`}`
                      : `Claim on your ${foundItemsMap[claim.foundItemId]?.itemName || `Found Item #${claim.foundItemId}`}`}
                  </h3>
                  {getStatusBadge(claim.status)}
                </div>
                <p className="claim-list-meta">
                  <strong>Lost Item:</strong>{' '}
                  {lostItemsMap[claim.lostItemId]?.itemName || `Lost Item #${claim.lostItemId}`}
                </p>
                {activeTab === 'received' && (
                  <p className="claim-list-meta">
                    <strong>Claimant:</strong> User #{claim.claimedBy}
                  </p>
                )}
                <p className="claim-list-meta">
                  <strong>Reason:</strong> {claim.claimReason}
                </p>
                <p className="claim-list-meta">
                  <strong>Submitted:</strong> {formatDate(claim.createdAt)}
                </p>
              </div>
              <div className="claim-list-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleViewClaim(claim.id)}
                  disabled={viewLoading}
                >
                  <Eye size={16} />
                  View
                </button>
                {activeTab === 'received' && claim.status === 'PENDING' && (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleApprove(claim.id)}
                      disabled={processingId === claim.id}
                    >
                      {processingId === claim.id ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReject(claim.id)}
                      disabled={processingId === claim.id}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingClaim && (
        <div className="modal-overlay" onClick={() => setViewingClaim(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Claim Details</h3>
              <button className="modal-close" onClick={() => setViewingClaim(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {viewLoading ? (
                <Loading message="Loading claim details..." />
              ) : (
                <div className="claim-detail-list">
                  <div className="claim-detail-row">
                    <span className="claim-detail-label">Claim ID</span>
                    <span className="claim-detail-value">#{viewingClaim.id}</span>
                  </div>
                  <div className="claim-detail-row">
                    <span className="claim-detail-label">Status</span>
                    <span className="claim-detail-value">{getStatusBadge(viewingClaim.status)}</span>
                  </div>
                  <div className="claim-detail-row">
                    <span className="claim-detail-label">Lost Item</span>
                    <span className="claim-detail-value">
                      {lostItemsMap[viewingClaim.lostItemId]?.itemName || `Lost Item #${viewingClaim.lostItemId}`}
                    </span>
                  </div>
                  <div className="claim-detail-row">
                    <span className="claim-detail-label">Found Item</span>
                    <span className="claim-detail-value">
                      {foundItemsMap[viewingClaim.foundItemId]?.itemName || `Found Item #${viewingClaim.foundItemId}`}
                    </span>
                  </div>
                  {activeTab === 'received' && (
                    <div className="claim-detail-row">
                      <span className="claim-detail-label">Claimant</span>
                      <span className="claim-detail-value">User #{viewingClaim.claimedBy}</span>
                    </div>
                  )}
                  <div className="claim-detail-row">
                    <span className="claim-detail-label">Reason</span>
                    <span className="claim-detail-value">{viewingClaim.claimReason || 'N/A'}</span>
                  </div>
                  <div className="claim-detail-row">
                    <span className="claim-detail-label">Submitted</span>
                    <span className="claim-detail-value">{formatDate(viewingClaim.createdAt)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingClaim(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Claims
