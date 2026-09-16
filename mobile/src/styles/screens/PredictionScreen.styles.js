import { StyleSheet } from 'react-native';
import colors from '../colors';

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.background, flexGrow: 1, gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.navy },
  subtitle: { color: colors.textGray },
  warningBox: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D', borderWidth: 1, borderRadius: 12, padding: 12 },
  warningTitle: { color: colors.navy, fontWeight: '800', marginBottom: 4 },
  warningText: { color: '#334155', lineHeight: 20 },
  formCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, gap: 14 },
  fieldGroup: { gap: 8 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, color: colors.navy },
  optionGroup: { borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.surfaceSoft, borderRadius: 14, padding: 12, gap: 8 },
  optionLabel: { color: colors.navy, fontWeight: '900', fontSize: 14 },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  optionChipActive: { backgroundColor: colors.fordBlue, borderColor: colors.fordBlue },
  optionText: { color: colors.fordBlue, fontWeight: '800', fontSize: 12 },
  optionTextActive: { color: colors.white },
  loadingBox: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center' },
  loadingText: { color: colors.textGray, marginTop: 8, fontWeight: '600' },
  resultCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6 },
  resultTitle: { fontWeight: '800', color: colors.fordBlue },
  row: { color: '#1E293B', lineHeight: 20 },
  label: { fontWeight: '800', color: colors.navy },
  criteriaBox: { marginTop: 8, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: 12, padding: 12, gap: 6 },
  criteriaTitle: { color: colors.navy, fontWeight: '900', marginBottom: 2 },
  criteriaItem: { color: '#334155', lineHeight: 19, fontSize: 13, fontWeight: '600' },
  errorCard: { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, borderRadius: 12, padding: 12 },
  errorTitle: { color: colors.riskRed, fontWeight: '900', marginBottom: 4 },
  errorText: { color: '#7F1D1D', lineHeight: 20, fontWeight: '600' },
});

export default styles;
