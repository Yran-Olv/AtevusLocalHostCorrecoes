import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("GerencianetConfigs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      sandbox: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      clientId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      clientSecret: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      chavePix: {
        type: DataTypes.STRING,
        allowNull: true
      },
      pixCert: {
        type: DataTypes.STRING,
        allowNull: true
      },
      webhookUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      pixCertPassword: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("GerencianetConfigs");
  }
};

