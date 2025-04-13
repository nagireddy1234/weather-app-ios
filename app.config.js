import 'dotenv/config'

export default {
  expo: {
    name: 'Weather Finder',
    owner: 'nagireddy1234',
    description: 'A simple weather app that uses OpenWeather API to fetch current weather data.',
    slug: 'weather-finder',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    sdkVersion: '52.0.0',
    platforms: ['ios', 'android', 'web'],
    extra: {
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
      eas: {
        projectId: 'ac5ccefb-6350-4ec9-84bd-6038cee08509',
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.nagireddy.weatherfinder',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#fff',
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
      backgroundColor: '#fff',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#fff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
}
