package com.lostfound.found_item_service.serviceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostfound.found_item_service.client.LostItemClient;
import com.lostfound.found_item_service.client.UserClient;
import com.lostfound.found_item_service.dto.FoundItemRequest;
import com.lostfound.found_item_service.dto.ImageUploadResponse;
import com.lostfound.found_item_service.dto.Response;
import com.lostfound.found_item_service.entity.FoundItem;
import com.lostfound.found_item_service.repository.FoundItemRepository;
import com.lostfound.found_item_service.service.FoundItemService;
import com.lostfound.found_item_service.service.ImageService;
import com.lostfound.user_service.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.lostfound.found_item_service.client.LostItemClient;
import com.lostfound.found_item_service.dto.MatchResponse;

import java.util.ArrayList;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FoundItemServiceImpl implements FoundItemService {

    private final FoundItemRepository foundItemRepository;
    private final UserClient userClient;
    private final ImageService imageService;
    private final LostItemClient lostItemClient;

    @Override
    public Response addFoundItem(FoundItemRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String token = authentication.getCredentials().toString();

        Response userResponse = userClient.getProfile(token);

        Map<String, Object> userData = (Map<String, Object>) userResponse.getData();

        Long userId = ((Number) userData.get("id")).longValue();

        FoundItem foundItem = new FoundItem();

        foundItem.setItemName(request.getItemName());
        foundItem.setDescription(request.getDescription());
        foundItem.setCategory(request.getCategory());
        foundItem.setLocation(request.getLocation());
        foundItem.setFoundDate(request.getFoundDate());
        foundItem.setUserId(userId);
        foundItem.setStatus("FOUND");

        if (request.getImage() != null && !request.getImage().isEmpty()) {

            ImageUploadResponse imageResponse = imageService.uploadImage(request.getImage());

            foundItem.setImageUrl(imageResponse.getImageUrl());
            foundItem.setImagePublicId(imageResponse.getImagePublicId());
        }

        foundItemRepository.save(foundItem);

        return new Response("Found item added successfully", true, HttpStatus.CREATED, foundItem);
    }

    @Override
    public Response getFoundItemById(Long id) {

        FoundItem foundItem = foundItemRepository.findById(id).orElse(null);

        if (foundItem == null) {
            return new Response("Found item not found", false, HttpStatus.NOT_FOUND, null);
        }

        return new Response("Found item fetched successfully", true, HttpStatus.OK, foundItem);
    }

    @Override
    public Response getAllFoundItems() {

        List<FoundItem> foundItems = foundItemRepository.findAll();

        return new Response("Found items fetched successfully", true, HttpStatus.OK, foundItems);
    }

//    @Override
//    public Response updateFoundItem(Long id, FoundItemRequest request) {
//
//        FoundItem foundItem = foundItemRepository.findById(id).orElse(null);
//
//        if (foundItem == null) {
//            return new Response("Found item not found", false, HttpStatus.NOT_FOUND, null);
//        }
//
//        foundItem.setItemName(request.getItemName());
//        foundItem.setDescription(request.getDescription());
//        foundItem.setCategory(request.getCategory());
//        foundItem.setLocation(request.getLocation());
//        foundItem.setFoundDate(request.getFoundDate());
//
//        // If a new image is provided
//        if (request.getImage() != null && !request.getImage().isEmpty()) {
//
//            // Delete old image from Cloudinary
//            if (foundItem.getImagePublicId() != null && !foundItem.getImagePublicId().isEmpty()) {
//                imageService.deleteImage(foundItem.getImagePublicId());
//            }
//
//            // Upload new image
//            ImageUploadResponse imageResponse = imageService.uploadImage(request.getImage());
//
//            foundItem.setImageUrl(imageResponse.getImageUrl());
//            foundItem.setImagePublicId(imageResponse.getImagePublicId());
//        }
//
//        foundItemRepository.save(foundItem);
//
//        return new Response("Found item updated successfully", true, HttpStatus.OK, foundItem);
//    }

    @Override
    public Response updateFoundItem(Long id, FoundItemRequest request) {

        FoundItem foundItem = foundItemRepository.findById(id)
                .orElse(null);

        if (foundItem == null) {
            return new Response(
                    "Found item not found",
                    false,
                    HttpStatus.NOT_FOUND,
                    null
            );
        }

        String token = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getCredentials()
                .toString();

        Response userResponse = userClient.getProfile(token);

        Map<String, Object> userData =
                (Map<String, Object>) userResponse.getData();

        Long loggedInUserId =
                ((Number) userData.get("id")).longValue();

        String role =
                (String) userData.get("role");

        boolean isAdmin =
                "ADMIN".equalsIgnoreCase(role);

        if (!isAdmin &&
                !foundItem.getUserId().equals(loggedInUserId)) {

            return new Response(
                    "You can update only your own found item",
                    false,
                    HttpStatus.FORBIDDEN,
                    null
            );
        }

        foundItem.setItemName(request.getItemName());
        foundItem.setDescription(request.getDescription());
        foundItem.setCategory(request.getCategory());
        foundItem.setLocation(request.getLocation());
        foundItem.setFoundDate(request.getFoundDate());

        if (request.getImage() != null &&
                !request.getImage().isEmpty()) {

            if (foundItem.getImagePublicId() != null &&
                    !foundItem.getImagePublicId().isEmpty()) {

                imageService.deleteImage(
                        foundItem.getImagePublicId()
                );
            }

            ImageUploadResponse imageResponse =
                    imageService.uploadImage(request.getImage());

            foundItem.setImageUrl(
                    imageResponse.getImageUrl()
            );

            foundItem.setImagePublicId(
                    imageResponse.getImagePublicId()
            );
        }

        FoundItem updatedItem =
                foundItemRepository.save(foundItem);

        return new Response(
                "Found item updated successfully",
                true,
                HttpStatus.OK,
                updatedItem
        );
    }

    @Override
    public Response deleteFoundItem(Long id) {

        FoundItem foundItem = foundItemRepository.findById(id)
                .orElse(null);

        if (foundItem == null) {
            return new Response(
                    "Found item not found",
                    false,
                    HttpStatus.NOT_FOUND,
                    null
            );
        }

        String token = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getCredentials()
                .toString();

        Response userResponse = userClient.getProfile(token);

        Map<String, Object> userData =
                (Map<String, Object>) userResponse.getData();

        Long loggedInUserId =
                ((Number) userData.get("id")).longValue();

        String role =
                (String) userData.get("role");

        boolean isAdmin =
                "ADMIN".equalsIgnoreCase(role);

        if (!isAdmin &&
                !foundItem.getUserId().equals(loggedInUserId)) {

            return new Response(
                    "You can delete only your own found item",
                    false,
                    HttpStatus.FORBIDDEN,
                    null
            );
        }

        if (foundItem.getImagePublicId() != null &&
                !foundItem.getImagePublicId().isEmpty()) {

            imageService.deleteImage(
                    foundItem.getImagePublicId()
            );
        }

        foundItemRepository.delete(foundItem);

        return new Response(
                "Found item deleted successfully",
                true,
                HttpStatus.OK,
                null
        );
    }

    @Override
    public Response findMatchingItems(Long lostItemId) {

        String token = SecurityContextHolder
                .getContext().getAuthentication()
                .getCredentials().toString();

        Object lostItemResponse = lostItemClient.getLostItemById(lostItemId, token);

        Map<String, Object> lostResponse =
                (Map<String, Object>) lostItemResponse;

        Map<String, Object> lostData =
                (Map<String, Object>) lostResponse.get("data");

        if (lostData == null) {

            return new Response(
                    "Lost item not found",
                    false,
                    HttpStatus.NOT_FOUND,
                    null
            );
        }

        String lostItemName =
                normalize(lostData.get("itemName").toString());

        String lostCategory =
                normalize(lostData.get("category").toString());

        String lostLocation =
                normalize(lostData.get("location").toString());

        List<FoundItem> foundItems = foundItemRepository.findAll();

        List<MatchResponse> matches = new ArrayList<>();

        for (FoundItem foundItem : foundItems) {

            int score = 0;

            String foundItemName =
                    normalize(foundItem.getItemName());

            String foundCategory =
                    normalize(foundItem.getCategory());

            String foundLocation =
                    normalize(foundItem.getLocation());

            // Item Name = 50 points
            if (foundItemName.contains(lostItemName)
                    || lostItemName.contains(foundItemName)) {

                score += 50;
            }

            // Category = 30 points
            if (foundCategory.equals(lostCategory)) {

                score += 30;
            }

            // Location = 20 points
            if (foundLocation.equals(lostLocation)) {

                score += 20;
            }

            // Only return matches with 70 or more points
            if (score >= 70) {

                MatchResponse match = new MatchResponse(
                        foundItem.getId(),
                        foundItem.getItemName(),
                        foundItem.getDescription(),
                        foundItem.getCategory(),
                        foundItem.getLocation(),
                        foundItem.getFoundDate(),
                        foundItem.getImageUrl(),
                        score
                );

                matches.add(match);
            }
        }

        // Highest score first
        matches.sort(
                (match1, match2) ->
                        Integer.compare(
                                match2.getMatchScore(),
                                match1.getMatchScore()
                        )
        );

        if (matches.isEmpty()) {

            return new Response(
                    "No matching found item",
                    true,
                    HttpStatus.OK,
                    matches
            );
        }

        return new Response(
                "Matching found items",
                true,
                HttpStatus.OK,
                matches
        );
    }

    private String normalize(String value) {

        if (value == null) {
            return "";
        }

        return value
                .trim()
                .toLowerCase()
                .replaceAll("\\s+", " ");
    }

    @Override
public List<FoundItem> getByUserId(Long userId) {
    return foundItemRepository.findByUserId(userId);
}
}




//package com.lostfound.found_item_service.serviceImpl;
//
//import com.lostfound.found_item_service.client.UserClient;
//import com.lostfound.found_item_service.dto.FoundItemRequest;
//import com.lostfound.found_item_service.dto.Response;
//import com.lostfound.found_item_service.entity.FoundItem;
//import com.lostfound.found_item_service.repository.FoundItemRepository;
//import com.lostfound.found_item_service.service.FoundItemService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class FoundItemServiceImpl implements FoundItemService {
//
//    private final FoundItemRepository foundItemRepository;
//    private final UserClient userClient;
//
//    @Override
//    public Response addFoundItem(FoundItemRequest request) {
//
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//
//        String token = authentication.getCredentials().toString();
//
//        Response userResponse = userClient.getProfile(token);
//
//        Map<String, Object> userData = (Map<String, Object>) userResponse.getData();
//
//        Long userId = ((Number) userData.get("id")).longValue();
//
//        FoundItem foundItem = new FoundItem();
//
//        foundItem.setItemName(request.getItemName());
//        foundItem.setDescription(request.getDescription());
//        foundItem.setCategory(request.getCategory());
//        foundItem.setLocation(request.getLocation());
//        foundItem.setFoundDate(request.getFoundDate());
//        foundItem.setUserId(userId);
//        foundItem.setStatus("FOUND");
//
//        foundItemRepository.save(foundItem);
//
//        return new Response("Found item added successfully", true, HttpStatus.CREATED, foundItem);
//    }
//
//    @Override
//    public Response getFoundItemById(Long id) {
//
//        FoundItem foundItem = foundItemRepository.findById(id).orElse(null);
//
//        if (foundItem == null) {
//            return new Response("Found item not found", false, HttpStatus.NOT_FOUND, null);
//        }
//
//        return new Response("Found item fetched successfully", true, HttpStatus.OK, foundItem);
//    }
//
//    @Override
//    public Response getAllFoundItems() {
//
//        List<FoundItem> foundItems = foundItemRepository.findAll();
//
//        return new Response("Found items fetched successfully", true, HttpStatus.OK, foundItems);
//    }
//
//    @Override
//    public Response updateFoundItem(Long id, FoundItemRequest request) {
//
//        FoundItem foundItem = foundItemRepository.findById(id).orElse(null);
//
//        if (foundItem == null) {
//            return new Response("Found item not found", false, HttpStatus.NOT_FOUND, null);
//        }
//
//        foundItem.setItemName(request.getItemName());
//        foundItem.setDescription(request.getDescription());
//        foundItem.setCategory(request.getCategory());
//        foundItem.setLocation(request.getLocation());
//        foundItem.setFoundDate(request.getFoundDate());
//
//        foundItemRepository.save(foundItem);
//
//        return new Response("Found item updated successfully", true, HttpStatus.OK, foundItem);
//    }
//
//    @Override
//    public Response deleteFoundItem(Long id) {
//
//        FoundItem foundItem = foundItemRepository.findById(id).orElse(null);
//
//        if (foundItem == null) {
//            return new Response("Found item not found", false, HttpStatus.NOT_FOUND, null);
//        }
//
//        foundItemRepository.delete(foundItem);
//
//        return new Response("Found item deleted successfully", true, HttpStatus.OK, null);
//    }
//}
