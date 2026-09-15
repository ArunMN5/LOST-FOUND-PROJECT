package com.lostfound.found_item_service.service;

import com.lostfound.found_item_service.dto.FoundItemRequest;
import com.lostfound.found_item_service.dto.Response;

public interface FoundItemService {

    Response addFoundItem(FoundItemRequest request);

    Response getFoundItemById(Long id);

    Response getAllFoundItems();

    Response updateFoundItem(Long id, FoundItemRequest request);

    Response deleteFoundItem(Long id);
}