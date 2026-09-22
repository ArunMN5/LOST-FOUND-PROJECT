package com.lostfound.found_item_service.service;

import java.util.List;

import com.lostfound.found_item_service.dto.FoundItemRequest;
import com.lostfound.found_item_service.dto.Response;
import com.lostfound.found_item_service.entity.FoundItem;

public interface FoundItemService {

    Response addFoundItem(FoundItemRequest request);

    Response getFoundItemById(Long id);

    Response getAllFoundItems();

    Response updateFoundItem(Long id, FoundItemRequest request);

    Response deleteFoundItem(Long id);

    Response findMatchingItems(Long lostItemId);

    List<FoundItem> getByUserId(Long userId);
}