# FordRetain API

> **Ford FIAP Challenge 2026 — Desafio 02**  
> API de Retenção Preditiva de Clientes | Disciplina: Arquitetura Orientada a Serviços e Web Services

---

## Visão Geral

A **FordRetain API** é um serviço RESTful desenvolvido em **Java + Spring Boot** que integra o pipeline de Machine Learning de retenção de clientes da Ford.

A API recebe dados de um cliente no momento da compra, prevê seu perfil comportamental e sugere ações personalizadas para a concessionária — tudo com persistência em banco de dados Oracle MySQL e documentação via Swagger.

---

## Arquitetura SOA

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO               │
│         App Mobile (React Native) / Dashboard Web        │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────▼─────────────────────────────┐
│                  CAMADA DE SERVIÇO                       │
│              FordRetain API (Spring Boot)                │
│                                                         │
│  POST /api/v1/predict   →  PredictionService            │
│  GET  /api/v1/dashboard →  PredictionService            │
│  GET  /api/v1/leads     →  PredictionService            │
└──────────┬──────────────────────────┬───────────────────┘
           │ JPA/Hibernate            │ HTTP (futuro)
┌──────────▼──────────┐   ┌──────────▼──────────────────┐
│   CAMADA DE DADOS   │   │  MICROSSERVIÇO ML (futuro)  │
│   Oracle MySQL      │   │  Python FastAPI             │
│   + Flyway          │   │  Modelo treinado (sklearn)  │
└─────────────────────┘   └─────────────────────────────┘
```

### Componentes

| Componente | Tecnologia | Responsabilidade |
|---|---|---|
| API REST | Java 17 + Spring Boot 3.2 | Orquestração dos serviços |
| Banco de Dados | Oracle MySQL | Persistência de clientes e predições |
| Migrações | Flyway | Controle de versão do schema |
| Documentação | Swagger (SpringDoc OpenAPI) | Contrato da API |
| Testes | JUnit 5 + Mockito | Validação dos serviços |

---

## Pré-requisitos

- Java 17+
- Maven 3.8+
- Oracle MySQL (porta 3306)

---

## Configuração do Banco de Dados

1. Crie o banco de dados no MySQL:

```sql
CREATE DATABASE fordretain_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Edite `src/main/resources/application.properties` com suas credenciais:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fordretain_db?useSSL=false&serverTimezone=America/Sao_Paulo
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
```

3. O **Flyway executa as migrações automaticamente** ao iniciar a aplicação:
   - `V1__create_tables.sql` — cria as tabelas `clientes` e `predicoes`
   - `V2__insert_sample_data.sql` — insere dados de exemplo

---

## Como Executar

```bash
# Clonar o projeto
git clone https://github.com/seu-grupo/fordretain-api.git
cd fordretain-api

# Compilar
mvn clean install

# Executar
mvn spring-boot:run
```

A API estará disponível em: `http://localhost:8080`

---

## Documentação — Swagger UI

Após iniciar a aplicação, acesse:

```
http://localhost:8080/swagger-ui.html
```

O contrato completo da API (OpenAPI 3.0) também está disponível em:

```
http://localhost:8080/api-docs
```

---

## Endpoints

### `POST /api/v1/predict`

Recebe dados do cliente no momento da compra e retorna o perfil previsto + ação sugerida.

**Request Body:**
```json
{
  "nome": "João da Silva",
  "email": "joao.silva@email.com",
  "telefone": "11999990001",
  "regiao": "SP",
  "idade": 34,
  "canalCompra": "ONLINE",
  "formaPagamento": "FINANCIAMENTO",
  "modeloVeiculo": "RANGER",
  "dataCompra": "2024-03-15",
  "historicoMarca": "PRIMEIRA_COMPRA"
}
```

**Response 201:**
```json
{
  "predicaoId": 1,
  "clienteId": 7,
  "nomeCliente": "João da Silva",
  "perfilPrevisto": "ABANDONO",
  "probabilidades": {
    "FIEL":      0.0800,
    "ABANDONO":  0.6800,
    "ESQUECIDO": 0.1500,
    "ECONOMICO": 0.0900
  },
  "scoreRisco": 68,
  "acaoSugerida": "Contato imediato — pacote de 3 revisões com desconto progressivo.",
  "dataPredicao": "2024-03-15T10:30:00"
}
```

---

### `GET /api/v1/dashboard`

Retorna métricas agregadas de VIN Share.

**Response 200:**
```json
{
  "totalClientes": 1250,
  "vinShareGeral": 0.58,
  "clientesRiscoAlto": 312,
  "distribuicaoPerfis": {
    "FIEL": 480,
    "ABANDONO": 340,
    "ESQUECIDO": 210,
    "ECONOMICO": 220
  },
  "vinSharePorRegiao": {
    "SP": 0.62,
    "RJ": 0.54,
    "MG": 0.58
  },
  "vinSharePorModelo": {
    "RANGER": 0.65,
    "MAVERICK": 0.48,
    "TERRITORY": 0.55
  },
  "geradoEm": "2024-03-15T10:30:00"
}
```

---

### `GET /api/v1/leads?scoreMinimo=50`

Lista clientes em risco de evasão, ordenados por prioridade.

**Parâmetros:**

| Parâmetro | Tipo | Padrão | Descrição |
|---|---|---|---|
| `scoreMinimo` | int | 50 | Score mínimo de risco (0-100) |

**Response 200:**
```json
[
  {
    "clienteId": 2,
    "nome": "Carlos Mendes",
    "email": "carlos.m@email.com",
    "telefone": "21999990002",
    "regiao": "RJ",
    "modeloVeiculo": "MAVERICK",
    "perfilPrevisto": "ABANDONO",
    "scoreRisco": 85,
    "probabilidadePrincipal": 0.7200,
    "acaoSugerida": "Contato imediato — pacote de 3 revisões com desconto progressivo.",
    "dataPredicao": "2024-03-15T10:30:00"
  }
]
```

---

## Perfis de Cliente

| Perfil | Descrição | Ação Sugerida |
|---|---|---|
| `FIEL` | Retorna consistentemente para manutenção na rede oficial | Programa de fidelidade premium |
| `ABANDONO` | Faz no máximo a 1ª revisão e deixa a rede | Contato imediato com pacote de revisões |
| `ESQUECIDO` | Perde o timing da manutenção e se frustra | Lembrete com agendamento fácil |
| `ECONOMICO` | Sensível a preço e promoções | Cupom de desconto |

---

## Integração com o Modelo ML

O método `mockPredict()` em `PredictionService.java` simula o modelo de Machine Learning com regras simples. **Quando o modelo Python (sklearn) estiver treinado**, substitua esse método por uma chamada HTTP:

```java
// Exemplo de integração futura com o microsserviço Python
RestTemplate restTemplate = new RestTemplate();
String mlServiceUrl = "http://localhost:5000/predict";
Map<String, BigDecimal> probs = restTemplate.postForObject(mlServiceUrl, request, Map.class);
```

---

## Testes

```bash
mvn test
```

Os testes cobrem:
- Predição de perfil ABANDONO para cliente novo via canal online
- Lançamento de exceção para e-mail duplicado
- Predição de perfil FIEL para cliente com histórico de recompra

---

## Estrutura do Projeto

```
fordretain-api/
├── src/main/java/com/ford/fordretain/
│   ├── FordRetainApplication.java       ← Entry point
│   ├── config/
│   │   └── SwaggerConfig.java           ← Configuração OpenAPI
│   ├── controller/
│   │   └── FordRetainController.java    ← Endpoints REST
│   ├── service/
│   │   └── PredictionService.java       ← Lógica de negócio
│   ├── repository/
│   │   ├── ClienteRepository.java       ← JPA Repository
│   │   └── PredicaoRepository.java      ← JPA Repository + queries
│   ├── model/
│   │   ├── Cliente.java                 ← Entidade JPA
│   │   └── Predicao.java               ← Entidade JPA
│   ├── dto/
│   │   ├── ClienteRequestDTO.java       ← Entrada do POST /predict
│   │   ├── PredicaoResponseDTO.java     ← Saída do POST /predict
│   │   ├── DashboardDTO.java            ← Saída do GET /dashboard
│   │   └── LeadDTO.java                 ← Saída do GET /leads
│   └── exception/
│       ├── GlobalExceptionHandler.java  ← Tratamento centralizado de erros
│       ├── ErrorResponse.java           ← DTO de erro
│       ├── ClienteNaoEncontradoException.java
│       └── ClienteJaCadastradoException.java
├── src/main/resources/
│   ├── application.properties           ← Configurações
│   └── db/migration/
│       ├── V1__create_tables.sql        ← Flyway: criação das tabelas
│       └── V2__insert_sample_data.sql   ← Flyway: dados de exemplo
├── src/test/java/com/ford/fordretain/
│   └── PredictionServiceTest.java       ← Testes unitários
└── pom.xml                              ← Dependências Maven
```

---

## Critérios Atendidos (Rubrica)

| Critério | Como foi atendido |
|---|---|
| Desenho de arquitetura (10%) | Diagrama SOA neste README |
| APIs RESTful (20%) | 3 endpoints com métodos HTTP corretos (POST, GET) |
| Métodos HTTP corretos (10%) | POST para criação, GET para consulta |
| Documentação Swagger (10%) | SpringDoc OpenAPI em `/swagger-ui.html` |
| SOA modular (10%) | Controller → Service → Repository separados |
| Separação de camadas (10%) | Apresentação / Serviço / Dados claramente separados |
| Padrões REST/JSON (8%) | JSON em todos os endpoints, status codes HTTP corretos |
| Tratamento de erros (7%) | GlobalExceptionHandler com respostas padronizadas |
| Conexão com banco (8%) | Spring Data JPA + MySQL configurado |
| Migrações (7%) | Flyway com V1 e V2 versionados |

---

*Ford FIAP Challenge 2026 — Grupo FordRetain*
