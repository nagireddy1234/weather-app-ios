import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEY } from '@/constants/api'
import { ForecastEntry } from '@/api'

export type WeatherData = {
  location: string
  temp: number
  feels_like: number
  description: string
  icon: string
  forecast: ForecastEntry[]
}

interface CityContextType {
  cities: WeatherData[]
  setCities: React.Dispatch<React.SetStateAction<WeatherData[]>>
  currentWeather: WeatherData | null
  setCurrentWeather: React.Dispatch<React.SetStateAction<WeatherData | null>>
  addCity: (weather: WeatherData) => void
  storageLoaded: boolean
}

const CityContext = createContext<CityContextType | undefined>(undefined)

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [cities, setCities] = useState<WeatherData[]>([])
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [storageLoaded, setStorageLoaded] = useState(false)

  useEffect(() => {
    const loadCitiesFromStorage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as WeatherData[]
          setCities(parsed)
        }
      } catch (error) {
        console.error('Failed to load cities from storage:', error)
      } finally {
        setStorageLoaded(true)
      }
    }
    loadCitiesFromStorage()
  }, [])

  useEffect(() => {
    const saveCitiesToStorage = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cities))
      } catch (error) {
        console.error('Failed to save cities to storage:', error)
      }
    }

    if (cities.length > 0) {
      saveCitiesToStorage()
    }
  }, [cities])

  const addCity = (weather: WeatherData) => {
    setCities((prev) => {
      const exists = prev.some((c) => c.location.toLowerCase() === weather.location.toLowerCase())
      return exists ? prev : [...prev, weather]
    })
  }

  return (
    <CityContext.Provider
      value={{ cities, setCities, currentWeather, setCurrentWeather, addCity, storageLoaded }}
    >
      {children}
    </CityContext.Provider>
  )
}

export const useCityContext = () => {
  const context = useContext(CityContext)
  if (!context) throw new Error('useCityContext must be used within a CityProvider')
  return context
}
