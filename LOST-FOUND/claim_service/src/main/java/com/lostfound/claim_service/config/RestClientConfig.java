package com.lostfound.claim_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient userServiceClient() {
        return RestClient.builder()
                .baseUrl("http://localhost:8081")
                .build();
    }

    @Bean
    public RestClient lostItemServiceClient() {
        return RestClient.builder()
                .baseUrl("http://localhost:8082")
                .build();
    }

    @Bean
    public RestClient foundItemServiceClient() {
        return RestClient.builder()
                .baseUrl("http://localhost:8083")
                .build();
    }

}
