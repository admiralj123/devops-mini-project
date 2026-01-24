package com.todo.todo_backend.controller;

import com.todo.todo_backend.model.User;
import com.todo.todo_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
        System.out.println("UserController initialized (legacy)");
    }

    // GET جميع المستخدمين (للإدارة فقط)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        System.out.println("=== Get All Users Request ===");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<User> users = userService.getAllUsers();
            
            // إزالة كلمات المرور قبل الإرسال
            users.forEach(user -> user.setPassword(null));
            
            System.out.println("Found " + users.size() + " users");
            
            response.put("success", true);
            response.put("message", users.size() + " utilisateurs trouvés");
            response.put("users", users);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // GET مستخدم واحد
    @GetMapping("/{username}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable String username) {
        System.out.println("=== Get User Request ===");
        System.out.println("Username: " + username);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User user = userService.getUserByUsername(username);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "Utilisateur non trouvé");
                return ResponseEntity.status(404).body(response);
            }
            
            // إزالة كلمة المرور قبل الإرسال
            user.setPassword(null);
            
            response.put("success", true);
            response.put("message", "Utilisateur trouvé");
            response.put("user", user);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erreur lors de la recherche: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // POST التحقق من وجود مستخدم (للتسجيل)
    @PostMapping("/check-username")
    public ResponseEntity<Map<String, Object>> checkUsername(@RequestBody Map<String, String> data) {
        System.out.println("=== Check Username Request ===");
        System.out.println("Data: " + data);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = data.get("username");
            
            if (username == null || username.trim().isEmpty()) {
                response.put("available", false);
                response.put("message", "Nom d'utilisateur requis");
                return ResponseEntity.badRequest().body(response);
            }
            
            boolean exists = userService.existsByUsername(username);
            
            response.put("available", !exists);
            response.put("message", exists ? 
                "Nom d'utilisateur déjà utilisé" : 
                "Nom d'utilisateur disponible");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("available", false);
            response.put("message", "Erreur serveur");
            return ResponseEntity.status(500).body(response);
        }
    }
}