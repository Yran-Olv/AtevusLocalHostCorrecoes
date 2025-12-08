import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("LoginConfigs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      theme: {
        type: DataTypes.STRING,
        defaultValue: "default",
        allowNull: false
      },
      logoUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      backgroundImageUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      subtitle: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      typingTexts: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      primaryColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      secondaryColor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      enableTypingEffect: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      enableAnimations: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      enablePasswordRecovery: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      customCss: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      welcomeMessage: {
        type: DataTypes.TEXT,
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
    return queryInterface.dropTable("LoginConfigs");
  }
};

