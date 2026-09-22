package com.lostfound.claim_service.controller;

import com.lostfound.claim_service.client.UserClient;
import com.lostfound.claim_service.dto.ClaimRequest;
import com.lostfound.claim_service.dto.Response;
import com.lostfound.claim_service.service.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/claim")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;
    private final UserClient userClient;

    @PostMapping("/create")
    public ResponseEntity<Response> createClaim(
            @RequestBody ClaimRequest request,
            Authentication authentication) {

        String token = authentication.getCredentials().toString();
        Response response = claimService.createClaim(request, token);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getClaimById(@PathVariable Long id) {

        Response response = claimService.getClaimById(id);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @GetMapping("/my")
    public ResponseEntity<Response> getMyClaims(Authentication authentication) {

        Long claimedBy = getCurrentUserId(authentication);
        Response response = claimService.getMyClaims(claimedBy);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @GetMapping("/received")
    public ResponseEntity<Response> getReceivedClaims(Authentication authentication) {

        Long foundItemOwnerId = getCurrentUserId(authentication);
        Response response = claimService.getReceivedClaims(foundItemOwnerId);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Response> approveClaim(
            @PathVariable Long id,
            Authentication authentication) {

        Long foundItemOwnerId = getCurrentUserId(authentication);
        Response response = claimService.approveClaim(id, foundItemOwnerId);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Response> rejectClaim(
            @PathVariable Long id,
            Authentication authentication) {

        Long foundItemOwnerId = getCurrentUserId(authentication);
        Response response = claimService.rejectClaim(id, foundItemOwnerId);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    private Long getCurrentUserId(Authentication authentication) {
        String token = authentication.getCredentials().toString();
        Map<String, Object> userData = userClient.getProfile(token);
        return ((Number) userData.get("id")).longValue();
    }

}
