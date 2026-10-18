-- =====================================================================
-- KANTINNINGUYS - DATA DEMO UNTUK DASHBOARD ADMIN (ORANG 4)
-- Jalankan SETELAH database_orang3.sql. File ini OPSIONAL dan aman dijalankan
-- berulang kali (tidak membuat data ganda). Hanya untuk mengisi dashboard saat testing.
-- Tidak mengubah struktur tabel apa pun.
-- =====================================================================
USE `kantinninguys`;

-- Mahasiswa tambahan untuk contoh pesanan
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(4, 'Budi Santoso', 'budi@kampus.ac.id', '$2y$10$abcdefghijklmnopqrstuv', '081211112222', 'student'),
(5, 'Citra Lestari', 'citra@kampus.ac.id', '$2y$10$abcdefghijklmnopqrstuv', '081233334444', 'student')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Pesanan contoh (order_number UNIQUE -> INSERT IGNORE agar tidak dobel)
INSERT IGNORE INTO `orders` (`user_id`, `order_number`, `total`, `status`, `notes`, `created_at`) VALUES
(1, 'KNG-DEMO-0001', 30000.00, 'selesai',       NULL,                       NOW() - INTERVAL 5 DAY),
(4, 'KNG-DEMO-0002', 19000.00, 'selesai',       'Tidak pakai sambal',       NOW() - INTERVAL 4 DAY),
(5, 'KNG-DEMO-0003', 12000.00, 'selesai',       NULL,                       NOW() - INTERVAL 3 DAY),
(1, 'KNG-DEMO-0004', 28000.00, 'selesai',       NULL,                       NOW() - INTERVAL 2 DAY),
(4, 'KNG-DEMO-0005', 19000.00, 'siap_diambil',  'Sambal dipisah',           NOW() - INTERVAL 1 DAY),
(5, 'KNG-DEMO-0006', 15000.00, 'diproses',      NULL,                       NOW() - INTERVAL 2 HOUR),
(1, 'KNG-DEMO-0007', 17000.00, 'menunggu',      'Es teh kurangi gula',      NOW() - INTERVAL 20 MINUTE),
(4, 'KNG-DEMO-0008', 20000.00, 'menunggu',      NULL,                       NOW() - INTERVAL 5 MINUTE);

-- Rincian item (hanya diisi bila pesanan belum punya rincian)
INSERT INTO `order_details` (`order_id`, `menu_id`, `jumlah`, `harga`, `subtotal`)
SELECT o.id, x.menu_id, x.jumlah, x.harga, x.jumlah * x.harga
FROM `orders` o
JOIN (
    SELECT 'KNG-DEMO-0001' AS no, 1 AS menu_id, 2 AS jumlah, 15000 AS harga UNION ALL
    SELECT 'KNG-DEMO-0002', 2, 1, 13000 UNION ALL SELECT 'KNG-DEMO-0002', 3, 1, 6000 UNION ALL
    SELECT 'KNG-DEMO-0003', 5, 1, 12000 UNION ALL
    SELECT 'KNG-DEMO-0004', 2, 1, 13000 UNION ALL SELECT 'KNG-DEMO-0004', 1, 1, 15000 UNION ALL
    SELECT 'KNG-DEMO-0005', 2, 1, 13000 UNION ALL SELECT 'KNG-DEMO-0005', 3, 1, 6000 UNION ALL
    SELECT 'KNG-DEMO-0006', 1, 1, 15000 UNION ALL
    SELECT 'KNG-DEMO-0007', 2, 1, 13000 UNION ALL SELECT 'KNG-DEMO-0007', 4, 1, 4000 UNION ALL
    SELECT 'KNG-DEMO-0008', 5, 1, 12000 UNION ALL SELECT 'KNG-DEMO-0008', 6, 1, 8000
) x ON x.no = o.order_number
WHERE o.order_number LIKE 'KNG-DEMO-%'
  AND NOT EXISTS (SELECT 1 FROM `order_details` d WHERE d.order_id = o.id);

-- Pembayaran (hanya untuk pesanan demo yang belum punya data pembayaran)
INSERT INTO `payments` (`order_id`, `metode`, `jumlah`, `tanggal_bayar`, `status`)
SELECT o.id,
       CASE MOD(o.id, 3) WHEN 0 THEN 'qris_manual' WHEN 1 THEN 'tunai' ELSE 'transfer_manual' END,
       o.total,
       CASE WHEN o.status IN ('menunggu') THEN NULL ELSE o.created_at END,
       CASE WHEN o.status IN ('menunggu') THEN 'menunggu' ELSE 'berhasil' END
FROM `orders` o
WHERE o.order_number LIKE 'KNG-DEMO-%'
  AND NOT EXISTS (SELECT 1 FROM `payments` p WHERE p.order_id = o.id);
