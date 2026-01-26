import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, theme } from '@/theme';

const RED_PRIMARY = '#D32F2F';

interface InfoCardProps {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
  showArrow?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  label,
  value,
  onPress,
  showArrow = false,
}) => {
  const content = (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={RED_PRIMARY} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value} numberOfLines={2}>
            {value}
          </Text>
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

