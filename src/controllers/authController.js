const { validationResult } = require('express-validator');
const { registerUser, loginUser } = require('../services/authService');

async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const { fullName, email, password } = req.body;
    const result = await registerUser({ fullName, email, password, role: 'STUDENT' });
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
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
};

