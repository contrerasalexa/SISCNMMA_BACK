const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { nombre, descripcion, id_atleta, detalles } = req.body;

  if (!nombre || !id_atleta || !detalles) {
    return res.status(400).json({ success: false, error: "Faltan datos obligatorios" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Insertar plan
    const insertPlan = await client.query(
      `INSERT INTO plan_alimenticio (nombre, descripcion, id_atleta)
       VALUES ($1, $2, $3) RETURNING id_plan`,
      [nombre, descripcion, id_atleta]
    );

    const id_plan = insertPlan.rows[0].id_plan;

    // 2. Insertar los alimentos asociados al plan
    for (const tiempo_comida of Object.keys(detalles)) {
      const alimentos = detalles[tiempo_comida];

      for (const alimento of alimentos) {
        await client.query(
          `INSERT INTO detalle_plan (id_plan, tiempo_comida, id_alimento, cantidad, observaciones)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            id_plan,
            tiempo_comida,
            alimento.id_alimento,
            alimento.cantidad || 1,
            alimento.observaciones || null
          ]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ success: true, id_plan });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al guardar plan alimenticio:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
