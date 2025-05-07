const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db'); 
const usuariosRoutes = require('./routes/usuarios');
const historialRoutes = require('./routes/historial');

app.use(cors());
app.use(express.json());

// Asegúrate que esté bien montado aquí
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/historial', historialRoutes);

app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
  });
  