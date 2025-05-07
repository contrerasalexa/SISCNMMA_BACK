const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_usuario, nombre_usuario, email, rol, estatus
      FROM usuario
      ORDER BY id_usuario ASC
    `);
    res.json({ success: true, usuarios: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener los usuarios' });
  }
});

router.put('/estatus/:id', async (req, res) => {
  const { id } = req.params;
  const { nuevoEstatus } = req.body;

  try {
    await pool.query(
      'UPDATE usuario SET estatus = $1 WHERE id_usuario = $2',
      [nuevoEstatus, id]
    );
    res.json({ success: true, message: 'Estatus actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al actualizar estatus' });
  }
});

router.post('/', async (req, res) => {
  const { nombre_usuario, email, password, rol, fecha_nacimiento, sexo, id_deporte } = req.body;

  try {
    // Insertar usuario
    const result = await pool.query(`
      INSERT INTO usuario (nombre_usuario, email, password, rol, estatus)
      VALUES ($1, $2, $3, $4, 1)
      RETURNING *
    `, [nombre_usuario, email, password, rol]);
    
    const nuevoUsuario = result.rows[0];
    
    if (nuevoUsuario.rol === 3) {
      await pool.query(`
        INSERT INTO atleta (id_atleta, nombre_completo, email)
        VALUES ($1, $2, $3)
      `, [nuevoUsuario.id_usuario, nuevoUsuario.nombre_usuario, nuevoUsuario.email]);
    }
    

    res.json({ success: true, usuario: nuevoUsuario });
  } catch (err) {
    console.error("Error en POST /usuarios:", err);
    res.status(500).json({ success: false, error: "Error al registrar usuario" });
  }
});




module.exports = router;
