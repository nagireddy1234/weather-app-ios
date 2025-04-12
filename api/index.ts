import ClearSky from '@/assets/weather/clearsky.jpg'
import Clouds from '@/assets/weather/clouds.jpg'
import Rain from '@/assets/weather/rain.png'
import Snow from '@/assets/weather/snow.jpg'
import Haze from '@/assets/weather/haze.png'
import Drizzle from '@/assets/weather/drizzle.jpg'
import FewClouds from '@/assets/weather/fewclouds.jpg'
import { OPENWEATHER_API_KEY, OPENWEATHER_API_URL, OPENWEATHER_IMG_URL } from '@/constants/api'

export interface Coordinates {
  lat: number
  lon: number
}

export interface WeatherData {
  location: string
  temp: number
  feels_like: number
  description: string
  icon: string
  forecast: ForecastEntry[]
}

export interface ForecastEntry {
  dt_txt: string
  main: {
    temp: number
  }
  weather: { icon: string; description: string }[]
}

export async function getCityCoordinates(city: string): Promise<Coordinates> {
  try {
    if (!city.trim()) throw new Error('City name cannot be empty.')

    const res = await fetch(
      `${OPENWEATHER_API_URL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
    )

    if (!res.ok) throw new Error(`Failed to fetch coordinates for city: ${city}`)

    const json = await res.json()
    if (!json.length) throw new Error(`City not found: ${city}`)

    return { lat: json[0].lat, lon: json[0].lon }
  } catch (error: unknown) {
    console.error('Error in getCityCoordinates:', error instanceof Error ? error.message : error)
    throw new Error('Unable to fetch city coordinates. Please try again.')
  }
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      throw new Error('Invalid coordinates provided.')
    }

    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `${OPENWEATHER_API_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      ),
      fetch(
        `${OPENWEATHER_API_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      ),
    ])

    if (!currentRes.ok) throw new Error('Failed to fetch current weather data.')
    if (!forecastRes.ok) throw new Error('Failed to fetch forecast data.')

    const current = await currentRes.json()
    const forecast = await forecastRes.json()

    return {
      location: current?.name || 'Unknown Location',
      temp: Math.round(current.main.temp),
      feels_like: Math.round(current.main.feels_like),
      description: current.weather[0]?.description || 'No description available',
      icon: `${OPENWEATHER_IMG_URL}/${current.weather[0]?.icon || '01d'}@2x.png`,
      forecast: forecast.list.slice(0, 8),
    }
  } catch (error) {
    console.error('Error in getCityCoordinates:', error instanceof Error ? error.message : error)
    throw new Error('Unable to fetch weather data. Please try again.')
  }
}

export function groupForecastByDay(forecast: ForecastEntry[]) {
  try {
    if (!forecast || !forecast.length) throw new Error('Forecast data is empty.')

    const grouped: Record<string, ForecastEntry[]> = {}

    forecast.forEach((entry) => {
      const day = new Date(entry.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })
      if (!grouped[day]) grouped[day] = []
      grouped[day].push(entry)
    })

    return Object.entries(grouped)
      .slice(0, 5)
      .map(([day, entries]) => {
        const temps = entries.map((e) => e.main.temp)
        const icon = entries[0]?.weather[0]?.icon || '01d'
        const description = entries[0]?.weather[0]?.description || 'No description available'
        return {
          day,
          icon,
          description,
          min: Math.min(...temps),
          max: Math.max(...temps),
        }
      })
  } catch (error) {
    console.error('Error in getCityCoordinates:', error instanceof Error ? error.message : error)
    throw new Error('Unable to group forecast data. Please try again.')
  }
}

export const weatherBackgrounds: Record<string, unknown> = {
  'clear sky': ClearSky,
  'few clouds': FewClouds,
  'scattered clouds': Clouds,
  'broken clouds': FewClouds,
  'overcast clouds': Clouds,
  'light rain': Rain,
  'moderate rain': Rain,
  'heavy intensity rain': Rain,
  snow: Snow,
  'light snow': Snow,
  fog: Haze,
  haze: Haze,
  smoke: Haze,
  drizzle: Drizzle,
  sand: ClearSky,
  dust: ClearSky,
  tornado: ClearSky,
  squalls: Drizzle,
  'shower rain': Rain,
}
