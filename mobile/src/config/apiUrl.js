const url = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080').replace(/\/$/, '');
export function getApiUrl() {
  if (!__DEV__ && !url.startsWith('https://')) throw new Error('A versão de produção exige API HTTPS.');
  return url;
}
