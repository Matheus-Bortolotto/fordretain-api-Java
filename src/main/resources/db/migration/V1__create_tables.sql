-- ================================================
-- FordRetain DB - V1 - Criação das tabelas
-- ================================================

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome          VARCHAR(100)         NOT NULL,
    email         VARCHAR(150)         UNIQUE NOT NULL,
    telefone      VARCHAR(20),
    regiao        VARCHAR(50)          NOT NULL,
    idade         INT                  NOT NULL,
    canal_compra  VARCHAR(50)          NOT NULL,   -- ex: CONCESSIONARIA, ONLINE
    forma_pagamento VARCHAR(50)        NOT NULL,   -- ex: FINANCIAMENTO, VISTA, CONSORCIO
    modelo_veiculo VARCHAR(50)         NOT NULL,
    data_compra   DATE                 NOT NULL,
    historico_marca VARCHAR(20)        NOT NULL,   -- PRIMEIRA_COMPRA, RECOMPRA
    criado_em     TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP            DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Predições
CREATE TABLE IF NOT EXISTS predicoes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    cliente_id      BIGINT               NOT NULL,
    perfil_previsto VARCHAR(30)          NOT NULL,   -- FIEL, ABANDONO, ESQUECIDO, ECONOMICO
    prob_fiel       DECIMAL(5,4)         NOT NULL,
    prob_abandono   DECIMAL(5,4)         NOT NULL,
    prob_esquecido  DECIMAL(5,4)         NOT NULL,
    prob_economico  DECIMAL(5,4)         NOT NULL,
    acao_sugerida   TEXT,
    score_risco     INT                  NOT NULL,   -- 0 a 100 (100 = maior risco de evasão)
    data_predicao   TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_predicao_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Índices para performance
CREATE INDEX idx_predicoes_perfil     ON predicoes (perfil_previsto);
CREATE INDEX idx_predicoes_risco      ON predicoes (score_risco DESC);
CREATE INDEX idx_clientes_regiao      ON clientes (regiao);
CREATE INDEX idx_clientes_modelo      ON clientes (modelo_veiculo);
