const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').isLength({ min: 3 }).withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 characters or more'),
    body('role')
      .optional()
      .isIn(['STUDENT', 'HOD', 'ACCOUNTS'])
      .withMessage('Role must be STUDENT, HOD or ACCOUNTS'),
  ],
  register,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').exists().withMessage('Password is required'),
  ],
  login,
);

module.exports = router;

