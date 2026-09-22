package com.lostfound.claim_service.client;

import com.lostfound.claim_service.dto.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class LostItemClient {

    private final RestClient lostItemServiceClient;

    @SuppressWarnings("unchecked")
    public Map<String, Object> getLostItemById(Long id, String token) {

        Response response = lostItemServiceClient.get()
                .uri("/lost/{id}", id)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Response.class);

        if (response == null || !response.isStatus() || response.getData() == null) {
            return null;
        }

        return (Map<String, Object>) response.getData();
    }

}
