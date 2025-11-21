const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { healthCheck } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const claimRoutes = require('./routes/claimRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || 'http://localhost:4000',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Serve uploaded static assets under /uploads (keeps existing behavior)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve the bundled frontend from `uploads/public` as the site root so
// paths like `/pages/admin.html`, `/css/styles.css`, `/js/admin.js` resolve.
// Fall back to the repo `public` folder if present.
const uploadsPublic = path.join(__dirname, '..', 'uploads', 'public');
app.use(express.static(uploadsPublic));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', async (_req, res, next) => {
  try {
    await healthCheck();
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Try to connect to the database but don't crash the whole server if unavailable.
(async () => {
  try {
    await healthCheck();
    // eslint-disable-next-line no-console
    console.log('Database connection OK');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', error.message);
    // Continue starting the server so non-DB endpoints (or health routes) can still respond.
    // This helps during local development when the DB is temporarily down.
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`EduPay Portal server listening on port ${PORT}`);
  });
})();

