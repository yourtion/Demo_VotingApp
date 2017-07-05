module.exports = {
  database: process.env.MONGODB_URI || process.env.MONGODB_CONNECTION || 'localhost/nef',
};
