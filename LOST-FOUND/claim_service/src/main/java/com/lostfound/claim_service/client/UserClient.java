package com.lostfound.claim_service.client;

import com.lostfound.claim_service.dto.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class UserClient {

    private final RestClient userServiceClient;

    @SuppressWarnings("unchecked")
    public Map<String, Object> getProfile(String token) {

        Response response = userServiceClient.get()
                .uri("/user/profile")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Response.class);

        if (response == null || !response.isStatus() || response.getData() == null) {
            return null;
        }

        return (Map<String, Object>) response.getData();
    }

}
