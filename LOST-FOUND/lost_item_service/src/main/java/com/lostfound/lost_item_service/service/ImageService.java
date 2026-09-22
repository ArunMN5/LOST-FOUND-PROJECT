package com.lostfound.lost_item_service.service;

import com.lostfound.lost_item_service.dto.ImageUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ImageService {

    ImageUploadResponse uploadImage(MultipartFile file);

    void deleteImage(String imagePublicId);
}