package com.lostfound.found_item_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageUploadResponse {

    private String imageUrl;
    private String imagePublicId;
}