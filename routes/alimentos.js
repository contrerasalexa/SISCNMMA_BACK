// routes/alimentos.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener todos los alimentos
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM alimento ORDER BY nombre ASC");
    res.json({ success: true, alimentos: result.rows });
  } catch (error) {
    console.error("Error al obtener alimentos:", error);
    res.status(500).json({ success: false, error: "Error al obtener los alimentos." });
  }
});

module.exports = router;
