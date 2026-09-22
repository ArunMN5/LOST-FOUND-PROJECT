package com.lostfound.lost_item_service.service;
import java.util.List;
import com.lostfound.lost_item_service.dto.LostItemRequest;
import com.lostfound.lost_item_service.dto.LostItemResponse;
import com.lostfound.lost_item_service.dto.Response;
import com.lostfound.lost_item_service.entity.LostItem;

public interface LostItemService {

    Response addLostItem(LostItemRequest request);

    Response getLostItemById(Long id);

    Response getAllLostItems();

    Response updateLostItem(Long id, LostItemRequest request);

    Response deleteLostItem(Long id);

    List<LostItem> getByUserId(Long userId);

    //Response findMatches(Long lostItemId);
}