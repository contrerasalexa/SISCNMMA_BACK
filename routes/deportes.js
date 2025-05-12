const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id_deporte, nombre
      FROM deporte
      WHERE estatus = 1
      ORDER BY nombre ASC
    `);
    res.json({ success: true, deportes: result.rows });
  } catch (error) {
    console.error("Error al obtener deportes:", error);
    res.status(500).json({ success: false, error: "Error al obtener deportes" });
  }
});

module.exports = router;
