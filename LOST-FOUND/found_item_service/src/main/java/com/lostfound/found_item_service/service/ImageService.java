package com.lostfound.found_item_service.service;

import com.lostfound.found_item_service.dto.ImageUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface ImageService {

    //String uploadImage(MultipartFile file);

    ImageUploadResponse uploadImage(MultipartFile file);

    void deleteImage(String imagePublicId);
}