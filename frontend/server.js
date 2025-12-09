const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const buildPath = path.join(__dirname, "build");
const indexHtmlPath = path.join(buildPath, "index.html");

// Verificar se o build existe antes de iniciar
if (!fs.existsSync(buildPath) || !fs.existsSync(indexHtmlPath)) {
	console.error("❌ ERRO: Build não encontrado!");
	console.error(`   Caminho esperado: ${indexHtmlPath}`);
	console.error("");
	console.error("📋 Para corrigir, execute:");
	console.error("   cd /home/deploy/multivustestes/frontend");
	console.error("   npm run build");
	console.error("");
	process.exit(1);
}

console.log("✅ Build encontrado, servindo arquivos estáticos...");

app.use(express.static(buildPath, {
	dotfiles: 'deny', // Não permitir acesso a arquivos dotfiles
	index: false, // Desabilitar listagem de diretório
	maxAge: '1y', // Cache de 1 ano para assets estáticos
	etag: true, // Habilitar ETag para cache
	lastModified: true // Habilitar Last-Modified
}));

// Rota catch-all para SPA (Single Page Application)
app.get("/*", function (req, res) {
	// Verificar novamente se o arquivo existe antes de enviar
	if (!fs.existsSync(indexHtmlPath)) {
		return res.status(500).send(`
			<html>
				<head><title>Erro - Build não encontrado</title></head>
				<body style="font-family: Arial; padding: 50px; text-align: center;">
					<h1>❌ Erro: Build não encontrado</h1>
					<p>O arquivo <code>build/index.html</code> não existe.</p>
					<p>Execute <code>npm run build</code> no diretório do frontend.</p>
				</body>
			</html>
		`);
	}
	
	res.sendFile(indexHtmlPath, {
		dotfiles: 'deny',
		maxAge: 0, // Não cachear index.html (sempre buscar versão atual)
		etag: true,
		lastModified: true
	});
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`✅ Servidor frontend rodando na porta ${PORT}`);
	console.log(`📁 Servindo arquivos de: ${buildPath}`);
});

