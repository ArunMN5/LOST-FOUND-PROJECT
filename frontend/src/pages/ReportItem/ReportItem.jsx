import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AddLostItem from '../AddLostItem/AddLostItem.jsx'
import AddFoundItem from '../AddFoundItem/AddFoundItem.jsx'
import './ReportItem.css'

const ReportItem = ({ defaultTab }) => {
  const [searchParams] = useSearchParams()
  const initialTab = defaultTab || searchParams.get('type') || 'lost'
  const [activeTab, setActiveTab] = useState(initialTab)

  return (
    <div className="page report-item-page">
      <div className="report-item-header">
        <div>
          <h1 className="page-title">Report Item</h1>
          <p className="page-subtitle">Provide details about the item you lost or found.</p>
        </div>
      </div>

      <div className="report-tabs">
        <button
          className={`report-tab ${activeTab === 'lost' ? 'active' : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          Lost Item
        </button>
        <button
          className={`report-tab ${activeTab === 'found' ? 'active' : ''}`}
          onClick={() => setActiveTab('found')}
        >
          Found Item
        </button>
      </div>

      <div className="report-item-form-wrapper">
        {activeTab === 'lost' ? <AddLostItem embedded /> : <AddFoundItem embedded />}
      </div>
    </div>
  )
}

export default ReportItem
