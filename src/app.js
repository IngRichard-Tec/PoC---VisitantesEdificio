const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// 1. Servir los archivos HTML, CSS y JS de la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Base de Datos en memoria
const departamentos = [];
const residentes = [];
const visitas = [];

// Inicializar 20 departamentos (101 a 504)
for (let piso = 1; piso <= 5; piso++) {
  for (let num = 1; num <= 4; num++) {
    departamentos.push({ id: `${piso}0${num}`, piso });
  }
}

// 2. RUTAS DE LA API (CRUD que vas a probar con Jest)

// Registrar Residente
app.post('/api/residentes', (req, res) => {
  const { nombre, idDepa } = req.body;
  
  if (!nombre || !idDepa) {
    return res.status(400).json({ error: "Nombre y Departamento son obligatorios" });
  }

  const depa = departamentos.find(d => d.id === idDepa);
  if (!depa) {
    return res.status(404).json({ error: "El departamento no existe (Usar 101-504)" });
  }

  const nuevoResidente = { id: residentes.length + 1, nombre, idDepa };
  residentes.push(nuevoResidente);
  return res.status(201).json(nuevoResidente);
});

// Registrar Visita
app.post('/api/visitas', (req, res) => {
  const { idDepa, visitante, tipoVisita } = req.body;
  const tiposValidos = ["Familia/amigos", "Proveedores de comida", "Taxis/Ubers"];

  if (!idDepa || !visitante || !tipoVisita) {
    return res.status(400).json({ error: "Faltan datos de la visita" });
  }

  if (!tiposValidos.includes(tipoVisita)) {
    return res.status(400).json({ error: "Tipo de visita no válido" });
  }

  const nuevaVisita = { id: visitas.length + 1, idDepa, visitante, tipoVisita, fecha: new Date() };
  visitas.push(nuevaVisita);
  return res.status(201).json(nuevaVisita);
});

module.exports = app;