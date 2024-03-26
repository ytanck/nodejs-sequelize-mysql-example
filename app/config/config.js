module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,

  /** DATABASE */
  db: {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
    dialect: "mysql",

    // pool is optional, it will be used for Sequelize connection pool configuration
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  /** AUTH KEY */
  auth: {
    secret: "abcdefghijklmnopqrstuvwxyz1234567890",
    jwt_expiresIn:7200 //2 hours
  },
  // session
  session: {
    name: "yt-token",
    secret: "123456",
    cookie_time: 1000*60*5 // 5 miniutes,
  },
};
