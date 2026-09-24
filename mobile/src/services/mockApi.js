import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'fordretain_demo_users';
const CLIENTS_KEY = 'fordretain_demo_clients';

const DEFAULT_USERS = [
  { id: 1, nome: 'Administrador Ford', email: 'admin@ford.com', senha: 'ford2026', role: 'ADMIN', ativo: true },
  { id: 2, nome: 'Gerente de Operações', email: 'gerente@ford.com', senha: 'ford2026', role: 'GERENTE', ativo: true },
  { id: 3, nome: 'Analista FordRetain', email: 'analista@ford.com', senha: 'ford2026', role: 'ANALISTA', ativo: true },
];

const DEFAULT_CLIENTS = [
  { id: 101, nome: 'Mariana Costa', email: 'mariana.costa@email.com', telefone: '11987654321', regiao: 'SP', idade: 42, modeloVeiculo: 'RANGER', formaPagamento: 'FINANCIAMENTO', canalCompra: 'CONCESSIONARIA', historicoMarca: 'RECOMPRA', dataCompra: '2025-04-12', perfilPrevisto: 'ABANDONO', scoreRisco: 91, probabilidadePrincipal: 0.82, acaoSugerida: 'Contato consultivo imediato', dataPredicao: '2026-09-20' },
  { id: 102, nome: 'Rafael Mendes', email: 'rafael.mendes@email.com', telefone: '21976543210', regiao: 'RJ', idade: 35, modeloVeiculo: 'MAVERICK', formaPagamento: 'VISTA', canalCompra: 'ONLINE', historicoMarca: 'PRIMEIRA_COMPRA', dataCompra: '2025-08-03', perfilPrevisto: 'ESQUECIDO', scoreRisco: 67, probabilidadePrincipal: 0.68, acaoSugerida: 'Lembrete automático de revisão', dataPredicao: '2026-09-20' },
  { id: 103, nome: 'Beatriz Oliveira', email: 'beatriz.oliveira@email.com', telefone: '11965432109', regiao: 'SP', idade: 29, modeloVeiculo: 'TERRITORY', formaPagamento: 'CONSORCIO', canalCompra: 'CONCESSIONARIA', historicoMarca: 'PRIMEIRA_COMPRA', dataCompra: '2026-01-18', perfilPrevisto: 'ECONOMICO', scoreRisco: 38, probabilidadePrincipal: 0.61, acaoSugerida: 'Cupom de revisão', dataPredicao: '2026-09-20' },
  { id: 104, nome: 'Carlos Santos', email: 'carlos.santos@email.com', telefone: '31954321098', regiao: 'MG', idade: 51, modeloVeiculo: 'BRONCO SPORT', formaPagamento: 'FINANCIAMENTO', canalCompra: 'REVENDEDOR', historicoMarca: 'RECOMPRA', dataCompra: '2024-11-22', perfilPrevisto: 'FIEL', scoreRisco: 24, probabilidadePrincipal: 0.76, acaoSugerida: 'Atendimento VIP no pós-venda', dataPredicao: '2026-09-20' },
  { id: 105, nome: 'Juliana Rocha', email: 'juliana.rocha@email.com', telefone: '41943210987', regiao: 'PR', idade: 46, modeloVeiculo: 'MUSTANG', formaPagamento: 'VISTA', canalCompra: 'CONCESSIONARIA', historicoMarca: 'RECOMPRA', dataCompra: '2025-02-10', perfilPrevisto: 'ABANDONO', scoreRisco: 78, probabilidadePrincipal: 0.71, acaoSugerida: 'Diagnóstico gratuito', dataPredicao: '2026-09-20' },
];

const PROFILE_ACTIONS = {
  FIEL: 'Atendimento VIP no pós-venda',
  ECONOMICO: 'Cupom de revisão',
  ESQUECIDO: 'Lembrete automático de revisão',
  ABANDONO: 'Contato consultivo imediato',
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }

async function readCollection(key, fallback) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    await AsyncStorage.setItem(key, JSON.stringify(fallback));
    return clone(fallback);
  }
  try { return JSON.parse(raw); } catch {
    await AsyncStorage.setItem(key, JSON.stringify(fallback));
    return clone(fallback);
  }
}

async function writeCollection(key, value) { await AsyncStorage.setItem(key, JSON.stringify(value)); }

function publicUser(user) {
  const { senha, demoLocal, ...safeUser } = user;
  return safeUser;
}

async function readDemoUsers() {
  const users = await readCollection(USERS_KEY, DEFAULT_USERS);
  const defaultEmails = new Set(DEFAULT_USERS.map((user) => user.email));
  const migratedUsers = users.map((user) => {
    if (!defaultEmails.has(user.email) && !user.demoLocal && user.role === 'ANALISTA') {
      return { ...user, role: 'ADMIN', demoLocal: true };
    }
    return user;
  });
  if (JSON.stringify(migratedUsers) !== JSON.stringify(users)) await writeCollection(USERS_KEY, migratedUsers);
  return migratedUsers;
}

function demoError(message, status, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

export function isDemoToken(token) { return typeof token === 'string' && token.startsWith('demo-token-'); }

export async function isMockCredential(email, password) {
  const users = await readDemoUsers();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return users.some((user) => user.email === normalizedEmail && user.senha === password);
}

export async function saveDemoUser({ nome, email, senha }) {
  const users = await readDemoUsers();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const existingIndex = users.findIndex((user) => user.email === normalizedEmail);
  const user = {
    id: existingIndex >= 0 ? users[existingIndex].id : Math.max(0, ...users.map((item) => Number(item.id) || 0)) + 1,
    nome: String(nome || '').trim(),
    email: normalizedEmail,
    senha,
    role: 'ADMIN',
    ativo: true,
    demoLocal: true,
  };
  const nextUsers = [...users];
  if (existingIndex >= 0) nextUsers[existingIndex] = { ...nextUsers[existingIndex], ...user };
  else nextUsers.push(user);
  await writeCollection(USERS_KEY, nextUsers);
  return publicUser(user);
}

export async function mockAuthRequest(path, body) {
  const users = await readDemoUsers();
  const email = String(body?.email || '').trim().toLowerCase();

  if (path === '/api/v1/auth/register') {
    if (users.some((user) => user.email === email)) throw demoError('Já existe uma conta com este e-mail.', 409, 'email-already-in-use');
    return saveDemoUser({ nome: body?.nome, email, senha: body?.senha });
  }

  const user = users.find((item) => item.email === email);
  if (!user || user.senha !== body?.senha) throw demoError('E-mail ou senha inválidos.', 401);
  if (!user.ativo) throw demoError('Usuário inativo. Procure um administrador.', 403);
  return { token: `demo-token-${user.id}`, tipo: 'Bearer', email: user.email, nome: user.nome, role: user.role, expiresIn: 86400 };
}

function toLead(client) {
  return { clienteId: client.id, nome: client.nome, email: client.email, telefone: client.telefone, regiao: client.regiao, modeloVeiculo: client.modeloVeiculo, perfilPrevisto: client.perfilPrevisto, scoreRisco: client.scoreRisco, probabilidadePrincipal: client.probabilidadePrincipal, acaoSugerida: client.acaoSugerida, dataPredicao: client.dataPredicao };
}

function buildDashboard(clients) {
  const countBy = (field) => clients.reduce((result, client) => { result[client[field]] = (result[client[field]] || 0) + 1; return result; }, {});
  const asShare = (values) => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value / Math.max(clients.length, 1)]));
  return { totalClientes: clients.length, clientesRiscoAlto: clients.filter((client) => client.scoreRisco >= 70).length, vinShareGeral: 0.68, distribuicaoPerfis: countBy('perfilPrevisto'), vinSharePorRegiao: asShare(countBy('regiao')), vinSharePorModelo: asShare(countBy('modeloVeiculo')), geradoEm: new Date().toISOString() };
}

function buildPrediction(form, clients) {
  const age = Number(form?.idade || 0);
  const profile = form?.historicoMarca === 'RECOMPRA' && age < 55 ? 'FIEL' : age >= 55 ? 'ABANDONO' : 'ESQUECIDO';
  const score = profile === 'ABANDONO' ? 76 : profile === 'ESQUECIDO' ? 58 : 22;
  const id = Math.max(0, ...clients.map((item) => Number(item.id) || 0)) + 1;
  const dataPredicao = new Date().toISOString().slice(0, 10);
  const client = { ...form, id, telefone: String(form?.telefone || '').replace(/\D/g, '') || null, idade: age, perfilPrevisto: profile, scoreRisco: score, probabilidadePrincipal: 0.74, acaoSugerida: PROFILE_ACTIONS[profile], dataPredicao };
  return {
    client,
    response: { predicaoId: id + 1000, clienteId: id, nomeCliente: client.nome, perfilPrevisto: profile, scoreRisco: score, acaoSugerida: client.acaoSugerida, dataPredicao, probabilidades: { FIEL: profile === 'FIEL' ? 0.74 : 0.12, ECONOMICO: 0.08, ESQUECIDO: profile === 'ESQUECIDO' ? 0.68 : 0.1, ABANDONO: profile === 'ABANDONO' ? 0.76 : 0.1 } },
  };
}

export async function mockApiRequest(path, options = {}) {
  const cleanPath = path.split('?')[0];
  const method = String(options.method || 'GET').toUpperCase();
  let body = {};
  try { body = options.body ? JSON.parse(options.body) : {}; } catch { body = {}; }

  if (cleanPath === '/actuator/health') return { status: 'DEMO', _demoMode: true };
  if (cleanPath === '/api/v1/dashboard') return buildDashboard(await readCollection(CLIENTS_KEY, DEFAULT_CLIENTS));
  if (cleanPath === '/api/v1/leads') {
    const leads = (await readCollection(CLIENTS_KEY, DEFAULT_CLIENTS)).map(toLead);
    const query = path.split('?')[1] || '';
    const scoreMinimo = Number(decodeURIComponent(query.match(/(?:^|&)scoreMinimo=([^&]*)/)?.[1] || '0'));
    return leads.filter((lead) => Number(lead.scoreRisco) >= scoreMinimo);
  }

  const clientMatch = cleanPath.match(/^\/api\/v1\/clientes\/(\d+)$/);
  if (clientMatch && method === 'GET') {
    const client = (await readCollection(CLIENTS_KEY, DEFAULT_CLIENTS)).find((item) => String(item.id) === clientMatch[1]);
    if (!client) throw demoError('Cliente não encontrado.', 404);
    return client;
  }

  if (cleanPath === '/api/v1/predict' && method === 'POST') {
    const clients = await readCollection(CLIENTS_KEY, DEFAULT_CLIENTS);
    const prediction = buildPrediction(body, clients);
    await writeCollection(CLIENTS_KEY, [...clients, prediction.client]);
    return prediction.response;
  }

  if (cleanPath === '/api/v1/admin/usuarios' && method === 'GET') return (await readDemoUsers()).map(publicUser);

  const roleMatch = cleanPath.match(/^\/api\/v1\/admin\/usuarios\/(\d+)\/role$/);
  if (roleMatch && method === 'PUT') {
    const users = await readDemoUsers();
    const updatedUsers = users.map((user) => user.id === Number(roleMatch[1]) ? { ...user, role: body.role } : user);
    await writeCollection(USERS_KEY, updatedUsers);
    const updated = updatedUsers.find((user) => user.id === Number(roleMatch[1]));
    if (!updated) throw demoError('Usuário não encontrado.', 404);
    return publicUser(updated);
  }

  const statusMatch = cleanPath.match(/^\/api\/v1\/admin\/usuarios\/(\d+)\/status$/);
  if (statusMatch && method === 'PUT') {
    const users = await readDemoUsers();
    const updatedUsers = users.map((user) => user.id === Number(statusMatch[1]) ? { ...user, ativo: Boolean(body.ativo) } : user);
    await writeCollection(USERS_KEY, updatedUsers);
    const updated = updatedUsers.find((user) => user.id === Number(statusMatch[1]));
    if (!updated) throw demoError('Usuário não encontrado.', 404);
    return publicUser(updated);
  }

  throw demoError('Recurso não disponível no modo demonstração.', 503);
}
