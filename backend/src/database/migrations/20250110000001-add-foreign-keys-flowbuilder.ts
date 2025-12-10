import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Adicionar foreign key para company_id
    await queryInterface.addConstraint("FlowBuilders", {
      fields: ["company_id"],
      type: "foreign key",
      name: "fk_flowbuilder_company",
      references: {
        table: "Companies",
        field: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // Adicionar foreign key para user_id
    await queryInterface.addConstraint("FlowBuilders", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_flowbuilder_user",
      references: {
        table: "Users",
        field: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    // Adicionar índice para company_id (se não existir)
    const indexes = await queryInterface.showIndex("FlowBuilders");
    const companyIndexExists = indexes.some(
      (idx: any) => idx.fields && idx.fields.some((f: any) => f.attribute === "company_id")
    );

    if (!companyIndexExists) {
      await queryInterface.addIndex("FlowBuilders", ["company_id"], {
        name: "idx_flowbuilder_company_id"
      });
    }

    // Adicionar índice composto para company_id e active (otimização de queries)
    const compositeIndexExists = indexes.some(
      (idx: any) =>
        idx.fields &&
        idx.fields.length === 2 &&
        idx.fields.some((f: any) => f.attribute === "company_id") &&
        idx.fields.some((f: any) => f.attribute === "active")
    );

    if (!compositeIndexExists) {
      await queryInterface.addIndex("FlowBuilders", ["company_id", "active"], {
        name: "idx_flowbuilder_company_active"
      });
    }

    // Adicionar constraint unique para name+company_id (evitar duplicatas)
    const uniqueConstraintExists = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE constraint_name = 'flowbuilders_name_company_unique'
        AND table_name = 'FlowBuilders'
    `);

    if (uniqueConstraintExists[0].length === 0) {
      await queryInterface.addConstraint("FlowBuilders", {
        fields: ["name", "company_id"],
        type: "unique",
        name: "flowbuilders_name_company_unique"
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover índices
    try {
      await queryInterface.removeIndex("FlowBuilders", "idx_flowbuilder_company_active");
    } catch (e) {
      // Índice pode não existir
    }

    try {
      await queryInterface.removeIndex("FlowBuilders", "idx_flowbuilder_company_id");
    } catch (e) {
      // Índice pode não existir
    }

    // Remover foreign keys
    try {
      await queryInterface.removeConstraint("FlowBuilders", "fk_flowbuilder_company");
    } catch (e) {
      // Constraint pode não existir
    }

    try {
      await queryInterface.removeConstraint("FlowBuilders", "fk_flowbuilder_user");
    } catch (e) {
      // Constraint pode não existir
    }

    // Remover constraint unique
    try {
      await queryInterface.removeConstraint("FlowBuilders", "flowbuilders_name_company_unique");
    } catch (e) {
      // Constraint pode não existir
    }
  }
};

