const { validationResult } = require('express-validator');
const {
  submitClaim,
  getStudentClaims,
  attachAdditionalDocuments,
  withdrawStudentClaim,
  escalateClaim,
  getAdminClaims,
  getClaimDetails,
} = require('../services/claimService');

async function createClaim(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { amount, description, purpose } = req.body;
    const claim = await submitClaim({
      studentId: req.user.id,
      amount,
      description,
      purpose,
      files: req.files || [],
    });
    return res.status(201).json(claim);
  } catch (error) {
    return next(error);
  }
}

async function listMyClaims(req, res, next) {
  try {
    const claims = await getStudentClaims(req.user.id);
    return res.json(claims);
  } catch (error) {
    return next(error);
  }
}

async function getClaim(req, res, next) {
  try {
    const claim = await getClaimDetails(req.params.claimId);
    if (req.user.role === 'STUDENT' && claim.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    return res.json(claim);
  } catch (error) {
    return next(error);
  }
}

async function uploadAdditionalDocs(req, res, next) {
  try {
    const claim = await attachAdditionalDocuments({
      claimId: req.params.claimId,
      studentId: req.user.id,
      files: req.files || [],
    });
    return res.json(claim);
  } catch (error) {
    return next(error);
  }
}

async function withdraw(req, res, next) {
  try {
    await withdrawStudentClaim({
      claimId: req.params.claimId,
      studentId: req.user.id,
    });
    return res.json({ message: 'Claim withdrawn' });
  } catch (error) {
    return next(error);
  }
}

async function adminList(req, res, next) {
  try {
    const { status } = req.query;
    const statuses = status ? status.split(',') : [];
    const claims = await getAdminClaims(statuses);
    return res.json(claims);
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const claim = await escalateClaim({
      claimId: req.params.claimId,
      actorId: req.user.id,
      actorRole: req.user.role,
      action: req.body.action,
      comment: req.body.comment,
    });
    return res.json(claim);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createClaim,
  listMyClaims,
  uploadAdditionalDocs,
  withdraw,
  adminList,
  updateStatus,
  getClaim,
};

