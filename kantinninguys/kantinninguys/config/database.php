<?php
/**
 * KantinNinGuys - Konfigurasi Koneksi Database MySQL (PDO)
 * File: config/database.php
 * Tanggung Jawab: Orang 1 (Integrasi dengan Orang 3)
 */

$db_host = 'localhost';
$db_port = '3306';
$db_name = 'kantinninguys';
$db_user = 'root';
$db_pass = ''; // Default XAMPP kosong tanpa password

try {
    $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Melempar PDOException untuk mekanisme Rollback
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Mengembalikan array asosiatif
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Menggunakan native prepared statements
    ];

    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    die("Koneksi database gagal: " . htmlspecialchars($e->getMessage()));
}
?>
