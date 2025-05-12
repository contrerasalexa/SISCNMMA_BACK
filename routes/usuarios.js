const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todos los usuarios (sin los eliminados)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_usuario, nombre_usuario, email, rol, estatus
      FROM usuario
      WHERE estatus != 3
      ORDER BY id_usuario ASC
    `);
    res.json({ success: true, usuarios: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener los usuarios' });
  }
});

// Actualizar estatus (activo/bloqueado)
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

// Actualizar datos del usuario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_usuario, email, password, rol } = req.body;

  try {
    if (password && password.trim() !== "") {
      await pool.query(
        `UPDATE usuario SET nombre_usuario = $1, email = $2, rol = $3, password = $4 WHERE id_usuario = $5`,
        [nombre_usuario, email, rol, password, id]
      );
    } else {
      await pool.query(
        `UPDATE usuario SET nombre_usuario = $1, email = $2, rol = $3 WHERE id_usuario = $4`,
        [nombre_usuario, email, rol, id]
      );
    }

    res.json({ success: true, message: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ success: false, error: "Error al actualizar usuario" });
  }
});

// Crear nuevo usuario (ya existe atleta/nutriologo con mismo email)
router.post('/', async (req, res) => {
  const { nombre_usuario, email, password, rol } = req.body;

  try {
    if (!nombre_usuario || !email || !password || !rol) {
      return res.status(400).json({ success: false, error: "Faltan datos obligatorios" });
    }
    
    const existe = await pool.query(`SELECT 1 FROM usuario WHERE email = $1`, [email]);
    if (existe.rowCount > 0) {
      return res.status(400).json({ success: false, error: "Ya existe un usuario con ese email." });
    }

    const result = await pool.query(`
      INSERT INTO usuario (nombre_usuario, email, password, rol, estatus)
      VALUES ($1, $2, $3, $4, 1)
      RETURNING *
    `, [nombre_usuario, email, password, rol]);

    const nuevoUsuario = result.rows[0];

    // Vincular con atleta o nutriólogo por email
    if (rol === 2) {
      await pool.query(`UPDATE nutriologo SET id_usuario = $1 WHERE email = $2`, [nuevoUsuario.id_usuario, email]);
    } else if (rol === 3) {
      await pool.query(`UPDATE atleta SET id_usuario = $1 WHERE email = $2`, [nuevoUsuario.id_usuario, email]);
    }

    res.json({ success: true, usuario: nuevoUsuario });
  } catch (err) {
    console.error("Error en POST /usuarios:", err);
    res.status(500).json({ success: false, error: "Error al registrar usuario." });
  }
});

// Borrado lógico
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE usuario SET estatus = 3 WHERE id_usuario = $1`,
      [id]
    );
    res.json({ success: true, message: 'Usuario eliminado lógicamente' });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ success: false, error: "Error al eliminar usuario" });
  }
});

module.exports = router;
