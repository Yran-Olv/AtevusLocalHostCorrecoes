import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Default
} from "sequelize-typescript";

@Table({ tableName: "WhitelabelConfigs" })
class WhitelabelConfig extends Model<WhitelabelConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  // Cores do Menu Lateral
  @Default("#1a1d29")
  @Column
  sidebarBg: string;

  @Default("#e4e6eb")
  @Column
  sidebarText: string;

  @Default("#ffffff")
  @Column
  sidebarTextActive: string;

  @Default("#25d366")
  @Column
  sidebarActiveBorder: string;

  // Cores do Navbar (Rodapé de cima)
  @Default("#128c7e")
  @Column
  navbarBg: string;

  @Default("#ffffff")
  @Column
  navbarText: string;

  // Cores de Fundo das Páginas
  @Default("#f8f9fa")
  @Column
  pageBgLight: string;

  @Default("#0f1117")
  @Column
  pageBgDark: string;

  @Default("#ffffff")
  @Column
  cardBgLight: string;

  @Default("#1a1d29")
  @Column
  cardBgDark: string;

  // Cores de Texto
  @Default("#1a1a1a")
  @Column
  textPrimaryLight: string;

  @Default("#e4e6eb")
  @Column
  textPrimaryDark: string;

  @Default("#4a5568")
  @Column
  textSecondaryLight: string;

  @Default("#b0b3b8")
  @Column
  textSecondaryDark: string;

  // Cores Primárias
  @Default("#128c7e")
  @Column
  primaryColor: string;

  @Default("#25d366")
  @Column
  secondaryColor: string;

  // Configurações de Fonte
  @Default("Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif")
  @Column(DataType.TEXT)
  fontFamily: string;

  @Default("16")
  @Column
  fontSizeBase: number;

  @Default("400")
  @Column
  fontWeightNormal: number;

  @Default("600")
  @Column
  fontWeightBold: number;

  // Logos (já existentes no Setting, mas mantendo compatibilidade)
  @Column(DataType.TEXT)
  appLogoLight: string;

  @Column(DataType.TEXT)
  appLogoDark: string;

  @Column(DataType.TEXT)
  appLogoFavicon: string;

  @Column
  appName: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhitelabelConfig;

