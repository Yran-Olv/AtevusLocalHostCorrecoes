import {
  Model,
  Table,
  Column,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  Default
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";

@Table({
  tableName: "FlowBuilders",
  indexes: [
    {
      fields: ["company_id"]
    },
    {
      fields: ["user_id"]
    },
    {
      fields: ["company_id", "active"]
    }
  ]
})
export class FlowBuilderModel extends Model<FlowBuilderModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name: string;

  @ForeignKey(() => Company)
  @Column
  company_id: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  active: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: true
  })
  flow: {
    nodes?: any[];
    connections?: any[];
  } | null;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
