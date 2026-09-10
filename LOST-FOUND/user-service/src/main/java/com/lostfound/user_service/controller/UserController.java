package com.lostfound.user_service.controller;

import com.lostfound.user_service.dto.LoginRequest;
import com.lostfound.user_service.dto.RegisterRequest;
import com.lostfound.user_service.dto.Response;
import com.lostfound.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Response> register(
            @RequestBody RegisterRequest request) {

        Response response = userService.register(request);

        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @PostMapping("/login")
    public ResponseEntity<Response> login(
            @RequestBody LoginRequest request) {

        Response response = userService.login(request);

        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @GetMapping("/profile")
    public ResponseEntity<Response> getProfile(
            Authentication authentication) {

        String email = authentication.getName();

        Response response = userService.getProfile(email);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @GetMapping("/admin/all")
    public ResponseEntity<Response> getAllUsers() {

        Response response = userService.getAllUsers();
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<Response> getUserById(
            @PathVariable Long id) {

        Response response = userService.getUserById(id);

        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<Response> updateUser(@PathVariable Long id, @RequestBody RegisterRequest request) {

        Response response = userService.updateUser(id, request);

        return new ResponseEntity<>(response, response.getHttpStatus());
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Response> deleteUser(@PathVariable Long id) {

        Response response = userService.deleteUser(id);
        return new ResponseEntity<>(response, response.getHttpStatus());
    }

}