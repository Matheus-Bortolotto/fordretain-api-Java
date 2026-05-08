# FordRetain API

> **Ford FIAP Challenge 2026 — Desafio 02**  
> API de Retenção Preditiva de Clientes | Disciplina: Arquitetura Orientada a Serviços e Web Services

---

## Integrantes

| Nome | RM |
|---|---|
| Fernanda Rocha Menon | RM 554673 |
| Luiza Macena Dantas | RM 556237 |
| Luan Ramos Garcia de Souza | RM 558537 |
| Matheus Ricciotti | RM 556930 |
| Matheus Bortolotto | RM 555189 |

---

## Visão Geral

A **FordRetain API** é um serviço RESTful desenvolvido em **Java 17 + Spring Boot 3.2** que integra o pipeline de retenção de clientes da Ford no pós-venda.

A API recebe dados de um cliente no momento da compra, prevê seu perfil comportamental (FIEL, ABANDONO, ESQUECIDO ou ECONÔMICO) e sugere ações personalizadas para a concessionária — com persistência em **Oracle Database** e documentação interativa via **Swagger/OpenAPI**.

---

## Arquitetura SOA

O projeto segue uma **Arquitetura Orientada a Serviços (SOA)** com separação clara em três camadas:

```
┌─────────────────────────────────────────────────────────┐
│                  CAMADA DE APRESENTAÇÃO                  │
│        App Mobile (React Native) / Dashboard Web         │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP/REST (JSON)
┌───────────────────────────▼─────────────────────────────┐
│                    CAMADA DE SERVIÇO                     │
│              FordRetain API (Spring Boot)                │
│                                                         │
│  POST /api/v1/predict   →  PredictionService            │
│  GET  /api/v1/dashboard →  PredictionService            │
│  GET  /api/v1/leads     →  PredictionService            │
│                                                         │
│  GlobalExceptionHandler  →  Tratamento de erros         │
│  Bean Validation         →  Validação de entrada        │
│  Swagger/OpenAPI         →  Documentação automática     │
└──────────┬──────────────────────────┬───────────────────┘
           │ JDBC (DAO Pattern)       │ HTTP (futuro)
┌──────────▼──────────┐   ┌──────────▼──────────────────┐
│   CAMADA DE DADOS   │   │  MICROSSERVIÇO ML (futuro)  │
│   Oracle Database   │   │  Python FastAPI             │
│   + Flyway          │   │  Modelo treinado (sklearn)  │
└─────────────────────┘   └─────────────────────────────┘
```

### Componentes

| Componente | Tecnologia | Responsabilidade |
|---|---|---|
| API REST | Java 17 + Spring Boot 3.2 | Orquestração dos serviços e exposição dos endpoints |
| Banco de Dados | Oracle Database | Persistência de clientes e predições |
| Migrações | Flyway | Controle de versão do schema (V1, V2) |
| Documentação | SpringDoc OpenAPI 2.3 (Swagger) | Contrato interativo da API |
| Validação | Bean Validation (Jakarta) | Validação de entrada com anotações |
| Testes | JUnit 5 + Mockito + AssertJ | Testes unitários do serviço de predição |
| Driver JDBC | ojdbc11 23.4 | Conexão com Oracle Database |

### Estrutura de Pacotes

```
com.ford.fordretain
├── controller/          # Endpoints REST (camada de apresentação)
│   └── FordRetainController.java
├── service/             # Lógica de negócio (camada de serviço)
│   └── PredictionService.java
├── dao/                 # Interfaces DAO (contrato de acesso a dados)
│   ├── ClienteDAO.java
│   ├── PredicaoDAO.java
│   └── impl/            # Implementações JDBC
│       ├── ClienteDAOImpl.java
│       └── PredicaoDAOImpl.java
├── model/               # Entidades de domínio
│   ├── Cliente.java
│   └── Predicao.java
├── dto/                 # Objetos de transferência (entrada/saída)
│   ├── ClienteRequestDTO.java
│   ├── PredicaoResponseDTO.java
│   ├── DashboardDTO.java
│   └── LeadDTO.java
├── exception/           # Tratamento global de erros
│   ├── GlobalExceptionHandler.java
│   ├── ClienteJaCadastradoException.java
│   ├── ClienteNaoEncontradoException.java
│   ├── DatabaseException.java
│   └── ErrorResponse.java
└── config/              # Configurações
    ├── OracleConnectionFactory.java
    └── SwaggerConfig.java
```

---

## Endpoints da API

### `POST /api/v1/predict` — Prever perfil do cliente

Recebe dados do momento da compra e retorna o perfil comportamental previsto.

**Request:**
```json
{
  "nome": "João da Silva",
  "email": "joao.silva@email.com",
  "telefone": "11999990001",
  "regiao": "SP",
  "idade": 34,
  "canalCompra": "CONCESSIONARIA",
  "formaPagamento": "FINANCIAMENTO",
  "modeloVeiculo": "RANGER",
  "dataCompra": "2024-03-15",
  "historicoMarca": "PRIMEIRA_COMPRA"
}
```

**Response (201 Created):**
```json
{
  "predicaoId": 42,
  "clienteId": 7,
  "nomeCliente": "João da Silva",
  "perfilPrevisto": "ABANDONO",
  "probabilidades": {
    "FIEL": 0.0800,
    "ABANDONO": 0.6800,
    "ESQUECIDO": 0.1500,
    "ECONOMICO": 0.0900
  },
  "scoreRisco": 68,
  "acaoSugerida": "Contato imediato — pacote de 3 revisões com desconto progressivo.",
  "dataPredicao": "2026-05-08T14:30:00"
}
```

### `GET /api/v1/dashboard` — Métricas de VIN Share

Retorna métricas agregadas de retenção: VIN Share geral, por região, por modelo e distribuição de perfis.

**Response (200 OK):**
```json
{
  "totalClientes": 1250,
  "vinShareGeral": 0.58,
  "clientesRiscoAlto": 312,
  "distribuicaoPerfis": {
    "FIEL": 420,
    "ABANDONO": 310,
    "ESQUECIDO": 280,
    "ECONOMICO": 240
  },
  "vinSharePorRegiao": { "SP": 0.62, "RJ": 0.51 },
  "vinSharePorModelo": { "RANGER": 0.65, "TERRITORY": 0.48 },
  "geradoEm": "2026-05-08T14:30:00"
}
```

### `GET /api/v1/leads?scoreMinimo=50` — Clientes em risco

Lista clientes com score de risco acima do mínimo, ordenados por prioridade.

**Response (200 OK):**
```json
[
  {
    "clienteId": 7,
    "nome": "Carlos Mendes",
    "email": "carlos.m@email.com",
    "telefone": "21999990002",
    "regiao": "RJ",
    "modeloVeiculo": "MAVERICK",
    "perfilPrevisto": "ABANDONO",
    "scoreRisco": 85,
    "probabilidadePrincipal": 0.7200,
    "acaoSugerida": "Contato imediato — pacote de 3 revisões com desconto progressivo.",
    "dataPredicao": "2026-05-08T14:30:00"
  }
]
```

### Métodos HTTP utilizados

| Método | Endpoint | Ação |
|---|---|---|
| `POST` | `/api/v1/predict` | Cria cliente + predição (recurso novo) |
| `GET` | `/api/v1/dashboard` | Consulta métricas (leitura) |
| `GET` | `/api/v1/leads` | Consulta leads com filtro (leitura) |

---

## Tratamento de Erros

A API possui um `GlobalExceptionHandler` que padroniza todas as respostas de erro:

| HTTP Status | Exceção | Cenário |
|---|---|---|
| `400` | `MethodArgumentNotValidException` | Campos inválidos (validação) |
| `404` | `ClienteNaoEncontradoException` | Cliente não existe na base |
| `409` | `ClienteJaCadastradoException` | E-mail já cadastrado |
| `500` | `DatabaseException` | Falha de conexão com o banco |
| `500` | `Exception` | Erro genérico (sem detalhes internos) |

Formato padrão de erro:
```json
{
  "status": 400,
  "erro": "Dados inválidos",
  "mensagem": "Verifique os campos informados",
  "campos": { "email": "Email inválido", "idade": "Idade mínima é 18" },
  "timestamp": "2026-05-08T14:30:00"
}
```

> **Nota de segurança:** mensagens de erro genéricas (500) nunca expõem stack trace, estrutura interna ou tecnologia utilizada.

---

## Pré-requisitos

- Java 17+
- Maven 3.8+
- Oracle Database (acesso FIAP: `oracle.fiap.com.br:1521/orcl`)

---

## Configuração do Banco de Dados

Edite `src/main/resources/application.properties` com suas credenciais Oracle FIAP:

```properties
oracle.datasource.url=jdbc:oracle:thin:@//oracle.fiap.com.br:1521/orcl
oracle.datasource.username=SEU_RM
oracle.datasource.password=SUA_SENHA
oracle.datasource.driver-class-name=oracle.jdbc.OracleDriver
```

O **Flyway** executa as migrações automaticamente ao iniciar a aplicação:
- `V1__create_tables.sql` — cria as tabelas `clientes` e `predicoes` (sintaxe Oracle)
- `V2__insert_sample_data.sql` — insere dados de exemplo para testes

---

## Como Executar

```bash
# Clonar o projeto
git clone https://github.com/seu-grupo/fordretain-api.git
cd fordretain-api

# Compilar e rodar testes
mvn clean install

# Executar a aplicação
mvn spring-boot:run
```

A API estará disponível em: `http://localhost:8080`

---

## Documentação — Swagger UI

Com a aplicação rodando, acesse:

| Recurso | URL |
|---|---|
| Swagger UI | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |
| OpenAPI JSON | [http://localhost:8080/api-docs](http://localhost:8080/api-docs) |

O Swagger funciona como o **contrato da API**, documentando todos os endpoints, parâmetros, schemas de request/response e códigos de erro.

---

## Testes

O projeto possui testes unitários com **JUnit 5 + Mockito + AssertJ** que validam todos os cenários do `PredictionService`:

```bash
mvn test
```

| Teste | Cenário |
|---|---|
| `deveRetornarPerfilAbandonoParaClienteNovoOnline` | Cliente novo + canal online → ABANDONO |
| `deveLancarExcecaoEmailDuplicado` | E-mail já cadastrado → 409 Conflict |
| `deveRetornarPerfilFielParaRecompra` | Cliente recompra + concessionária → FIEL |
| `deveRetornarPerfilEsquecidoParaConsorcio` | Primeira compra + consórcio → ESQUECIDO |
| `deveRetornarPerfilEconomicoParaCenarioPadrao` | Cenário padrão → ECONOMICO |

---

## Perfis de Cliente e Ações

| Perfil | Descrição | Ação Sugerida |
|---|---|---|
| **FIEL** | Retorna consistentemente à rede oficial | Programa de fidelidade premium |
| **ABANDONO** | Realiza no máximo a 1ª revisão e sai da rede | Contato imediato + pacote de revisões |
| **ESQUECIDO** | Perde o timing da manutenção | Lembrete com agendamento fácil |
| **ECONOMICO** | Sensível a preço, mantém relação parcial | Cupom de desconto na próxima revisão |

---

## Tecnologias

- **Java 17** + **Spring Boot 3.2**
- **Oracle Database** (JDBC direto via `ojdbc11`)
- **Flyway** (migrações de schema)
- **SpringDoc OpenAPI 2.3** (Swagger UI)
- **Lombok** (redução de boilerplate)
- **Bean Validation** (Jakarta)
- **JUnit 5** + **Mockito** + **AssertJ** (testes)
