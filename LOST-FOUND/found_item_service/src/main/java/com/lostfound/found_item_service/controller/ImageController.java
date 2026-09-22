package com.lostfound.found_item_service.controller;

import com.lostfound.found_item_service.dto.ImageUploadResponse;
import com.lostfound.found_item_service.service.ImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/image")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ImageUploadResponse> uploadImage(
            @RequestParam("image") MultipartFile image) {

        ImageUploadResponse response = imageService.uploadImage(image);

        return ResponseEntity.ok(response);
    }
}