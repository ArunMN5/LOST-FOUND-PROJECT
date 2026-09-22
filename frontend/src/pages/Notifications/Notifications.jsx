import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCircle, FileText, Info, Clock, XCircle } from 'lucide-react'
import * as claimService from '../../services/claimService'
import * as lostItemService from '../../services/lostItemService'
import * as foundItemService from '../../services/foundItemService'
import Loading from '../../components/Loading/Loading.jsx'
import Toast from '../../components/Toast/Toast.jsx'
import useToast from '../../hooks/useToast.js'
import './Notifications.css'

const formatTime = (dateString) => {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [myClaimsResponse, receivedClaimsResponse, lostResponse, foundResponse] = await Promise.all([
          claimService.getMyClaims(),
          claimService.getReceivedClaims(),
          lostItemService.getAllLostItems(),
          foundItemService.getAllFoundItems()
        ])

        const myClaims = myClaimsResponse.data || []
        const receivedClaims = receivedClaimsResponse.data || []
        const lostItems = lostResponse.data || []
        const foundItems = foundResponse.data || []

        const lostMap = {}
        const foundMap = {}
        lostItems.forEach((item) => (lostMap[item.id] = item))
        foundItems.forEach((item) => (foundMap[item.id] = item))

        const derived = []

        myClaims.forEach((claim) => {
          const foundItem = foundMap[claim.foundItemId]
          const lostItem = lostMap[claim.lostItemId]
          let title = 'Claim Submitted'
          let message = `You submitted a claim for "${foundItem?.itemName || 'a found item'}".`
          let type = 'claim'

          if (claim.status === 'APPROVED') {
            title = 'Claim Approved'
            message = `Your claim for "${foundItem?.itemName || 'a found item'}" was approved.`
            type = 'approved'
          } else if (claim.status === 'REJECTED') {
            title = 'Claim Rejected'
            message = `Your claim for "${foundItem?.itemName || 'a found item'}" was rejected.`
            type = 'rejected'
          }

          derived.push({
            id: `my-${claim.id}`,
            title,
            message,
            time: formatTime(claim.createdAt),
            type,
            read: claim.status !== 'PENDING',
            link: '/claims'
          })
        })

        receivedClaims.forEach((claim) => {
          const foundItem = foundMap[claim.foundItemId]
          const lostItem = lostMap[claim.lostItemId]
          derived.push({
            id: `received-${claim.id}`,
            title: 'New Claim Request',
            message: `Someone claimed "${foundItem?.itemName || 'your found item'}" via your lost item "${lostItem?.itemName || 'item'}".`,
            time: formatTime(claim.createdAt),
            type: 'claim',
            read: claim.status !== 'PENDING',
            link: '/claims'
          })
        })

        derived.sort((a, b) => new Date(b.time) - new Date(a.time))
        setNotifications(derived)
      } catch (error) {
        addToast(error.message || 'Failed to load notifications.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [addToast])

  const getIcon = (type) => {
    switch (type) {
      case 'approved':
        return <CheckCircle size={20} />
      case 'rejected':
        return <XCircle size={20} />
      case 'claim':
        return <FileText size={20} />
      default:
        return <Info size={20} />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="page notifications-page">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="notifications-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
              : 'Stay updated with the latest activity.'}
          </p>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <div className="empty-state card">
          <div className="card-body text-center">
            <div className="empty-icon">
              <Bell size={48} />
            </div>
            <h3 className="empty-title">No notifications yet</h3>
            <p className="empty-description">
              Notifications about your claims and matching items will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="notifications-list card">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              to={notification.link}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className={`notification-icon notification-${notification.type}`}>
                {getIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h4 className="notification-title">{notification.title}</h4>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  <Clock size={12} /> {notification.time}
                </span>
              </div>
              {!notification.read && <span className="notification-dot" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
