# Configuração do Google Meet

Este guia explica como configurar a integração com Google Meet para criar reuniões automaticamente.

## Pré-requisitos

1. Conta Google (Gmail ou Google Workspace)
2. Acesso ao [Google Cloud Console](https://console.cloud.google.com/)

## Passo a Passo

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar um projeto" → "Novo Projeto"
3. Dê um nome ao projeto (ex: "Psicologia Vitoria API")
4. Clique em "Criar"

### 2. Habilitar Google Calendar API

1. No menu lateral, vá em "APIs e Serviços" → "Biblioteca"
2. Procure por "Google Calendar API"
3. Clique em "Ativar"

### 3. Criar Credenciais OAuth 2.0

1. Vá em "APIs e Serviços" → "Credenciais"
2. Clique em "Criar credenciais" → "ID do cliente OAuth"
3. Configure:
   - **Tipo de aplicativo**: Aplicativo da Web
   - **Nome**: Psicologia Vitoria API
   - **URIs de redirecionamento autorizados**: 
     - `http://localhost:3000/auth/google/callback` (desenvolvimento)
     - `https://seu-dominio.com/auth/google/callback` (produção)
4. Clique em "Criar"
5. **IMPORTANTE**: Copie o **ID do Cliente** e o **Segredo do Cliente**

### 4. Obter Refresh Token

Para obter o refresh token, você precisa fazer o fluxo OAuth uma vez. Existem duas opções:

#### Opção A: Usar Script Node.js (Recomendado)

Crie um arquivo `get-refresh-token.js` na raiz do projeto:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'SEU_CLIENT_ID';
const CLIENT_SECRET = 'SEU_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Autorize este aplicativo visitando esta URL:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Digite o código da URL aqui: ', (code) => {
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Erro ao recuperar o token de acesso', err);
    
    console.log('\n=== CREDENCIAIS ===');
    console.log('REFRESH_TOKEN:', token.refresh_token);
    console.log('\nAdicione este refresh_token ao seu arquivo .env');
    
    rl.close();
  });
});
```

Execute:
```bash
node get-refresh-token.js
```

#### Opção B: Usar OAuth 2.0 Playground

1. Acesse [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Clique em ⚙️ (Configurações) → Marque "Use your own OAuth credentials"
3. Cole seu Client ID e Client Secret
4. No lado esquerdo, selecione "Calendar API v3" → "https://www.googleapis.com/auth/calendar"
5. Clique em "Authorize APIs"
6. Faça login e autorize
7. Clique em "Exchange authorization code for tokens"
8. Copie o **Refresh token**

### 5. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_REFRESH_TOKEN=seu_refresh_token_aqui
```

### 6. Executar Migration

```bash
npm run migration:run
```

## Testando

Após configurar, você pode testar criando uma consulta e chamando o endpoint:

```bash
GET http://localhost:3000/consultations/1/meet-link
```

## Troubleshooting

### Erro: "Google Calendar API não está configurada"
- Verifique se todas as variáveis de ambiente estão configuradas
- Certifique-se de que o arquivo `.env` está na raiz do projeto

### Erro: "invalid_grant"
- O refresh token pode ter expirado
- Gere um novo refresh token seguindo o Passo 4

### Erro: "insufficient permissions"
- Verifique se a Google Calendar API está habilitada
- Verifique se o refresh token tem as permissões corretas (calendar, calendar.events)

## Notas Importantes

- O refresh token não expira (a menos que seja revogado manualmente)
- Mantenha suas credenciais seguras e nunca as commite no Git
- Em produção, use variáveis de ambiente do servidor ou um gerenciador de secrets



