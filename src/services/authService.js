const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findByEmail } = require('../models/userModel');

const SALT_ROUNDS = 10;

async function registerUser({ fullName, email, password, role = 'STUDENT' }) {
  const existing = await findByEmail(email);
  if (existing) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ fullName, email, passwordHash, role });

  return {
    user,
    token: generateToken(user),
  };
}

async function loginUser({ email, password }) {
  const user = await findByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const payload = {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
  };

  return {
    user: payload,
    token: generateToken(payload),
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      fullName: user.fullName || user.full_name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'change-me',
    { expiresIn: '12h' },
  );
}

module.exports = {
  registerUser,
  loginUser,
};

