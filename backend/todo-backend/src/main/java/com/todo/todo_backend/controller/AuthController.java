package com.todo.todo_backend.controller;

import com.todo.todo_backend.model.User;
import com.todo.todo_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")  // ← تأكد أن المسار هو /api/auth
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
        System.out.println("AuthController initialized!");
    }

    // الصحة العامة للخادم
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        System.out.println("=== Health Check Request ===");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Todo Backend API");
        response.put("timestamp", System.currentTimeMillis());
        response.put("message", "Service is running");
        
        System.out.println("Health check response: " + response);
        return ResponseEntity.ok(response);
    }

    // تسجيل الدخول
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        System.out.println("=== Login Request ===");
        System.out.println("Credentials: " + credentials);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");
            
            // التحقق من المدخلات
            if (username == null || username.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Nom d'utilisateur requis");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (password == null || password.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Mot de passe requis");
                return ResponseEntity.badRequest().body(response);
            }
            
            System.out.println("Looking for user: " + username);
            
            // البحث عن المستخدم
            User user = userService.getUserByUsername(username);
            
            if (user == null) {
                System.out.println("User not found: " + username);
                response.put("success", false);
                response.put("message", "Nom d'utilisateur ou mot de passe incorrect");
                return ResponseEntity.status(401).body(response);
            }
            
            System.out.println("User found: " + user.getUsername());
            
            // التحقق من كلمة المرور
            if (password.equals(user.getPassword())) {
                System.out.println("Password matches!");
                
                // إعداد بيانات المستخدم للرد
                Map<String, Object> userResponse = new HashMap<>();
                userResponse.put("id", user.getId());
                userResponse.put("username", user.getUsername());
                userResponse.put("email", user.getEmail());
                userResponse.put("createdAt", user.getCreatedAt());
                
                response.put("success", true);
                response.put("message", "Connexion réussie");
                response.put("user", userResponse);
                
                System.out.println("Login successful for user: " + username);
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Password does NOT match!");
                response.put("success", false);
                response.put("message", "Nom d'utilisateur ou mot de passe incorrect");
                return ResponseEntity.status(401).body(response);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erreur serveur: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // التسجيل
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        System.out.println("=== Register Request ===");
        System.out.println("User data: " + user);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // التحقق من البيانات المطلوبة
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Nom d'utilisateur requis");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Mot de passe requis");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email requis");
                return ResponseEntity.badRequest().body(response);
            }
            
            System.out.println("Checking if user exists: " + user.getUsername());
            
            // التحقق من عدم وجود مستخدم بنفس الاسم
            if (userService.existsByUsername(user.getUsername())) {
                response.put("success", false);
                response.put("message", "Nom d'utilisateur déjà utilisé");
                return ResponseEntity.status(409).body(response);
            }
            
            // التحقق من عدم وجود مستخدم بنفس الإيميل
            if (userService.existsByEmail(user.getEmail())) {
                response.put("success", false);
                response.put("message", "Email déjà utilisé");
                return ResponseEntity.status(409).body(response);
            }
            
            System.out.println("Saving new user...");
            
            // حفظ المستخدم الجديد
            User savedUser = userService.saveUser(user);
            
            // إعداد بيانات المستخدم للرد
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("id", savedUser.getId());
            userResponse.put("username", savedUser.getUsername());
            userResponse.put("email", savedUser.getEmail());
            userResponse.put("createdAt", savedUser.getCreatedAt());
            
            response.put("success", true);
            response.put("message", "Utilisateur créé avec succès");
            response.put("user", userResponse);
            
            System.out.println("User registered successfully: " + savedUser.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erreur lors de l'inscription: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}