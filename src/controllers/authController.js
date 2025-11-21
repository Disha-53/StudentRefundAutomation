const { validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../services/authService');

async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { fullName, email, password, role } = req.body;
    // Allow role from body but default to STUDENT. In a real app you would restrict who can create HOD/ACCOUNTS.
    const allowedRoles = ['STUDENT', 'HOD', 'ACCOUNTS'];
    const userRole = allowedRoles.includes(role) ? role : 'STUDENT';
    const result = await registerUser({ fullName, email, password, role: userRole });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    // Set JWT as httpOnly cookie for browser clients
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
};

