import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Search, Package, FileCheck, ChevronRight } from 'lucide-react'
import Loading from '../../components/Loading/Loading.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import * as lostItemService from '../../services/lostItemService'
import * as foundItemService from '../../services/foundItemService'
import * as claimService from '../../services/claimService'
import './Dashboard.css'

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

const ItemSection = ({ title, viewAllLink, items, emptyTitle, emptyDescription, reportLink, reportLabel }) => {
  return (
    <div className="recent-section">
      <div className="recent-section-header">
        <h2 className="section-title">{title}</h2>
        <Link to={viewAllLink} className="view-all-link">
          View All
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-state card">
          <div className="card-body">
            <h3 className="empty-title">{emptyTitle}</h3>
            <p className="empty-description">{emptyDescription}</p>
            {reportLink && (
              <Link to={reportLink} className="btn btn-primary mt-4">
                {reportLabel}
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="recent-grid">
          {items.map((item) => {
            const itemId = item.id || item._id
            return (
              <Link
                key={`${item.itemType}-${itemId}`}
                to={`/${item.itemType}-items/${itemId}`}
                className="recent-card card"
              >
                <div className="recent-card-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.itemName} />
                  ) : (
                    <div className="recent-card-no-image">
                      <Package size={24} />
                    </div>
                  )}
                  <span className={`recent-card-badge badge badge-${item.itemType}`}>
                    {item.itemType}
                  </span>
                </div>
                <div className="recent-card-body">
                  <h3 className="recent-card-title">{item.itemName}</h3>
                  <p className="recent-card-meta">
                    {item.location} · {formatDate(item.lostDate || item.foundDate)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    lostCount: 0,
    foundCount: 0,
    myLostCount: 0,
    myFoundCount: 0,
    claimsCount: 0,
    pendingClaimsCount: 0,
    loading: true
  })
  const [recentItems, setRecentItems] = useState([])
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [recentClaims, setRecentClaims] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const { toasts, addToast, removeToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          lostItemService.getAllLostItems(),
          foundItemService.getAllFoundItems(),
          claimService.getMyClaims()
        ]

        if (user?.id) {
          promises.push(
            lostItemService.getLostItemsByUserId(user.id),
            foundItemService.getFoundItemsByUserId(user.id)
          )
        }

        const [lostResponse, foundResponse, claimsResponse, myLostResponse, myFoundResponse] =
          await Promise.all(promises)

        const lostItems = lostResponse.data || []
        const foundItems = foundResponse.data || []
        const claimsList = claimsResponse.data || []
        const myLostItems = myLostResponse?.data || []
        const myFoundItems = myFoundResponse?.data || []

        setStats({
          lostCount: lostItems.length,
          foundCount: foundItems.length,
          myLostCount: myLostItems.length,
          myFoundCount: myFoundItems.length,
          claimsCount: claimsList.length,
          pendingClaimsCount: claimsList.filter((c) => c.status === 'PENDING').length,
          loading: false
        })

        const allItems = [
          ...lostItems.map((item) => ({ ...item, itemType: 'lost' })),
          ...foundItems.map((item) => ({ ...item, itemType: 'found' }))
        ]
          .sort((a, b) => new Date(b.lostDate || b.foundDate) - new Date(a.lostDate || a.foundDate))
          .slice(0, 4)

        setLostItems(lostItems)
        setFoundItems(foundItems)
        setRecentItems(allItems)
        setRecentClaims(claimsList.slice(0, 5))
      } catch (error) {
        addToast(error.message || 'Failed to load dashboard data.', 'error')
        setStats((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchData()
  }, [user, addToast])

  const statCards = [
    {
      label: 'Total Lost Items',
      value: stats.lostCount,
      icon: Package,
      color: 'danger',
      link: '/search-items?type=lost',
      footer: 'View items'
    },
    {
      label: 'Total Found Items',
      value: stats.foundCount,
      icon: Package,
      color: 'success',
      link: '/search-items?type=found',
      footer: 'View items'
    },
    {
      label: 'My Lost Items',
      value: stats.myLostCount,
      icon: Package,
      color: 'danger',
      link: '/lost-items?mine=true',
      footer: 'View my items'
    },
    {
      label: 'My Found Items',
      value: stats.myFoundCount,
      icon: Package,
      color: 'success',
      link: '/found-items?mine=true',
      footer: 'View my items'
    },
    {
      label: 'My Claims',
      value: stats.claimsCount,
      icon: FileCheck,
      color: 'info',
      link: '/claims',
      footer: 'View Claims',
      pendingCount: stats.pendingClaimsCount
    },
    {
      label: 'Total Items',
      value: stats.lostCount + stats.foundCount,
      icon: Package,
      color: 'danger',
      link: '/search-items',
      footer: 'View items'
    }
  ]

  return (
    <div className="dashboard-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Hello, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}! 👋</h1>
          <p className="dashboard-subtitle">Together we can bring lost items back home.</p>
        </div>
        <div className="dashboard-search">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search for items, category, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/search-items?search=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (searchQuery.trim()) {
                navigate(`/search-items?search=${encodeURIComponent(searchQuery.trim())}`)
              }
            }}
          >
            Search
          </button>
        </div>
      </div>

      {stats.loading ? (
        <Loading message="Loading dashboard..." />
      ) : (
        <>
          <div className="stats-grid grid grid-4">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <Link key={card.label} to={card.link} className={`stat-card stat-card-${card.color}`}>
                  <div className="stat-card-body">
                    <div className="stat-card-icon">
                      <Icon size={24} />
                    </div>
                    <div className="stat-card-info">
                      <span className="stat-card-value">{card.value}</span>
                      <span className="stat-card-label">{card.label}</span>
                      {card.pendingCount > 0 && (
                        <span className="stat-card-pending">{card.pendingCount} Pending</span>
                      )}
                    </div>
                  </div>
                  <div className="stat-card-footer">
                    <span>{card.footer}</span>
                    <ChevronRight size={16} />
                  </div>
                </Link>
              )
            })}
          </div>

          <ItemSection
            title="Recent Items"
            viewAllLink="/search-items"
            items={recentItems}
            emptyTitle="No items yet"
            emptyDescription="Start by reporting a lost or found item."
            reportLink="/report-item"
            reportLabel="Report Item"
          />

          <ItemSection
            title="Lost Items"
            viewAllLink="/lost-items"
            items={lostItems
              .slice()
              .sort((a, b) => new Date(b.lostDate) - new Date(a.lostDate))
              .slice(0, 4)
              .map((item) => ({ ...item, itemType: 'lost' }))}
            emptyTitle="No lost items yet"
            emptyDescription="Be the first to report a lost item and let others help you find it."
            reportLink="/report-lost"
            reportLabel="Report Lost Item"
          />

          <ItemSection
            title="Found Items"
            viewAllLink="/found-items"
            items={foundItems
              .slice()
              .sort((a, b) => new Date(b.foundDate) - new Date(a.foundDate))
              .slice(0, 4)
              .map((item) => ({ ...item, itemType: 'found' }))}
            emptyTitle="No found items yet"
            emptyDescription="Be the first to report a found item and help someone recover their belongings."
            reportLink="/report-found"
            reportLabel="Report Found Item"
          />

          <div className="recent-section">
            <div className="recent-section-header">
              <h2 className="section-title">Recent Claim Activity</h2>
              <Link to="/claims" className="view-all-link">
                View All
              </Link>
            </div>

            {recentClaims.length === 0 ? (
              <div className="empty-state card">
                <div className="card-body">
                  <h3 className="empty-title">No claims yet</h3>
                  <p className="empty-description">
                    Submit a claim when you find a matching item.
                  </p>
                  <Link to="/search-items" className="btn btn-primary mt-4">
                    Browse Items
                  </Link>
                </div>
              </div>
            ) : (
              <div className="claims-summary-list card">
                {recentClaims.map((claim) => (
                  <div key={claim.id} className="claims-summary-item">
                    <div className="claims-summary-info">
                      <span className={`badge badge-${claim.status?.toLowerCase() || 'pending'}`}>
                        {claim.status || 'PENDING'}
                      </span>
                      <span className="claims-summary-meta">
                        Claim #{claim.id} · {formatDate(claim.createdAt)}
                      </span>
                    </div>
                    <Link to="/claims" className="btn btn-secondary btn-sm">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
