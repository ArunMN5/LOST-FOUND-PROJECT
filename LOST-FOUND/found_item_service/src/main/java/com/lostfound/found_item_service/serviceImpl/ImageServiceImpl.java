package com.lostfound.found_item_service.serviceImpl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lostfound.found_item_service.dto.ImageUploadResponse;
import com.lostfound.found_item_service.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {

    private final Cloudinary cloudinary;

    @Override
    public ImageUploadResponse uploadImage(MultipartFile file) {

        try {

            Map uploadResult = cloudinary.uploader().upload(file.getBytes()
                    , ObjectUtils.asMap("folder", "lost-found"));

            String imageUrl = uploadResult.get("secure_url").toString();

            String imagePublicId = uploadResult.get("public_id").toString();

            return new ImageUploadResponse(imageUrl, imagePublicId);

        } catch (IOException e) {

            throw new RuntimeException("Image upload failed", e);
        }
    }

    @Override
    public void deleteImage(String imagePublicId) {

        try {
            cloudinary.uploader().destroy(imagePublicId, ObjectUtils.emptyMap());

        } catch (Exception e) {
            throw new RuntimeException("Image deletion failed", e);
        }
    }
}