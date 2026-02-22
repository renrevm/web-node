
console.log("SERVER.JS cargado OK");
console.log("BOOT SERVER:", new Date().toISOString());
process.on("uncaughtException", (err) => console.error("uncaughtException:", err));
process.on("unhandledRejection", (err) => console.error("unhandledRejection:", err));

const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("UP"));
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Listening on", PORT));