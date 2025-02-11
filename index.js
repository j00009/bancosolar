const express = require('express');
const https = require("https");
const fs = require("fs");
const cors = require('cors');  // Importa cors

const {
  getUsuarios,
  setUsuario,
  updateUsuario,
  deleteUsuario,
  insertarTransferencia,
  getTransferencias
} = require('./db');

const app = express();

// Configura CORS para permitir solicitudes desde cualquier origen
// (O ajusta el origen según tus necesidades)
app.use(cors());

// También puedes usar una configuración más específica, por ejemplo:
// app.use(cors({ origin: 'https://localhost:3000' }));

app.use(express.json());

// Resto de tu código...
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const options = {
  key: fs.readFileSync("./ssl/private.key"),        // Clave privada
  cert: fs.readFileSync("./ssl/certificate.crt"),     // Certificado principal
  ca: fs.readFileSync("./ssl/ca_bundle.crt"),         // Certificado intermedio
};

https.createServer(options, app).listen(3000, () => {
  console.log("Servidor HTTPS corriendo en https://localhost:3000");
});

// Rutas de la API...
app.get('/usuarios', async (req, res) => {
  try {
    const response = await getUsuarios();
    res.send(response);
  } catch (error) {
    res.status(500).json({
      error: 'Algo salió mal, inténtelo más tarde'
    });
  }
});

// POST /usuario
app.post("/usuario", async (req, res) => {
  const payload = req.body;
  try {
    if (!payload.nombre || !payload.balance) {
      res.status(400).json({
        status: 400,
        error: 'Payload mal definido'
      });
      return;
    }
    const response = await setUsuario(payload);
    res.send(response);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal, inténtelo más tarde',
      error: error
    });
  }
});

// PUT /usuario
app.put("/usuario", async (req, res) => {
  const { id } = req.query;
  const payload = req.body;
  payload.id = id;
  try {
    const response = await updateUsuario(payload);
    res.send(response);
  } catch (error) {
    res.status(500).json({
      message: 'Algo salió mal, inténtelo más tarde',
      error: error
    });
  }
});

// DELETE /usuario?id=2
app.delete("/usuario", async (req, res) => {
  const payload = req.query;
  try {
    const result = await deleteUsuario(payload);
    res.status(202).json({ message: "Usuario Eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Algo salió mal, inténtelo más tarde" });
  }
});

app.post("/transferencia", async (req, res) => {
  const payload = req.body;
  payload.fecha = new Date();
  try {
    if (payload.emisor !== payload.receptor) {
      const response = await insertarTransferencia(payload);
      res.send(response.rows);
    } else {
      res.status(400).send({
        error: "No se puede transferir a la misma cuenta"
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'No fue posible ingresar la transferencia.' });
  }
});

app.get("/transferencias", async (req, res) => {
  try {
    const result = await getTransferencias();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error en BD.' });
  }
});
