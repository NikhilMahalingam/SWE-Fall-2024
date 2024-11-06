CREATE DATABASE IF NOT EXISTS PCComposer;
USE PCComposer;

CREATE TABLE IF NOT EXISTS User_Account(
	user_id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    CHECK (email REGEXP '^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    role ENUM('Admin') NULL
);

CREATE TABLE IF NOT EXISTS Computer_Part(
	part_id INT AUTO_INCREMENT PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    size FLOAT NOT NULL,
    date_posted DATETIME NOT NULL,
    unit_price FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS Cpu(
	part_id INT PRIMARY KEY,
    cores INT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Storage_Device(
	part_id INT PRIMARY KEY,
    memory INT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Gpu(
	part_id INT PRIMARY KEY,
    vram VARCHAR(100) NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Motherboard(
	part_id INT PRIMARY KEY,
    form_factor VARCHAR(100) NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Computer_case(
	part_id INT PRIMARY KEY,
    size FLOAT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Cooling(
	part_id INT PRIMARY KEY,
    method VARCHAR(100) NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Pre_Build(
	build_id INT AUTO_INCREMENT PRIMARY KEY,
    build_name VARCHAR(100) NOT NULL,
    build_price FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS Uses(
	part_id INT,
    build_id INT,
    PRIMARY KEY (part_id, build_id),
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE,
    FOREIGN KEY (build_id) REFERENCES Pre_Build(build_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Parts_Order(
	order_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME NOT NULL,
    status ENUM('In Cart', 'Completed') NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES User_Account(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Consists(
	part_id INT,
	order_id INT,
    quantity INT NOT NULL,
    PRIMARY KEY (part_id, order_id),
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES Parts_Order(order_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Favorites(
	favorite_id INT AUTO_INCREMENT PRIMARY KEY,
	price_max FLOAT,
    brand VARCHAR(100),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES User_Account(user_id) ON DELETE CASCADE
);