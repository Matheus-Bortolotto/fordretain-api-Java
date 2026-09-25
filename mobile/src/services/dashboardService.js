import { apiRequest } from './httpClient';

const PROFILE_LABELS = {
  FIEL: 'Cliente Fiel',
  ECONOMICO: 'Cliente Econômico',
  ESQUECIDO: 'Cliente Esquecido',
  ABANDONO: 'Cliente de Abandono',
};

function toPercent(value) {
  const number = Number(value || 0);
  return Number((number <= 1 ? number * 100 : number).toFixed(1));
}

function mapEntries(values = {}, labelMapper = (label) => label) {
  return Object.entries(values || {}).map(([label, value]) => ({
    label: labelMapper(label),
    value,
  }));
}

export async function getDashboard() {
  const response = await apiRequest('/api/v1/dashboard');
  const highRisk = Number(response.clientesRiscoAlto || 0);

  return {
    total: Number(response.totalClientes || 0),
    highRisk,
    vinShareEstimado: toPercent(response.vinShareGeral),
    clientesPorPerfil: mapEntries(
      response.distribuicaoPerfis,
      (profile) => PROFILE_LABELS[profile] || profile,
    ),
    vinSharePorRegiao: mapEntries(response.vinSharePorRegiao).map((item) => ({
      ...item,
      value: toPercent(item.value),
    })),
    vinSharePorModelo: mapEntries(response.vinSharePorModelo).map((item) => ({
      ...item,
      value: toPercent(item.value),
    })),
    riscoPorNivel: [{ label: 'Alto', value: highRisk }],
    geradoEm: response.geradoEm,
  };
}

export async function getDashboardContract() {
  return apiRequest('/api/v1/dashboard');
}

export async function getDashboardInsights() {
  const dashboard = await getDashboard();
  const perfilMaisComum = [...dashboard.clientesPorPerfil].sort((a, b) => b.value - a.value)[0];
  const regiaoMenorVinShare = [...dashboard.vinSharePorRegiao].sort((a, b) => a.value - b.value)[0];

  return {
    cards: [
      {
        title: 'Clientes em alto risco',
        value: String(dashboard.highRisk),
        description: 'Clientes com score de risco igual ou superior a 70.',
      },
      {
        title: 'Perfil mais comum',
        value: perfilMaisComum?.label || 'Não informado',
        description: perfilMaisComum ? `${perfilMaisComum.value} cliente(s)` : 'Sem dados de perfil',
      },
      {
        title: 'Região de atenção',
        value: regiaoMenorVinShare?.label || 'Não informado',
        description: regiaoMenorVinShare
          ? `VIN Share em ${regiaoMenorVinShare.value}%`
          : 'Sem dados regionais',
      },
    ],
    recommendation: 'Priorizar os clientes com maior score de risco retornado pela API.',
  };
}

export async function getVinShareByModel() {
  const dashboard = await getDashboard();
  return [...dashboard.vinSharePorModelo].sort((a, b) => a.value - b.value);
}
