const { getNotifications } = require('../services/notificationService');

async function list(req, res, next) {
  try {
    const notifications = await getNotifications(req.user.id);
    return res.json(notifications);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
};

