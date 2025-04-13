import Constants from 'expo-constants'

const OPENWEATHER_API_URL = 'https://api.openweathermap.org'
const OPENWEATHER_IMG_URL = 'https://openweathermap.org/img/wn'

const OPENWEATHER_API_KEY = Constants.expoConfig?.extra?.openWeatherApiKey

const STORAGE_KEY = 'cities_weather_data'

export { OPENWEATHER_API_URL, OPENWEATHER_API_KEY, STORAGE_KEY, OPENWEATHER_IMG_URL }
