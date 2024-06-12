module.exports = {
  development: {
    username: "your_db_username",
    password: "your_db_password",
    database: "your_db_name",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  test: {
    username: "your_db_username",
    password: "your_db_password",
    database: "your_db_name_test",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    username: "your_db_username",
    password: "your_db_password",
    database: "your_db_name_prod",
    host: "127.0.0.1",
    dialect: "postgres",
  },
};