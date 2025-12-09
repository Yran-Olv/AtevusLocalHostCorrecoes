import path from "path";

/**
 * Helper para construir caminhos de forma cross-platform
 * Substitui o uso de split("\\") que não funciona no Linux
 */
export const getPublicFolder = (): string => {
  return path.resolve(__dirname, "..", "..", "public");
};

/**
 * Constrói caminho para arquivos públicos de forma cross-platform
 */
export const getPublicFilePath = (relativePath: string): string => {
  const publicFolder = getPublicFolder();
  // Normaliza o caminho removendo barras duplas e usando path.join
  const normalizedPath = relativePath.replace(/\/+/g, "/").replace(/\\+/g, "/");
  return path.join(publicFolder, normalizedPath);
};

/**
 * Constrói caminho relativo ao diretório raiz do projeto
 * Funciona tanto em desenvolvimento (src) quanto em produção (dist)
 */
export const getProjectRootPath = (): string => {
  // Em produção, __dirname aponta para dist/
  // Em desenvolvimento, __dirname aponta para src/
  const isProduction = __dirname.includes("dist");
  const basePath = isProduction 
    ? path.resolve(__dirname, "..") 
    : path.resolve(__dirname, "..", "..");
  return basePath;
};

/**
 * Constrói caminho para arquivo público usando o root do projeto
 * Substitui o padrão: __dirname.split("src")[0].split("\\").join("/")
 */
export const getPublicPathFromRoot = (relativePath: string): string => {
  const rootPath = getProjectRootPath();
  const publicFolder = path.join(rootPath, "public");
  const normalizedPath = relativePath.replace(/\/+/g, "/").replace(/\\+/g, "/");
  return path.join(publicFolder, normalizedPath);
};

