CREATE DATABASE IF NOT EXISTS cafe_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cafe_system;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `menu_items`;
DROP TABLE IF EXISTS `tables`;

SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE `tables` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `table_number` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tables_table_number` (`table_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `menu_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) NOT NULL DEFAULT '',
  `category` VARCHAR(60) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_menu_items_category` (`category`),
  KEY `idx_menu_items_is_available` (`is_available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `table_number` INT UNSIGNED NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'preparing', 'served', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created_at` (`created_at`),
  CONSTRAINT `fk_orders_table_number`
    FOREIGN KEY (`table_number`) REFERENCES `tables` (`table_number`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `item_name` VARCHAR(120) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  CONSTRAINT `fk_order_items_order_id`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tables` (`table_number`) VALUES
  (1), (2), (3), (4), (5), (6), (7), (8), (9), (10),
  (11), (12), (13), (14), (15), (16), (17), (18), (19), (20);

INSERT INTO `menu_items` (`name`, `description`, `category`, `price`, `image`, `is_available`) VALUES
  ('Espresso', 'Bold espresso shot with a dense crema.', 'Coffee', 14.00, '/frontend/images/menu/espresso.svg', 1),
  ('Cappuccino', 'Balanced espresso, steamed milk, and airy foam.', 'Coffee', 20.00, '/frontend/images/menu/cappuccino.svg', 1),
  ('Latte', 'Smooth milk-forward coffee with a rounded finish.', 'Coffee', 22.00, '/frontend/images/menu/latte.svg', 1),
  ('Mocha', 'Chocolate espresso drink with a velvety texture.', 'Coffee', 24.00, '/frontend/images/menu/mocha.svg', 1),
  ('Iced Americano', 'Chilled espresso over ice for a crisp finish.', 'Cold Drinks', 18.00, '/frontend/images/menu/iced-americano.svg', 1),
  ('Orange Juice', 'Fresh citrus juice served cold.', 'Cold Drinks', 15.00, '/frontend/images/menu/orange-juice.svg', 1),
  ('Berry Lemonade', 'Sweet and tart lemonade with berry notes.', 'Cold Drinks', 17.00, '/frontend/images/menu/berry-lemonade.svg', 1),
  ('Club Sandwich', 'Stacked sandwich with layers of crunch and flavor.', 'Sandwiches', 32.00, '/frontend/images/menu/club-sandwich.svg', 1),
  ('Chicken Panini', 'Pressed sandwich with grilled chicken and melted cheese.', 'Sandwiches', 35.00, '/frontend/images/menu/chicken-panini.svg', 1),
  ('Veggie Wrap', 'Fresh wrap packed with seasonal vegetables.', 'Sandwiches', 28.00, '/frontend/images/menu/veggie-wrap.svg', 1),
  ('Cheesecake', 'Creamy cheesecake with a delicate crumb base.', 'Desserts', 26.00, '/frontend/images/menu/cheesecake.svg', 1),
  ('Chocolate Brownie', 'Dense chocolate brownie with a fudgy center.', 'Desserts', 18.00, '/frontend/images/menu/brownie.svg', 1),
  ('Tiramisu', 'Italian layered dessert with coffee and mascarpone.', 'Desserts', 29.00, '/frontend/images/menu/tiramisu.svg', 1);
