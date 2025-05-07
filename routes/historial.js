// routes/historial.js
const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
    const {
        id_atleta,
        nombre_completo,
        email,
        fecha_nacimiento,
        sexo,
        id_deporte,
        peso,
        altura,
        imc,
        edad,
        antecedentes,
        objetivo,
        alimentos_frecuentes,
        alimentos_que_no_gustan,
        alimentos_por_malestar,
        suplementos,
        consumo_fuera_casa,
        bebidas_frecuentes,
        suenio,
        rutina,
        entrenamiento
    } = req.body;

    const client = await db.connect();

    if (!id_atleta) {
        throw new Error("id_atleta no recibido en la petición");
      }
    try {
        await client.query("BEGIN");

        // Verificar si el atleta ya existe
        const buscar = await client.query(
            `SELECT id_atleta FROM atleta WHERE id_atleta = $1`,
            [id_atleta]
        );

        if (buscar.rows.length > 0) {
            // Actualizar información del atleta
            await client.query(
                `UPDATE atleta 
                 SET nombre_completo = $1, email = $2, fecha_nacimiento = $3, sexo = $4, id_deporte = $5
                 WHERE id_atleta = $6`,
                [
                    nombre_completo,
                    email,
                    fecha_nacimiento,
                    sexo,
                    id_deporte || 1,
                    id_atleta
                ]
            );
        } else {
            // Insertar nuevo atleta si no existe
            await client.query(
                `INSERT INTO atleta (id_atleta, nombre_completo, email, fecha_nacimiento, sexo, id_deporte)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    id_atleta,
                    nombre_completo,
                    email,
                    fecha_nacimiento,
                    sexo,
                    id_deporte || 1
                ]
            );
        }

        await client.query(
            `INSERT INTO evaluacion_clinica (id_atleta, peso_actual_kg, altura, imc)
             VALUES ($1, $2, $3, $4)`,
            [id_atleta, peso, altura, imc]
        );

        for (const a of antecedentes) {
            await client.query(
                `INSERT INTO antecedentes_heredofamiliares (id_atleta, familiar, enfermedad)
                 VALUES ($1, $2, $3)`,
                [id_atleta, a.familiar, a.enfermedad]
            );
        }

        await client.query(
            `INSERT INTO preferencias_dieteticas (id_atleta, objetivo, alimentos_frecuentes, alimentos_que_no_gustan, alimentos_por_malestar, suplementos, consumo_fuera_casa, bebidas_frecuentes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                id_atleta,
                objetivo,
                alimentos_frecuentes,
                alimentos_que_no_gustan,
                alimentos_por_malestar,
                suplementos,
                consumo_fuera_casa,
                bebidas_frecuentes
            ]
        );

        for (let i = 0; i < rutina.length; i++) {
            await client.query(
                `INSERT INTO rutina_diaria (id_atleta, dia_semana, descripcion, suenio)
                 VALUES ($1, $2, $3, $4)`,
                [id_atleta, i + 1, rutina[i].descripcion, i === 0 ? suenio : null]
            );
        }

        for (let i = 0; i < entrenamiento.length; i++) {
            await client.query(
                `INSERT INTO esquema_entrenamiento (id_atleta, dia_semana, horario, actividad)
                 VALUES ($1, $2, $3, $4)`,
                [id_atleta, i + 1, entrenamiento[i].horario, entrenamiento[i].actividad]
            );
        }

        await client.query("COMMIT");
        res.json({ success: true });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error en /api/historial:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
