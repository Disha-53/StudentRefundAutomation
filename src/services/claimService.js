const {
  createClaim,
  addDocument,
  listClaimsByStudent,
  listClaimsByStatus,
  getClaimById,
  updateClaimStatus,
  withdrawClaim,
  addHistory,
  listDocuments,
} = require('../models/claimModel');
const { pushNotification } = require('./notificationService');
const { CLAIM_STATUS } = require('../utils/statuses');

function mapActionToStatus({ action, actorRole }) {
  switch (action) {
    case 'APPROVE':
      return actorRole === 'HOD'
        ? { status: CLAIM_STATUS.UNDER_REVIEW, stage: 'ACCOUNTS' }
        : { status: CLAIM_STATUS.APPROVED, stage: 'ACCOUNTS' };
    case 'REQUEST_INFO':
      return { status: CLAIM_STATUS.MORE_INFO, stage: 'STUDENT' };
    case 'REJECT':
      return { status: CLAIM_STATUS.REJECTED, stage: 'STUDENT' };
    case 'COMPLETE':
      return { status: CLAIM_STATUS.COMPLETED, stage: 'STUDENT' };
    default:
      throw new Error(`Unknown action ${action}`);
  }
}

async function submitClaim({ studentId, amount, description, purpose, files = [] }) {
  const claimId = await createClaim({ studentId, amount, description, purpose });
  await addHistory({
    claimId,
    status: CLAIM_STATUS.SUBMITTED,
    actorId: studentId,
    actorRole: 'STUDENT',
    notes: 'Claim submitted',
  });

  await Promise.all(
    files.map((file) =>
      addDocument({
        claimId,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: studentId,
      }),
    ),
  );

  await pushNotification({
    userId: studentId,
    title: 'Refund request submitted',
    message: 'Your refund claim has been submitted and sent to the HoD for review.',
    metadata: { status: CLAIM_STATUS.SUBMITTED },
  });

  return getClaimById(claimId);
}

async function attachAdditionalDocuments({ claimId, studentId, files = [] }) {
  await Promise.all(
    files.map((file) =>
      addDocument({
        claimId,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: studentId,
      }),
    ),
  );

  await updateClaimStatus({
    claimId,
    status: CLAIM_STATUS.UNDER_REVIEW,
    currentStage: 'HOD',
    comment: 'Student uploaded additional documents',
    actorId: studentId,
  });

  await addHistory({
    claimId,
    status: CLAIM_STATUS.ACTION_NEEDED,
    actorId: studentId,
    actorRole: 'STUDENT',
    notes: 'Additional documents uploaded',
  });

  await pushNotification({
    userId: studentId,
    title: 'Documents received',
    message: 'Your additional documents were uploaded successfully. HoD will resume review shortly.',
    metadata: { status: CLAIM_STATUS.UNDER_REVIEW },
  });

  return getClaimById(claimId);
}

async function getStudentClaims(studentId) {
  return listClaimsByStudent(studentId);
}

async function getAdminClaims(statuses) {
  return listClaimsByStatus(statuses);
}

async function escalateClaim({ claimId, actorId, actorRole, action, comment = '' }) {
  const claim = await getClaimById(claimId);
  if (!claim) {
    const error = new Error('Claim not found');
    error.statusCode = 404;
    throw error;
  }

  const { status, stage } = mapActionToStatus({ action, actorRole });
  await updateClaimStatus({
    claimId,
    status,
    currentStage: stage,
    comment,
    actorId,
  });

  await addHistory({
    claimId,
    status,
    actorId,
    actorRole,
    notes: comment || action,
  });

  await pushNotification({
    userId: claim.student_id,
    title: `Claim update: ${status}`,
    message: comment || `Your refund claim is now marked as ${status.replace('_', ' ')}`,
    metadata: { status },
  });

  return getClaimById(claimId);
}

async function withdrawStudentClaim({ claimId, studentId }) {
  const success = await withdrawClaim({ claimId, studentId });
  if (!success) {
    const error = new Error('Unable to withdraw claim');
    error.statusCode = 400;
    throw error;
  }

  await addHistory({
    claimId,
    status: CLAIM_STATUS.WITHDRAWN,
    actorId: studentId,
    actorRole: 'STUDENT',
    notes: 'Claim withdrawn by student',
  });

  await pushNotification({
    userId: studentId,
    title: 'Claim withdrawn',
    message: 'Your claim has been withdrawn successfully.',
    metadata: { status: CLAIM_STATUS.WITHDRAWN },
  });
}

async function getClaimDetails(claimId) {
  const claim = await getClaimById(claimId);
  if (!claim) {
    const error = new Error('Claim not found');
    error.statusCode = 404;
    throw error;
  }

  const documents = await listDocuments(claimId);
  return { ...claim, documents };
}

module.exports = {
  submitClaim,
  attachAdditionalDocuments,
  getStudentClaims,
  getAdminClaims,
  escalateClaim,
  withdrawStudentClaim,
  getClaimDetails,
};

