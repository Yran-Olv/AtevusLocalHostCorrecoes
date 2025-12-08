import React, { useContext, useState, useCallback } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { Formik, Form } from "formik";
import AddressForm from "./Forms/AddressForm";
import PaymentForm from "./Forms/PaymentForm";
import ReviewOrder from "./ReviewOrder";
import CheckoutSuccess from "./CheckoutSuccess";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import validationSchema from "./FormModel/validationSchema";
import checkoutFormModel from "./FormModel/checkoutFormModel";
import formInitialValues from "./FormModel/formInitialValues";
import useStyles from "./styles";

export default function CheckoutPage(props) {
  const steps = ["Dados", "Personalizar", "Revisar"];
  const { formId, formField } = checkoutFormModel;

  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(1);
  const [datePayment, setDatePayment] = useState(null);
  const [invoiceId, setInvoiceId] = useState(props.Invoice?.id || null);
  const currentValidationSchema = validationSchema[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const { user } = useContext(AuthContext);

  // Adicionando console.log para verificar o user
  console.log("Dados do usuário:", user);

  // Função para criar fatura automaticamente
  const createInvoice = useCallback(async (planData) => {
    try {
      // Se já existe invoiceId, não cria novamente
      if (invoiceId) {
        return invoiceId;
      }

      if (!user?.companyId) {
        throw new Error("Empresa não encontrada");
      }

      // Calcula data de vencimento (30 dias a partir de hoje)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateString = dueDate.toISOString().split("T")[0];

      const invoiceData = {
        companyId: user.companyId,
        dueDate: dueDateString,
        detail: `Assinatura - ${planData.title || "Plano"}`,
        status: "pending",
        value: planData.price || planData.amount || 0,
        users: planData.users || 0,
        connections: planData.connections || 0,
        queues: planData.queues || 0,
        useWhatsapp: true,
        useFacebook: false,
        useInstagram: false,
        useCampaigns: false,
        useSchedules: false,
        useInternalChat: false,
        useExternalApi: false,
        linkInvoice: ""
      };

      console.log('Criando fatura:', invoiceData);

      const { data } = await api.post("/api/invoices", invoiceData);
      
      if (data && data.id) {
        setInvoiceId(data.id);
        console.log('Fatura criada com sucesso. ID:', data.id);
        return data.id;
      } else {
        throw new Error("Fatura criada mas ID não retornado");
      }
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
      toast.error("Erro ao criar fatura. Por favor, tente novamente.");
      throw error;
    }
  }, [invoiceId, user?.companyId]);

  function _renderStepContent(step, setFieldValue, setActiveStep, values) {
    switch (step) {
      case 0:
        return <AddressForm formField={formField} values={values} setFieldValue={setFieldValue} />;
      case 1:
        return (
          <PaymentForm
            formField={formField}
            setFieldValue={setFieldValue}
            setActiveStep={setActiveStep}
            activeStep={step}
            invoiceId={invoiceId}
            values={values}
            onCreateInvoice={createInvoice}
          />
        );
      case 2:
        return (
          <ReviewOrder 
            firstName={values.firstName}
            lastName={values.lastName}
            cpf={values.cpf}
          />
        );
      default:
        return <div>Not Found</div>;
    }
  }

  async function _submitForm(values, actions) {
    try {
      // Valida se há invoiceId
      if (!invoiceId) {
        toast.error("Erro: Fatura não encontrada. Por favor, tente novamente.");
        actions.setSubmitting(false);
        return;
      }

      const plan = JSON.parse(values.plan);
      const newValues = {
        firstName: values.firstName,
        lastName: values.lastName,
        cpf: values.cpf,
        address2: values.address2,
        city: values.city,
        state: values.state,
        zipcode: values.zipcode,
        country: values.country,
        useAddressForPaymentDetails: values.useAddressForPaymentDetails,
        nameOnCard: values.nameOnCard,
        cardNumber: values.cardNumber,
        cvv: values.cvv,
        plan: values.plan,
        price: plan.price || plan.amount || 0,
        users: plan.users || 0,
        connections: plan.connections || 0,
        invoiceId: invoiceId
      };

      console.log('Enviando dados para criar assinatura:', newValues);

      const { data } = await api.post("/subscription", newValues);
      
      // Valida resposta
      if (!data || !data.qrcode || !data.qrcode.qrcode) {
        throw new Error("Resposta inválida da API. QR Code não foi gerado.");
      }

      setDatePayment(data);
      actions.setSubmitting(false);
      setActiveStep(activeStep + 1);
      toast.success("Assinatura realizada com sucesso!, aguardando a realização do pagamento");
    } catch (err) {
      console.error('Erro ao criar assinatura:', err);
      toastError(err);
      actions.setSubmitting(false);
    }
  }

  function _handleSubmit(values, actions) {
    if (isLastStep) {
      _submitForm(values, actions);
    } else {
      setActiveStep(activeStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  }

  function _handleBack() {
    setActiveStep(activeStep - 1);
  }

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4" align="center">
        Falta pouco!
      </Typography>
      <Stepper activeStep={activeStep} className={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <React.Fragment>
        {activeStep === steps.length ? (
          <CheckoutSuccess pix={datePayment} />
        ) : (
          <Formik
            initialValues={{
              firstName: user?.company?.name || '',
              lastName: '', // Preencha aqui se tiver um sobrenome
              cpf: user?.company?.document || '',
              ...formInitialValues
            }}
            validationSchema={currentValidationSchema}
            onSubmit={_handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form id={formId}>
                {_renderStepContent(activeStep, setFieldValue, setActiveStep, values)}

                <div className={classes.buttons}>
                  {activeStep !== 1 && activeStep !== 0 && (
                    <Button onClick={_handleBack} className={classes.button}>
                      VOLTAR
                    </Button>
                  )}
                  <div className={classes.wrapper}>
                    {activeStep !== 1 && (
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                      >
                        {isLastStep ? "PAGAR" : "PRÓXIMO"}
                      </Button>
                    )}
                    {isSubmitting && (
                      <CircularProgress size={24} className={classes.buttonProgress} />
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </React.Fragment>
    </React.Fragment>
  );
}
