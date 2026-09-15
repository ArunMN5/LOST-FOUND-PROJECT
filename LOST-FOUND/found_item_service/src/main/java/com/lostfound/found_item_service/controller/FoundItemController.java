package com.lostfound.found_item_service.controller;

import com.lostfound.found_item_service.dto.FoundItemRequest;
import com.lostfound.found_item_service.dto.Response;
import com.lostfound.found_item_service.service.FoundItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/found")
public class FoundItemController {

    private final FoundItemService foundItemService;

    public FoundItemController(FoundItemService foundItemService) {
        this.foundItemService = foundItemService;
    }

    @PostMapping("/add")
    public ResponseEntity<Response> addFoundItem(@RequestBody FoundItemRequest request) {
        Response response = foundItemService.addFoundItem(request);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getFoundItemById(@PathVariable Long id) {
        Response response = foundItemService.getFoundItemById(id);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @GetMapping("/all")
    public ResponseEntity<Response> getAllFoundItems() {
        Response response = foundItemService.getAllFoundItems();
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response> updateFoundItem(
            @PathVariable Long id,
            @RequestBody FoundItemRequest request) {

        Response response = foundItemService.updateFoundItem(id, request);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Response> deleteFoundItem(@PathVariable Long id) {
        Response response = foundItemService.deleteFoundItem(id);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }
}