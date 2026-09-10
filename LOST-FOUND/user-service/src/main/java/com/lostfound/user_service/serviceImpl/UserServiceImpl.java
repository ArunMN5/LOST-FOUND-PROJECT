package com.lostfound.user_service.serviceImpl;

import com.lostfound.user_service.config.JwtUtil;
import com.lostfound.user_service.dto.*;
import com.lostfound.user_service.entity.User;
import com.lostfound.user_service.repository.UserRepository;
import com.lostfound.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public Response register(RegisterRequest request) {

        // Check whether email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {

            return new Response("Email already registered", false, HttpStatus.CONFLICT, null);
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Default role
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        // Do NOT return password
        savedUser.setPassword(null);

        return new Response("User registered successfully", true, HttpStatus.CREATED, savedUser);
    }

    @Override
    public Response login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return new Response("Invalid email or password", false, HttpStatus.UNAUTHORIZED, null);
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword());

        if (!passwordMatches) {
            return new Response("Invalid email or password", false, HttpStatus.UNAUTHORIZED, null);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        LoginResponse loginResponse = new LoginResponse(token);

        return new Response("Login successful", true, HttpStatus.OK, loginResponse);
    }


    @Override
    public Response getProfile(String email) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return new Response("User not found", false, HttpStatus.NOT_FOUND, null);
        }

        user.setPassword(null);
        return new Response("Profile fetched successfully", true, HttpStatus.OK, user);
    }

    @Override
    public Response getAllUsers() {

        List<User> users = userRepository.findAll();
        // Never return passwords
        users.forEach(user -> user.setPassword(null));
        return new Response("Users fetched successfully", true, HttpStatus.OK, users);
    }

    @Override
    public Response getUserById(Long id) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {

            return new Response("User not found", false, HttpStatus.NOT_FOUND, null);
        }

        // Never expose password
        user.setPassword(null);

        return new Response("User fetched successfully", true, HttpStatus.OK, user);
    }


    @Override
    public Response updateUser(Long id, RegisterRequest request) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return new Response("User not found", false, HttpStatus.NOT_FOUND, null);
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(updatedUser.getId());
        userResponse.setEmail(updatedUser.getEmail());
        userResponse.setPhone(updatedUser.getPhone());
        userResponse.setRole(updatedUser.getRole());

        return new Response("User updated successfully", true, HttpStatus.OK, userResponse);
    }

    @Override
    public Response deleteUser(Long id) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return new Response("User not found", false, HttpStatus.NOT_FOUND, null);
        }

        userRepository.delete(user);

        return new Response("User deleted successfully", true, HttpStatus.OK, null);
    }

}