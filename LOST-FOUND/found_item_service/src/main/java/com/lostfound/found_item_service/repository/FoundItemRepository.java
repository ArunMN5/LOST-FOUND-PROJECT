package com.lostfound.found_item_service.repository;

import com.lostfound.found_item_service.entity.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {


    List<FoundItem> findByUserId(Long userId);

}