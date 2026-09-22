package com.lostfound.user_service.service;

import com.lostfound.user_service.dto.LoginRequest;
import com.lostfound.user_service.dto.RegisterRequest;
import com.lostfound.user_service.dto.Response;

public interface UserService {

    Response register(RegisterRequest registerRequest);

    Response login(LoginRequest request);

    Response getProfile(String email);

    Response getAllUsers();

    Response getUserById(Long id);

    Response updateUser(Long id, RegisterRequest request);

    Response deleteUser(Long id);

    Response updateProfile(String email, RegisterRequest request);
}