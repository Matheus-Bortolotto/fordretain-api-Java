import { apiRequest } from './httpClient';

const PROFILE_LABELS = {
  FIEL: 'Cliente Fiel',
  ECONOMICO: 'Cliente Econômico',
  ESQUECIDO: 'Cliente Esquecido',
  ABANDONO: 'Cliente de Abandono',
};

function toPercent(value) {
  const number = Number(value || 0);
  return Math.round(number <= 1 ? number * 100 : number);
}

function getRiskLevel(score) {
  if (score >= 70) return 'Alto';
  if (score >= 50) return 'Médio';
  return 'Baixo';
}

function getPriority(score) {
  if (score >= 70) return 'Contato em até 24h';
  if (score >= 50) return 'Acompanhar esta semana';
  return 'Manter relacionamento';
}

function mapLead(lead) {
  const score = Number(lead.scoreRisco || 0);
  const perfil = PROFILE_LABELS[lead.perfilPrevisto] || lead.perfilPrevisto || 'Não informado';

  return {
    id: lead.clienteId,
    clienteId: lead.clienteId,
    nome: lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    regiao: lead.regiao,
    modelo: lead.modeloVeiculo,
    veiculo: lead.modeloVeiculo,
    perfil,
    perfilPrevisto: lead.perfilPrevisto,
    riscoEvasao: score,
    nivelRisco: getRiskLevel(score),
    prioridade: getPriority(score),
    probabilidadePerfil: toPercent(lead.probabilidadePrincipal),
    acaoRecomendada: lead.acaoSugerida,
    dataPredicao: lead.dataPredicao,
    motivoPriorizacao: `score de risco ${score}/100`,
    fatoresRisco: [`Score calculado pela API: ${score}/100`],
  };
}

function mapClient(client) {
  return {
    ...client,
    modelo: client.modeloVeiculo,
    veiculo: client.modeloVeiculo,
  };
}

export async function getLeads(filters = {}) {
  const scoreMinimo = Number(filters.scoreMinimo ?? 0);
  const response = await apiRequest(`/api/v1/leads?scoreMinimo=${scoreMinimo}`);
  let leads = (response || []).map(mapLead);

  if (filters.riskLevel && filters.riskLevel !== 'Todos') {
    leads = leads.filter((lead) => lead.nivelRisco === filters.riskLevel);
  }

  if (filters.onlyPriority) {
    leads = leads.filter((lead) => lead.riscoEvasao >= 70);
  }

  return leads.sort((a, b) => b.riscoEvasao - a.riscoEvasao);
}

export async function getPriorityLeads(limit = 5) {
  const leads = await getLeads({ scoreMinimo: 70, onlyPriority: true });
  return leads.slice(0, limit);
}

export async function getClientById(id) {
  const [client, leads] = await Promise.all([
    apiRequest(`/api/v1/clientes/${id}`),
    getLeads({ scoreMinimo: 0 }),
  ]);
  const lead = leads.find((item) => String(item.id) === String(id));

  return {
    ...mapClient(client),
    ...(lead || {}),
    ...mapClient(client),
    fatoresRisco: lead?.fatoresRisco || [],
  };
}

export async function simulateCommercialAction() {
  throw new Error('A API ainda não possui endpoint para registrar ações comerciais.');
}
