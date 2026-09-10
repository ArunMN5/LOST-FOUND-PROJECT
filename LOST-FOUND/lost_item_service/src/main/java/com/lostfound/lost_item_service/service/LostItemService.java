package com.lostfound.lost_item_service.service;

import com.lostfound.lost_item_service.dto.LostItemRequest;
import com.lostfound.lost_item_service.dto.LostItemResponse;
import com.lostfound.lost_item_service.dto.Response;

public interface LostItemService {

    Response addLostItem(LostItemRequest request);

    Response getLostItemById(Long id);

    Response getAllLostItems();

    Response updateLostItem(Long id, LostItemRequest request);

    Response deleteLostItem(Long id);
}