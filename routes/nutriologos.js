const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { nombre_completo, fecha_nacimiento, cedula_profesional, email } = req.body;

  try {
    if (!nombre_completo || !fecha_nacimiento || !cedula_profesional || !email) {
        return res.status(400).json({ success: false, error: "Datos incompletos" });
      }      

    const result = await db.query(
      `INSERT INTO nutriologo (nombre_completo, fecha_nacimiento, cedula_profesional, email)
       VALUES ($1, $2, $3, $4) RETURNING id_nutriologo`,
      [nombre_completo, fecha_nacimiento, cedula_profesional, email]
    );

    res.json({ success: true, id_nutriologo: result.rows[0].id_nutriologo });
  } catch (error) {
    console.error("Error al registrar nutriólogo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/opciones", async (req, res) => {
    try {
      const result = await db.query(`
        SELECT id_nutriologo AS id, nombre_completo, fecha_nacimiento, email
        FROM nutriologo
      `);
      res.json({ success: true, nutriologos: result.rows });
    } catch (error) {
      console.error("Error al obtener nutriólogos disponibles:", error);
      res.status(500).json({ success: false, error: "Error al obtener nutriólogos" });
    }
  });

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
      console.error("Error al obtener nutriólogos disponibles:", error);
      res.status(500).json({ success: false, error: "Error al obtener nutriólogos" });
    }
  });
  

module.exports = router;
