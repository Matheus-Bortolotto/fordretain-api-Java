const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

const strategies = [
  {
    perfil: 'Cliente Fiel',
    objetivo: 'Manter relacionamento e aumentar recompra.',
    prioridade: 'Baixa',
    acoes: [
      'Programa premium de fidelidade',
      'Revisão com benefício exclusivo',
      'Atendimento VIP no pós-venda',
    ],
    canais: ['App', 'E-mail', 'Consultor'],
    indicador: 'Recorrência na rede autorizada',
  },
  {
    perfil: 'Cliente Econômico',
    objetivo: 'Reduzir sensibilidade a preço e reforçar valor da rede Ford.',
    prioridade: 'Média',
    acoes: [
      'Cupom de revisão',
      'Parcelamento de serviços',
      'Pacote econômico com peças genuínas',
    ],
    canais: ['WhatsApp', 'SMS', 'E-mail'],
    indicador: 'Agendamentos de curto prazo',
  },
  {
    perfil: 'Cliente Esquecido',
    objetivo: 'Evitar perda do timing da revisão.',
    prioridade: 'Média',
    acoes: [
      'Lembrete automático',
      'Link de agendamento rápido',
      'Notificação preventiva antes do prazo',
    ],
    canais: ['Push', 'WhatsApp', 'E-mail'],
    indicador: 'Redução de revisões atrasadas',
  },
  {
    perfil: 'Cliente de Abandono',
    objetivo: 'Recuperar relacionamento antes da evasão para oficinas independentes.',
    prioridade: 'Alta',
    acoes: [
      'Contato consultivo imediato',
      'Diagnóstico gratuito',
      'Pacote de recuperação pós-garantia',
    ],
    canais: ['Telefone', 'CRM', 'WhatsApp'],
    indicador: 'Redução do risco de evasão',
  },
  {
    perfil: 'Cliente em Risco',
    objetivo: 'Priorizar ação comercial antes da perda de vínculo.',
    prioridade: 'Alta',
    acoes: [
      'Contato do consultor em até 24h',
      'Oferta personalizada de revisão',
      'Acompanhamento semanal no CRM',
    ],
    canais: ['Telefone', 'CRM', 'App'],
    indicador: 'Conversão de contatos em agendamentos',
  },
];

export async function getRetentionStrategies() {
  await delay();

  return strategies;
}
