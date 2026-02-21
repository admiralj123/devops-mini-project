# ===== Stage 1 : Build =====
FROM node:22-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (compatible Windows/Linux)
RUN npm install

# Copier le reste du code
COPY . .

# Build l'application Angular
RUN npm run build --prod

# ===== Stage 2 : Serveur Nginx =====
FROM nginx:alpine

# نسخ الملفات من داخل browser folder seulement (adapté pour Angular récent)
COPY --from=build /app/dist/todo-frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]