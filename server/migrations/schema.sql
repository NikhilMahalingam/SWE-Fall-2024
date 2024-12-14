CREATE TABLE IF NOT EXISTS User_Account(
	user_id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    isAdmin INTEGER CHECK (isAdmin == 0 || isAdmin == 1)
);

CREATE TABLE IF NOT EXISTS Computer_Part(
	part_id INTEGER PRIMARY KEY,
    part_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    date_posted DATETIME NOT NULL,
    unit_price FLOAT NOT NULL,
    slug TEXT NULL, 
    component_type TEXT NOT NULL, 
    other_info TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Cpu(
	part_id INTEGER PRIMARY KEY,
    cores INTEGER NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Storage_Device(
	part_id INTEGER PRIMARY KEY,
    memory TEXT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Gpu(
	part_id INTEGER PRIMARY KEY,
    vram TEXT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Motherboard(
	part_id INTEGER PRIMARY KEY,
    form_factor TEXT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Computer_case(
	part_id INTEGER PRIMARY KEY,
    size FLOAT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Cooling(
	part_id INTEGER PRIMARY KEY,
    method TEXT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Pre_Build(
	build_id INTEGER PRIMARY KEY,
    build_name TEXT NOT NULL,
    build_price FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS Uses(
	part_id INTEGER,
    build_id INTEGER,
    PRIMARY KEY (part_id, build_id),
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE,
    FOREIGN KEY (build_id) REFERENCES Pre_Build(build_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Parts_Order(
	order_id INTEGER PRIMARY KEY,
    date DATETIME NOT NULL,
    status TEXT CHECK(status IN ('In Cart', 'Completed', 'Cancelled')) NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES User_Account(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Consists(
	part_id INTEGER,
	order_id INTEGER,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (part_id, order_id),
    FOREIGN KEY (part_id) REFERENCES Computer_Part(part_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES Parts_Order(order_id) ON DELETE CASCADE
);

INSERT INTO User_Account(name, password, email, isAdmin) VALUES('Alice', 'AlicePass', 'alice@example.com', 0);
INSERT INTO User_Account(name, password, email, isAdmin) VALUES('Bob', 'BobPass', 'bob@example.com', 0);
INSERT INTO User_Account(name, password, email, isAdmin) VALUES('Charlie', 'CharliePass', 'charlie@example.com', 0);
INSERT INTO User_Account(name, password, email, isAdmin) VALUES('Admin', 'AdminPass', 'admin@example.com', 1);