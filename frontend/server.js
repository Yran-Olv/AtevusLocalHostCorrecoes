const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "build"), {
	dotfiles: 'deny', // Não permitir acesso a arquivos dotfiles
	index: false, // Desabilitar listagem de diretório
}));

app.get("/*", function (req, res) {
	res.sendFile(path.join(__dirname, "build", "index.html"), {
		dotfiles: 'deny', // Mesma regra para arquivos dotfiles aqui
	});
});
app.listen(3001);

