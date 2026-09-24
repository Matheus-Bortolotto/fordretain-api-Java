# Apresentação sem a API

O aplicativo tenta usar a API normalmente. Se a conexão falhar, ele entra automaticamente no modo demonstração e usa uma base local persistida no navegador ou no dispositivo.

Credenciais demonstrativas:

- `admin@ford.com` / `ford2026`
- `gerente@ford.com` / `ford2026`
- `analista@ford.com` / `ford2026`

O modo demonstração cobre login, cadastro, dashboard, carteira de clientes, detalhes, predição e administração de usuários. O status `demonstração` no cabeçalho indica que os dados não estão vindo do backend.

Para voltar a testar a API real, ligue o backend, faça logout e entre novamente. O fallback só ocorre quando há falha de conexão; respostas HTTP reais, como `401` ou `409`, continuam sendo tratadas pela API.
