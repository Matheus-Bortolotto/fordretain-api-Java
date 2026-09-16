import { StyleSheet } from 'react-native';
import colors from '../colors';

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: colors.background, gap: 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 18 },
  loadingText: { marginTop: 10, color: colors.textGray, fontWeight: '600', textAlign: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: colors.navy },
  subtitle: { color: colors.textGray },
  card: { backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 },
  decisionCard: { backgroundColor: colors.navy, borderRadius: 18, padding: 16, gap: 12 },
  decisionHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  decisionLabel: { color: '#9CC5FF', fontWeight: '900', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  decisionTitle: { color: colors.white, fontWeight: '900', fontSize: 18, lineHeight: 24, marginTop: 4 },
  decisionText: { color: '#DCEBFF', fontWeight: '700', lineHeight: 20 },
  riskBadge: { backgroundColor: colors.riskRed, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 72 },
  riskValue: { color: colors.white, fontWeight: '900', fontSize: 18 },
  riskLabel: { color: colors.white, fontWeight: '800', fontSize: 11, marginTop: 1 },
  actionRow: { gap: 8 },
  actionButton: { flex: 1 },
  noteCard: { backgroundColor: colors.lightBlue, borderRadius: 14, borderWidth: 1, borderColor: '#BFDBFE', padding: 14, gap: 8 },
  sectionTitle: { color: colors.fordBlue, fontWeight: '800', marginBottom: 2 },
  row: { color: '#1E293B', lineHeight: 20 },
  label: { fontWeight: '800', color: colors.navy },
});

export default styles;
