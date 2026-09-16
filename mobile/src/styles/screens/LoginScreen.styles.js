import { StyleSheet } from 'react-native';
import colors from '../colors';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy, justifyContent: 'center', alignItems: 'center', padding: 18 },
  card: { width: '100%', maxWidth: 540, backgroundColor: colors.white, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', shadowColor: colors.shadow, shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 7 },
  title: { fontSize: 30, fontWeight: '900', color: colors.navy, marginTop: 18, marginBottom: 6, textAlign: 'center' },
  subtitle: { color: colors.textGray, marginBottom: 18, lineHeight: 21, textAlign: 'center', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, marginBottom: 10, color: colors.navy, backgroundColor: colors.surfaceSoft },
  registerPrompt: { color: colors.textGray, marginTop: 10, marginBottom: 2, textAlign: 'center', fontWeight: '800' },
});

export default styles;
