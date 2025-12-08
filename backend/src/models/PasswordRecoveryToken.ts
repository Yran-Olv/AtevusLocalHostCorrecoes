import {
  Table,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import User from "./User";

@Table({ tableName: "PasswordRecoveryTokens" })
class PasswordRecoveryToken extends Model<PasswordRecoveryToken> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  token: string;

  @Column
  expiresAt: Date;

  @CreatedAt
  createdAt: Date;
}

export default PasswordRecoveryToken;

