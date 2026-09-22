import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as foundItemService from '../../services/foundItemService'
import * as lostItemService from '../../services/lostItemService'
import * as claimService from '../../services/claimService.js'
import Loading from '../../components/Loading/Loading.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import { ArrowLeft, Search, Filter } from 'lucide-react'
import './Matches.css'

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const Matches = () => {
  const { lostItemId } = useParams()
  const navigate = useNavigate()
  const [lostItem, setLostItem] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [claimModal, setClaimModal] = useState({ open: false, match: null })
  const [claimReason, setClaimReason] = useState('')
  const [submittingClaim, setSubmittingClaim] = useState(false)
  const [myClaims, setMyClaims] = useState([])
  const [claimsLoading, setClaimsLoading] = useState(true)
  const { toasts, addToast, removeToast } = useToast()

  const fetchMyClaims = async () => {
    try {
      setClaimsLoading(true)
      const response = await claimService.getMyClaims()
      setMyClaims(response.data || [])
    } catch (error) {
      addToast(error.message || 'Failed to load your claims.', 'error')
      setMyClaims([])
    } finally {
      setClaimsLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [lostResponse, matchesResponse] = await Promise.all([
          lostItemService.getLostItemById(lostItemId),
          foundItemService.findMatchingFoundItems(lostItemId)
        ])

        setLostItem(lostResponse.data)

        const matchData = matchesResponse.data || []
        const sortedMatches = Array.isArray(matchData)
          ? [...matchData].sort((a, b) => b.matchScore - a.matchScore)
          : []
        setMatches(sortedMatches)
      } catch (error) {
        addToast(error.message || 'Failed to load matching items.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    fetchMyClaims()
  }, [lostItemId, addToast])

  const getClaimForMatch = (match) => {
    return myClaims.find(
      (claim) =>
        claim.lostItemId === Number(lostItemId) && claim.foundItemId === Number(match.id)
    )
  }

  const openClaimModal = (match) => {
    setClaimModal({ open: true, match })
    setClaimReason('')
  }

  const closeClaimModal = () => {
    setClaimModal({ open: false, match: null })
    setClaimReason('')
  }

  const handleSubmitClaim = async (e) => {
    e.preventDefault()

    if (!claimReason.trim()) {
      addToast('Please provide a claim reason.', 'error')
      return
    }

    try {
      setSubmittingClaim(true)
      const response = await claimService.createClaim({
        lostItemId: Number(lostItemId),
        foundItemId: claimModal.match.id,
        claimReason: claimReason.trim()
      })

      if (response.status) {
        addToast('Claim submitted successfully. Status: PENDING', 'success')
        closeClaimModal()
        fetchMyClaims()
      } else {
        addToast(response.message || 'Failed to submit claim.', 'error')
      }
    } catch (error) {
      addToast(error.message || 'Failed to submit claim.', 'error')
    } finally {
      setSubmittingClaim(false)
    }
  }

  if (loading) {
    return <Loading message="Finding matches..." />
  }

  return (
    <div className="matches-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <button className="btn btn-ghost back-btn" onClick={() => navigate('/search-items')}>
        <ArrowLeft size={18} />
        Back to Search
      </button>

      <div className="matches-header">
        <div>
          <h1 className="page-title">My Matches</h1>
          <p className="page-subtitle">
            Items that may match with your lost item
            {lostItem && <strong> "{lostItem.itemName}"</strong>}.
          </p>
        </div>
      </div>

      <div className="matches-tabs">
        <button
          className={`match-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Matches
        </button>
        <button
          className={`match-tab ${activeTab === 'lost' ? 'active' : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          Lost Items
        </button>
        <button
          className={`match-tab ${activeTab === 'found' ? 'active' : ''}`}
          onClick={() => setActiveTab('found')}
        >
          Found Items
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state card">
          <div className="card-body">
            <div className="empty-icon">
              <Search size={48} />
            </div>
            <h3 className="empty-title">No matching found items</h3>
            <p className="empty-description">
              We couldn't find any found items that closely match your lost item. Check back later.
            </p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/search-items')}>
              Browse Items
            </button>
          </div>
        </div>
      ) : (
        <div className="matches-list card">
          {matches.map((match) => (
            <div key={match.id} className="match-list-item">
              <div className="match-list-image">
                {match.imageUrl ? (
                  <img src={match.imageUrl} alt={match.itemName} />
                ) : (
                  <div className="match-list-no-image">No Image</div>
                )}
              </div>
              <div className="match-list-content">
                <div className="match-list-info">
                  <h3 className="match-list-title">{match.itemName}</h3>
                  <span className="badge badge-found">Found</span>
                </div>
                <p className="match-list-meta">
                  {match.category} · {match.location} · {formatDate(match.foundDate)}
                </p>
              </div>
              <div className="match-list-score">
                <div className="match-score-ring" style={{ '--score': `${match.matchScore}%` }}>
                  <span>{match.matchScore}%</span>
                </div>
              </div>
              <div className="match-list-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/found-items/${match.id}`)}
                >
                  View
                </button>
                {(() => {
                  const existingClaim = getClaimForMatch(match)
                  if (existingClaim) {
                    return (
                      <span className="match-claim-status">
                        Claim Status: <strong>{existingClaim.status}</strong>
                      </span>
                    )
                  }
                  return (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => openClaimModal(match)}
                      disabled={claimsLoading}
                    >
                      Claim This Item
                    </button>
                  )
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {claimModal.open && (
        <div className="modal-overlay" onClick={closeClaimModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Claim This Item</h3>
              <button className="modal-close" onClick={closeClaimModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitClaim}>
              <div className="modal-body">
                <p className="modal-subtitle">
                  You are claiming <strong>{claimModal.match.itemName}</strong> that was found at{' '}
                  <strong>{claimModal.match.location}</strong>.
                </p>
                <div className="form-group">
                  <label htmlFor="claimReason" className="form-label">
                    Claim Reason
                  </label>
                  <textarea
                    id="claimReason"
                    className="form-textarea"
                    placeholder="Explain why this item belongs to you..."
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeClaimModal}
                  disabled={submittingClaim}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingClaim}
                >
                  {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Matches
