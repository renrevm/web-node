const express = require("express");
const path = require("path");
const pool = require("./src/db");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mensaje: "Servidor funcionando 🚀" });
});

// ✅ GET mensajes
app.get("/api/mensajes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM mensajes ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error consultando MySQL" });
  }
});

// ✅ POST mensaje
app.post("/api/mensajes", async (req, res) => {
  try {
    const texto = (req.body.texto || "").trim();
    if (!texto) return res.status(400).json({ error: "texto requerido" });

    const [r] = await pool.query("INSERT INTO mensajes(texto) VALUES(?)", [texto]);
    res.json({ ok: true, id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error insertando en MySQL" });
  }
});

// ✅ Express 5: fallback (no captura /api)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo en puerto", PORT));