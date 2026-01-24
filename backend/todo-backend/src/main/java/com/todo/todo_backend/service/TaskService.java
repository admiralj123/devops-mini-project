package com.todo.todo_backend.service;

import com.todo.todo_backend.model.Task;
import com.todo.todo_backend.model.User;
import com.todo.todo_backend.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // حفظ مهمة جديدة
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }

    // الحصول على جميع مهام المستخدم
    public List<Task> getTasksByUser(User user) {
        return taskRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // تحديث مهمة باستخدام Map
    public Task updateTask(Long id, Map<String, Object> updateData) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée avec l'id: " + id));
        
        if (updateData.containsKey("title")) {
            task.setTitle((String) updateData.get("title"));
        }
        
        if (updateData.containsKey("description")) {
            Object desc = updateData.get("description");
            task.setDescription(desc != null ? desc.toString() : null);
        }
        
        if (updateData.containsKey("category")) {
            task.setCategory((String) updateData.get("category"));
        }
        
        if (updateData.containsKey("priority")) {
            task.setPriority((String) updateData.get("priority"));
        }
        
        if (updateData.containsKey("status")) {
            task.setStatus((String) updateData.get("status"));
        }
        
        if (updateData.containsKey("dueDate")) {
            Object dueDateObj = updateData.get("dueDate");
            if (dueDateObj != null && !dueDateObj.toString().trim().isEmpty()) {
                try {
                    task.setDueDate(LocalDate.parse(dueDateObj.toString()));
                } catch (Exception e) {
                    System.out.println("Format de date invalide: " + dueDateObj);
                    // يمكن ترك الحقل فارغاً أو التعامل مع الخطأ حسب احتياجاتك
                }
            } else {
                task.setDueDate(null);
            }
        }
        
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    // تحديث مهمة باستخدام كائن Task (للتوافق مع الطرق القديمة)
    public Task updateTask(Long id, Task updatedTask) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tâche non trouvée avec l'id: " + id));
        
        if (updatedTask.getTitle() != null) {
            task.setTitle(updatedTask.getTitle());
        }
        if (updatedTask.getDescription() != null) {
            task.setDescription(updatedTask.getDescription());
        }
        if (updatedTask.getCategory() != null) {
            task.setCategory(updatedTask.getCategory());
        }
        if (updatedTask.getPriority() != null) {
            task.setPriority(updatedTask.getPriority());
        }
        if (updatedTask.getStatus() != null) {
            task.setStatus(updatedTask.getStatus());
        }
        if (updatedTask.getDueDate() != null) {
            task.setDueDate(updatedTask.getDueDate());
        }
        
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    // حذف مهمة
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Tâche non trouvée avec l'id: " + id);
        }
        taskRepository.deleteById(id);
    }

    // الحصول على مهمة بواسطة ID
    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }
}