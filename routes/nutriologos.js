const express = require("express");
const router = express.Router();
const db = require("../db");

// Registrar nuevo nutriólogo
router.post("/", async (req, res) => {
  const { nombre_completo, fecha_nacimiento, cedula_profesional, email, id_usuario } = req.body;

  try {
    if (!nombre_completo || !fecha_nacimiento || !cedula_profesional || !email || !id_usuario) {
      return res.status(400).json({ success: false, error: "Datos incompletos" });
    }

    const result = await db.query(
      `INSERT INTO nutriologo (nombre_completo, fecha_nacimiento, cedula_profesional, email, id_usuario)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_nutriologo`,
      [nombre_completo, fecha_nacimiento, cedula_profesional, email, id_usuario]
    );

    res.json({ success: true, id_nutriologo: result.rows[0].id_nutriologo });
  } catch (error) {
    console.error("Error al registrar nutriólogo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener opciones de nutriólogos
router.get("/opciones", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id_nutriologo AS id, nombre_completo, fecha_nacimiento, email
      FROM nutriologo
    `);
    res.json({ success: true, nutriologos: result.rows });
  } catch (error) {
    console.error("Error al obtener nutriólogos:", error);
    res.status(500).json({ success: false, error: "Error al obtener nutriólogos" });
  }
});

// Obtener lista con datos completos
router.get("/ver-nutriologos", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT n.id_nutriologo AS id, n.nombre_completo, n.fecha_nacimiento, u.email, n.cedula_profesional
      FROM nutriologo n
      JOIN usuario u ON n.id_usuario = u.id_usuario
      WHERE u.estatus IN (1, 2)
    `);
    res.json({ success: true, nutriologos: result.rows });
  } catch (error) {
    console.error("Error al obtener nutriólogos:", error);
    res.status(500).json({ success: false, error: "Error al obtener nutriólogos" });
  }
});

// Obtener id_nutriologo por id_usuario
router.get("/byUser/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT id_nutriologo FROM nutriologo WHERE id_usuario = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Nutriólogo no encontrado" });
    }

    res.json({ success: true, id_nutriologo: result.rows[0].id_nutriologo });
  } catch (error) {
    console.error("Error al obtener nutriólogo por usuario:", error);
    res.status(500).json({ success: false, error: "Error del servidor" });
  }
});

module.exports = router;
