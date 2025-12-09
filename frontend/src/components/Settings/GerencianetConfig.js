import React, { useEffect, useState } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import Switch from "../UI/Switch";
import { toast } from "react-toastify";
import api from "../../services/api";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js/index.js";
import "./GerencianetConfig.css";

export default function GerencianetConfig() {
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
        <form onSubmit={handleSubmit} className="gerencianet-config-form">
          <div className="config-header">
            <h2>Configuração do Gerencianet (EFI Bank)</h2>
            <p className="config-description">
              Configure as credenciais do Gerencianet para processar pagamentos PIX.
              As configurações são salvas no banco de dados e não requerem recompilação do backend.
            </p>
          </div>

          <div className="config-grid">
            <div className="config-item config-item-full">
              <div className="switch-wrapper">
                <Switch
                  checked={config.sandbox}
                  onChange={handleChange("sandbox")}
                  label="Ambiente Sandbox (Testes)"
                />
                <p className="config-helper">
                  Ative para usar ambiente de testes. Desative para produção.
                </p>
              </div>
            </div>

            <div className="config-item">
              <Input
                label="Client ID"
                value={config.clientId || ""}
                onChange={handleChange("clientId")}
                helperText="Client ID da aplicação Gerencianet"
              />
            </div>

            <div className="config-item">
              <Input
                label="Client Secret"
                type="password"
                value={config.clientSecret && !config.clientSecret.startsWith("***") ? config.clientSecret : ""}
                onChange={handleChange("clientSecret")}
                helperText="Client Secret da aplicação Gerencianet (deixe em branco para manter o atual)"
                placeholder={config.clientSecret && config.clientSecret.startsWith("***") ? "Secret já configurado (digite novo para alterar)" : ""}
              />
            </div>

            <div className="config-item">
              <Input
                label="Chave PIX"
                value={config.chavePix || ""}
                onChange={handleChange("chavePix")}
                helperText="Chave PIX cadastrada no Gerencianet"
              />
            </div>

            <div className="config-item">
              <Input
                label="Nome do Certificado PIX"
                value={config.pixCert || ""}
                onChange={handleChange("pixCert")}
                helperText="Nome do arquivo .p12 (sem extensão) que deve estar em backend/certs/"
              />
            </div>

            <div className="config-item">
              <Input
                label="Senha do Certificado (Opcional)"
                type="password"
                value={config.pixCertPassword || ""}
                onChange={handleChange("pixCertPassword")}
                helperText="Senha do certificado .p12, se houver"
              />
            </div>

            <div className="config-item config-item-full">
              <Input
                label="URL do Webhook"
                value={config.webhookUrl || ""}
                onChange={handleChange("webhookUrl")}
                helperText="URL completa do webhook (ex: https://seu-dominio.com/subscription/return/{chave}/pix)"
              />
            </div>

            <div className="config-item config-item-full">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                loading={loading}
                fullWidth
              >
                {loading ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>
          </div>
        </form>
      )}
    />
  );
}
