package com.lostfound.found_item_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class MatchResponse {

    private Long id;
    private String itemName;
    private String description;
    private String category;
    private String location;
    private LocalDate foundDate;
    private String imageUrl;
    private int matchScore;
}