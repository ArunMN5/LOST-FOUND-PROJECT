package com.lostfound.claim_service.service;

import com.lostfound.claim_service.dto.ClaimRequest;
import com.lostfound.claim_service.dto.Response;

public interface ClaimService {

    Response createClaim(ClaimRequest request, String token);

    Response getClaimById(Long id);

    Response getMyClaims(Long claimedBy);

    Response getReceivedClaims(Long foundItemOwnerId);

    Response approveClaim(Long id, Long foundItemOwnerId);

    Response rejectClaim(Long id, Long foundItemOwnerId);

}
