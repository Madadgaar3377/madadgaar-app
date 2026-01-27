import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserProfile, updateUserProfile } from '@/store/auth/authActions';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { AuthRequired } from '@/components/auth/AuthRequired';
import { LazyImage } from '@/components/common/LazyImage';

export default function PersonalInformationScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userProfile, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    email: '',
    phoneNumber: '',
    WhatsappNumber: '',
    cnicNumber: '',
    Address: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        userName: userProfile.userName || '',
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || '',
        WhatsappNumber: userProfile.WhatsappNumber || '',
        cnicNumber: userProfile.cnicNumber || '',
        Address: userProfile.Address || '',
      });
    }
  }, [userProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchUserProfile());
    setRefreshing(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        userName: userProfile.userName || '',
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || '',
        WhatsappNumber: userProfile.WhatsappNumber || '',
        cnicNumber: userProfile.cnicNumber || '',
        Address: userProfile.Address || '',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Name is required' });
      return;
    }

    setSaving(true);
    const result = await dispatch(
      updateUserProfile({
        name: formData.name.trim(),
        userName: formData.userName.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim() || undefined,
        WhatsappNumber: formData.WhatsappNumber.trim() || undefined,
        cnicNumber: formData.cnicNumber.trim() || undefined,
        Address: formData.Address.trim() || undefined,
      })
    );
    setSaving(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully',
      });
      setEditing(false);
      await dispatch(fetchUserProfile());
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.message || 'Failed to update profile',
      });
    }
  };

  const getInitials = () => {
    const fullName = userProfile?.name || '';
    if (fullName) {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return fullName[0].toUpperCase();
    }
    return 'U';
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AuthRequired
          title="Access Your Information"
          message="Login to view and manage your personal information"
          redirectPath="/personal-information"
        />
      </SafeAreaView>
    );
  }

  if (loading && !userProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderField = (
    label: string,
    value: string,
    fieldKey: keyof typeof formData,
    placeholder?: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' = 'default',
    multiline: boolean = false,
    icon?: string
  ) => {
    const isEmpty = !value || value.trim() === '';
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldLabelRow}>
          {icon && <Ionicons name={icon as any} size={16} color="#666" style={styles.fieldIcon} />}
          <Text style={styles.fieldLabel}>{label}</Text>
        </View>
        {editing ? (
          <TextInput
            style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
            value={formData[fieldKey]}
            onChangeText={(text) => setFormData({ ...formData, [fieldKey]: text })}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            placeholderTextColor="#999"
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            editable={fieldKey !== 'email'} // Email is read-only
          />
        ) : (
          <View style={styles.fieldValueContainer}>
            <Text style={[styles.fieldValue, isEmpty && styles.fieldValueEmpty]}>
              {value || 'Not provided'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={styles.headerRight}>
          {!editing ? (
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Ionicons name="create-outline" size={22} color={colors.accent} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerRight} />
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          {userProfile?.profilePic ? (
            <LazyImage
              source={{ uri: userProfile.profilePic }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageInitials}>{getInitials()}</Text>
            </View>
          )}
          <Text style={styles.profileName}>{userProfile?.name || 'User'}</Text>
          {userProfile?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified Account</Text>
            </View>
          )}
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          {renderField('Full Name', formData.name, 'name', 'Enter your full name', 'default', false, 'person-outline')}
          {renderField('Username', formData.userName, 'userName', 'Enter your username', 'default', false, 'at-outline')}
          {renderField('Email', formData.email, 'email', 'Enter your email', 'email-address', false, 'mail-outline')}
          {renderField('Phone Number', formData.phoneNumber, 'phoneNumber', 'Enter your phone number', 'phone-pad', false, 'call-outline')}
          {renderField('WhatsApp Number', formData.WhatsappNumber, 'WhatsappNumber', 'Enter your WhatsApp number', 'phone-pad', false, 'logo-whatsapp')}
          {renderField('CNIC Number', formData.cnicNumber, 'cnicNumber', 'Enter your CNIC number', 'numeric', false, 'card-outline')}
          {renderField('Address', formData.Address, 'Address', 'Enter your address', 'default', true, 'location-outline')}
        </View>

        {/* Account Information Section */}
        {userProfile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>User ID</Text>
              <View style={styles.fieldValueContainer}>
                <Text style={styles.fieldValue}>{userProfile.userId || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Account Type</Text>
              <View style={styles.fieldValueContainer}>
                <Text style={styles.fieldValue}>
                  {userProfile.UserType ? userProfile.UserType.charAt(0).toUpperCase() + userProfile.UserType.slice(1) : 'User'}
                </Text>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Account Status</Text>
              <View style={styles.fieldValueContainer}>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      userProfile.isVerified ? styles.statusBadgeVerified : styles.statusBadgeUnverified,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        userProfile.isVerified ? styles.statusTextVerified : styles.statusTextUnverified,
                      ]}
                    >
                      {userProfile.isVerified ? 'Verified' : 'Unverified'}
                    </Text>
                  </View>
                  {userProfile.isActive !== undefined && (
                    <View
                      style={[
                        styles.statusBadge,
                        userProfile.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          userProfile.isActive ? styles.statusTextActive : styles.statusTextInactive,
                        ]}
                      >
                        {userProfile.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>


            {userProfile.createdAt && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Member Since</Text>
                <View style={styles.fieldValueContainer}>
                  <Text style={styles.fieldValue}>
                    {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {editing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!editing && (
          <View style={styles.footerSection}>
            <TouchableOpacity
              style={[styles.button, styles.editButtonFull]}
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit Information</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#666',
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.accent,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.accent,
  },
  profileImageInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: spacing.md,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  fieldInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  fieldValueContainer: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  fieldValueEmpty: {
    color: '#999',
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeVerified: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeUnverified: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeActive: {
    backgroundColor: '#DBEAFE',
  },
  statusBadgeInactive: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextVerified: {
    color: '#065F46',
  },
  statusTextUnverified: {
    color: '#991B1B',
  },
  statusTextActive: {
    color: '#1E40AF',
  },
  statusTextInactive: {
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  editButtonFull: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  footerSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
});
