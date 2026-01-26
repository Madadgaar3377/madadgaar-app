import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { colors, typography } from '@/theme';

export function AppToast() {
  return (
    <Toast
      position="top"
      visibilityTime={2500}
      config={{
        success: ({ text1, text2 }) => (
          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <View style={styles.textContainer}>
              {text1 && <Text style={styles.title}>{text1}</Text>}
              {text2 && <Text style={styles.message}>{text2}</Text>}
            </View>
          </View>
        ),
        error: ({ text1, text2 }) => (
          <View style={styles.errorContainer}>
            <View style={[styles.iconContainer, styles.errorIconBg]}>
              <Text style={styles.errorIcon}>✕</Text>
            </View>
            <View style={styles.textContainer}>
              {text1 && <Text style={styles.title}>{text1}</Text>}
              {text2 && <Text style={styles.message}>{text2}</Text>}
            </View>
          </View>
        ),
        info: ({ text1, text2 }) => (
          <View style={styles.infoContainer}>
            <View style={[styles.iconContainer, styles.infoIconBg]}>
              <Text style={styles.infoIcon}>ℹ</Text>
            </View>
            <View style={styles.textContainer}>
              {text1 && <Text style={styles.title}>{text1}</Text>}
              {text2 && <Text style={styles.message}>{text2}</Text>}
            </View>
          </View>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  successContainer: {
    height: 70,
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  errorContainer: {
    height: 70,
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoContainer: {
    height: 70,
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  errorIconBg: {
    backgroundColor: colors.error + '15',
  },
  infoIconBg: {
    backgroundColor: colors.info + '15',
  },
  successIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
  },
  errorIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
  },
  infoIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.info,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

