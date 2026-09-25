# FordRetain Mobile

Aplicativo React Native com Expo Router para acompanhamento de clientes Ford, análise de risco, classificação de novos perfis, recomendações de retenção e administração de usuários.

O mobile possui dois modos de execução:

- **Demonstração offline:** funciona sem a API e sem o Oracle, usando dados locais do dispositivo.
- **Sistema real:** utiliza a API Spring Boot, autenticação JWT e persistência no Oracle.

As telas do aplicativo estão documentadas na [galeria do README principal](../README.md#galeria-de-telas).

## Pré-requisitos

- Node.js 18 ou superior
- npm
- Expo executado via `npx`
- Para o modo real: API Spring Boot disponível em `http://localhost:8080`

## Instalação

Dentro desta pasta, instale as dependências:

```bash
npm ci
```

Crie o arquivo `.env` a partir do exemplo:

```bash
# PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

## Modo demonstração offline

Para apresentar o aplicativo sem iniciar a API ou o Oracle, configure o `.env`:

```env
EXPO_PUBLIC_DEMO_MODE=true
```

Nesse modo:

- login e cadastro são processados localmente;
- clientes, dashboard, classificação, recomendações e usuários usam dados do `AsyncStorage`;
- novos usuários recebem o perfil `ADMIN` para permitir a navegação por todas as telas;
- nenhuma requisição é enviada ao backend.

Credenciais demonstrativas:

| E-mail | Senha |
|---|---|
| `admin@ford.com` | `ford2026` |
| `gerente@ford.com` | `ford2026` |
| `analista@ford.com` | `ford2026` |

## Modo real com API

Configure o `.env` desta forma:

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_API_URL=http://localhost:8080
```

No modo real:

- login e cadastro usam `POST /api/v1/auth/login` e `POST /api/v1/auth/register`;
- a API retorna um JWT, armazenado pelo app para as chamadas autenticadas;
- novos usuários recebem `ANALISTA`;
- somente usuários `ADMIN` acessam a administração e alteram roles ou status de contas.

### Endereço da API por ambiente

| Ambiente | `EXPO_PUBLIC_API_URL` |
|---|---|
| Navegador no computador | `http://localhost:8080` |
| Android Emulator | `http://10.0.2.2:8080` |
| Celular físico | `http://IP_DO_COMPUTADOR:8080` |

No celular físico, computador e aparelho precisam estar na mesma rede. A API também deve aceitar conexões na rede local.

Para iniciar o backend, volte à raiz do projeto e execute:

```bash
cd ..
mvn spring-boot:run
```

## Executar o Expo

Dentro da pasta `mobile/`:

```bash
# Abre o menu do Expo
npm run start

# Executa no navegador
npm run web

# Abre no Android Emulator ou dispositivo conectado
npm run android

# Executa no iOS, em ambiente compatível
npm run ios
```

Depois de alterar qualquer variável do `.env`, reinicie o Expo com cache limpo:

```bash
npx expo start -c
```

## Gerar APK Android

O perfil `preview` está configurado para gerar um APK instalável em modo demonstração:

```bash
npx eas-cli@latest build -p android --profile preview --clear-cache
```

O build é executado pelo Expo EAS. Ao finalizar, o terminal e o painel do EAS disponibilizam o link para download do APK.

## Validação local

```bash
npm run doctor
npm run lint
npm run build
```

O comando `npm run build` valida a exportação web do projeto; ele não gera o APK. O APK é gerado pelo comando do EAS apresentado acima.

## Documentação relacionada

- [README principal](../README.md)
- [Guia do modo demonstração](DEMO.md)
- [Configuração do EAS](eas.json)
