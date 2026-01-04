# Modelos de Prompts para Testes NestJS

Aqui estão modelos de prompts para gerar novos casos de teste para a API, focados em Controller e Service.

## 1. Prompt para Gerar Testes de Service

**Contexto**: Você precisa testar a lógica de negócios isolada de dependências externas (banco de dados, APIs externas).
**Template**:

> "Atue como um especialista em testes unitários com NestJS e Jest. Crie um arquivo de teste `[NomeDoService].spec.ts` para o serviço `[NomeDoService]`.
>
> **Requisitos:**
>
> 1.  Use `Test.createTestingModule` para configurar o módulo de teste.
> 2.  **Mock de Dependências**: Crie mocks para todas as dependências injetadas (ex: Repositories com `typeorm`, outros Services).
>     - Exemplo: `useValue: { find: jest.fn(), save: jest.fn() }`.
> 3.  **Casos de Teste**:
>     - **Sucesso**: Um teste para cada método (`create`, `findAll`, `findOne`, etc.) retornando dados válidos (`ResultDTO`).
>     - **Erro**: Um teste capturando exceções ou retornando `false` quando algo falha (ex: item não encontrado, erro de banco).
> 4.  **Sintaxe**: Use `describe`, `it`, `expect` e `jest.spyOn` se necessário.
>
> **Código do Service**:
>
> ````typescript
> [Cole aqui o código do Service]
> ```"
> ````

---

## 2. Prompt para Gerar Testes E2E de Controller

**Contexto**: Você precisa testar os endpoints HTTP, entradas e saídas, e o comportamento dos Guards/Interceptors.
**Template**:

> "Atue como um especialista em testes E2E com NestJS e Supertest. Crie um arquivo de teste `[NomeDoController].e2e-spec.ts`.
>
> **Requisitos:**
>
> 1.  Use `Test.createTestingModule` para compilar o módulo.
> 2.  **Mock do Service**: Não use o banco de dados real. Mocke o `[NomeDoService]` para retornar respostas fixas de sucesso/erro.
>     - Use `.overrideProvider([NomeDoService]).useValue(mockService)`.
> 3.  **Auth (JWT)**: Se houver rotas protegidas com `UseGuards(AuthGuard('jwt'))`:
>     - Sobrescreva o Guard usando `.overrideGuard(AuthGuard('jwt')).useValue({ canActivate: () => true })` OU simule um token válido se preferir integração completa.
> 4.  **Casos de Teste**:
>     - Teste `POST`, `GET`, `PUT`, `DELETE`.
>     - Verifique o **Status Code** (200, 201, 401, 404).
>     - Verifique o **Corpo da Resposta** (deve seguir a estrutura `ResultDTO`).
>
> **Código do Controller**:
>
> ````typescript
> [Cole aqui o código do Controller]
> ```"
> ````
