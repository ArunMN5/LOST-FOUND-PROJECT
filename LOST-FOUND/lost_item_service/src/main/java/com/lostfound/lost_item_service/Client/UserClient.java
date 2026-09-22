package com.lostfound.lost_item_service.Client;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostfound.lost_item_service.dto.Response;
import com.lostfound.user_service.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class UserClient {

    private final RestClient restClient;

    public UserResponse getProfile(String token) {

        Response response = restClient.get()
                .uri("/user/profile")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Response.class);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        return objectMapper.convertValue(
                response.getData(),
                UserResponse.class
        );
    }
}