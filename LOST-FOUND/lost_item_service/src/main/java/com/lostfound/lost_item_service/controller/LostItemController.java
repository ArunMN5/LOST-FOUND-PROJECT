package com.lostfound.lost_item_service.controller;

import com.lostfound.lost_item_service.dto.LostItemRequest;
import com.lostfound.lost_item_service.dto.Response;
import com.lostfound.lost_item_service.service.LostItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lost")
@RequiredArgsConstructor
public class LostItemController {

    private final LostItemService lostItemService;

    @PostMapping("/add")
    public ResponseEntity<Response> addLostItem(@RequestBody LostItemRequest request) {

        Response response = lostItemService.addLostItem(request);

        return new ResponseEntity<>(
                response,
                response.getHttpStatus()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getLostItemById(@PathVariable Long id) {

        Response response = lostItemService.getLostItemById(id);

        return new ResponseEntity<>(
                response,
                response.getHttpStatus()
        );
    }

    @GetMapping("/all")
    public ResponseEntity<Response> getAllLostItems() {

        Response response = lostItemService.getAllLostItems();

        return new ResponseEntity<>(
                response,
                response.getHttpStatus()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response> updateLostItem(
            @PathVariable Long id,
            @RequestBody LostItemRequest request) {

        Response response = lostItemService.updateLostItem(id, request);

        return new ResponseEntity<>(
                response,
                response.getHttpStatus()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Response> deleteLostItem(@PathVariable Long id) {

        Response response = lostItemService.deleteLostItem(id);

        return new ResponseEntity<>(
                response,
                response.getHttpStatus()
        );
    }
}