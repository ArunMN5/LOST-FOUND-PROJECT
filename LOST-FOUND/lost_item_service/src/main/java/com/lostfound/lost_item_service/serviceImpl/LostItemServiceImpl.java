package com.lostfound.lost_item_service.serviceImpl;

import com.lostfound.lost_item_service.Client.UserClient;
import com.lostfound.lost_item_service.dto.LostItemRequest;
import com.lostfound.lost_item_service.dto.LostItemResponse;
import com.lostfound.lost_item_service.dto.Response;
import com.lostfound.lost_item_service.entity.LostItem;
import com.lostfound.lost_item_service.repository.LostItemRepository;
import com.lostfound.lost_item_service.service.LostItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LostItemServiceImpl implements LostItemService {

    private final UserClient userClient;
    private final LostItemRepository lostItemRepository;
    private final RestClient restClient;

    @Override
    public Response addLostItem(LostItemRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String token =
                authentication.getCredentials().toString();

        Response userResponse =
                userClient.getProfile(token);

        Map<String, Object> userData =
                (Map<String, Object>) userResponse.getData();

        Long userId =
                ((Number) userData.get("id")).longValue();

        LostItem lostItem = new LostItem();

        lostItem.setItemName(request.getItemName());
        lostItem.setDescription(request.getDescription());
        lostItem.setCategory(request.getCategory());
        lostItem.setLocation(request.getLocation());
        lostItem.setLostDate(request.getLostDate());
        lostItem.setStatus("LOST");
        lostItem.setUserId(userId);

        LostItem savedItem =
                lostItemRepository.save(lostItem);

        LostItemResponse response =
                new LostItemResponse();

        response.setId(savedItem.getId());
        response.setItemName(savedItem.getItemName());
        response.setDescription(savedItem.getDescription());
        response.setCategory(savedItem.getCategory());
        response.setLocation(savedItem.getLocation());
        response.setLostDate(savedItem.getLostDate());
        response.setStatus(savedItem.getStatus());
        response.setUserId(savedItem.getUserId());

        return new Response(
                "Lost item added successfully",
                true,
                HttpStatus.CREATED,
                response
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

        lostItem.setItemName(request.getItemName());
        lostItem.setDescription(request.getDescription());
        lostItem.setCategory(request.getCategory());
        lostItem.setLocation(request.getLocation());
        lostItem.setLostDate(request.getLostDate());

        LostItem updatedItem =
                lostItemRepository.save(lostItem);

        LostItemResponse response =
                new LostItemResponse();

        response.setId(updatedItem.getId());
        response.setItemName(updatedItem.getItemName());
        response.setDescription(updatedItem.getDescription());
        response.setCategory(updatedItem.getCategory());
        response.setLocation(updatedItem.getLocation());
        response.setLostDate(updatedItem.getLostDate());
        response.setStatus(updatedItem.getStatus());
        response.setUserId(updatedItem.getUserId());

        return new Response(
                "Lost item updated successfully",
                true,
                HttpStatus.OK,
                response
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

        lostItemRepository.delete(lostItem);

        return new Response(
                "Lost item deleted successfully",
                true,
                HttpStatus.OK,
                null
        );
    }



    @Override
    public Response findMatches(Long lostItemId) {

        LostItem lostItem = lostItemRepository.findById(lostItemId).orElse(null);

        if (lostItem == null) {
            return new Response("Lost item not found", false, HttpStatus.NOT_FOUND, null);
        }

        JsonNode response = restClient.get()
                .uri("http://localhost:8083/found/all")
                .retrieve()
                .body(JsonNode.class);

        JsonNode foundItems = response.get("data");

        List<JsonNode> matches = new ArrayList<>();

        if (foundItems != null && foundItems.isArray()) {

            for (JsonNode foundItem : foundItems) {

                String itemName = foundItem.get("itemName").asText();
                String category = foundItem.get("category").asText();
                String location = foundItem.get("location").asText();

                if (lostItem.getItemName().equalsIgnoreCase(itemName)
                        && lostItem.getCategory().equalsIgnoreCase(category)
                        && lostItem.getLocation().equalsIgnoreCase(location)) {

                    matches.add(foundItem);
                }
            }
        }

        if (matches.isEmpty()) {
            return new Response(
                    "No matching found item",
                    true,
                    HttpStatus.OK,
                    matches
            );
        }

        return new Response(
                "Possible match found",
                true,
                HttpStatus.OK,
                matches
        );
    }

}
