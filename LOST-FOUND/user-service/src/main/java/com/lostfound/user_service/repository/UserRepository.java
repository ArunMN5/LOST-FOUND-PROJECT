package com.lostfound.user_service.repository;

import com.lostfound.user_service.dto.Response;
import com.lostfound.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    //Response getUserById(Long id);

}