INSERT INTO clientes (
    nome, email, telefone, regiao, idade, canal_compra,
    forma_pagamento, modelo_veiculo, data_compra, historico_marca,
    criado_em, atualizado_em
) VALUES (
    'João Silva', 'joao.silva@email.com', '11999999999', 'SP', 35,
    'ONLINE', 'FINANCIAMENTO', 'Ranger', DATE '2026-01-15', 'PRIMEIRA_COMPRA',
    SYSTIMESTAMP, SYSTIMESTAMP
);

INSERT INTO clientes (
    nome, email, telefone, regiao, idade, canal_compra,
    forma_pagamento, modelo_veiculo, data_compra, historico_marca,
    criado_em, atualizado_em
) VALUES (
    'Maria Souza', 'maria.souza@email.com', '21988888888', 'RJ', 42,
    'CONCESSIONARIA', 'CONSORCIO', 'Territory', DATE '2026-02-10', 'RECOMPRA',
    SYSTIMESTAMP, SYSTIMESTAMP
);

INSERT INTO predicoes (
    cliente_id, perfil_previsto, prob_fiel, prob_abandono,
    prob_esquecido, prob_economico, acao_sugerida,
    score_risco, data_predicao
) VALUES (
    1, 'ABANDONO', 0.0800, 0.6800, 0.1500, 0.0900,
    'Contato imediato — pacote de 3 revisões com desconto progressivo.',
    68, SYSTIMESTAMP
);

INSERT INTO predicoes (
    cliente_id, perfil_previsto, prob_fiel, prob_abandono,
    prob_esquecido, prob_economico, acao_sugerida,
    score_risco, data_predicao
) VALUES (
    2, 'ESQUECIDO', 0.1500, 0.1000, 0.6000, 0.1500,
    'Enviar lembrete com agendamento fácil e link direto para a concessionária.',
    42, SYSTIMESTAMP
);