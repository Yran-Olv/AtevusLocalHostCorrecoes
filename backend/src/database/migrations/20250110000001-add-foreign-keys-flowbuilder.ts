import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verificar e adicionar foreign key para company_id
    const [fkCompany]: any = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_flowbuilder_company'
        AND table_name = 'FlowBuilders'
    `);

    if (fkCompany.length === 0) {
      await queryInterface.sequelize.query(`
        ALTER TABLE "FlowBuilders"
        ADD CONSTRAINT fk_flowbuilder_company
        FOREIGN KEY (company_id)
        REFERENCES "Companies"(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
      `);
    }

    // Verificar e adicionar foreign key para user_id
    const [fkUser]: any = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_flowbuilder_user'
        AND table_name = 'FlowBuilders'
    `);

    if (fkUser.length === 0) {
      await queryInterface.sequelize.query(`
        ALTER TABLE "FlowBuilders"
        ADD CONSTRAINT fk_flowbuilder_user
        FOREIGN KEY (user_id)
        REFERENCES "Users"(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;
      `);
    }

    // Adicionar índice para company_id (se não existir)
    const [indexes]: any = await queryInterface.sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'FlowBuilders' 
        AND indexname = 'idx_flowbuilder_company_id'
    `);

    if (Array.isArray(indexes) && indexes.length === 0) {
      await queryInterface.addIndex("FlowBuilders", ["company_id"], {
        name: "idx_flowbuilder_company_id"
      });
    }

    // Adicionar índice composto para company_id e active
    const [compositeIndexes]: any = await queryInterface.sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'FlowBuilders' 
        AND indexname = 'idx_flowbuilder_company_active'
    `);

    if (Array.isArray(compositeIndexes) && compositeIndexes.length === 0) {
      await queryInterface.addIndex("FlowBuilders", ["company_id", "active"], {
        name: "idx_flowbuilder_company_active"
      });
    }

    // Adicionar constraint unique para name+company_id (evitar duplicatas)
    const [uniqueConstraints]: any = await queryInterface.sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE constraint_name = 'flowbuilders_name_company_unique'
        AND table_name = 'FlowBuilders'
    `);

    if (Array.isArray(uniqueConstraints) && uniqueConstraints.length === 0) {
      await queryInterface.addConstraint("FlowBuilders", ["name", "company_id"], {
        name: "flowbuilders_name_company_unique",
        type: "unique"
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

