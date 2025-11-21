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
    body('account_number')
      .matches(/^[0-9]{9,18}$/)
      .withMessage('Account number is required and must be 9 to 18 digits'),
    body('ifsc_code')
      .matches(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/)
      .withMessage('IFSC code is required and must be a valid 11-character code (e.g. ABCD0E12345)'),
    body('phone_number')
      .optional()
      .matches(/^[0-9]{7,15}$/)
      .withMessage('Phone number must be 7 to 15 digits'),
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

