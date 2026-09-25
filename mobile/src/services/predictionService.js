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

export async function predictClientProfile(form) {
  const response = await apiRequest('/api/v1/predict', {
    method: 'POST',
    body: JSON.stringify({
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      telefone: form.telefone.replace(/\D/g, '') || null,
      regiao: form.regiao,
      idade: Number(form.idade),
      canalCompra: form.canalCompra,
      formaPagamento: form.formaPagamento,
      modeloVeiculo: form.modeloVeiculo,
      dataCompra: form.dataCompra,
      historicoMarca: form.historicoMarca,
    }),
  });

  return {
    predicaoId: response.predicaoId,
    clienteId: response.clienteId,
    nomeCliente: response.nomeCliente,
    perfil: PROFILE_LABELS[response.perfilPrevisto] || response.perfilPrevisto,
    perfilCodigo: response.perfilPrevisto,
    riscoEvasao: Number(response.scoreRisco || 0),
    acaoRecomendada: response.acaoSugerida,
    dataPredicao: response.dataPredicao,
    probabilidades: Object.entries(response.probabilidades || {}).map(([perfil, value]) => ({
      perfil: PROFILE_LABELS[perfil] || perfil,
      valor: toPercent(value),
    })),
  };
}

export async function getPredictionVariables() {
  return {
    variaveis: [
      {
        name: 'regiao',
        label: 'Estado (UF)',
        options: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
      },
      {
        name: 'modeloVeiculo',
        label: 'Modelo do veículo',
        options: ['BRONCO SPORT', 'ECOSPORT', 'EDGE', 'FIESTA', 'FOCUS', 'KA', 'MAVERICK', 'MUSTANG', 'RANGER', 'TERRITORY'],
      },
      {
        name: 'formaPagamento',
        label: 'Forma de pagamento',
        options: ['FINANCIAMENTO', 'VISTA', 'CONSORCIO'],
      },
      {
        name: 'canalCompra',
        label: 'Canal de compra',
        options: ['CONCESSIONARIA', 'ONLINE', 'REVENDEDOR'],
      },
      {
        name: 'historicoMarca',
        label: 'Histórico com a Ford',
        options: ['PRIMEIRA_COMPRA', 'RECOMPRA'],
      },
    ],
  };
}
