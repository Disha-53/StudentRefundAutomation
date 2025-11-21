function notFoundHandler(_req, res, _next) {
  res.status(404).json({
    message: 'Resource not found',
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

