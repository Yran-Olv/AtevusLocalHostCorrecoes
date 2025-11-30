import React, { useState, useEffect } from "react";
import qs from 'query-string';
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import usePlans from '../../hooks/usePlans';
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import "../Login/style.css";

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  companyName: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  password: Yup.string()
    .min(5, "Mínimo 5 caracteres!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  email: Yup.string()
    .email("Email inválido")
    .required("Obrigatório"),
  phone: Yup.string()
    .required("Obrigatório"),
  planId: Yup.string()
    .required("Selecione um plano"),
});

const SignUp = () => {
  const history = useHistory();
  const { getPlanList } = usePlans();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [focusedFields, setFocusedFields] = useState({});

  let companyId = null;
  const params = qs.parse(window.location.search);
  if (params.companyId !== undefined) {
    companyId = params.companyId;
  }

  const initialState = { 
    name: "", 
    email: "", 
    password: "", 
    phone: "", 
    companyId, 
    companyName: "", 
    planId: "" 
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const planList = await getPlanList({ listPublic: "false" });
        setPlans(planList);
      } catch (err) {
        // Ignorar erro de rede se backend não estiver disponível
        if (err.message === "Network Error") {
          console.warn("Backend não disponível. Continuando sem planos.");
          setPlans([]);
        } else {
          toastError(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getPlanList]);

  const handleSignUp = async (values) => {
    try {
      await openApi.post("/auth/signup", values);
      toast.success(i18n.t("signup.toasts.success"));
      history.push("/login");
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className="multivus-login">
      <div className="multivus-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      <div className="multivus-container">
        <div className="multivus-brand">
          <div className="brand-logo">
            <div className="logo-shape">
              <span>M</span>
            </div>
          </div>
          <h1 className="brand-name">Multivus</h1>
          <p className="brand-tagline">Crie sua conta</p>
        </div>

        <div className="multivus-card">
          <div className="card-header">
            <RouterLink to="/login" className="tab-button">
              Entrar
            </RouterLink>
            <RouterLink to="/signup" className="tab-button active">
              Criar Conta
            </RouterLink>
          </div>

          {isUnavailable && (
            <div className="unavailable-overlay">
              <p>Cadastro temporariamente indisponível</p>
            </div>
          )}

          <Formik
            initialValues={initialState}
            enableReinitialize={true}
            validationSchema={UserSchema}
            onSubmit={(values, actions) => {
              handleSignUp(values);
              actions.setSubmitting(false);
            }}
          >
            {({ touched, errors, isSubmitting, values, setFieldValue }) => (
              <Form className="multivus-form">
                <div className={`input-wrapper ${focusedFields.companyName || (touched.companyName && !errors.companyName) ? 'focused' : ''} ${values.companyName ? 'has-value' : ''}`}>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <Field
                    type="text"
                    id="companyName"
                    name="companyName"
                    placeholder=" "
                    onFocus={() => setFocusedFields(prev => ({ ...prev, companyName: true }))}
                    onBlur={() => setFocusedFields(prev => ({ ...prev, companyName: false }))}
                  />
                  <label htmlFor="companyName">{i18n.t("signup.form.company")}</label>
                  {touched.companyName && errors.companyName && (
                    <div className="input-error">{errors.companyName}</div>
                  )}
                </div>

                <div className={`input-wrapper ${focusedFields.name || (touched.name && !errors.name) ? 'focused' : ''} ${values.name ? 'has-value' : ''}`}>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder=" "
                    onFocus={() => setFocusedFields(prev => ({ ...prev, name: true }))}
                    onBlur={() => setFocusedFields(prev => ({ ...prev, name: false }))}
                  />
                  <label htmlFor="name">{i18n.t("signup.form.name")}</label>
                  {touched.name && errors.name && (
                    <div className="input-error">{errors.name}</div>
                  )}
                </div>

                <div className={`input-wrapper ${focusedFields.email || (touched.email && !errors.email) ? 'focused' : ''} ${values.email ? 'has-value' : ''}`}>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder=" "
                    style={{ textTransform: 'lowercase' }}
                    onFocus={() => setFocusedFields(prev => ({ ...prev, email: true }))}
                    onBlur={() => setFocusedFields(prev => ({ ...prev, email: false }))}
                  />
                  <label htmlFor="email">{i18n.t("signup.form.email")}</label>
                  {touched.email && errors.email && (
                    <div className="input-error">{errors.email}</div>
                  )}
                </div>

                <div className={`input-wrapper ${focusedFields.password || (touched.password && !errors.password) ? 'focused' : ''} ${values.password ? 'has-value' : ''}`}>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    placeholder=" "
                    onFocus={() => setFocusedFields(prev => ({ ...prev, password: true }))}
                    onBlur={() => setFocusedFields(prev => ({ ...prev, password: false }))}
                  />
                  <label htmlFor="password">{i18n.t("signup.form.password")}</label>
                  {touched.password && errors.password && (
                    <div className="input-error">{errors.password}</div>
                  )}
                </div>

                <div className={`input-wrapper ${focusedFields.phone || (touched.phone && !errors.phone) ? 'focused' : ''} ${values.phone ? 'has-value' : ''}`}>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <Field
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    placeholder=" "
                    onFocus={() => setFocusedFields(prev => ({ ...prev, phone: true }))}
                    onBlur={() => setFocusedFields(prev => ({ ...prev, phone: false }))}
                  />
                  <label htmlFor="phone">{i18n.t("signup.form.phone")}</label>
                  {touched.phone && errors.phone && (
                    <div className="input-error">{errors.phone}</div>
                  )}
                </div>

                <div className={`input-wrapper select-wrapper ${focusedFields.planId || (touched.planId && !errors.planId) ? 'focused' : ''} ${values.planId ? 'has-value' : ''}`}>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <Field
                    as="select"
                    id="planId"
                    name="planId"
                    className="select-field"
                    required
                    onFocus={() => {
                      setFocusedFields(prev => ({ ...prev, planId: true }));
                    }}
                    onBlur={() => setFocusedFields(prev => ({ ...prev, planId: false }))}
                    onChange={(e) => {
                      setFieldValue('planId', e.target.value);
                    }}
                  >
                    <option value="" disabled hidden>Selecione um plano</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - Atendentes: {plan.users} - WhatsApp: {plan.connections} - Filas: {plan.queues} - R$ {plan.amount}
                      </option>
                    ))}
                  </Field>
                  <label htmlFor="planId">Plano</label>
                  {touched.planId && errors.planId && (
                    <div className="input-error">{errors.planId}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? (
                    <>
                      <span className="button-spinner"></span>
                      <span>Criando conta...</span>
                    </>
                  ) : (
                    i18n.t("signup.title")
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        <div className="multivus-footer">
          <p>
            © {new Date().getFullYear()} Multivus. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
