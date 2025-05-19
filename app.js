const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path'); 
require('dotenv').config();

const pool = require('./db');
const usuariosRoutes = require('./routes/usuarios');
const historialRoutes = require('./routes/historial');
const atletasRoutes = require('./routes/atletas');
const deportesRoutes = require('./routes/deportes');
const nutriologosRoutes = require('./routes/nutriologos');
const planesRoutes = require('./routes/planes');
const nuevoRoutes = require('./routes/nuevo_plan');
const alimentosRoutes = require("./routes/alimentos");
const sudoracionRoutes = require("./routes/sudoracion");



app.use(cors());
app.use(express.json());
app.use('/alimentos', express.static('public/alimentos'));



app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/historial', historialRoutes);
app.use('/api/atletas', atletasRoutes);
app.use('/api/deportes', deportesRoutes);
app.use('/api/nutriologos', nutriologosRoutes);
app.use('/api/planes', planesRoutes);
app.use('/api/nuevo_plan', nuevoRoutes);
app.use('/api/alimentos', alimentosRoutes);
app.use("/api/sudoracion", sudoracionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
