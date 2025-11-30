frontend\src\pages\Dashboard Refatoração completa da pasta Dashboard

Arquivos refatorados
1. Chart.js
Removido: useTheme do Material-UI, componente Title
Adicionado: CSS customizado, cores via variáveis CSS, tooltip e legendas estilizados
2. ChartDonut.js
Melhorado: labels com cores do tema, responsividade aprimorada, estilos via CSS
3. ChartsDate.js
Removido: Material-UI (DatePicker, LocalizationProvider, Button, Grid, TextField, Typography, useTheme)
Adicionado: inputs de data nativos, botões customizados, layout responsivo, integração com Chart.js
4. ChartsUser.js
Removido: Material-UI (DatePicker, LocalizationProvider, Button, Grid, TextField, Typography, makeStyles, useTheme)
Adicionado: inputs de data nativos, botões customizados, layout responsivo, integração com Chart.js
5. Title.js
Refatorado: removido Material-UI, mantido como componente simples para compatibilidade
6. button.css
Removido: arquivo não é mais necessário (estilos do Material-UI)
Melhorias no CSS (style.css)
Novos estilos adicionados:
.dashboard-donut-chart — container para gráficos donut
.dashboard-chart-filters — grid responsivo para filtros de data
.dashboard-date-input-wrapper — wrapper para inputs de data
.dashboard-date-label — labels dos inputs
.dashboard-date-input — inputs de data customizados
.dashboard-title — título customizado (compatibilidade)
Responsividade:
Mobile (< 480px): gráficos com altura reduzida (200px)
Tablet (480px - 768px): gráficos com altura média (250px)
Desktop (> 768px): gráficos com altura padrão (300px)
Resultado final
Todos os arquivos sem Material-UI
Design empresarial consistente
Totalmente responsivo (mobile, tablet, desktop)
Cores alinhadas ao tema do Dashboard
Performance otimizada
Código mais limpo e manutenível
Arquivos da pasta Dashboard:
index.js — refatorado
Chart.js — refatorado
ChartDonut.js — refatorado
ChartsDate.js — refatorado
ChartsUser.js — refatorado
Filters.js — refatorado
Title.js — refatorado
style.css — atualizado com novos estilos
button.css — removido