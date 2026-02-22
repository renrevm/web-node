const express = require("express");
const path = require("path");
const pool = require("./src/db");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mensaje: "Servidor funcionando 🚀" });
});

// ✅ PRUEBA GET MENSAJES
app.get("/api/mensajes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM mensajes");
    res.json(rows);
  } catch (e) {
    console.error("MYSQL ERROR /api/mensajes:", e);
    res.status(500).json({ error: "Error consultando MySQL", code: e.code, message: e.message });
  }
});


// ✅ PRUEBA SQL
app.get("/api/envcheck", (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST || null,
    DB_PORT: process.env.DB_PORT || null,
    DB_NAME: process.env.DB_NAME || null,
    DB_USER_present: !!process.env.DB_USER,
    DB_PASS_present: !!process.env.DB_PASS
  });
});

// ✅ Express 5: usar REGEX (no "*" ni "/*")
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo en puerto", PORT));