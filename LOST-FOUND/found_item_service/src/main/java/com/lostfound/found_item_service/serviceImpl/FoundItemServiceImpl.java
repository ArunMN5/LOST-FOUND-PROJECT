package com.lostfound.found_item_service.serviceImpl;

import com.lostfound.found_item_service.client.UserClient;
import com.lostfound.found_item_service.dto.FoundItemRequest;
import com.lostfound.found_item_service.dto.Response;
import com.lostfound.found_item_service.entity.FoundItem;
import com.lostfound.found_item_service.repository.FoundItemRepository;
import com.lostfound.found_item_service.service.FoundItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FoundItemServiceImpl implements FoundItemService {

    private final FoundItemRepository foundItemRepository;
    private final UserClient userClient;

    @Override
    public Response addFoundItem(FoundItemRequest request) {

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

        FoundItem foundItem = new FoundItem();

        foundItem.setItemName(request.getItemName());
        foundItem.setDescription(request.getDescription());
        foundItem.setCategory(request.getCategory());
        foundItem.setLocation(request.getLocation());
        foundItem.setFoundDate(request.getFoundDate());
        foundItem.setUserId(userId);
        foundItem.setStatus("FOUND");

        foundItemRepository.save(foundItem);

        return new Response(
                "Found item added successfully",
                true,
                HttpStatus.CREATED,
                foundItem
        );
    }

    @Override
    public Response getFoundItemById(Long id) {

        FoundItem foundItem =
                foundItemRepository.findById(id).orElse(null);

        if (foundItem == null) {
            return new Response(
                    "Found item not found",
                    false,
                    HttpStatus.NOT_FOUND,
                    null
            );
        }

        return new Response(
                "Found item fetched successfully",
                true,
                HttpStatus.OK,
                foundItem
        );
    }

    @Override
    public Response getAllFoundItems() {

        List<FoundItem> foundItems =
                foundItemRepository.findAll();

        return new Response(
                "Found items fetched successfully",
                true,
                HttpStatus.OK,
                foundItems
        );
    }

    @Override
    public Response updateFoundItem(
            Long id,
            FoundItemRequest request) {

        FoundItem foundItem =
                foundItemRepository.findById(id).orElse(null);

        if (foundItem == null) {
            return new Response(
                    "Found item not found",
                    false,
                    HttpStatus.NOT_FOUND,
                    null
            );
        }

        foundItem.setItemName(request.getItemName());
        foundItem.setDescription(request.getDescription());
        foundItem.setCategory(request.getCategory());
        foundItem.setLocation(request.getLocation());
        foundItem.setFoundDate(request.getFoundDate());

        foundItemRepository.save(foundItem);

        return new Response(
                "Found item updated successfully",
                true,
                HttpStatus.OK,
                foundItem
        );
    }

    @Override
    public Response deleteFoundItem(Long id) {

        FoundItem foundItem =
                foundItemRepository.findById(id).orElse(null);

        if (foundItem == null) {
            return new Response(
                    "Found item not found",
                    false,
                    HttpStatus.NOT_FOUND,
                    null
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
}
