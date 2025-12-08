import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default
} from "sequelize-typescript";

@Table({ tableName: "GerencianetConfigs" })
class GerencianetConfig extends Model<GerencianetConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default(false)
  @Column
  sandbox: boolean;

  @Column
  clientId: string;

  @Column
  clientSecret: string;

  @Column
  chavePix: string;

  @Column
  pixCert: string;

  @Column
  webhookUrl: string;

  @Column
  pixCertPassword: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default GerencianetConfig;

