package com.lostfound.claim_service.client;

import com.lostfound.claim_service.dto.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class FoundItemClient {

    private final RestClient foundItemServiceClient;

    @SuppressWarnings("unchecked")
    public Map<String, Object> getFoundItemById(Long id, String token) {

        Response response = foundItemServiceClient.get()
                .uri("/found/{id}", id)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Response.class);

        if (response == null || !response.isStatus() || response.getData() == null) {
            return null;
        }

        return (Map<String, Object>) response.getData();
    }

}
