package com.lostfound.claim_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long lostItemId;

    private Long foundItemId;

    private Long claimedBy;

    private Long foundItemOwnerId;

    private String claimReason;

    private String status;

    private LocalDateTime createdAt;

}
