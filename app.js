const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); // Cargar variables del .env

const pool = require('./db');
const usuariosRoutes = require('./routes/usuarios');
const historialRoutes = require('./routes/historial');
const atletasRoutes = require('./routes/atletas');
const deportesRoutes = require('./routes/deportes');
const nutriologosRoutes = require('./routes/nutriologos');


app.use(cors());
app.use(express.json());
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/historial', historialRoutes);
app.use('/api/atletas', atletasRoutes);
app.use('/api/deportes', deportesRoutes);
app.use('/api/nutriologos', nutriologosRoutes);



// Usar puerto de entorno o 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
