# Gerenciamento de Migrations

Este documento fornece instruções sobre como gerenciar as migrations do banco de dados no projeto Psicologia Vitória API.

## Configuração Inicial

Certifique-se de que as seguintes variáveis de ambiente estejam configuradas no seu arquivo `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=psicologia_vitoria
```

## Comandos Disponíveis

### 1. Criar uma Nova Migration

Para criar uma nova migration manualmente:

```bash
npm run migration:create src/migrations/NomeDaMigration
```

### 2. Gerar uma Migration Automaticamente

Para gerar uma migration automaticamente com base nas entidades existentes:

```bash
npm run migration:generate src/migrations/NomeDaMigration
```

### 3. Executar Todas as Migrations Pendentes

Para executar todas as migrations que ainda não foram aplicadas:

```bash
npm run migration:run
```

### 4. Reverter a Última Migration Executada

Para desfazer a última migration que foi aplicada:

```bash
npm run migration:revert
```

### 5. Verificar o Status das Migrations

Para verificar quais migrations já foram aplicadas e quais estão pendentes:

```bash
npm run migration:show
```

## Boas Práticas

1. **Nomes Descritivos**: Use nomes descritivos para as migrations, como `CreateUsersTable` ou `AddEmailVerificationToUsers`.

2. **Ordem de Execução**: As migrations são executadas em ordem alfabética. Use um prefixo numérico (ex: `1703952000000-CreateUsersTable.ts`) para garantir a ordem correta.

3. **Testar Localmente**: Sempre teste as migrations localmente antes de enviar para o repositório.

4. **Backup**: Faça backup do banco de dados antes de executar migrations em produção.

5. **Transações**: As migrations são executadas dentro de transações. Se ocorrer um erro, todas as alterações serão revertidas.

## Migrations Criadas

1. **CreateUsersTable** - Cria a tabela de usuários
2. **CreateTokensTable** - Cria a tabela de tokens de autenticação

## Solução de Problemas

### Erro ao Conectar ao Banco de Dados
Verifique se as credenciais no arquivo `.env` estão corretas e se o servidor de banco de dados está em execução.

### Erro de Permissão
Certifique-se de que o usuário do banco de dados tem permissão para criar e modificar tabelas.

### Erro de Chave Estrangeira
Se encontrar erros de chave estrangeira, verifique a ordem das migrations para garantir que as tabelas referenciadas existam.
