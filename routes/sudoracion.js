const express = require("express");
const router = express.Router();
const db = require("../db");

// Registrar tasa de sudoración
router.post("/", async (req, res) => {
  const { id_usuario, fecha, peso_antes, peso_despues, liquido_ingesta_ml, duracion_ejercicio_min } = req.body;

  if (!id_usuario || !fecha || !peso_antes || !peso_despues || !liquido_ingesta_ml || !duracion_ejercicio_min) {
    return res.status(400).json({ success: false, error: "Datos incompletos" });
  }

  try {
    // Buscar id_atleta correspondiente al id_usuario
    const atletaResult = await db.query(
      `SELECT id_atleta FROM atleta WHERE id_usuario = $1`,
      [id_usuario]
    );

    if (atletaResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "No se encontró el atleta" });
    }

    const id_atleta = atletaResult.rows[0].id_atleta;

    const perdida_peso_kg = parseFloat(peso_antes) - parseFloat(peso_despues);
    const tasa_resultado_ml_hora = Math.round((((perdida_peso_kg * 1000) + parseFloat(liquido_ingesta_ml)) / (parseInt(duracion_ejercicio_min) / 60)) * 100) / 100;

    await db.query(
      `INSERT INTO tasa_sudoracion (
        id_atleta, fecha, peso_antes, peso_despues, liquido_ingesta_ml, duracion_ejercicio_min, tasa_resultado_ml_hora
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id_atleta, fecha, peso_antes, peso_despues, liquido_ingesta_ml, duracion_ejercicio_min, tasa_resultado_ml_hora]
    );

    res.json({ success: true, tasa: tasa_resultado_ml_hora });
  } catch (error) {
    console.error("Error al registrar tasa:", error);
    res.status(500).json({ success: false, error: "Error al registrar la tasa" });
  }
});

// Obtener historial por atleta
router.get("/historial/:id_atleta", async (req, res) => {
  const { id_atleta } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM tasa_sudoracion WHERE id_atleta = $1 ORDER BY fecha DESC`,
      [id_atleta]
    );
    res.json({ success: true, historial: result.rows });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ success: false, error: "Error al obtener historial" });
  }
});

module.exports = router;
