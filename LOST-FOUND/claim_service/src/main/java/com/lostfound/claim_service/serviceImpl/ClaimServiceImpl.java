package com.lostfound.claim_service.serviceImpl;

import com.lostfound.claim_service.client.FoundItemClient;
import com.lostfound.claim_service.client.LostItemClient;
import com.lostfound.claim_service.client.UserClient;
import com.lostfound.claim_service.dto.ClaimRequest;
import com.lostfound.claim_service.dto.Response;
import com.lostfound.claim_service.entity.Claim;
import com.lostfound.claim_service.repository.ClaimRepository;
import com.lostfound.claim_service.service.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final UserClient userClient;
    private final LostItemClient lostItemClient;
    private final FoundItemClient foundItemClient;

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";

    @Override
    public Response createClaim(ClaimRequest request, String token) {

        Map<String, Object> userData = userClient.getProfile(token);

        if (userData == null) {
            return new Response("User not found", false, HttpStatus.NOT_FOUND, null);
        }

        Long loggedInUserId = ((Number) userData.get("id")).longValue();

        // Verify lost item exists and belongs to logged-in user
        Map<String, Object> lostItem = lostItemClient.getLostItemById(request.getLostItemId(), token);

        if (lostItem == null) {
            return new Response("Lost item not found", false, HttpStatus.NOT_FOUND, null);
        }

        Long lostItemOwnerId = ((Number) lostItem.get("userId")).longValue();

        if (!lostItemOwnerId.equals(loggedInUserId)) {
            return new Response("You can only claim for your own lost item", false, HttpStatus.FORBIDDEN, null);
        }

        // Verify found item exists
        Map<String, Object> foundItem = foundItemClient.getFoundItemById(request.getFoundItemId(), token);

        if (foundItem == null) {
            return new Response("Found item not found", false, HttpStatus.NOT_FOUND, null);
        }

        Long foundItemOwnerId = ((Number) foundItem.get("userId")).longValue();

        // Prevent duplicate PENDING claim
        Optional<Claim> existingClaim = claimRepository
                .findByLostItemIdAndFoundItemIdAndClaimedBy(
                        request.getLostItemId(),
                        request.getFoundItemId(),
                        loggedInUserId);

        if (existingClaim.isPresent() && STATUS_PENDING.equals(existingClaim.get().getStatus())) {
            return new Response("Claim already exists for this item", false, HttpStatus.CONFLICT, null);
        }

        Claim claim = new Claim();
        claim.setLostItemId(request.getLostItemId());
        claim.setFoundItemId(request.getFoundItemId());
        claim.setClaimedBy(loggedInUserId);
        claim.setFoundItemOwnerId(foundItemOwnerId);
        claim.setClaimReason(request.getClaimReason());
        claim.setStatus(STATUS_PENDING);
        claim.setCreatedAt(LocalDateTime.now());

        Claim savedClaim = claimRepository.save(claim);

        return new Response("Claim created successfully", true, HttpStatus.CREATED, savedClaim);
    }

    @Override
    public Response getClaimById(Long id) {

        Optional<Claim> claim = claimRepository.findById(id);

        if (claim.isEmpty()) {
            return new Response("Claim not found", false, HttpStatus.NOT_FOUND, null);
        }

        return new Response("Claim fetched successfully", true, HttpStatus.OK, claim.get());
    }

    @Override
    public Response getMyClaims(Long claimedBy) {

        List<Claim> claims = claimRepository.findByClaimedBy(claimedBy);

        return new Response("Claims fetched successfully", true, HttpStatus.OK, claims);
    }

    @Override
    public Response getReceivedClaims(Long foundItemOwnerId) {

        List<Claim> claims = claimRepository.findByFoundItemOwnerId(foundItemOwnerId);

        return new Response("Received claims fetched successfully", true, HttpStatus.OK, claims);
    }

    @Override
    public Response approveClaim(Long id, Long foundItemOwnerId) {

        Optional<Claim> claimOptional = claimRepository.findById(id);

        if (claimOptional.isEmpty()) {
            return new Response("Claim not found", false, HttpStatus.NOT_FOUND, null);
        }

        Claim claim = claimOptional.get();

        if (!claim.getFoundItemOwnerId().equals(foundItemOwnerId)) {
            return new Response("Only the found item owner can approve this claim", false, HttpStatus.FORBIDDEN, null);
        }

        if (!STATUS_PENDING.equals(claim.getStatus())) {
            return new Response("Claim can only be approved from PENDING status", false, HttpStatus.BAD_REQUEST, null);
        }

        claim.setStatus(STATUS_APPROVED);
        Claim updatedClaim = claimRepository.save(claim);

        return new Response("Claim approved successfully", true, HttpStatus.OK, updatedClaim);
    }

    @Override
    public Response rejectClaim(Long id, Long foundItemOwnerId) {

        Optional<Claim> claimOptional = claimRepository.findById(id);

        if (claimOptional.isEmpty()) {
            return new Response("Claim not found", false, HttpStatus.NOT_FOUND, null);
        }

        Claim claim = claimOptional.get();

        if (!claim.getFoundItemOwnerId().equals(foundItemOwnerId)) {
            return new Response("Only the found item owner can reject this claim", false, HttpStatus.FORBIDDEN, null);
        }

        if (!STATUS_PENDING.equals(claim.getStatus())) {
            return new Response("Claim can only be rejected from PENDING status", false, HttpStatus.BAD_REQUEST, null);
        }

        claim.setStatus(STATUS_REJECTED);
        Claim updatedClaim = claimRepository.save(claim);

        return new Response("Claim rejected successfully", true, HttpStatus.OK, updatedClaim);
    }

}
