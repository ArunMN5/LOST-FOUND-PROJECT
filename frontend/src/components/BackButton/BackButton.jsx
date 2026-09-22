import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './BackButton.css'

const BackButton = ({ to = '/dashboard', label = 'Back' }) => {
  return (
    <Link to={to} className="back-button">
      <ArrowLeft size={16} />
      <span>{label}</span>
    </Link>
  )
}

export default BackButton
