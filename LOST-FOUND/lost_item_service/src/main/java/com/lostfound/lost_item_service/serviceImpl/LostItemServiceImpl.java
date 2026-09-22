package com.lostfound.lost_item_service.serviceImpl;

import com.lostfound.lost_item_service.Client.UserClient;
import com.lostfound.lost_item_service.dto.ImageUploadResponse;
import com.lostfound.lost_item_service.dto.LostItemRequest;
import com.lostfound.lost_item_service.dto.LostItemResponse;
import com.lostfound.lost_item_service.dto.Response;
import com.lostfound.lost_item_service.entity.LostItem;
import com.lostfound.lost_item_service.repository.LostItemRepository;
import com.lostfound.lost_item_service.service.ImageService;
import com.lostfound.lost_item_service.service.LostItemService;
import com.lostfound.user_service.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LostItemServiceImpl implements LostItemService {

    private final UserClient userClient;
    private final LostItemRepository lostItemRepository;
    private final RestClient restClient;
    private final HttpServletRequest request;
    private final ImageService imageService;


    @Override
    public Response addLostItem(LostItemRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String token = authentication.getCredentials().toString();

        // Get logged-in user from User Service
        UserResponse userResponse = userClient.getProfile(token);

        Long userId = userResponse.getId();

        LostItem lostItem = new LostItem();

        lostItem.setItemName(request.getItemName());
        lostItem.setDescription(request.getDescription());
        lostItem.setCategory(request.getCategory());
        lostItem.setLocation(request.getLocation());
        lostItem.setLostDate(request.getLostDate());

        // Set logged-in user's ID
        lostItem.setUserId(userId);

        // Set default status
        lostItem.setStatus("LOST");

        // Upload image if provided
        if (request.getImage() != null &&
                !request.getImage().isEmpty()) {

            ImageUploadResponse imageResponse =
                    imageService.uploadImage(request.getImage());

            lostItem.setImageUrl(imageResponse.getImageUrl());
            lostItem.setImagePublicId(imageResponse.getImagePublicId());
        }

        // Save lost item
        lostItemRepository.save(lostItem);

        return new Response(
                "Lost item added successfully",
                true,
                HttpStatus.CREATED,
                lostItem
        );
    }


    @Override
    public Response getLostItemById(Long id) {

        LostItem lostItem =
                lostItemRepository.findById(id).orElse(null);

        if (lostItem == null) {
            return new Response(
                    "Lost item not found",
                    false,
                    HttpStatus.NOT_FOUND,
                    null
            );
        }

        LostItemResponse response = new LostItemResponse();

        response.setId(lostItem.getId());
        response.setItemName(lostItem.getItemName());
        response.setDescription(lostItem.getDescription());
        response.setCategory(lostItem.getCategory());
        response.setLocation(lostItem.getLocation());
        response.setLostDate(lostItem.getLostDate());
        response.setStatus(lostItem.getStatus());
        response.setUserId(lostItem.getUserId());

        return new Response(
                "Lost item found",
                true,
                HttpStatus.OK,
                response
        );
    }


    @Override
    public Response getAllLostItems() {

        List<LostItem> lostItems =
                lostItemRepository.findAll();

        List<LostItemResponse> responseList =
                new ArrayList<>();

        for (LostItem lostItem : lostItems) {

            LostItemResponse response =
                    new LostItemResponse();

            response.setId(lostItem.getId());
            response.setItemName(lostItem.getItemName());
            response.setDescription(lostItem.getDescription());
            response.setCategory(lostItem.getCategory());
            response.setLocation(lostItem.getLocation());
            response.setLostDate(lostItem.getLostDate());
            response.setStatus(lostItem.getStatus());
            response.setUserId(lostItem.getUserId());

            responseList.add(response);
        }

        return new Response(
                "Lost items fetched successfully",
                true,
                HttpStatus.OK,
                responseList
        );
    }


    @Override
    public Response updateLostItem(
            Long id,
            LostItemRequest request) {

        LostItem lostItem =
                lostItemRepository.findById(id).orElse(null);

        if (lostItem == null) {
            return new Response(
                    "Lost item not found",
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

        UserResponse user =
                userClient.getProfile(token);

        Long loggedInUserId = user.getId();

        boolean isAdmin =
                "ADMIN".equalsIgnoreCase(user.getRole());

        // Ownership check
        if (!isAdmin &&
                !lostItem.getUserId().equals(loggedInUserId)) {

            return new Response(
                    "You can update only your own lost item",
                    false,
                    HttpStatus.FORBIDDEN,
                    null
            );
        }

        lostItem.setItemName(request.getItemName());
        lostItem.setDescription(request.getDescription());
        lostItem.setCategory(request.getCategory());
        lostItem.setLocation(request.getLocation());
        lostItem.setLostDate(request.getLostDate());

        // If new image is provided
        if (request.getImage() != null &&
                !request.getImage().isEmpty()) {

            // Delete old image
            if (lostItem.getImagePublicId() != null &&
                    !lostItem.getImagePublicId().isEmpty()) {

                imageService.deleteImage(
                        lostItem.getImagePublicId()
                );
            }

            // Upload new image
            ImageUploadResponse imageResponse =
                    imageService.uploadImage(
                            request.getImage()
                    );

            lostItem.setImageUrl(
                    imageResponse.getImageUrl()
            );

            lostItem.setImagePublicId(
                    imageResponse.getImagePublicId()
            );
        }

        LostItem updatedItem =
                lostItemRepository.save(lostItem);

        return new Response(
                "Lost item updated successfully",
                true,
                HttpStatus.OK,
                updatedItem
        );
    }


    @Override
    public Response deleteLostItem(Long id) {

        LostItem lostItem =
                lostItemRepository.findById(id).orElse(null);

        if (lostItem == null) {
            return new Response(
                    "Lost item not found",
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

        UserResponse user =
                userClient.getProfile(token);

        Long loggedInUserId = user.getId();

        boolean isAdmin =
                "ADMIN".equalsIgnoreCase(user.getRole());

        // Ownership check
        if (!isAdmin &&
                !lostItem.getUserId().equals(loggedInUserId)) {

            return new Response(
                    "You can delete only your own lost item",
                    false,
                    HttpStatus.FORBIDDEN,
                    null
            );
        }

        // Delete image from Cloudinary
        if (lostItem.getImagePublicId() != null &&
                !lostItem.getImagePublicId().isEmpty()) {

            imageService.deleteImage(
                    lostItem.getImagePublicId()
            );
        }

        lostItemRepository.delete(lostItem);

        return new Response(
                "Lost item deleted successfully",
                true,
                HttpStatus.OK,
                null
        );
    }


    @Override
public List<LostItem> getByUserId(Long userId) {
    return lostItemRepository.findByUserId(userId);
}

}


//working
//package com.lostfound.lost_item_service.serviceImpl;
//
//import com.lostfound.lost_item_service.Client.UserClient;
//import com.lostfound.lost_item_service.dto.LostItemRequest;
//import com.lostfound.lost_item_service.dto.LostItemResponse;
//import com.lostfound.lost_item_service.dto.Response;
//import com.lostfound.lost_item_service.entity.LostItem;
//import com.lostfound.lost_item_service.repository.LostItemRepository;
//import com.lostfound.lost_item_service.service.LostItemService;
//import com.lostfound.user_service.dto.UserResponse;
//import jakarta.servlet.http.HttpServletRequest;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestClient;
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import java.util.ArrayList;
//import java.util.List;
//import com.lostfound.lost_item_service.dto.ImageUploadResponse;
//import com.lostfound.lost_item_service.service.ImageService;
//
//
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class LostItemServiceImpl implements LostItemService {
//
//    private final UserClient userClient;
//    private final LostItemRepository lostItemRepository;
//    private final RestClient restClient;
//    private final HttpServletRequest request;
//    private final ImageService imageService;
////    private final ObjectMapper objectMapper;
//
//
////    @Override
////    public Response addLostItem(LostItemRequest request) {
////
////        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
////
////        String token = authentication.getCredentials().toString();
////
////        Response userResponse = userClient.getProfile(token);
////
////        Map<String, Object> userData = (Map<String, Object>) userResponse.getData();
////
////        Long userId = ((Number) userData.get("id")).longValue();
////
////        LostItem lostItem = new LostItem();
////
////        lostItem.setItemName(request.getItemName());
////        lostItem.setDescription(request.getDescription());
////        lostItem.setCategory(request.getCategory());
////        lostItem.setLocation(request.getLocation());
////        lostItem.setLostDate(request.getLostDate());
////        lostItem.setStatus("LOST");
////        lostItem.setUserId(userId);
////
////        LostItem savedItem = lostItemRepository.save(lostItem);
////
////        LostItemResponse response = new LostItemResponse();
////
////        response.setId(savedItem.getId());
////        response.setItemName(savedItem.getItemName());
////        response.setDescription(savedItem.getDescription());
////        response.setCategory(savedItem.getCategory());
////        response.setLocation(savedItem.getLocation());
////        response.setLostDate(savedItem.getLostDate());
////        response.setStatus(savedItem.getStatus());
////        response.setUserId(savedItem.getUserId());
////
////        return new Response("Lost item added successfully", true, HttpStatus.CREATED, response);
////    }
//
//    @Override
//    public Response addLostItem(LostItemRequest request) {
//
//        Authentication authentication =
//                SecurityContextHolder.getContext().getAuthentication();
//
//        String token = authentication.getCredentials().toString();
//
//        Response userResponse = userClient.getProfile(token);
//
//        Map<String, Object> userData = (Map<String, Object>) userResponse.getData();
//
//        Long userId = ((Number) userData.get("id")).longValue();
//
//        LostItem lostItem = new LostItem();
//
//        lostItem.setItemName(request.getItemName());
//        lostItem.setDescription(request.getDescription());
//        lostItem.setCategory(request.getCategory());
//        lostItem.setLocation(request.getLocation());
//        lostItem.setLostDate(request.getLostDate());
//        lostItem.setUserId(userId);
//        lostItem.setStatus("LOST");
//
//        // Upload image if provided
//        if (request.getImage() != null && !request.getImage().isEmpty()) {
//
//            ImageUploadResponse imageResponse =
//                    imageService.uploadImage(request.getImage());
//
//            lostItem.setImageUrl(imageResponse.getImageUrl());
//            lostItem.setImagePublicId(imageResponse.getImagePublicId());
//        }
//
//        lostItemRepository.save(lostItem);
//
//        return new Response(
//                "Lost item added successfully",
//                true,
//                HttpStatus.CREATED,
//                lostItem
//        );
//    }
//
//    @Override
//    public Response getLostItemById(Long id) {
//
//        LostItem lostItem = lostItemRepository.findById(id).orElse(null);
//
//        if (lostItem == null) {
//            return new Response("Lost item not found", false, HttpStatus.NOT_FOUND, null);
//        }
//
//        LostItemResponse response = new LostItemResponse();
//
//        response.setId(lostItem.getId());
//        response.setItemName(lostItem.getItemName());
//        response.setDescription(lostItem.getDescription());
//        response.setCategory(lostItem.getCategory());
//        response.setLocation(lostItem.getLocation());
//        response.setLostDate(lostItem.getLostDate());
//        response.setStatus(lostItem.getStatus());
//        response.setUserId(lostItem.getUserId());
//
//        return new Response("Lost item found", true, HttpStatus.OK, response);
//    }
//
//    @Override
//    public Response getAllLostItems() {
//
//        List<LostItem> lostItems = lostItemRepository.findAll();
//
//        List<LostItemResponse> responseList = new ArrayList<>();
//
//        for (LostItem lostItem : lostItems) {
//
//            LostItemResponse response = new LostItemResponse();
//
//            response.setId(lostItem.getId());
//            response.setItemName(lostItem.getItemName());
//            response.setDescription(lostItem.getDescription());
//            response.setCategory(lostItem.getCategory());
//            response.setLocation(lostItem.getLocation());
//            response.setLostDate(lostItem.getLostDate());
//            response.setStatus(lostItem.getStatus());
//            response.setUserId(lostItem.getUserId());
//
//            responseList.add(response);
//        }
//
//        return new Response("Lost items fetched successfully", true, HttpStatus.OK, responseList);
//    }
//
////    @Override
////    public Response updateLostItem(Long id, LostItemRequest request) {
////
////        LostItem lostItem = lostItemRepository.findById(id).orElse(null);
////
////        if (lostItem == null) {
////            return new Response("Lost item not found", false, HttpStatus.NOT_FOUND, null);
////        }
////
////        lostItem.setItemName(request.getItemName());
////        lostItem.setDescription(request.getDescription());
////        lostItem.setCategory(request.getCategory());
////        lostItem.setLocation(request.getLocation());
////        lostItem.setLostDate(request.getLostDate());
////
////        // If a new image is provided
////        if (request.getImage() != null && !request.getImage().isEmpty()) {
////
////            // Delete old image from Cloudinary
////            if (lostItem.getImagePublicId() != null && !lostItem.getImagePublicId().isEmpty()) {
////
////                imageService.deleteImage(lostItem.getImagePublicId());
////            }
////
////            // Upload new image
////            ImageUploadResponse imageResponse = imageService.uploadImage(request.getImage());
////
////            lostItem.setImageUrl(imageResponse.getImageUrl());
////            lostItem.setImagePublicId(imageResponse.getImagePublicId());
////        }
////
////        lostItemRepository.save(lostItem);
////
////        return new Response("Lost item updated successfully", true, HttpStatus.OK, lostItem);
////    }
//@Override
//public Response updateLostItem(Long id, LostItemRequest request) {
//
//    LostItem lostItem = lostItemRepository.findById(id).orElse(null);
//
//    if (lostItem == null) {
//        return new Response("Lost item not found", false, HttpStatus.NOT_FOUND, null);
//    }
//
//    String token = SecurityContextHolder
//            .getContext()
//            .getAuthentication()
//            .getCredentials()
//            .toString();
//
//
//    Response userResponse = userClient.getProfile(token);
//
//    UserResponse user = objectMapper.convertValue(
//            userResponse.getData(),
//            UserResponse.class
//    );
//
//
//    Long loggedInUserId = user.getId();
//
//    boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
//
//    if (!isAdmin && !lostItem.getUserId().equals(loggedInUserId)) {
//        return new Response("You can update only your own lost item", false, HttpStatus.FORBIDDEN, null);
//    }
//
//    lostItem.setItemName(request.getItemName());
//    lostItem.setDescription(request.getDescription());
//    lostItem.setCategory(request.getCategory());
//    lostItem.setLocation(request.getLocation());
//    lostItem.setLostDate(request.getLostDate());
//
//    if (request.getImage() != null && !request.getImage().isEmpty()) {
//
//        if (lostItem.getImagePublicId() != null) {
//            imageService.deleteImage(lostItem.getImagePublicId());
//        }
//
//        ImageUploadResponse imageResponse =
//                imageService.uploadImage(request.getImage());
//
//        lostItem.setImageUrl(imageResponse.getImageUrl());
//        lostItem.setImagePublicId(imageResponse.getImagePublicId());
//    }
//
//    LostItem updatedItem = lostItemRepository.save(lostItem);
//
//    return new Response("Lost item updated successfully", true, HttpStatus.OK, updatedItem);
//}
//
//    @Override
//    public Response deleteLostItem(Long id) {
//
//        LostItem lostItem = lostItemRepository.findById(id)
//                .orElse(null);
//
//        if (lostItem == null) {
//            return new Response(
//                    "Lost item not found",
//                    false,
//                    HttpStatus.NOT_FOUND,
//                    null
//            );
//        }
//
//        String token = SecurityContextHolder
//                .getContext()
//                .getAuthentication()
//                .getCredentials()
//                .toString();
//
//        Response userResponse = userClient.getProfile(token);
//
//        UserResponse user = objectMapper.convertValue(
//                userResponse.getData(),
//                UserResponse.class
//        );
//
//        Long loggedInUserId = user.getId();
//
//        boolean isAdmin =
//                "ADMIN".equalsIgnoreCase(user.getRole());
//
//        if (!isAdmin &&
//                !lostItem.getUserId().equals(loggedInUserId)) {
//
//            return new Response(
//                    "You can delete only your own lost item",
//                    false,
//                    HttpStatus.FORBIDDEN,
//                    null
//            );
//        }
//
//        if (lostItem.getImagePublicId() != null) {
//            imageService.deleteImage(lostItem.getImagePublicId());
//        }
//
//        lostItemRepository.delete(lostItem);
//
//        return new Response(
//                "Lost item deleted successfully",
//                true,
//                HttpStatus.OK,
//                null
//        );
//    }



//    @Override
//    public Response findMatches(Long lostItemId) {
//
//        LostItem lostItem = lostItemRepository.findById(lostItemId).orElse(null);
//
//        if (lostItem == null) {
//            return new Response("Lost item not found", false, HttpStatus.NOT_FOUND, null);
//        }
//
//        String authHeader = request.getHeader("Authorization");
//
//        String response = restClient.get()
//                .uri("http://localhost:8083/found/all")
//                .header("Authorization", authHeader)
//                .retrieve()
//                .body(String.class);
//
//        ObjectMapper objectMapper = new ObjectMapper();
//
//        JsonNode responseNode;
//
//        try {
//            responseNode = objectMapper.readTree(response);
//        } catch (Exception e) {
//            return new Response("Error reading found items", false, HttpStatus.INTERNAL_SERVER_ERROR, null);
//        }
//
//        JsonNode foundItems = responseNode.get("data");
//
//        List<JsonNode> matches = new ArrayList<>();
//
//        if (foundItems != null && foundItems.isArray()) {
//
//            for (JsonNode foundItem : foundItems) {
//
//                String itemName = foundItem.get("itemName").asText();
//                String category = foundItem.get("category").asText();
//                String location = foundItem.get("location").asText();
//
//                if (lostItem.getItemName().equalsIgnoreCase(itemName)
//                        && lostItem.getCategory().equalsIgnoreCase(category)
//                        && lostItem.getLocation().equalsIgnoreCase(location)) {
//
//                    matches.add(foundItem);
//                }
//            }
//        }
//
//        // Convert JsonNode objects into normal Java objects
//        List<Object> matchData = new ArrayList<>();
//
//        for (JsonNode match : matches) {
//            matchData.add(objectMapper.convertValue(match, Object.class));
//        }
//
//        if (matchData.isEmpty()) {
//            return new Response("No matching found item", true, HttpStatus.OK, matchData);
//        }
//
//        return new Response("Possible match found", true, HttpStatus.OK, matchData);
//    }


