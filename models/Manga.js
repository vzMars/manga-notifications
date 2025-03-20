const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Manga = sequelize.define(
  "Manga",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cover: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latestchapter: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    textchannelid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "mangas",
  }
);

module.exports = Manga;
