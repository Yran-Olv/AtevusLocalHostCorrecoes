import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import api from "../../services/api";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js/index.js";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  button: {
    marginTop: theme.spacing(2),
  },
  helperText: {
    marginTop: theme.spacing(1),
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
}));

export default function GerencianetConfig() {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    sandbox: true,
    clientId: "",
    clientSecret: "",
    chavePix: "",
    pixCert: "",
    webhookUrl: "",
    pixCertPassword: "",
  });
  const [currentUser, setCurrentUser] = useState({});
  const { getCurrentUserInfo } = useAuth();

  useEffect(() => {
    getCurrentUserInfo().then((u) => {
      setCurrentUser(u);
    });
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await api.get("/gerencianet-config");
      setConfig(data);
    } catch (err) {
      console.error("Erro ao carregar configuração:", err);
      toast.error("Erro ao carregar configuração do Gerencianet");
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setConfig({
      ...config,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put("/gerencianet-config", config);
      toast.success("Configuração do Gerencianet salva com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar configuração:", err);
      toast.error(err.response?.data?.message || "Erro ao salvar configuração");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnlyForSuperUser
      user={currentUser}
      yes={() => (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} className={classes.container}>
            <Grid item xs={12}>
              <h2>Configuração do Gerencianet (EFI Bank)</h2>
              <p className={classes.helperText}>
                Configure as credenciais do Gerencianet para processar pagamentos PIX.
                As configurações são salvas no banco de dados e não requerem recompilação do backend.
              </p>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.sandbox}
                      onChange={handleChange("sandbox")}
                      color="primary"
                    />
                  }
                  label="Ambiente Sandbox (Testes)"
                />
                <p className={classes.helperText}>
                  Ative para usar ambiente de testes. Desative para produção.
                </p>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Client ID"
                  value={config.clientId || ""}
                  onChange={handleChange("clientId")}
                  fullWidth
                  variant="outlined"
                  helperText="Client ID da aplicação Gerencianet"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Client Secret"
                  type="password"
                  value={config.clientSecret && !config.clientSecret.startsWith("***") ? config.clientSecret : ""}
                  onChange={handleChange("clientSecret")}
                  fullWidth
                  variant="outlined"
                  helperText="Client Secret da aplicação Gerencianet (deixe em branco para manter o atual)"
                  placeholder={config.clientSecret && config.clientSecret.startsWith("***") ? "Secret já configurado (digite novo para alterar)" : ""}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Chave PIX"
                  value={config.chavePix || ""}
                  onChange={handleChange("chavePix")}
                  fullWidth
                  variant="outlined"
                  helperText="Chave PIX cadastrada no Gerencianet"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Nome do Certificado PIX"
                  value={config.pixCert || ""}
                  onChange={handleChange("pixCert")}
                  fullWidth
                  variant="outlined"
                  helperText="Nome do arquivo .p12 (sem extensão) que deve estar em backend/certs/"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Senha do Certificado (Opcional)"
                  type="password"
                  value={config.pixCertPassword || ""}
                  onChange={handleChange("pixCertPassword")}
                  fullWidth
                  variant="outlined"
                  helperText="Senha do certificado .p12, se houver"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="URL do Webhook"
                  value={config.webhookUrl || ""}
                  onChange={handleChange("webhookUrl")}
                  fullWidth
                  variant="outlined"
                  helperText="URL completa do webhook (ex: https://seu-dominio.com/subscription/return/{chave}/pix)"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                className={classes.button}
              >
                {loading ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    />
  );
}

