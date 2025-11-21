const { pool } = require('../config/db');

async function createNotification({ userId, title, message, status, metadata }) {
  const sql = `
    INSERT INTO notifications (user_id, title, message, status, metadata)
    VALUES (:userId, :title, :message, :status, :metadata)
  `;
  const [result] = await pool.execute(sql, {
    userId,
    title,
    message,
    status,
    metadata: JSON.stringify(metadata || {}),
  });
  return result.insertId;
}

async function listNotifications(userId) {
  const sql = `
    SELECT id, title, message, status, metadata, created_at
    FROM notifications
    WHERE user_id = :userId
    ORDER BY created_at DESC
    LIMIT 20
  `;
  const [rows] = await pool.execute(sql, { userId });
  return rows.map((row) => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : {},
  }));
}

module.exports = {
  createNotification,
  listNotifications,
};

