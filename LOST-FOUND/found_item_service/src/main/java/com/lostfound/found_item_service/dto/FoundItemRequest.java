package com.lostfound.found_item_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoundItemRequest {

    private String itemName;

    private String description;

    private String category;

    private String location;

    private LocalDate foundDate;

    private Long userId;
}