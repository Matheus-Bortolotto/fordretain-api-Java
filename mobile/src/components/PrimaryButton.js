import { Pressable, StyleSheet, Text } from 'react-native';
import colors from '../styles/colors';

export default function PrimaryButton({ title, onPress, variant = 'primary', color, disabled = false }) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.secondaryButton : styles.primaryButton,
        color && !isSecondary && { backgroundColor: color, borderColor: color },
        color && isSecondary && { borderColor: color },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, isSecondary ? styles.secondaryText : styles.primaryText, color && isSecondary && { color }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    borderWidth: 1,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: colors.fordBlue,
    borderColor: colors.fordBlue,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  disabled: { opacity: 0.55 },
  text: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.fordBlue,
  },
});
