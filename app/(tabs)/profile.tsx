import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  logout,
  uploadProfileImage,
  updateUserProfile,
  fetchUserProfile,
} from '@/store/auth/authActions';
import { updatePassword } from '@/services/user.api';
import { colors, spacing, theme } from '@/theme';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { LazyImage } from '@/components/common/LazyImage';
import { AuthRequired } from '@/components/auth/AuthRequired';
import { ProfileSkeleton } from '@/components/common/SkeletonLoader';
import { BottomSheet } from '@/components/common/BottomSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { email, name, userName, profileImageUrl, userProfile, isAuthenticated, loading } =
    useAppSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imageActionSheetVisible, setImageActionSheetVisible] = useState(false);
  const [imageEditSheetVisible, setImageEditSheetVisible] = useState(false);
  const [editName, setEditName] = useState(name || '');
  const [editUserName, setEditUserName] = useState(userName || '');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editWhatsappNumber, setEditWhatsappNumber] = useState('');
  const [editCnicNumber, setEditCnicNumber] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!editing && !saving) {
      const timer = setTimeout(() => {
        dispatch(fetchUserProfile());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [editing, saving]);

  useEffect(() => {
    setEditName(name || userProfile?.name || '');
    setEditUserName(userName || userProfile?.userName || '');
    setEditPhoneNumber(userProfile?.phoneNumber || '');
    setEditWhatsappNumber(userProfile?.WhatsappNumber || '');
    setEditCnicNumber(userProfile?.cnicNumber || '');
    setEditAddress(userProfile?.Address || '');
  }, [userProfile, name, userName]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchUserProfile());
    setRefreshing(false);
  };

  const requestImagePickerPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }
    return true;
  };

  const handlePickImageFromGallery = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Please grant photo library access to upload profile picture',
      });
      return;
    }

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets[0]) {
        setUploading(true);
        const uploadResult = await dispatch(uploadProfileImage(pickerResult.assets[0].uri));
        setUploading(false);
        if (uploadResult && uploadResult.success) {
          await dispatch(fetchUserProfile());
        }
      }
    } catch (error: any) {
      setUploading(false);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error.message || 'Failed to pick image. Please try again.',
      });
    }
  };

  const handlePickImageFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Please grant camera access to take a photo',
      });
      return;
    }

    try {
      const pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets[0]) {
        setUploading(true);
        const uploadResult = await dispatch(uploadProfileImage(pickerResult.assets[0].uri));
        setUploading(false);
        if (uploadResult && uploadResult.success) {
          await dispatch(fetchUserProfile());
        }
      }
    } catch (error: any) {
      setUploading(false);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error.message || 'Failed to take photo. Please try again.',
      });
    }
  };

  const handleProfileImagePress = () => {
    // Show bottom sheet with View and Edit options
    setImageActionSheetVisible(true);
  };

  const handleEdit = () => {
    setEditName(name || userProfile?.name || '');
    setEditUserName(userName || userProfile?.userName || '');
    setEditPhoneNumber(userProfile?.phoneNumber || '');
    setEditWhatsappNumber(userProfile?.WhatsappNumber || '');
    setEditCnicNumber(userProfile?.cnicNumber || '');
    setEditAddress(userProfile?.Address || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Name is required' });
      return;
    }

    setSaving(true);
    const result = await dispatch(
      updateUserProfile({
        name: editName.trim(),
        userName: editUserName.trim() || undefined,
        phoneNumber: editPhoneNumber.trim() || undefined,
        WhatsappNumber: editWhatsappNumber.trim() || undefined,
        cnicNumber: editCnicNumber.trim() || undefined,
        Address: editAddress.trim() || undefined,
      })
    );
    setSaving(false);

    if (result.success) {
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditName(userProfile?.name || name || '');
    setEditUserName(userProfile?.userName || userName || '');
    setEditPhoneNumber(userProfile?.phoneNumber || '');
    setEditWhatsappNumber(userProfile?.WhatsappNumber || '');
    setEditCnicNumber(userProfile?.cnicNumber || '');
    setEditAddress(userProfile?.Address || '');
  };

  const getInitials = () => {
    const fullName = name || userProfile?.name || '';
    if (fullName) {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return fullName[0].toUpperCase();
    }
    return 'U';
  };

  const displayName = name || userProfile?.name || 'User';
  const displayUserName = userName || userProfile?.userName || '';
  const currentProfileImage = profileImageUrl || userProfile?.profilePic || null;

  // Show auth required screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AuthRequired
          title="Access Your Profile"
          message="Login or signup to view and manage your personal information"
          redirectPath="/(tabs)/profile"
        />
      </SafeAreaView>
    );
  }

  // Show skeleton while loading (only on initial load)
  if (loading && !userProfile && !name) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Profile Header - Large Avatar */}
          <View style={styles.profileHeader}>
            <TouchableOpacity
              onPress={handleProfileImagePress}
              disabled={uploading}
              activeOpacity={0.8}
              style={styles.avatarContainer}
            >
              <View style={styles.avatarWrapper}>
                {currentProfileImage ? (
                  <LazyImage
                    source={{ uri: currentProfileImage }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{getInitials()}</Text>
                  </View>
                )}
                {uploading && (
                  <View style={styles.uploadOverlay}>
                    <Animated.View style={{ opacity: fadeAnim }}>
                      <Ionicons name="cloud-upload-outline" size={32} color={colors.white} />
                    </Animated.View>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.nameContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{displayName}</Text>
                {userProfile?.isVerified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#10B981"
                    style={styles.verifiedIcon}
                  />
                )}
              </View>
              {displayUserName ? (
                <Text style={styles.displayUsername}>@{displayUserName}</Text>
              ) : null}
            </View>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>

            <View style={styles.menuGroup}>
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="person-outline" size={22} color={colors.accent} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Personal Information</Text>
                  <Text style={styles.menuDesc}>Update your details</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/(tabs)/dashboard' as any)}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="grid-outline" size={22} color={colors.accent} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Dashboard</Text>
                  <Text style={styles.menuDesc}>View all applications</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/(tabs)/dashboard' as any)}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="card-outline" size={22} color={colors.accent} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>My Installments</Text>
                  <Text style={styles.menuDesc}>View payment plans</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/(tabs)/loans' as any)}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="wallet-outline" size={22} color={colors.accent} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Apply Loan</Text>
                  <Text style={styles.menuDesc}>Apply for a loan</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>

            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>SUPPORT</Text>

            <View style={styles.menuGroup}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/help-center' as any)}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="help-circle-outline" size={22} color={colors.accent} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>Help Center</Text>
                  <Text style={styles.menuDesc}>FAQs and support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={async () => await dispatch(logout())}>
                <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                  <Ionicons name="log-out-outline" size={22} color={colors.error} />
                </View>
                <View style={styles.menuText}>
                  <Text style={[styles.menuLabel, styles.logoutLabel]}>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animated.View>
      </ScrollView>

      {/* Profile Image Action Bottom Sheet */}
      <BottomSheet
        visible={imageActionSheetVisible}
        onClose={() => setImageActionSheetVisible(false)}
        title="Profile Image"
        options={[
          {
            label: 'View Profile Image',
            icon: 'eye-outline',
            onPress: () => {
              setImageActionSheetVisible(false);
              setTimeout(() => setImagePreviewVisible(true), 300);
            },
          },
          {
            label: 'Edit Profile Image',
            icon: 'create-outline',
            onPress: () => {
              setImageActionSheetVisible(false);
              setTimeout(() => setImageEditSheetVisible(true), 300);
            },
          },
        ]}
      />

      {/* Edit Profile Image Bottom Sheet */}
      <BottomSheet
        visible={imageEditSheetVisible}
        onClose={() => setImageEditSheetVisible(false)}
        title="Edit Profile Image"
        options={[
          {
            label: 'Choose from Gallery',
            icon: 'images-outline',
            onPress: async () => {
              setImageEditSheetVisible(false);
              // Small delay to allow bottom sheet to close smoothly
              await new Promise(resolve => setTimeout(resolve, 300));
              handlePickImageFromGallery();
            },
          },
          {
            label: 'Take Photo',
            icon: 'camera-outline',
            onPress: async () => {
              setImageEditSheetVisible(false);
              // Small delay to allow bottom sheet to close smoothly
              await new Promise(resolve => setTimeout(resolve, 300));
              handlePickImageFromCamera();
            },
          },
        ]}
      />

      {/* Image Preview Modal */}
      <Modal
        visible={imagePreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImagePreviewVisible(false)}
      >
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity
            style={styles.imagePreviewClose}
            onPress={() => setImagePreviewVisible(false)}
          >
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>
          {currentProfileImage && (
            <Image
              source={{ uri: currentProfileImage }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editing}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.textInput}
                  value={editUserName}
                  onChangeText={setEditUserName}
                  placeholder="Username"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={editPhoneNumber}
                  onChangeText={setEditPhoneNumber}
                  placeholder="03XX XXXXXXX"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>WhatsApp</Text>
                <TextInput
                  style={styles.textInput}
                  value={editWhatsappNumber}
                  onChangeText={setEditWhatsappNumber}
                  placeholder="03XX XXXXXXX"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>CNIC</Text>
                <TextInput
                  style={styles.textInput}
                  value={editCnicNumber}
                  onChangeText={setEditCnicNumber}
                  placeholder="XXXXX-XXXXXXX-X"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Full address"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, (!editName.trim() || saving) && styles.disabledBtn]}
                  onPress={handleSave}
                  disabled={saving || !editName.trim()}
                >
                  <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => {
                  setPasswordModalVisible(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showOldPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                  <Text style={styles.errorText}>Passwords do not match</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setPasswordModalVisible(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    (updatingPassword ||
                      !oldPassword.trim() ||
                      !newPassword.trim() ||
                      !confirmPassword.trim() ||
                      newPassword !== confirmPassword) &&
                      styles.disabledBtn,
                  ]}
                  onPress={async () => {
                    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Please fill all fields',
                        position: 'top',
                        visibilityTime: 2500,
                      });
                      return;
                    }

                    if (newPassword !== confirmPassword) {
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Passwords do not match',
                        position: 'top',
                        visibilityTime: 2500,
                      });
                      return;
                    }

                    if (newPassword.length < 6) {
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Password must be at least 6 characters',
                        position: 'top',
                        visibilityTime: 2500,
                      });
                      return;
                    }

                    try {
                      setUpdatingPassword(true);
                      const response = await updatePassword({
                        password: oldPassword,
                        newPassword: newPassword,
                      });

                      if (response.success) {
                        Toast.show({
                          type: 'success',
                          text1: 'Success',
                          text2: 'Password updated successfully',
                          position: 'top',
                          visibilityTime: 2500,
                        });
                        setPasswordModalVisible(false);
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      } else {
                        throw new Error(response.message || 'Failed to update password');
                      }
                    } catch (error: any) {
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: error.message || 'Failed to update password',
                        position: 'top',
                        visibilityTime: 2500,
                      });
                    } finally {
                      setUpdatingPassword(false);
                    }
                  }}
                  disabled={
                    updatingPassword ||
                    !oldPassword.trim() ||
                    !newPassword.trim() ||
                    !confirmPassword.trim() ||
                    newPassword !== confirmPassword
                  }
                >
                  <Text style={styles.saveBtnText}>
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Space for floating nav bar
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    borderWidth: 3,
    borderColor: colors.red50,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.white,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.accent,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  nameContainer: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  verifiedIcon: {
    marginLeft: spacing.xs,
  },
  displayUsername: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  menuSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  menuGroup: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.red50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  logoutIconContainer: {
    backgroundColor: colors.error + '15',
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  logoutLabel: {
    color: colors.error,
  },
  menuDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginLeft: 68,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    minHeight: 52,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: spacing.sm,
  },
  imagePreview: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: spacing.md,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.sm + 2,
    minHeight: 48,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '15',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },
});
