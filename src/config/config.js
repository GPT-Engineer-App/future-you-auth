module.exports = {
  development: {
    username: process.env.DB_USERNAME || "your_db_username",
    password: process.env.DB_PASSWORD || "your_db_password",
    database: process.env.DB_NAME || "your_db_name",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USERNAME || "your_db_username",
    password: process.env.DB_PASSWORD || "your_db_password",
    database: process.env.DB_NAME_TEST || "your_db_name_test",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USERNAME || "your_db_username",
    password: process.env.DB_PASSWORD || "your_db_password",
    database: process.env.DB_NAME_PROD || "your_db_name_prod",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
};