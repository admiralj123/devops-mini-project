package com.todo.todo_backend.controller;

import com.todo.todo_backend.model.Task;
import com.todo.todo_backend.model.User;
import com.todo.todo_backend.service.TaskService;
import com.todo.todo_backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    // إنشاء مهمة جديدة
    @PostMapping
    public ResponseEntity<Map<String, Object>> createTask(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("Requête de création de tâche reçue: " + requestData);
            
            // استخراج username من البيانات
            Map<String, Object> userData = (Map<String, Object>) requestData.get("user");
            if (userData == null) {
                response.put("success", false);
                response.put("message", "Utilisateur non spécifié");
                return ResponseEntity.badRequest().body(response);
            }
            
            String username = (String) userData.get("username");
            System.out.println("Recherche de l'utilisateur: " + username);
            
            User user = userService.getUserByUsername(username);
            if (user == null) {
                response.put("success", false);
                response.put("message", "Utilisateur non trouvé: " + username);
                return ResponseEntity.status(404).body(response);
            }
            
            // التحقق من الحقول الإلزامية
            String title = (String) requestData.get("title");
            if (title == null || title.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Le titre est obligatoire");
                return ResponseEntity.badRequest().body(response);
            }
            
            // إنشاء المهمة
            Task task = new Task();
            task.setTitle(title.trim());
            
            Object description = requestData.get("description");
            if (description != null) {
                task.setDescription(description.toString());
            }
            
            task.setCategory((String) requestData.get("category"));
            task.setPriority((String) requestData.get("priority"));
            
            // تعيين الحالة
            String status = (String) requestData.get("status");
            if (status == null || status.trim().isEmpty()) {
                status = "Pending";
            }
            task.setStatus(status);
            
            // معالجة التاريخ
            Object dueDateObj = requestData.get("dueDate");
            if (dueDateObj != null && !dueDateObj.toString().trim().isEmpty()) {
                try {
                    task.setDueDate(LocalDate.parse(dueDateObj.toString()));
                } catch (Exception e) {
                    System.out.println("Erreur de format de date: " + e.getMessage());
                    // يمكن تجاهل الخطأ أو استخدام القيمة الافتراضية
                }
            }
            
            task.setUser(user);
            
            // حفظ المهمة
            Task savedTask = taskService.saveTask(task);
            System.out.println("Tâche créée avec succès - ID: " + savedTask.getId());
            
            // إعداد الاستجابة
            response.put("success", true);
            response.put("message", "Tâche créée avec succès");
            response.put("task", savedTask);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erreur lors de la création: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // الحصول على مهام المستخدم
    @GetMapping("/user/{username}")
    public ResponseEntity<Map<String, Object>> getTasksByUser(@PathVariable String username) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("Récupération des tâches pour l'utilisateur: " + username);
            
            User user = userService.getUserByUsername(username);
            if (user == null) {
                response.put("success", false);
                response.put("message", "Utilisateur non trouvé: " + username);
                return ResponseEntity.status(404).body(response);
            }
            
            List<Task> tasks = taskService.getTasksByUser(user);
            System.out.println("Nombre de tâches trouvées: " + tasks.size());
            
            response.put("success", true);
            response.put("message", "Tâches récupérées avec succès");
            response.put("tasks", tasks);
            response.put("count", tasks.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // تحديث مهمة
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> updateData) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("Mise à jour de la tâche ID: " + id);
            System.out.println("Données de mise à jour: " + updateData);
            
            Task updatedTask = taskService.updateTask(id, updateData);
            
            response.put("success", true);
            response.put("message", "Tâche mise à jour avec succès");
            response.put("task", updatedTask);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erreur lors de la mise à jour: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // حذف مهمة
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("Suppression de la tâche ID: " + id);
            
            taskService.deleteTask(id);
            
            response.put("success", true);
            response.put("message", "Tâche supprimée avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // الحصول على مهمة بواسطة ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTaskById(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Task task = taskService.getTaskById(id)
                    .orElseThrow(() -> new RuntimeException("Tâche non trouvée"));
            
            response.put("success", true);
            response.put("message", "Tâche récupérée avec succès");
            response.put("task", task);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(404).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Erreur lors de la récupération: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}