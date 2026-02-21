# استخدام صورة PostgreSQL الرسمية
FROM postgres:15-alpine

# تعيين متغيرات البيئة الافتراضية (يمكن تغييرها في docker-compose)
ENV POSTGRES_DB=todo_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# نسخ سكريبتات التهيئة إذا وجدت
COPY ./init.sql /docker-entrypoint-initdb.d/

# فتح المنفذ الافتراضي لـ PostgreSQL
EXPOSE 5432

# الأمر الافتراضي لتشغيل PostgreSQL
CMD ["postgres"]