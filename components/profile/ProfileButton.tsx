import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, theme } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const WHITE = '#FFFFFF';

interface ProfileButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary && styles.primaryButton,
        isOutline && styles.outlineButton,
        !fullWidth && styles.notFullWidth,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? WHITE : RED_PRIMARY} />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={20}
              color={isPrimary ? WHITE : RED_PRIMARY}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              isPrimary && styles.primaryText,
              isOutline && styles.outlineText,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  primaryButton: {
    backgroundColor: RED_PRIMARY,
  },
  outlineButton: {
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: RED_PRIMARY,
  },
  notFullWidth: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    ...typography.body,
    fontSize: 18,
    fontWeight: '700',
  },
  primaryText: {
    color: WHITE,
  },
  outlineText: {
    color: RED_PRIMARY,
  },
});

