import { StyleSheet } from 'react-native';
import colors from '../colors';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 18 },
  loadingText: { marginTop: 10, color: colors.textGray, fontWeight: '600', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: colors.navy },
  subtitle: { color: colors.textGray, marginBottom: 10 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  summaryCard: { flexBasis: '48%', flexGrow: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12 },
  summaryHigh: { backgroundColor: colors.riskRedSoft, borderColor: '#FFC9CE' },
  summaryMedium: { backgroundColor: colors.warningSoft, borderColor: '#FDE1A8' },
  summaryLow: { backgroundColor: colors.successSoft, borderColor: '#BBF7D0' },
  summaryValue: { color: colors.navy, fontWeight: '900', fontSize: 22 },
  summaryLabel: { color: colors.textGray, fontWeight: '800', fontSize: 12, marginTop: 2 },
  filterPanel: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, marginBottom: 10, gap: 10 },
  filterTitle: { color: colors.navy, fontWeight: '900', fontSize: 15 },
  filterSubtitle: { color: colors.textGray, fontWeight: '700', fontSize: 12, marginTop: 2 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  filterChipActive: { backgroundColor: colors.fordBlue, borderColor: colors.fordBlue },
  filterText: { color: colors.fordBlue, fontWeight: '900', fontSize: 12 },
  filterTextActive: { color: colors.white },
  listContent: { paddingBottom: 14 },
  separator: { height: 10 },
  empty: { textAlign: 'center', color: colors.textGray, marginTop: 20, fontWeight: '600' },
  error: { color: colors.riskRed, fontWeight: '700', marginBottom: 8 },
});

export default styles;
