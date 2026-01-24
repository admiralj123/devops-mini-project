package com.todo.todo_backend.repository;

import com.todo.todo_backend.model.Task;
import com.todo.todo_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // البحث عن مهام المستخدم مرتبة حسب تاريخ الإنشاء
    List<Task> findByUserOrderByCreatedAtDesc(User user);
    
    // حذف مهام المستخدم
    void deleteByUser(User user);
    
    // العد حسب الحالة
    long countByUserAndStatus(User user, String status);
    
    // العد حسب الفئة
    long countByUserAndCategory(User user, String category);
}