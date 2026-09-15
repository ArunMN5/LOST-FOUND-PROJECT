package com.lostfound.found_item_service.repository;

import com.lostfound.found_item_service.entity.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {


}