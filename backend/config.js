const config = {
  environment: process.env.NODE_ENV || 'development',
  server: {
    port: process.env.PORT || 8080
  },
  mongo: {
    url: process.env.MONGO_DB_URI || 'mongodb://localhost/people'
  }
};

module.exports = config;
