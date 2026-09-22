package com.lostfound.claim_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimRequest {

    private Long lostItemId;

    private Long foundItemId;

    private String claimReason;

}
