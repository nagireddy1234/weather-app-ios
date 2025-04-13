# Welcome to Weather Finder App

This is a IOS-style Weather Finder App project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

An iOS-style weather app built with **React Native** and **Expo**, offering real-time weather updates by city or current location. Inspired by the Apple Weather app.

---

## 🚀 Features

- 🌍 Get weather for **current location** using device GPS
- 🏙️ **Search & add cities** to a persistent saved list
- 📄 **7-day and hourly forecasts** using OpenWeather API
- 🌈 Dynamic **backgrounds based on weather**
- ✨ **Swipe to delete** cities
- 🌐 **Offline support** using AsyncStorage
- 🔍 City selector with autocomplete and flag icons
- 🔧 **EAS Build** & CI/CD ready

---

## 🧰 Tech Stack

| Tech | Purpose |
|------|---------|
| **React Native + Expo** | Cross-platform mobile development |
| **Expo Location** | Get user’s current position |
| **OpenWeather API** | Weather data |
| **AsyncStorage** | Persist city weather data |
| **React Navigation** | Bottom tab & stack navigation |
| **React Native Swipe List View** | Swipe-to-delete city cards |
| **LinearGradient (expo-linear-gradient)** | Background gradients |
| **EAS Build** | Cloud builds for iOS and Android |
| **Husky + lint-staged** | Pre-commit linting & formatting |
| **.env config** | Secure API key handling

---

## 🧪 How to Run & Test

1. Install dependencies

   ```bash
   npm install
   ```

2. Create .env

       OPENWEATHER_API_KEY=your_api_key_here

3. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a
- [Expo Go](https://expo.dev/go)

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)


## 🧪 How to Build for Production

 1. iOS .ipa

   ```bash
      eas build --platform ios --profile preview
   ```

 2. Android .apk

   ```bash
      eas build --platform android --profile preview
   ```