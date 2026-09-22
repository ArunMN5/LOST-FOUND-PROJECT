package com.lostfound.lost_item_service.repository;

import com.lostfound.lost_item_service.entity.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LostItemRepository extends JpaRepository<LostItem, Long> {

    List<LostItem> findByUserId(Long userId);

}