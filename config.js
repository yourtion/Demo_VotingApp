module.exports = {
  database: process.env.MONGO_URI || process.env.MONGODB_CONNECTION || 'localhost/nef',
};
