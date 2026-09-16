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
