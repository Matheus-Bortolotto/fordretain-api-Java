-- ================================================
-- FordRetain DB - V2 - Dados de exemplo
-- ================================================

INSERT INTO clientes (nome, email, telefone, regiao, idade, canal_compra, forma_pagamento, modelo_veiculo, data_compra, historico_marca)
VALUES
('Ana Silva',       'ana.silva@email.com',    '11999990001', 'SP', 34, 'CONCESSIONARIA', 'FINANCIAMENTO', 'RANGER',        '2023-03-15', 'RECOMPRA'),
('Carlos Mendes',   'carlos.m@email.com',     '21999990002', 'RJ', 28, 'ONLINE',         'VISTA',         'MAVERICK',      '2023-06-20', 'PRIMEIRA_COMPRA'),
('Beatriz Costa',   'beatriz.c@email.com',    '31999990003', 'MG', 45, 'CONCESSIONARIA', 'CONSORCIO',     'TERRITORY',     '2022-11-10', 'RECOMPRA'),
('Diego Pereira',   'diego.p@email.com',      '41999990004', 'PR', 22, 'ONLINE',         'FINANCIAMENTO', 'BRONCO_SPORT',  '2024-01-05', 'PRIMEIRA_COMPRA'),
('Fernanda Lima',   'fernanda.l@email.com',   '51999990005', 'RS', 38, 'CONCESSIONARIA', 'VISTA',         'RANGER_RAPTOR', '2023-09-22', 'RECOMPRA');

INSERT INTO predicoes (cliente_id, perfil_previsto, prob_fiel, prob_abandono, prob_esquecido, prob_economico, acao_sugerida, score_risco)
VALUES
(1, 'FIEL',      0.7800, 0.0500, 0.0900, 0.0800, 'Programa de fidelidade premium — oferecer revisão com desconto.',  15),
(2, 'ABANDONO',  0.0800, 0.7200, 0.1200, 0.0800, 'Contato imediato — pacote de 3 revisões com desconto progressivo.', 85),
(3, 'ESQUECIDO', 0.1500, 0.1000, 0.6500, 0.1000, 'Enviar lembrete com agendamento fácil e link direto.',             60),
(4, 'ABANDONO',  0.0600, 0.6800, 0.1500, 0.1100, 'Oferta de pacote de revisões com parcelamento sem juros.',          88),
(5, 'ECONOMICO', 0.2000, 0.1000, 0.1500, 0.5500, 'Enviar cupom de desconto de 20% na próxima revisão.',               45);
