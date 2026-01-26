import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@/services/user.api';

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  name: string | null;
  userName: string | null;
  profileImageUrl: string | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  userId: null,
  email: null,
  name: null,
  userName: null,
  profileImageUrl: null,
  userProfile: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setAuthData: (
      state,
      action: PayloadAction<{
        token: string;
        userId: string;
        email: string;
        name: string;
        userName?: string;
        profileImageUrl?: string;
      }>
    ) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.name = action.payload.name;
      if (action.payload.userName !== undefined) {
        state.userName = action.payload.userName;
      }
      if (action.payload.profileImageUrl !== undefined) {
        state.profileImageUrl = action.payload.profileImageUrl;
      }
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setProfileImage: (state, action: PayloadAction<string | null>) => {
      state.profileImageUrl = action.payload;
    },
    updateUserData: (
      state,
      action: PayloadAction<{
        name?: string;
        userName?: string;
        profileImageUrl?: string;
        phoneNumber?: string;
        WhatsappNumber?: string;
        cnicNumber?: string;
        Address?: string;
        livelocation?: string;
        lastIpAddress?: string;
      }>
    ) => {
      if (action.payload.name !== undefined) {
        state.name = action.payload.name;
      }
      if (action.payload.userName !== undefined) {
        state.userName = action.payload.userName;
      }
      if (action.payload.profileImageUrl !== undefined) {
        state.profileImageUrl = action.payload.profileImageUrl;
      }
      // Update userProfile if it exists
      if (state.userProfile) {
        if (action.payload.name !== undefined) {
          state.userProfile.name = action.payload.name;
        }
        if (action.payload.userName !== undefined) {
          state.userProfile.userName = action.payload.userName;
        }
        if (action.payload.profileImageUrl !== undefined) {
          state.userProfile.profilePic = action.payload.profileImageUrl;
        }
        if (action.payload.phoneNumber !== undefined) {
          state.userProfile.phoneNumber = action.payload.phoneNumber;
        }
        if (action.payload.WhatsappNumber !== undefined) {
          state.userProfile.WhatsappNumber = action.payload.WhatsappNumber;
        }
        if (action.payload.cnicNumber !== undefined) {
          state.userProfile.cnicNumber = action.payload.cnicNumber;
        }
        if (action.payload.Address !== undefined) {
          state.userProfile.Address = action.payload.Address;
        }
        if (action.payload.livelocation !== undefined) {
          state.userProfile.livelocation = action.payload.livelocation;
        }
        if (action.payload.lastIpAddress !== undefined) {
          state.userProfile.lastIpAddress = action.payload.lastIpAddress;
        }
      }
    },
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload;
      // Also update basic fields if available
      if (action.payload) {
        if (action.payload.name) state.name = action.payload.name;
        if (action.payload.email) state.email = action.payload.email;
        if (action.payload.userName) state.userName = action.payload.userName;
        if (action.payload.profilePic) state.profileImageUrl = action.payload.profilePic;
        if (action.payload.userId) state.userId = action.payload.userId;
      }
    },
    clearAuth: (state) => {
      state.token = null;
      state.userId = null;
      state.email = null;
      state.name = null;
      state.userName = null;
      state.profileImageUrl = null;
      state.userProfile = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setAuthData, setProfileImage, updateUserData, setUserProfile, clearAuth } =
  authSlice.actions;
export default authSlice.reducer;
