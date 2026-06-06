-- Script para crear la base de datos y tabla de usuarios

-- Crear base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS tfm_unir;
USE tfm_unir;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ejemplo: Crear un usuario de prueba (contraseña: 123456)
-- INSERT INTO usuarios (email, password, nombre) VALUES 
-- ('test@example.com', '$2a$10$...', 'Usuario Test');
