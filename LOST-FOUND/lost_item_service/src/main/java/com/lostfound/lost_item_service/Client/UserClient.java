package com.lostfound.lost_item_service.Client;

import com.lostfound.lost_item_service.dto.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class UserClient {

    private final RestClient restClient;

    public Response getProfile(String token) {

        return restClient.get()
                .uri("/user/profile")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Response.class);
    }
}