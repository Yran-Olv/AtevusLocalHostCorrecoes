# Arquivo de Som de Notificação

Para que as notificações funcionem com som no PWA (Android/iOS), você precisa adicionar um arquivo de som.

## Instruções:

1. Crie ou baixe um arquivo de som de notificação (formato MP3, OGG ou WAV)
2. Nomeie o arquivo como `notification-sound.mp3`
3. Coloque o arquivo em: `frontend/public/notification-sound.mp3`

## Recomendações:

- **Duração**: 0.3 a 0.5 segundos
- **Frequência**: 800Hz (similar ao WhatsApp)
- **Formato**: MP3 é o mais compatível
- **Tamanho**: Mantenha pequeno (< 50KB) para carregamento rápido

## Alternativa:

Se não adicionar o arquivo, o sistema usará um som sintético gerado programaticamente.

