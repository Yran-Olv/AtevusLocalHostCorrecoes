import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("WhitelabelConfigs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      sidebarBg: {
        type: DataTypes.STRING,
        defaultValue: "#1a1d29",
        allowNull: false
      },
      sidebarText: {
        type: DataTypes.STRING,
        defaultValue: "#e4e6eb",
        allowNull: false
      },
      sidebarTextActive: {
        type: DataTypes.STRING,
        defaultValue: "#ffffff",
        allowNull: false
      },
      sidebarActiveBorder: {
        type: DataTypes.STRING,
        defaultValue: "#25d366",
        allowNull: false
      },
      navbarBg: {
        type: DataTypes.STRING,
        defaultValue: "#128c7e",
        allowNull: false
      },
      navbarText: {
        type: DataTypes.STRING,
        defaultValue: "#ffffff",
        allowNull: false
      },
      pageBgLight: {
        type: DataTypes.STRING,
        defaultValue: "#f8f9fa",
        allowNull: false
      },
      pageBgDark: {
        type: DataTypes.STRING,
        defaultValue: "#0f1117",
        allowNull: false
      },
      cardBgLight: {
        type: DataTypes.STRING,
        defaultValue: "#ffffff",
        allowNull: false
      },
      cardBgDark: {
        type: DataTypes.STRING,
        defaultValue: "#1a1d29",
        allowNull: false
      },
      textPrimaryLight: {
        type: DataTypes.STRING,
        defaultValue: "#1a1a1a",
        allowNull: false
      },
      textPrimaryDark: {
        type: DataTypes.STRING,
        defaultValue: "#e4e6eb",
        allowNull: false
      },
      textSecondaryLight: {
        type: DataTypes.STRING,
        defaultValue: "#4a5568",
        allowNull: false
      },
      textSecondaryDark: {
        type: DataTypes.STRING,
        defaultValue: "#b0b3b8",
        allowNull: false
      },
      primaryColor: {
        type: DataTypes.STRING,
        defaultValue: "#128c7e",
        allowNull: false
      },
      secondaryColor: {
        type: DataTypes.STRING,
        defaultValue: "#25d366",
        allowNull: false
      },
      fontFamily: {
        type: DataTypes.TEXT,
        defaultValue: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        allowNull: false
      },
      fontSizeBase: {
        type: DataTypes.INTEGER,
        defaultValue: 16,
        allowNull: false
      },
      fontWeightNormal: {
        type: DataTypes.INTEGER,
        defaultValue: 400,
        allowNull: false
      },
      fontWeightBold: {
        type: DataTypes.INTEGER,
        defaultValue: 600,
        allowNull: false
      },
      appLogoLight: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      appLogoDark: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      appLogoFavicon: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      appName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("WhitelabelConfigs");
  }
};

