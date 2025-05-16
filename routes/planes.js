const express = require("express");
const router = express.Router();
const db = require("../db");

// Crear nuevo plan alimenticio
router.post("/", async (req, res) => {
  const { id_atleta, id_nutriologo, nombre, descripcion, detalles } = req.body;
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const nutriResult = await client.query(
      `SELECT id_nutriologo FROM nutriologo WHERE id_usuario = $1`,
      [id_nutriologo]
    );
    if (nutriResult.rowCount === 0) throw new Error("Nutriólogo no encontrado");
    const idNutriologoFinal = nutriResult.rows[0].id_nutriologo;

    const planResult = await client.query(
      `INSERT INTO plan_alimenticio (id_atleta, id_nutriologo, fecha_creacion, nombre, descripcion)
       VALUES ($1, $2, NOW(), $3, $4) RETURNING id_plan`,
      [id_atleta, idNutriologoFinal, nombre, descripcion]
    );

    const id_plan = planResult.rows[0].id_plan;
    for (const detalle of detalles) {
      const { id_alimento, tiempo_comida, cantidad, observaciones } = detalle;
      await client.query(
        `INSERT INTO detalle_plan (id_plan, id_alimento, tiempo_comida, cantidad, observaciones)
         VALUES ($1, $2, $3, $4, $5)`,
        [id_plan, id_alimento, tiempo_comida, cantidad || 1, observaciones || null]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, id_plan });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// Obtener todos los planes de un nutriólogo con nombre del atleta
router.get("/nutriologo/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
        SELECT p.*, a.nombre_completo AS nombre_atleta
        FROM plan_alimenticio p
        JOIN atleta a ON a.id_atleta = p.id_atleta
        WHERE p.id_nutriologo = $1
        ORDER BY p.fecha_creacion DESC
      `, [id]);
      
    res.json({ success: true, planes: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error al obtener los planes." });
  }
});

// Obtener todos los planes de un nutriólogo con nombre del atleta
// Obtener todos los planes de un atleta usando id_usuario
router.get("/atleta/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;

  try {
    // Buscar el id_atleta a partir del usuario
    const atletaResult = await db.query(
      `SELECT id_atleta FROM atleta WHERE id_usuario = $1`,
      [id_usuario]
    );

    if (atletaResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Atleta no encontrado" });
    }

    const id_atleta = atletaResult.rows[0].id_atleta;

    // Buscar los planes de ese atleta
    const result = await db.query(`
      SELECT p.*, a.nombre_completo AS nombre_atleta
      FROM plan_alimenticio p
      JOIN atleta a ON a.id_atleta = p.id_atleta
      WHERE p.id_atleta = $1
      ORDER BY p.fecha_creacion DESC
    `, [id_atleta]);

    res.json({ success: true, planes: result.rows });
  } catch (error) {
    console.error("Error al obtener planes del atleta:", error);
    res.status(500).json({ success: false, error: "Error al obtener los planes." });
  }
});


router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT 
          dp.tiempo_comida, 
          dp.cantidad, 
          a.nombre, 
          a.imagen, 
          a.energia_kcal, 
          a.proteina, 
          a.carbohidrato, 
          a.grasa,
          p.nombre AS nombre_plan,
          p.fecha_creacion,
          at.nombre_completo AS nombre_atleta
        FROM detalle_plan dp
        JOIN alimento a ON dp.id_alimento = a.id_alimento
        JOIN plan_alimenticio p ON dp.id_plan = p.id_plan
        JOIN atleta at ON p.id_atleta = at.id_atleta
        WHERE dp.id_plan = $1`,
      [id]
    );

    res.json({ success: true, detalles: result.rows });
  } catch (error) {
    console.error("Error al obtener detalle del plan:", error);
    res.status(500).json({ success: false, error: "Error al obtener el detalle del plan." });
  }
});


// Obtener detalle de un plan (ya lo tienes bien)

module.exports = router;
