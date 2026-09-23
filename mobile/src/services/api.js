import {
  getDashboard,
  getDashboardContract,
  getDashboardInsights,
  getVinShareByModel,
} from './dashboardService';
import {
  getLeads,
  getClientById,
  getPriorityLeads,
  simulateCommercialAction,
} from './leadsService';
import { predictClientProfile, getPredictionVariables } from './predictionService';
import { getRetentionStrategies } from './retentionService';
import { apiRequest } from './httpClient';

export async function getUsers() { return apiRequest('/api/v1/admin/usuarios'); }
export async function updateUserRole(id, role) { return apiRequest(`/api/v1/admin/usuarios/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }); }
export async function updateUserStatus(id, ativo) { return apiRequest(`/api/v1/admin/usuarios/${id}/status`, { method: 'PUT', body: JSON.stringify({ ativo }) }); }

async function getApiHealth() {
  return apiRequest('/actuator/health');
}

export {
  getApiHealth,
  getDashboard,
  getDashboardContract,
  getDashboardInsights,
  getVinShareByModel,
  getLeads,
  getClientById,
  getPriorityLeads,
  simulateCommercialAction,
  predictClientProfile,
  getPredictionVariables,
  getRetentionStrategies,
};
