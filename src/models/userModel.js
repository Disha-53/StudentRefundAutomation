const { pool } = require('../config/db');

async function createUser({ fullName, email, passwordHash, role }) {
  const sql = `
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES (:fullName, :email, :passwordHash, :role)
  `;
  const [result] = await pool.execute(sql, { fullName, email, passwordHash, role });
  return { id: result.insertId, fullName, email, role };
}

async function findByEmail(email) {
  const sql = 'SELECT id, full_name, email, password_hash, role FROM users WHERE email = :email LIMIT 1';
  const [rows] = await pool.execute(sql, { email });
  return rows[0];
}

async function findById(id) {
  const sql = 'SELECT id, full_name, email, role FROM users WHERE id = :id LIMIT 1';
  const [rows] = await pool.execute(sql, { id });
  return rows[0];
}

module.exports = {
  createUser,
  findByEmail,
  findById,
};

