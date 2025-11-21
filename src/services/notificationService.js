const nodemailer = require('nodemailer');
const stubTransport = require('nodemailer-stub-transport');
const { createNotification, listNotifications } = require('../models/notificationModel');
const { findById } = require('../models/userModel');

const useStub = !process.env.SMTP_HOST;
const transporter = useStub
  ? nodemailer.createTransport(stubTransport())
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

async function pushNotification({ userId, title, message, metadata = {} }) {
  const notificationId = await createNotification({
    userId,
    title,
    message,
    status: metadata.status || 'INFO',
    metadata,
  });

  const user = await findById(userId);
  if (user?.email) {
    await transporter.sendMail({
      from: process.env.NOTIFICATION_SENDER || 'edupay@example.com',
      to: user.email,
      subject: title,
      text: message,
    });
  }

  return notificationId;
}

async function getNotifications(userId) {
  return listNotifications(userId);
}

module.exports = {
  pushNotification,
  getNotifications,
};

