const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Carpeta para el Frontend

// Conexión a la Base de Datos de Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Crear tabla automáticamente al iniciar
pool.query(`CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    director VARCHAR(255) NOT NULL,
    year INT NOT NULL
)`).catch(err => console.error("Error creando tabla", err));

// 1. CONSULTAR TODOS (Read All)
app.get('/api/movies', async (req, res) => {
    const result = await pool.query('SELECT * FROM movies ORDER BY id DESC');
    res.json(result.rows);
});

// 2. CONSULTAR INDIVIDUAL (Read One)
app.get('/api/movies/:id', async (req, res) => {
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
});

// 3. AGREGAR REGISTRO (Create)
app.post('/api/movies', async (req, res) => {
    const { title, director, year } = req.body;
    await pool.query('INSERT INTO movies (title, director, year) VALUES ($1, $2, $3)', [title, director, year]);
    res.json({ message: "Película agregada" });
});

// 4. EDITAR REGISTRO (Update)
app.put('/api/movies/:id', async (req, res) => {
    const { title, director, year } = req.body;
    await pool.query('UPDATE movies SET title=$1, director=$2, year=$3 WHERE id=$4', [title, director, year, req.params.id]);
    res.json({ message: "Película actualizada" });
});

// 5. ELIMINAR REGISTRO (Delete)
app.delete('/api/movies/:id', async (req, res) => {
    await pool.query('DELETE FROM movies WHERE id = $1', [req.params.id]);
    res.json({ message: "Película eliminada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));