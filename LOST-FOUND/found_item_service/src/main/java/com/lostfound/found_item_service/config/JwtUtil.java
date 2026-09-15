package com.lostfound.found_item_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

    @Component
    public class JwtUtil {

        private final String SECRET_KEY = "mySecretKeyForLostAndFoundProjectJwtAuthentication123456";

        private SecretKey getKey() {
            return Keys.hmacShaKeyFor(
                    SECRET_KEY.getBytes(StandardCharsets.UTF_8)
            );
        }

        public String extractUsername(String token) {

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();
        }

        public boolean validateToken(String token) {

            try {
                extractUsername(token);
                return true;
            } catch (Exception e) {
                return false;
            }
        }
    }