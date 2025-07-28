# 🏀 BallUp - Complete Development Setup Guide

## Current Status
Your BallUp app has:
✅ **Backend API** - Running on port 3000
✅ **React Native Frontend** - UI components and screens
✅ **Web Demo** - Fully functional web version
❌ **Mobile App** - Needs React Native environment setup

## 🚀 Quick Start Options

### Option 1: Test Web Version (Immediate)
The fastest way to test your complete app:

```bash
# Start backend (if not running)
cd backend && npm start

# Open web demo in browser
open web-demo/index.html
# OR serve it properly:
npx serve web-demo
```

Your web demo is fully functional with:
- User authentication
- Game search and creation
- Location management  
- Profile management
- Real backend API integration

### Option 2: React Native Development (Recommended)

#### Step 1: Install React Native Environment

**For macOS (Android + iOS):**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (if not installed)
brew install node watchman

# Install Java Development Kit
brew install --cask zulu@17

# Android Studio
brew install --cask android-studio
```

**Configure Android Studio:**
1. Open Android Studio
2. Go to Preferences → Appearance & Behavior → System Settings → Android SDK
3. Install Android SDK Platform 34
4. Install Android SDK Build-Tools 34.0.0
5. Create Android Virtual Device (AVD)

#### Step 2: Create Proper React Native Project

```bash
# Navigate to BallUp directory
cd /Users/vineelnadakuditi/Documents/BallUp

# Create new React Native project
npx react-native@latest init BallUpMobile --template react-native-template-typescript

# Copy your existing screens and components
cp -r frontend/src/* BallUpMobile/src/
```

#### Step 3: Set Up Dependencies

```bash
cd BallUpMobile

# Install navigation dependencies
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# For iOS
cd ios && pod install && cd ..

# Install additional dependencies
npm install axios react-native-vector-icons
```

#### Step 4: Test on Device/Emulator

```bash
# Start Metro bundler
npm start

# Run on Android (in new terminal)
npm run android

# Run on iOS (in new terminal)  
npm run ios
```

### Option 3: Expo Development (Easiest)

If React Native setup is too complex, use Expo:

```bash
# Install Expo CLI
npm install -g @expo/cli

# Create Expo project
npx create-expo-app BallUpExpo --template typescript

# Copy your components
cp -r frontend/src/* BallUpExpo/src/

# Start development
cd BallUpExpo
npx expo start
```

Scan QR code with Expo Go app on your phone to test immediately.

## 🔧 Current App Features

Your BallUp app already has:

### ✅ Backend API (Working)
- User authentication (register/login)
- Game CRUD operations
- Location management
- User profiles
- Database with Prisma ORM

### ✅ Frontend Screens (Complete)
- **LoginScreen** - User authentication with validation
- **RegisterScreen** - Account creation
- **HomeScreen** - Main dashboard with navigation
- **GameSearchScreen** - Find and join games
- **CreateGameScreen** - Organize new games
- **CreateLocationScreen** - Add basketball courts
- **ProfileScreen** - User profile management
- **MyGamesScreen** - View created/joined games

### ✅ Web Demo (Fully Functional)
- Complete user interface
- Real API integration
- All features working
- Professional styling

## 🏃‍♂️ Immediate Testing Steps

### 1. Test Backend API
```bash
cd backend && npm start

# Test endpoints
curl http://localhost:3000/health
```

### 2. Test Web Demo
```bash
# Open in browser
open web-demo/index.html

# Test complete user flow:
# 1. Register new account
# 2. Login
# 3. Create location
# 4. Create game
# 5. Search games
# 6. Update profile
```

### 3. Test React Native Components

If you want to test the React Native components without full environment setup:

```bash
# Use React Native Web
npm install react-native-web react-dom
npx webpack serve --mode development
```

## 🐛 Common Issues & Solutions

### Issue 1: Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Use legacy peer deps
npm install --legacy-peer-deps

# Or use yarn
npm install -g yarn
yarn install
```

### Issue 2: Android Emulator Not Starting
```bash
# Check if ANDROID_HOME is set
echo $ANDROID_HOME

# Set environment variables in ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Issue 3: iOS Build Failing
```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

## 📱 Next Steps

### Phase 1: Get Mobile App Running (Priority)
1. Choose React Native setup or Expo
2. Test on emulator/device
3. Connect to your backend API
4. Test all user flows

### Phase 2: Polish and Optimize
1. Add proper error handling
2. Implement loading states
3. Add offline support
4. Optimize performance

### Phase 3: Prepare for Production
1. Add app icons and splash screens
2. Configure build settings
3. Test on multiple devices
4. Prepare for app store submission

## 🎯 Recommended Path

**For immediate testing:** Use the web demo - it's fully functional!

**For mobile development:** 
1. Start with Expo (easier setup)
2. Test core functionality 
3. Migrate to React Native CLI if needed

**For production:** Focus on React Native CLI for better performance and customization.

## 🔗 Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Expo Documentation](https://docs.expo.dev/)
- [Android Studio Setup](https://developer.android.com/studio)
- [iOS Development Setup](https://developer.apple.com/xcode/)

Your BallUp app is very close to being complete! The backend and UI are ready - you just need the mobile environment set up. 🏀