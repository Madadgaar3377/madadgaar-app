import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, typography } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const RED_ACCENT = '#FFCDD2';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label = 'Profile Completeness',
  showPercentage = true,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{percentage}%</Text>
          )}
        </View>
      )}
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.bar,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  percentage: {
    ...typography.body,
    fontWeight: '600',
    color: RED_PRIMARY,
    fontSize: 14,
  },
  barContainer: {
    height: 8,
    backgroundColor: RED_ACCENT,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: RED_PRIMARY,
    borderRadius: 4,
  },
});

