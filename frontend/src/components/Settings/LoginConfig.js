import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Chip from "@material-ui/core/Chip";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import api from "../../services/api";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js/index.js";
import ColorPicker from "../ColorPicker";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  helperText: {
    marginTop: theme.spacing(1),
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  typingTextsContainer: {
    marginTop: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  textInput: {
    marginTop: theme.spacing(1),
  },
}));

export default function LoginConfig() {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState({});
  const [config, setConfig] = useState({
    theme: "default",
    logoUrl: "",
    backgroundImageUrl: "",
    title: "Multivus",
    subtitle: "Sistema de Multiatendimento",
    typingTexts: [],
    primaryColor: "#128c7e",
    secondaryColor: "#25d366",
    enableTypingEffect: true,
    enableAnimations: true,
    enablePasswordRecovery: true,
    customCss: "",
    welcomeMessage: "Bem-vindo ao sistema de atendimento",
    mailHost: "",
    mailPort: 587,
    mailUser: "",
    mailPass: "",
    mailFrom: "",
    mailSecure: true,
  });
  const [newTypingText, setNewTypingText] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const { getCurrentUserInfo } = useAuth();

  useEffect(() => {
    getCurrentUserInfo().then((u) => {
      setCurrentUser(u);
    });
    loadConfig();
    loadThemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await api.get("/login-config");
      setConfig({
        ...data,
        typingTexts: Array.isArray(data.typingTexts) ? data.typingTexts : [],
      });
    } catch (err) {
      console.error("Erro ao carregar configuração:", err);
      toast.error("Erro ao carregar configuração do Login");
    }
  };

  const loadThemes = async () => {
    try {
      const { data } = await api.get("/login-config/themes");
      setThemes(data);
    } catch (err) {
      console.error("Erro ao carregar temas:", err);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setConfig({
      ...config,
      [field]: value,
    });
  };

  const handleThemeChange = (event) => {
    const themeName = event.target.value;
    const theme = themes[themeName];
    
    if (theme) {
      setConfig({
        ...config,
        theme: themeName,
        primaryColor: theme.primaryColor || config.primaryColor,
        secondaryColor: theme.secondaryColor || config.secondaryColor,
        typingTexts: theme.typingTexts || config.typingTexts,
      });
    } else {
      setConfig({
        ...config,
        theme: themeName,
      });
    }
  };

  const handleAddTypingText = () => {
    if (newTypingText.trim()) {
      setConfig({
        ...config,
        typingTexts: [...config.typingTexts, newTypingText.trim()],
      });
      setNewTypingText("");
    }
  };

  const handleRemoveTypingText = (index) => {
    setConfig({
      ...config,
      typingTexts: config.typingTexts.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put("/login-config", config);
      toast.success("Configuração do Login salva com sucesso!");
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
              <h2>Configuração da Tela de Login</h2>
              <p className={classes.helperText}>
                Configure completamente a aparência e comportamento da tela de login.
                Todas as alterações são aplicadas imediatamente.
              </p>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <InputLabel>Tema</InputLabel>
                <Select
                  value={config.theme}
                  onChange={handleThemeChange}
                  label="Tema"
                >
                  <MenuItem value="default">Padrão</MenuItem>
                  <MenuItem value="natalino">Natalino</MenuItem>
                  <MenuItem value="anoNovo">Ano Novo</MenuItem>
                  <MenuItem value="diaMulher">Dia da Mulher</MenuItem>
                  <MenuItem value="diaMaes">Dia das Mães</MenuItem>
                  <MenuItem value="conscienciaNegra">Consciência Negra</MenuItem>
                </Select>
                <p className={classes.helperText}>
                  Selecione um tema pré-definido ou personalize manualmente
                </p>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Título"
                  value={config.title || ""}
                  onChange={handleChange("title")}
                  fullWidth
                  variant="outlined"
                  helperText="Título principal exibido no login"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Subtítulo"
                  value={config.subtitle || ""}
                  onChange={handleChange("subtitle")}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                  helperText="Subtítulo ou descrição exibida no login"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="URL do Logo"
                  value={config.logoUrl || ""}
                  onChange={handleChange("logoUrl")}
                  fullWidth
                  variant="outlined"
                  helperText="URL da imagem do logo (deixe vazio para usar padrão)"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="URL da Imagem de Fundo"
                  value={config.backgroundImageUrl || ""}
                  onChange={handleChange("backgroundImageUrl")}
                  fullWidth
                  variant="outlined"
                  helperText="URL da imagem de fundo (opcional)"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <TextField
                    label="Cor Primária"
                    value={config.primaryColor || ""}
                    onChange={handleChange("primaryColor")}
                    fullWidth
                    variant="outlined"
                    helperText="Cor principal do tema"
                  />
                  <ColorPicker
                    color={config.primaryColor}
                    onChange={(color) => setConfig({ ...config, primaryColor: color })}
                  />
                </div>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <TextField
                    label="Cor Secundária"
                    value={config.secondaryColor || ""}
                    onChange={handleChange("secondaryColor")}
                    fullWidth
                    variant="outlined"
                    helperText="Cor secundária do tema"
                  />
                  <ColorPicker
                    color={config.secondaryColor}
                    onChange={(color) => setConfig({ ...config, secondaryColor: color })}
                  />
                </div>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Mensagem de Boas-vindas"
                  value={config.welcomeMessage || ""}
                  onChange={handleChange("welcomeMessage")}
                  fullWidth
                  variant="outlined"
                  helperText="Mensagem exibida na tela de login"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl className={classes.selectContainer}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enableTypingEffect}
                      onChange={handleChange("enableTypingEffect")}
                      color="primary"
                    />
                  }
                  label="Ativar Efeito de Digitação (Typing Effect)"
                />
                <p className={classes.helperText}>
                  Exibe textos com animação de digitação
                </p>
              </FormControl>
            </Grid>

            {config.enableTypingEffect && (
              <Grid item xs={12} className={classes.typingTextsContainer}>
                <FormControl className={classes.selectContainer}>
                  <InputLabel>Textos para Efeito de Digitação</InputLabel>
                  <div style={{ marginTop: "10px" }}>
                    {config.typingTexts.map((text, index) => (
                      <Chip
                        key={index}
                        label={text}
                        onDelete={() => handleRemoveTypingText(index)}
                        className={classes.chip}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <TextField
                      value={newTypingText}
                      onChange={(e) => setNewTypingText(e.target.value)}
                      placeholder="Digite um texto..."
                      fullWidth
                      variant="outlined"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTypingText();
                        }
                      }}
                    />
                    <IconButton onClick={handleAddTypingText} color="primary">
                      <AddIcon />
                    </IconButton>
                  </div>
                  <p className={classes.helperText}>
                    Textos que serão exibidos com animação de digitação
                  </p>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={4}>
              <FormControl className={classes.selectContainer}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enableAnimations}
                      onChange={handleChange("enableAnimations")}
                      color="primary"
                    />
                  }
                  label="Ativar Animações"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl className={classes.selectContainer}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enablePasswordRecovery}
                      onChange={handleChange("enablePasswordRecovery")}
                      color="primary"
                    />
                  }
                  label="Ativar Recuperação de Senha"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="CSS Personalizado"
                  value={config.customCss || ""}
                  onChange={handleChange("customCss")}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={6}
                  helperText="CSS adicional para personalização avançada"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <h3 style={{ marginTop: "24px", marginBottom: "16px" }}>Configurações de Email (Recuperação de Senha)</h3>
              <p className={classes.helperText}>
                Configure o servidor de email para envio de recuperação de senha. Se não configurado, usará as variáveis de ambiente do .env.
              </p>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Servidor SMTP (Host)"
                  value={config.mailHost || ""}
                  onChange={handleChange("mailHost")}
                  fullWidth
                  variant="outlined"
                  helperText="Ex: smtp.gmail.com"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Porta SMTP"
                  type="number"
                  value={config.mailPort || 587}
                  onChange={handleChange("mailPort")}
                  fullWidth
                  variant="outlined"
                  helperText="587 (TLS) ou 465 (SSL)"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Usuário/Email SMTP"
                  type="email"
                  value={config.mailUser || ""}
                  onChange={handleChange("mailUser")}
                  fullWidth
                  variant="outlined"
                  helperText="Email do servidor SMTP"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Senha SMTP"
                  type="password"
                  value={config.mailPass && !config.mailPass.startsWith("***") ? config.mailPass : ""}
                  onChange={handleChange("mailPass")}
                  fullWidth
                  variant="outlined"
                  helperText="Senha do email (deixe em branco para manter a atual)"
                  placeholder={config.mailPass && config.mailPass.startsWith("***") ? "Senha já configurada (digite nova para alterar)" : ""}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <TextField
                  label="Email Remetente (From)"
                  type="email"
                  value={config.mailFrom || ""}
                  onChange={handleChange("mailFrom")}
                  fullWidth
                  variant="outlined"
                  helperText="Email que aparecerá como remetente"
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl className={classes.selectContainer}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.mailSecure !== undefined ? config.mailSecure : true}
                      onChange={handleChange("mailSecure")}
                      color="primary"
                    />
                  }
                  label="Usar SSL/TLS Seguro"
                />
                <p className={classes.helperText}>
                  Ative para porta 465 (SSL), desative para porta 587 (TLS)
                </p>
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

