import { useEffect, useState } from 'react'
import * as claimService from '../services/claimService'

const useNotificationCount = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [myClaimsResponse, receivedClaimsResponse] = await Promise.all([
          claimService.getMyClaims(),
          claimService.getReceivedClaims()
        ])

        const myClaims = myClaimsResponse.data || []
        const receivedClaims = receivedClaimsResponse.data || []

        const pendingMyClaims = myClaims.filter((claim) => claim.status === 'PENDING').length
        const pendingReceivedClaims = receivedClaims.filter((claim) => claim.status === 'PENDING').length

        setCount(pendingMyClaims + pendingReceivedClaims)
      } catch (error) {
        // Fail silently — notification badge is non-critical
        setCount(0)
      }
    }

    fetchCounts()
  }, [])

  return count
}

export default useNotificationCount
