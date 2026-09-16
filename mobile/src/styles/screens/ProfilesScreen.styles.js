import { StyleSheet } from 'react-native';
import colors from '../colors';

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 2, color: colors.navy },
  subtitle: { color: colors.textGray, marginBottom: 10 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border, gap: 7 },
  explanationCard: { backgroundColor: colors.lightBlue, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#BFDBFE', gap: 7 },
  sectionTitle: { color: colors.navy, fontWeight: '800', marginBottom: 4 },
  row: { color: '#1E293B', lineHeight: 20 },
  label: { fontWeight: '800', color: colors.navy },
});

export default styles;
