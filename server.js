const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));

const UBICACIONES = [
  { id: 'laplata', nombre: 'La Plata', lat: -34.9214, lon: -57.9545 },
  { id: 'caba', nombre: 'CABA', lat: -34.6037, lon: -58.3816 },
  { id: 'escobar', nombre: 'Belén de Escobar', lat: -34.348, lon: -58.791 }
];

app.get('/api/lluvia-todas', async (req, res) => {
  try {
    const resultados = await Promise.all(UBICACIONES.map(async (u) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${u.lat}&longitude=${u.lon}&daily=precipitation_sum&past_days=5&forecast_days=14&timezone=America%2FArgentina%2FBuenos_Aires`;
      const response = await fetch(url);
      const data = await response.json();

      const fechas = data.daily.time;
      const precipitaciones = data.daily.precipitation_sum;

      // Primeros 5 días (pasado/real)
      const historico = fechas.slice(0, 5).map((f, i) => ({
        fecha: f,
        mm_reales: precipitaciones[i]
      }));

      // Siguientes 14 días (pronóstico)
      const pronostico = fechas.slice(5).map((f, i) => ({
        fecha: f,
        mm_estimados: precipitaciones[i + 5]
      }));

      return {
        id: u.id,
        nombre: u.nombre,
        historico,
        pronostico
      };
    }));

    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al consultar las precipitaciones" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});