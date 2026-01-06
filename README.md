# BlockOff

## How to Run the Project

### Prerequisites
- Node.js (LTS version recommended)
- `npm` or `yarn`
- [Expo Go](https://expo.dev/go) app on your Android/iOS device (for development)
- Android Studio / Xcode (for building native apps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run on Various Platforms

#### Web (Browser)
Run the app in your default web browser:
```bash
npm run web
```
*Note: Some features like Bluetooth Low Energy (BLE) are simulated or disabled on the web.*

#### Android
**Using Expo Go (Fastest for testing JS changes):**
```bash
npx expo start --android
```

**Run Native Build (Requires Android Studio/Emulator):**
```bash
npm run android
```
*This command compiles the native Android code. First-time builds may take a few minutes.*

#### iOS
**Using Expo Go:**
```bash
npx expo start --ios
```

**Run Native Build (Requires Xcode/macOS):**
```bash
npm run ios
```

### 3. Build for Production/Preview (EAS)

To build a standalone APK/AAB or IPA using EAS Build:
```bash
# Android Preview Build
eas build -p android --profile preview

# Production Build
eas build -p android --profile production
```

### Troubleshooting
- **BLE Errors**: If you encounter BLE errors on Web or Expo Go, don't worry. The app gracefully handles missing native modules. Full BLE functionality requires a native build (`npm run android` / `npm run ios`).
- **Build Failures**: Ensure you have clean Gradle caches. You can run `cd android && ./gradlew clean` to reset.
