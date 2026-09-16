import { getFirebaseIdToken } from './authService';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, options = {}, retry = true) {
  const token = await getFirebaseIdToken(!retry);
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch (error) {
    throw new ApiError('Não foi possível conectar à API FordRetain.', 0, error?.message);
  }

  if (response.status === 401 && retry) {
    return apiRequest(path, options, false);
  }

  const body = await parseResponse(response);

  if (!response.ok) {
    const message = body?.mensagem || body?.message || body?.erro || `A API respondeu com status ${response.status}.`;
    throw new ApiError(message, response.status, body);
  }

  return body;
}
