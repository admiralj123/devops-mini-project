package com.todo.todo_backend.service;

import com.todo.todo_backend.model.User;
import com.todo.todo_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        System.out.println("UserService initialized!");
    }

    public User getUserByUsername(String username) {
        System.out.println("Searching for user: " + username);
        User user = userRepository.findByUsername(username);
        System.out.println("Found user: " + (user != null ? user.getUsername() : "null"));
        return user;
    }

    public User saveUser(User user) {
        System.out.println("Saving user: " + user.getUsername());
        return userRepository.save(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // إضافة هذه الدالة المفقودة
    public List<User> getAllUsers() {
        System.out.println("Getting all users");
        return userRepository.findAll();
    }
}