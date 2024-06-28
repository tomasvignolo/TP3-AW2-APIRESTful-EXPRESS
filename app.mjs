import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(cors());

dotenv.config();

const port = process.env.PORT || 3333;
const secret = process.env.SECRET;
const pg_user = process.env.PG_USER;
const pg_pass = process.env.PG_PASS;

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  user: pg_user,
  database: 'productos',
  port: 5432,
  password: pg_pass,
  
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware para verificar token
const verificarToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Acceso no autorizado');
  }

  try {
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(401).send('Acceso no autorizado');
  }
};

// Método GET -> Obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// Método GET -> Obtener producto por ID
app.get('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// Método POST -> Crear nuevo producto
app.post('/productos', verificarToken, async (req, res) => {
  const { nombre, marca, categoria, stock, precio } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, marca, categoria, stock, precio) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, marca, categoria, stock, precio]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// Método PUT -> Actualizar producto por ID
app.put('/productos/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, marca, categoria, stock, precio } = req.body;
  try {
    const result = await pool.query(
      'UPDATE productos SET nombre = $1, marca = $2, categoria = $3, stock = $4, precio = $5 WHERE id = $6 RETURNING *',
      [nombre, marca, categoria, stock, precio, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// Método DELETE -> Eliminar producto por ID
app.delete('/productos/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      res.json({ message: 'Producto eliminado', producto: result.rows[0] });
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// Registrar usuario
app.post('/register', async (req, res) => {
  const { nombre, usuario, clave } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const claveEncriptada = bcrypt.hashSync(clave, salt);

  try {
    const result = await pool.query('INSERT INTO usuarios (nombre, usuario, clave) VALUES ($1, $2, $3)', [
      nombre,
      usuario,
      claveEncriptada,
    ]);
    res.status(201).send('Usuario registrado correctamente');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// Iniciar sesión
app.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    if (result.rows.length === 0) {
      return res.status(401).send('Usuario o contraseña incorrectos');
    }

    const usuarioDB = result.rows[0];
    const claveValida = bcrypt.compareSync(clave, usuarioDB.clave);

    if (!claveValida) {
      return res.status(401).send('Usuario o contraseña incorrectos');
    }

    const token = jwt.sign({ usuario: usuarioDB.usuario }, secret, { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: true });
    res.send('Inicio de sesión exitoso');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Error del servidor');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
