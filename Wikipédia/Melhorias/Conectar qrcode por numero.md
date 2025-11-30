Funcionalidade implementada
Frontend
Modal de telefone: ao clicar em "Conectar com número de telefone", abre um formulário para inserir o número.
Validação: valida formato do número (mínimo 10 dígitos).
Interface: formulário responsivo, estilo WhatsApp Web.
Feedback: mensagens de erro e loading states.
Backend
Endpoint criado: POST /whatsappsession/:whatsappId/phone
Limpeza de sessão: limpa sessão anterior e gera novo QR code.
Mensagem informativa: informa que autenticação por número requer WhatsApp Business API.
Observação importante
O Baileys (biblioteca usada) não suporta autenticação direta por número de telefone. Ele usa QR code como método padrão. Para autenticação por número, é necessário:
WhatsApp Business API oficial, ou
Integração com serviço externo que forneça essa funcionalidade.
O que funciona agora
Botão "Conectar com número de telefone" abre o modal.
Usuário pode inserir o número.
Sistema limpa a sessão e gera novo QR code.
Interface responsiva e funcional.
Para implementar autenticação real por número
Seria necessário integrar com WhatsApp Business API ou usar uma solução externa que forneça autenticação por SMS/OTP.
A interface está pronta e funcional. Quando houver integração com WhatsApp Business API, basta atualizar o backend para usar a autenticação real.