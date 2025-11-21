const { pool } = require('../src/config/db');
(async () => {
  const [rows] = await pool.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'claims'");
  console.log(rows.map(r => r.COLUMN_NAME).join(', '));
  process.exit(0);
})().catch(err => { console.error(err.message); process.exit(1); });
