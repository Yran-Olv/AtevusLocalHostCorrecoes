// Em produção, JWT_SECRET é obrigatório
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET é obrigatório em produção. Configure a variável de ambiente JWT_SECRET."
  );
}

export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "15m",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "7d"
};
