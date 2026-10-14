-- =====================================================================
-- KANTINNINGUYS - SKEMA DATABASE RESMI SESUAI DOKUMEN WORD
-- Tujuh Tabel Utama: users, merchants, categories, menus, orders, order_details, payments
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `kantinninguys` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kantinninguys`;

-- ---------------------------------------------------------------------
-- 1. TABEL: users (Tanggung jawab Orang 5)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `role` ENUM('student', 'admin') DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. TABEL: merchants (Tanggung jawab Orang 4)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `location` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. TABEL: categories (Tanggung jawab Orang 4)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. TABEL: menus (Tanggung jawab Orang 2 & Orang 4)
-- Kolom resmi: id, merchant_id, category_id, name, description, price, photo_url, stock, created_at
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `menus` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `merchant_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `photo_url` VARCHAR(255) NULL,
  `stock` INT NOT NULL DEFAULT 50,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. TABEL: orders (Tanggung jawab Orang 3)
-- Kolom resmi: id, user_id, order_number, total, status, notes, created_at
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `order_number` VARCHAR(30) NOT NULL UNIQUE,
  `total` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('menunggu', 'diproses', 'siap_diambil', 'selesai') DEFAULT 'menunggu',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. TABEL: order_details (Tanggung jawab Orang 3)
-- Kolom resmi: id, order_id, menu_id, jumlah, harga, subtotal, created_at
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `menu_id` INT NOT NULL,
  `jumlah` INT NOT NULL,
  `harga` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. TABEL: payments (Tanggung jawab Orang 3)
-- Kolom resmi: id, order_id, metode, jumlah, tanggal_bayar, status, created_at
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `metode` VARCHAR(30) NOT NULL,
  `jumlah` DECIMAL(10, 2) NOT NULL,
  `tanggal_bayar` TIMESTAMP NULL DEFAULT NULL,
  `status` ENUM('menunggu', 'berhasil', 'ditolak') DEFAULT 'menunggu',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- DATA DUMMY AWAL SESUAI STRUKTUR RESMI
-- =====================================================================

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'Ahmad Fauzi', 'ahmad@kampus.ac.id', '$2y$10$abcdefghijklmnopqrstuv', '081234567890', 'student'),
(2, 'Ibu Siti (Stand 01)', 'siti@kantin.ac.id', '$2y$10$abcdefghijklmnopqrstuv', '081298765432', 'admin'),
(3, 'Mas Eko (Stand 02)', 'eko@kantin.ac.id', '$2y$10$abcdefghijklmnopqrstuv', '081345678901', 'admin')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `merchants` (`id`, `user_id`, `name`, `description`, `location`) VALUES
(1, 2, 'Kantin Bu Siti - Aneka Nasi', 'Aneka olahan nasi, ayam krispi, geprek, dan gorengan hangat.', 'Stand 01 - Lantai 1'),
(2, 3, 'Kedai Mas Eko - Mie & Minuman', 'Spesialis mie dok-dok, racikan kopi susu gula aren, dan aneka minuman dingin.', 'Stand 02 - Lantai 1')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Makanan', 'Aneka hidangan berat dan makanan utama'),
(2, 'Minuman', 'Aneka minuman segar dingin dan hangat'),
(3, 'Camilan', 'Aneka snack dan gorengan')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `menus` (`id`, `merchant_id`, `category_id`, `name`, `description`, `price`, `photo_url`, `stock`) VALUES
(1, 1, 1, 'Nasi Ayam Geprek Sambal Bawang', 'Ayam krispi digeprek dengan sambal bawang pedas khas Bu Siti, disajikan dengan nasi hangat dan lalapan.', 15000.00, 'ayam_geprek.jpg', 30),
(2, 1, 1, 'Nasi Goreng Spesial Telur', 'Nasi goreng racikan bumbu khas kantin dengan suwiran ayam, bakso, dan telur mata sapi renyah.', 13000.00, 'nasgor.jpg', 25),
(3, 1, 3, 'Tahu & Tempe Mendoan (Porsi)', 'Gorengan mendoan hangat gurih lengkap dengan sambal kecap rawit pedas manis.', 6000.00, 'mendoan.jpg', 40),
(4, 1, 2, 'Es Teh Manis Jumbo', 'Es teh melati segar porsi jumbo, pas untuk menemani istirahat kuliah siang.', 4000.00, 'es_teh.jpg', 50),
(5, 2, 1, 'Mie Dok-Dok Kuah Pedas', 'Mie kuah nyemek bumbu rempah pedas gurih dengan campuran telur kocok dan sayuran segar.', 12000.00, 'mie_dokdok.jpg', 20),
(6, 2, 2, 'Kopi Susu Gula Aren Dingin', 'Espresso susu creamy dengan pemanis gula aren asli, penambah semangat kuliah.', 8000.00, 'kopi_susu.jpg', 35)
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`);
