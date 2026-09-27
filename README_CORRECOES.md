# Correções de Cybersecurity FordRetain

Base: Matheus-Bortolotto/fordretain-api-Java, main 1a63684d379e4e93d7b5ffb95382965123633703.
Este pacote contém alterações locais. Não foi publicado no GitHub por falta de permissão push.

## Implementação

- Spring Boot 3.5.16, dependências JWT/Springdoc atualizadas e SBOM CycloneDX.
- CI com SCA em push e PR, Java/JavaScript CodeQL, Gitleaks, Trivy IaC/container e gate bloqueante HIGH/CRITICAL.
- Revalidação de conta ativa e role a cada JWT, CORS configurável e limite de login.
- AES-GCM rejeita dados corrompidos e texto puro. Fazer migração explícita dos telefones legados antes da implantação sobre banco existente.
- Logs JSON sem e-mail/token, contadores Micrometer e identidade exclusiva para Prometheus.
- SecureStore no Android/iOS, sessão web em memória, remoção da cópia antiga no AsyncStorage e HTTPS obrigatório em release.
- Regressão logística do notebook integrada à API como coeficientes JSON; teste de equivalência Python/Java em 12 registros. Não há execução de pickle na API.
- Persistência da predição transacional e uso do pool DataSource.

## Reproduzir

Requisitos: Java 17, Maven, Node 22 e Python 3.

```bash
mvn clean verify
cd mobile
npm ci
npm run lint
npm run build
cd ..
python scripts/runtime_evidence.py
```

O script gera chaves temporárias, inicia o perfil local H2, executa os testes HTTP e salva evidências sem credenciais.
Ele não conecta nem modifica o Oracle.
O bootstrap de admin é restrito ao perfil local e exige LOCAL_ADMIN_PASSWORD; nunca use esse perfil em produção.

Para Oracle, configure ORACLE_URL, ORACLE_USER, ORACLE_PASSWORD, JWT_SECRET, CRYPTO_SECRET e CRYPTO_SALT no ambiente.
Use scripts/validate-oracle.sql no cliente Oracle. Revise a conta inicial do V5 e substitua sua senha de demonstração antes de expor a aplicação.

## Monitoramento

Gere MONITORING_TOKEN aleatório com pelo menos 32 caracteres. Configure o mesmo valor no ambiente da API e no arquivo local monitoring/metrics-token.txt (ignorado pelo Git).
Defina GRAFANA_ADMIN_PASSWORD no ambiente do Compose.

```bash
cd monitoring
docker compose up -d
```

Grafana: http://localhost:3000. Prometheus: http://localhost:9090.
O dashboard e a fonte de dados são provisionados. A API deve aceitar conexão da rede Docker; server.address do perfil local é 127.0.0.1 por padrão. Se usar API no host com Docker Linux, altere o bind apenas em rede controlada e mantenha firewall e autenticação do coletor.
Configure destinatários de alertas antes de declarar resposta operacional validada.

## Implantação e limitações

Um mantenedor deve aplicar as mudanças em branch, executar o CI e revisar/mesclar o PR. Não desative o gate para conseguir pipeline verde.
O Trivy e o CodeQL precisam executar no ambiente autorizado. Este pacote não contém comprovação de aprovação remota dessas novas versões.
Oracle real, restauração de backup, APK/IPA em dispositivo e Grafana/Prometheus em execução permanecem validações de homologação.
O projeto fornecido não implementa IoT. MQTT/TLS depende de módulo e escopo definidos pela equipe.
O limitador é por instância; múltiplas réplicas exigem rate limit compartilhado no gateway.

O modelo foi treinado com clientes sintéticos; F1 macro 0,405886 e acurácia 0,432. Esses números não provam efetividade comercial e as probabilidades não foram calibradas.
