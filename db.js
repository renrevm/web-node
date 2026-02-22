app.get("/api/mensajes", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM mensajes");
  res.json(rows);
});

app.post("/api/mensajes", async (req, res) => {
  const { texto } = req.body;
  const [r] = await pool.query(
    "INSERT INTO mensajes(texto) VALUES(?)",
    [texto]
  );
  res.json({ id: r.insertId });
});