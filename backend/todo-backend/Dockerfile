# ===== Stage 1 : Build =====
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# نسخ ملفات المشروع
COPY pom.xml .
COPY src ./src

# بناء التطبيق
RUN mvn clean package -DskipTests

# ===== Stage 2 : Run =====
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# نسخ الـ JAR من مرحلة البناء
COPY --from=build /app/target/*.jar app.jar

# متغيرات البيئة
ENV SPRING_PROFILES_ACTIVE=docker
ENV SERVER_PORT=8080

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]