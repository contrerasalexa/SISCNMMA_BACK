const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(`
      SELECT id_usuario, nombre_usuario, rol, estatus
      FROM usuario
      WHERE email = $1 AND password = $2 AND estatus = 1
    `, [email, password]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({
        success: true,
        user: {
          id: user.id_usuario,
          nombre: user.nombre_usuario,
          rol: user.rol
        }
      });
    } else {
      res.status(401).json({ success: false, error: 'Credenciales inválidas o cuenta inactiva' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
