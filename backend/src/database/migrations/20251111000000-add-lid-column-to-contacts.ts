import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Contacts", "lid", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      comment: "LID (Linked ID) do WhatsApp para suporte a multi-device e privacidade"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Contacts", "lid");
  }
};

