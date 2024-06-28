-- Crear la tabla productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    marca VARCHAR(255) NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    stock INT NOT NULL
);

-- Crear la tabla usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    usuario VARCHAR(255) NOT NULL UNIQUE,
    clave VARCHAR(255) NOT NULL
);

-- Insertar productos electrónicos
INSERT INTO productos (id, nombre, marca, categoria, stock) VALUES 
(2, 'Laptop ABC', 'MarcaB', 'Laptops', 27),
(3, 'Tablet DEF', 'MarcaC', 'Tablets', 20),
(4, 'Smartwatch GHI', 'MarcaD', 'Smartwatches', 15),
(5, 'Auriculares JKL', 'MarcaE', 'Auriculares', 100),
(6, 'Televisor MNO', 'MarcaF', 'Televisores', 25),
(7, 'Consola de Videojuegos PQR', 'MarcaG', 'Consolas', 10),
(8, 'Cámara Digital STU', 'MarcaH', 'Cámaras', 5),
(9, 'Altavoces VWXbv', 'MarcaI', 'Altavoces', 40),
(10, 'Proyector YZ', 'MarcaJ', 'Proyectores', 8),
(11, 'Tomás', 'Boca Juniors', 'Cracks', 0),
(12, 'Luca', 'Aldosivi', 'Enanos', 20),
(13, 'Rasero', 'Boca Juniors', 'Negro', -99)
 
SELECT * FROM productos