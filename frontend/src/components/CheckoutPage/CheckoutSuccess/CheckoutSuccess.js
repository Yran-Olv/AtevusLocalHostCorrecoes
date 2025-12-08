import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from "react-router-dom";
import QRCode from 'react-qr-code';
import { SuccessContent, Total } from './style';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';
import { useDate } from "../../../hooks/useDate";
import { toast } from "react-toastify";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../../utils/socketHelper";

function CheckoutSuccess(props) {
  // IMPORTANTE: Hooks devem ser chamados ANTES de qualquer return condicional
  const [pixString, setPixString] = useState(null);
  const [copied, setCopied] = useState(false);
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const { dateToClient } = useDate();

  const { pix } = props;

  // Inicializa pixString quando pix estiver disponível
  useEffect(() => {
    if (pix && pix.qrcode && pix.qrcode.qrcode) {
      setPixString(pix.qrcode.qrcode);
    }
  }, [pix]);

  useEffect(() => {
    const companyId = user.companyId;
    if (companyId && isSocketValid(socket)) {
      // const socket = socketManager.GetSocket();

      const onCompanyPayment = (data) => {

        if (data.action === "CONCLUIDA") {
          toast.success(`Sua licença foi renovada até ${dateToClient(data.company.dueDate)}!`);
          setTimeout(() => {
            history.push("/");
          }, 4000);
        }
      }

      safeSocketOn(socket, `company-${companyId}-payment`, onCompanyPayment);

      return () => {
        safeSocketOff(socket, `company-${companyId}-payment`, onCompanyPayment);
      }
    }
  }, [socket, user?.companyId, history, dateToClient]);

  const handleCopyQR = () => {
    setTimeout(() => {
      setCopied(false);
    }, 1 * 1000);
    setCopied(true);
  };

  // Valida se pix e qrcode existem - DEPOIS de todos os hooks
  if (!pix || !pix.qrcode || !pix.qrcode.qrcode || !pixString) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Erro: Dados do PIX não foram recebidos corretamente.</p>
        <p>Por favor, tente novamente.</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Total>
        <span>TOTAL</span>
        <strong>R${pix.valor.original.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</strong>
      </Total>
      <SuccessContent>
        <QRCode value={pixString} />
        <CopyToClipboard text={pixString} onCopy={handleCopyQR}>
          <button className="copy-button" type="button">
            {copied ? (
              <>
                <span>Copiado</span>
                <FaCheckCircle size={18} />
              </>
            ) : (
              <>
                <span>Copiar código QR</span>
                <FaCopy size={18} />
              </>
            )}
          </button>
        </CopyToClipboard>
        <span>
          Para finalizar, basta realizar o pagamento escaneando ou colando o
          código Pix acima :)
        </span>
      </SuccessContent>
    </React.Fragment>
  );
}

export default CheckoutSuccess;
