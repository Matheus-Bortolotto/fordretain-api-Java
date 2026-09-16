import { StyleSheet, Text, View } from 'react-native';
import colors from '../styles/colors';

export default function AppLogo({ small = false }) {
  return (
    <View style={[styles.logo, small && styles.logoSmall]}>
      <Text style={[styles.text, small && styles.textSmall]}>FordRetain</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: 'center',
    minWidth: 230,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: '#07106B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  logoSmall: {
    minWidth: 170,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderWidth: 2,
  },
  text: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  textSmall: {
    fontSize: 21,
  },
});
