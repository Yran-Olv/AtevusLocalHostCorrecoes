import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("LoginConfigs", "mailHost", {
      type: DataTypes.STRING,
      allowNull: true
    })
    .then(() => {
      return queryInterface.addColumn("LoginConfigs", "mailPort", {
        type: DataTypes.INTEGER,
        allowNull: true
      });
    })
    .then(() => {
      return queryInterface.addColumn("LoginConfigs", "mailUser", {
        type: DataTypes.STRING,
        allowNull: true
      });
    })
    .then(() => {
      return queryInterface.addColumn("LoginConfigs", "mailPass", {
        type: DataTypes.TEXT,
        allowNull: true
      });
    })
    .then(() => {
      return queryInterface.addColumn("LoginConfigs", "mailFrom", {
        type: DataTypes.STRING,
        allowNull: true
      });
    })
    .then(() => {
      return queryInterface.addColumn("LoginConfigs", "mailSecure", {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("LoginConfigs", "mailHost")
      .then(() => queryInterface.removeColumn("LoginConfigs", "mailPort"))
      .then(() => queryInterface.removeColumn("LoginConfigs", "mailUser"))
      .then(() => queryInterface.removeColumn("LoginConfigs", "mailPass"))
      .then(() => queryInterface.removeColumn("LoginConfigs", "mailFrom"))
      .then(() => queryInterface.removeColumn("LoginConfigs", "mailSecure"));
  }
};

