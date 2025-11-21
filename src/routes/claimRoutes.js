const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createClaim,
  listMyClaims,
  uploadAdditionalDocs,
  withdraw,
  adminList,
  updateStatus,
  getClaim,
} = require('../controllers/claimController');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorizeRoles('STUDENT'),
  listMyClaims,
);

router.get(
  '/admin/pending',
  authenticate,
  authorizeRoles('HOD', 'ACCOUNTS'),
  adminList,
);

router.post(
  '/',
  authenticate,
  authorizeRoles('STUDENT'),
  upload.array('documents'),
  [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('description').isLength({ min: 10 }).withMessage('Description is required'),
    body('purpose').notEmpty().withMessage('Purpose is required'),
  ],
  createClaim,
);

router.post(
  '/:claimId/additional-docs',
  authenticate,
  authorizeRoles('STUDENT'),
  upload.array('documents'),
  [param('claimId').isInt().toInt()],
  uploadAdditionalDocs,
);

router.post(
  '/:claimId/withdraw',
  authenticate,
  authorizeRoles('STUDENT'),
  [param('claimId').isInt().toInt()],
  withdraw,
);

router.patch(
  '/:claimId/status',
  authenticate,
  authorizeRoles('HOD', 'ACCOUNTS'),
  [
    param('claimId').isInt().toInt(),
    body('action').isIn(['APPROVE', 'REQUEST_INFO', 'REJECT', 'COMPLETE']),
    body('comment').optional().isLength({ max: 500 }),
  ],
  updateStatus,
);

router.get(
  '/:claimId',
  authenticate,
  [param('claimId').isInt().toInt()],
  getClaim,
);

module.exports = router;

