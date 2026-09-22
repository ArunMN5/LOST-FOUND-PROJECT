package com.lostfound.found_item_service.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class LostItemClient {

    private final RestClient restClient;

    public LostItemClient() {

        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:8082")
                .build();
    }

    public Object getLostItemById(Long lostItemId, String token) {

        return restClient.get()
                .uri("/lost/{id}", lostItemId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Object.class);
    }
}