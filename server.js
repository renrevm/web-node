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

// ✅ PRUEBA POST MENSAJES
app.post("/api/mensajes", async (req, res) => {
  try {
    const texto = (req.body?.texto || "").trim();
    if (!texto) return res.status(400).json({ error: "texto requerido" });

    const ip = getClientIp(req);

    // ✅ bloquear si ya envió en la última hora
    const [rows] = await pool.query(
      `SELECT id, creado_en
       FROM mensajes
       WHERE ip = ?
         AND creado_en >= (NOW() - INTERVAL 1 HOUR)
       ORDER BY creado_en DESC
       LIMIT 1`,
      [ip]
    );

    if (rows.length > 0) {
      return res.status(429).json({
        error: "Solo puedes enviar 1 mensaje por hora",
        ultimo: rows[0].creado_en
      });
    }

    const [r] = await pool.query(
      "INSERT INTO mensajes(texto, ip) VALUES(?, ?)",
      [texto, ip]
    );

    res.json({ ok: true, id: r.insertId });
  } catch (e) {
    console.error("POST /api/mensajes ERROR:", e);
    res.status(500).json({ error: "Error insertando mensaje", code: e.code, message: e.message });
  }
});

// ✅ DELETE mensaje por id
app.delete("/api/mensajes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id inválido" });
    }

    const [r] = await pool.query("DELETE FROM mensajes WHERE id = ?", [id]);

    // mysql2 devuelve affectedRows
    if (r.affectedRows === 0) {
      return res.status(404).json({ error: "mensaje no encontrado" });
    }

    res.json({ ok: true, deletedId: id });
  } catch (e) {
    console.error("MYSQL ERROR DELETE:", e);
    res.status(500).json({ error: "Error eliminando en MySQL", code: e.code, message: e.message });
  }
});

// ✅ PRUEBA SQL
app.get("/api/envcheck", (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST || null,
    DB_PORT: process.env.DB_PORT || null,
    DB_NAME: process.env.DB_NAME || null,
    DB_USER: process.env.DB_USER ? "(present)" : null,
    DB_PASS: process.env.DB_PASS ? "(present)" : null
  });
});

// ✅ Express 5: usar REGEX (no "*" ni "/*")
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo en puerto", PORT));