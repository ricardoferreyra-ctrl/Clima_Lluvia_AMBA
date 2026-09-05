// server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

const UBICACIONES = [
  { id: 'escobar', nombre: 'Belén de Escobar', lat: -34.348, lon: -58.791 },
  { id: 'caba', nombre: 'CABA', lat: -34.6037, lon: -58.3816 },
  { id: 'laplata', nombre: 'La Plata', lat: -34.9214, lon: -57.9545 }
];

app.get('/api/lluvia-todas', async (req, res) => {
  try {
    const promesas = UBICACIONES.map(async (zona) => {
      // Cambiamos forecast_days a 14
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${zona.lat}&longitude=${zona.lon}&daily=precipitation_sum&timezone=America/Argentina/Buenos_Aires&past_days=5&forecast_days=14`;
      const response = await fetch(url);
      const data = await response.json();

      const fechas = data.daily.time;
      const precipitaciones = data.daily.precipitation_sum;

      const historico = [];
      const pronostico = [];

      // Primeros 5 elementos: Histórico (pasado)
      for (let i = 0; i < 5; i++) {
        historico.push({ fecha: fechas[i], mm_reales: precipitaciones[i] ?? 0 });
      }

      // Desde el día actual en adelante: Pronóstico a 14 días
      for (let i = 5; i < fechas.length; i++) {
        pronostico.push({ fecha: fechas[i], mm_estimados: precipitaciones[i] ?? 0 });
      }

      return {
        id: zona.id,
        nombre: zona.nombre,
        historico,
        pronostico
      };
    });

    const resultados = await Promise.all(promesas);
    res.json(resultados);

  } catch (error) {
    res.status(500).json({ error: "Error al obtener datos meteorológicos" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});