const { Sequelize } = require("sequelize");

console.log("DATABASE_URI:", process.env.DATABASE_URI);

const sequelize = new Sequelize(process.env.DATABASE_URI, {
  dialect: "postgres",
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }

  return sequelize;
};

module.exports = { sequelize, connectDB };
