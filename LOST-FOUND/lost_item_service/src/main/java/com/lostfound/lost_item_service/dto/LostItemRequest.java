package com.lostfound.lost_item_service.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LostItemRequest {

    private String itemName;
    private String description;
    private String category;
    private String location;
    private LocalDate lostDate;
}