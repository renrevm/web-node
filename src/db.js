const mysql = require("mysql2/promise");

console.log("ENV CHECK:", {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER_present: !!process.env.DB_USER,
  DB_PASS_present: !!process.env.DB_PASS
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;