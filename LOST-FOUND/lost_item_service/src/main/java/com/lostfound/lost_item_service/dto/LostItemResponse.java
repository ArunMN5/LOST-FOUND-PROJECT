package com.lostfound.lost_item_service.dto;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LostItemResponse {

    private Long id;
    private String itemName;
    private String description;
    private String category;
    private String location;
    private LocalDate lostDate;
    private String status;
    private Long userId;

}