const { pool } = require('../src/config/db');

async function ensureColumns() {
  const checks = [
    { name: 'account_number', type: 'VARCHAR(64)' },
    { name: 'ifsc_code', type: 'VARCHAR(32)' },
    { name: 'phone_number', type: 'VARCHAR(32)' },
  ];

  for (const col of checks) {
    const [rows] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'claims' AND COLUMN_NAME = ?`,
      [col.name],
    );
    if (rows.length === 0) {
      console.log(`Adding column ${col.name}...`);
      await pool.execute(`ALTER TABLE claims ADD COLUMN ${col.name} ${col.type} NULL`);
    } else {
      console.log(`Column ${col.name} already exists`);
    }
  }

  console.log('Migration complete (columns ensured)');
  process.exit(0);
}

ensureColumns().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
