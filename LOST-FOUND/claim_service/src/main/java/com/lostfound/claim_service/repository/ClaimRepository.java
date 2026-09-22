package com.lostfound.claim_service.repository;

import com.lostfound.claim_service.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByClaimedBy(Long claimedBy);

    List<Claim> findByFoundItemOwnerId(Long foundItemOwnerId);

    Optional<Claim> findByLostItemIdAndFoundItemIdAndClaimedBy(Long lostItemId, Long foundItemId, Long claimedBy);

}
