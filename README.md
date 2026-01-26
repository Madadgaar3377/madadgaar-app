# Madadgaar

A modern React Native mobile application built with Expo, TypeScript, and Redux Toolkit.

## Features

- 🔐 Authentication (Login, Signup, OTP Verification)
- 🎨 Modern UI with Red + White theme
- 📱 Bottom tab navigation
- 🎭 Premium animated loader
- 🔔 Toast notifications
- 💾 Secure token storage
- 🎯 TypeScript for type safety
- 🏗️ Clean, scalable architecture

## Tech Stack

- **Framework**: Expo ~54.0.29
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Redux Toolkit
- **API**: Axios
- **Storage**: Expo SecureStore (tokens), AsyncStorage (user data)
- **Animations**: React Native Reanimated
- **UI Components**: Custom components with React Native SVG

## Project Structure

```
madadgaar/
├── app/                 # Expo Router screens
│   ├── (auth)/         # Authentication screens
│   ├── (tabs)/         # Main app tabs
│   └── index.tsx       # Entry point with loader
├── components/          # Reusable components
│   ├── common/         # Common components (Button, Input, Loader, Toast)
│   ├── icons/          # Custom SVG icons
│   └── ui/             # UI components (Card)
├── services/           # API services
│   ├── api.ts          # Axios configuration
│   └── auth.api.ts     # Authentication API
├── store/              # Redux store
│   ├── auth/          # Auth slice and actions
│   ├── hooks.ts        # Typed hooks
│   └── store.ts        # Store configuration
├── theme/              # Theme configuration
│   ├── colors.ts       # Color palette (Red + White)
│   ├── typography.ts   # Typography styles
│   └── spacing.ts      # Spacing system
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator or Expo Go app

### Installation

1. Clone the repository:
```bash
git clone https://github.com/devshahzaibali/Madadgaar.git
cd Madadgaar
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web
- Scan QR code with Expo Go app

## Authentication Flow

1. **Signup**: Create account → Auto-login → Navigate to app
2. **Login**: Enter credentials → Validate account status → Navigate to app
3. **Token Storage**: JWT token stored securely in Expo SecureStore
4. **User Data**: Stored in AsyncStorage with clear key names

## API Configuration

- **Base URL**: `https://api.madadgaar.com.pk/api`
- **Authentication**: Bearer token (automatically attached via Axios interceptor)
- **Token Storage**: Expo SecureStore (encrypted)

## Storage Rules

### SecureStore (Encrypted)
- `authToken` - JWT token only

### AsyncStorage (User Data)
- `userMongoId` - MongoDB _id
- `userId` - User ID string
- `userEmail` - User email
- `userName` - User name

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on Web

## License

Private project

## Author

Shahzaib Ali

