# FordRetain Mobile

Aplicativo React Native com Expo Router integrado à API Spring Boot do FordRetain.

## Autenticação

O cadastro e o login usam exclusivamente a API própria:

- `POST /api/v1/auth/register` cria o usuário como `ANALISTA` e ativo;
- `POST /api/v1/auth/login` valida a senha com BCrypt e retorna um JWT;
- o JWT e os dados básicos do usuário ficam no `AsyncStorage` nas chaves `fordretain_token` e `fordretain_user`;
- chamadas autenticadas enviam `Authorization: Bearer <JWT>`;
- respostas `401` limpam a sessão e levam o usuário de volta ao login; `403` apenas informa falta de permissão.

Configure somente `EXPO_PUBLIC_API_URL` no arquivo `.env` (no emulador Android, normalmente `http://10.0.2.2:8080`).

## Perfis

As roles são definidas pelo backend e podem ser `ADMIN`, `GERENTE` ou `ANALISTA`. O cadastro público nunca aceita uma role enviada pelo aplicativo. A área Administração de usuários aparece somente para `ADMIN` e permite listar usuários, alterar role e ativar ou desativar contas.

## Execução

```bash
npm install
npm run start
```

O backend precisa estar disponível no endereço configurado em `EXPO_PUBLIC_API_URL`.
