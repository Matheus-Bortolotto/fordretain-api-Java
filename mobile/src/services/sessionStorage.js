import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
const memory = new Map();
let cleanup;
async function clearLegacy() {
  cleanup ??= AsyncStorage.multiRemove(['fordretain_token', 'fordretain_user']);
  await cleanup;
}
export async function readSession(key) {
  await clearLegacy();
  return Platform.OS === 'web' ? memory.get(key) ?? null : SecureStore.getItemAsync(key);
}
export async function writeSession(key, value) {
  await clearLegacy();
  if (Platform.OS === 'web') memory.set(key, value);
  else await SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}
export async function removeSession(key) {
  await clearLegacy();
  memory.delete(key);
  if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(key);
}
