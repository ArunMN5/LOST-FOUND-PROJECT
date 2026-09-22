import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './Home.css'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Lost & Found</h1>
            <p className="hero-subtitle">
              Reconnect with your belongings. Report lost items, share found items,
              and let our matching system help bring things back together.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/report-lost" className="btn btn-primary btn-lg">
                    Report Lost Item
                  </Link>
                  <Link to="/report-found" className="btn btn-success btn-lg">
                    Report Found Item
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">Report Lost Item</h3>
              <p className="step-description">
                Describe what you lost, where, and when. Upload a photo to help others identify it.
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Upload Details + Image</h3>
              <p className="step-description">
                Add a clear image and important details like category and location.
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">System Searches Found Items</h3>
              <p className="step-description">
                Our matching algorithm scans reported found items for possible matches.
              </p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3 className="step-title">Matching Items Displayed</h3>
              <p className="step-description">
                Review potential matches ranked by score and recover your belongings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card card">
            <div className="card-body text-center">
              <h2 className="cta-title">Found something?</h2>
              <p className="cta-description">
                Help someone get their item back by reporting what you found.
              </p>
              <Link to={isAuthenticated ? '/report-found' : '/register'} className="btn btn-success btn-lg">
                Report Found Item
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
