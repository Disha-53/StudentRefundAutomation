const { pool } = require('../config/db');

async function createClaim({ studentId, amount, description, purpose, accountNumber = null, ifscCode = null, phoneNumber = null }) {
  const sqlWithIfsc = `
    INSERT INTO claims (student_id, amount, description, purpose, account_number, ifsc_code, phone_number, status, current_stage)
    VALUES (:studentId, :amount, :description, :purpose, :accountNumber, :ifscCode, :phoneNumber, 'SUBMITTED', 'HOD')
  `;

  try {
    const [result] = await pool.execute(sqlWithIfsc, { studentId, amount, description, purpose, accountNumber, ifscCode, phoneNumber });
    return result.insertId;
  } catch (err) {
    // Handle older DB schemas that don't yet have account_number/ifsc_code columns.
    // MySQL returns ER_BAD_FIELD_ERROR when a column in the INSERT does not exist.
    if (err && err.code === 'ER_BAD_FIELD_ERROR' && /account_number|ifsc_code|phone_number/i.test(err.sqlMessage || '')) {
      const sqlFallback = `
        INSERT INTO claims (student_id, amount, description, purpose, status, current_stage)
        VALUES (:studentId, :amount, :description, :purpose, 'SUBMITTED', 'HOD')
      `;
      const [fallbackResult] = await pool.execute(sqlFallback, { studentId, amount, description, purpose });
      return fallbackResult.insertId;
    }
    // Re-throw unexpected errors
    throw err;
  }
}

async function addDocument({ claimId, originalName, storedName, mimeType, size, uploadedBy }) {
  const sql = `
    INSERT INTO claim_documents (claim_id, original_name, stored_name, mime_type, size, uploaded_by)
    VALUES (:claimId, :originalName, :storedName, :mimeType, :size, :uploadedBy)
  `;
  await pool.execute(sql, { claimId, originalName, storedName, mimeType, size, uploadedBy });
}

async function listClaimsByStudent(studentId) {
  const sql = `
    SELECT c.*, u.full_name AS student_name
    FROM claims c
    JOIN users u ON u.id = c.student_id
    WHERE student_id = :studentId
    ORDER BY c.updated_at DESC
  `;
  const [rows] = await pool.execute(sql, { studentId });
  return rows;
}

async function listClaimsByStatus(statuses = []) {
  let sql = `
    SELECT c.*, u.full_name AS student_name
    FROM claims c
    JOIN users u ON u.id = c.student_id
  `;
  const params = {};
  if (statuses.length) {
    const placeholders = statuses.map((_, idx) => `:status${idx}`).join(',');
    sql += ` WHERE c.status IN (${placeholders})`;
    statuses.forEach((status, idx) => {
      params[`status${idx}`] = status;
    });
  }
  sql += ' ORDER BY c.updated_at DESC';
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getClaimById(claimId) {
  const sql = `
    SELECT c.*, u.full_name AS student_name
    FROM claims c
    JOIN users u ON u.id = c.student_id
    WHERE c.id = :claimId
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, { claimId });
  return rows[0];
}

async function updateClaimStatus({ claimId, status, currentStage, comment, actorId }) {
  const sql = `
    UPDATE claims
    SET status = :status, current_stage = :currentStage, last_action_by = :actorId,
        decision_comment = :comment, updated_at = NOW()
    WHERE id = :claimId
  `;
  await pool.execute(sql, { claimId, status, currentStage, comment, actorId });
}

async function withdrawClaim({ claimId, studentId }) {
  const sql = `
    UPDATE claims
    SET status = 'WITHDRAWN', current_stage = 'STUDENT', updated_at = NOW()
    WHERE id = :claimId AND student_id = :studentId AND status IN ('SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO')
  `;
  const [result] = await pool.execute(sql, { claimId, studentId });
  return result.affectedRows > 0;
}

async function addHistory({ claimId, status, actorId, actorRole, notes }) {
  const sql = `
    INSERT INTO claim_history (claim_id, status, actor_id, actor_role, notes)
    VALUES (:claimId, :status, :actorId, :actorRole, :notes)
  `;
  await pool.execute(sql, { claimId, status, actorId, actorRole, notes });
}

async function listDocuments(claimId) {
  const sql = `
    SELECT id, original_name, stored_name, mime_type, size, created_at
    FROM claim_documents
    WHERE claim_id = :claimId
  `;
  const [rows] = await pool.execute(sql, { claimId });
  return rows;
}

module.exports = {
  createClaim,
  addDocument,
  listClaimsByStudent,
  listClaimsByStatus,
  getClaimById,
  updateClaimStatus,
  withdrawClaim,
  addHistory,
  listDocuments,
};

