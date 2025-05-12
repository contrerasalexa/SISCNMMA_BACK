const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { nombre_completo, fecha_nacimiento, sexo, id_deporte, email } = req.body;

  try {
    if (!nombre_completo || !fecha_nacimiento || !sexo || !email) {
      return res.status(400).json({ success: false, error: "Datos incompletos" });
    }

    const result = await db.query(
      `INSERT INTO atleta (nombre_completo, fecha_nacimiento, sexo, id_deporte, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_atleta`,
      [nombre_completo, fecha_nacimiento, sexo, id_deporte || 2, email]
    );

    res.json({ success: true, id_atleta: result.rows[0].id_atleta });
  } catch (error) {
    console.error("Error al registrar atleta:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/opciones", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id_atleta AS id, nombre_completo, fecha_nacimiento, email
      FROM atleta
    `);
    res.json({ success: true, atletas: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error al obtener atletas" });
  }
});

router.get("/listado", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id_atleta AS id, a.nombre_completo, a.fecha_nacimiento, a.sexo, u.email
      FROM atleta a
      JOIN usuario u ON a.id_usuario = u.id_usuario
      WHERE u.estatus IN (1, 2)
    `);
    res.json({ success: true, atletas: result.rows });
  } catch (error) {
    console.error("Error al obtener atletas vinculados:", error);
    res.status(500).json({ success: false, error: "Error al obtener atletas" });
  }
});

module.exports = router;