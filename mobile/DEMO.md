# Modo de apresentacao

O aplicativo possui dois modos explicitamente separados.

## Sistema real

Configure no `.env`:

```env
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_API_URL=http://localhost:8080
```

O login e o cadastro usam Spring Boot, Oracle e JWT. Novos usuários recebem o perfil `ANALISTA`, conforme a regra real do backend.

## Demonstração offline

Configure no `.env`:

```env
EXPO_PUBLIC_DEMO_MODE=true
```

O aplicativo não chama a API. Login, cadastro, clientes, dashboard, predição e administração usam dados persistidos no AsyncStorage. Novos usuários recebem `ADMIN` para que o professor consiga navegar por todas as telas.

Credenciais demonstrativas:

- `admin@ford.com` / `ford2026`
- `gerente@ford.com` / `ford2026`
- `analista@ford.com` / `ford2026`

Depois de alterar o `.env`, reinicie o Expo com `npx expo start -c`.
