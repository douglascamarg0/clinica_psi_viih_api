# Guia de Testes - Psicologia Vitoria API

Este guia explica como executar e interpretar os testes automatizados localizados na pasta `moduleTesting`.

## 1. Pré-requisitos

Certifique-se de que as dependências do projeto estejam instaladas:

```bash
npm install
```

## 2. Executando os Testes

### Executar TODOS os testes

Para rodar todos os arquivos de teste dentro de `moduleTesting`:

```bash
npx jest moduleTesting
```

### Executar um teste ESPECÍFICO

Para rodar apenas um arquivo específico (por exemplo, apenas o controller de usuários), passe o caminho do arquivo:

```bash
npx jest moduleTesting/modules/users/users.controller.e2e-spec.ts
```

### Executar um CASO DE TESTE específico

Para rodar apenas um teste específico dentro de um arquivo (por exemplo, apenas o teste `create` do `UsersService`), use a flag `-t` com o nome do teste:

```bash
npx jest moduleTesting/modules/users/users.service.e2e-spec.ts -t "should create a new user successfully"
```

**Dica**: O nome do teste é o texto que você vê dentro do `it('nome do teste', ...)`. Você pode usar parte do nome também:

```bash
npx jest moduleTesting/modules/users/users.service.e2e-spec.ts -t "create"
```

Isso executará todos os testes que contenham "create" no nome.

### Modo Watch (Desenvolvimento)

Para rodar os testes automaticamente sempre que você salvar um arquivo:

```bash
npx jest moduleTesting --watch
```

## 3. Interpretando os Resultados

### ✅ Sucesso (PASS)

Quando tudo está correto, você verá uma saída verde indicando "PASS".

```text
 PASS  moduleTesting/modules/users/users.service.e2e-spec.ts
 PASS  moduleTesting/modules/users/users.controller.e2e-spec.ts

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        3.456 s
```

- **Test Suites**: Número de arquivos de teste executados.
- **Tests**: Número total de casos de teste (`it` ou `test`) individuais que passaram.

### ❌ Falha (FAIL)

Quando algo dá errado, você verá uma saída vermelha indicando "FAIL" e os detalhes do erro.

**Exemplo de Erro:**

```text
 FAIL  moduleTesting/modules/users/users.service.e2e-spec.ts
  ● UsersService › create › should create a new user successfully

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      45 |         const result = await service.create(dto);
      46 |
    > 47 |         expect(result.status).toBe(true);
         |                               ^
```

**Como ler:**

1.  **Arquivo**: O topo diz qual arquivo falhou (`users.service.e2e-spec.ts`).
2.  **Local**: Mostra a descrição do teste (`UsersService > create > should create...`).
3.  **Expectativa vs Realidade**:
    - `Expected`: O que o teste esperava (ex: `true`).
    - `Received`: O que ele recebeu de fato (ex: `false`).
4.  **Linha do Código**: A seta `>` aponta para a linha exata no arquivo de teste onde a falha ocorreu.

## Dicas

- Se um teste falhar, verifique a mensagem de erro (o que foi recebido diferente do esperado).
- Se houver erros de importação ou módulos, verifique se o `Test.createTestingModule` está mockando corretamente todas as dependências do Service/Controller.
