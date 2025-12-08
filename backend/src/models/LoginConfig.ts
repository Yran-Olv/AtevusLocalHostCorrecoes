import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default,
  DataType
} from "sequelize-typescript";

@Table({ tableName: "LoginConfigs" })
class LoginConfig extends Model<LoginConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default("default")
  @Column
  theme: string;

  @Column(DataType.TEXT)
  logoUrl: string;

  @Column(DataType.TEXT)
  backgroundImageUrl: string;

  @Column
  title: string;

  @Column(DataType.TEXT)
  subtitle: string;

  @Column(DataType.TEXT)
  typingTexts: string; // JSON array de textos para typing effect

  @Column
  primaryColor: string;

  @Column
  secondaryColor: string;

  @Column
  enableTypingEffect: boolean;

  @Column
  enableAnimations: boolean;

  @Column
  enablePasswordRecovery: boolean;

  @Column(DataType.TEXT)
  customCss: string;

  @Column(DataType.TEXT)
  welcomeMessage: string;

  // Configurações de Email
  @Column
  mailHost: string;

  @Column
  mailPort: number;

  @Column
  mailUser: string;

  @Column(DataType.TEXT)
  mailPass: string;

  @Column
  mailFrom: string;

  @Column
  mailSecure: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default LoginConfig;

