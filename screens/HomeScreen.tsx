import React, { useState, useRef, useEffect } from 'react'
import * as Location from 'expo-location'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { ForecastEntry, groupForecastByDay, getWeatherData, getCityCoordinates } from '@/api'
import { LinearGradient } from 'expo-linear-gradient'
import { useCityContext } from '@/context/CityContext'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import { OPENWEATHER_IMG_URL } from '@/constants/api'

const SCREEN_WIDTH = Dimensions.get('window').width
const defaultCities = ['London', 'Dublin', 'New York']

export default function HomeScreen(): JSX.Element {
  const { cities, setCities, setCurrentWeather, currentWeather, storageLoaded } = useCityContext()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        setError('No internet connection')
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const loadWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') throw new Error('Permission denied')

      const location = await Location.getCurrentPositionAsync({})
      const weather = await getWeatherData(location.coords.latitude, location.coords.longitude)
      weather.currentLocation = weather.location
      setCurrentWeather(weather)

      const weatherPromises = defaultCities.map(async (cityName) => {
        const coords = await getCityCoordinates(cityName)
        return await getWeatherData(coords.lat, coords.lon)
      })

      const results = await Promise.all(weatherPromises)
      const allCities = [weather, ...results]

      const deduplicated = Array.from(
        new Map(allCities.map((city) => [city.location.toLowerCase(), city])).values()
      )

      setCities(deduplicated)
    } catch (err) {
      console.error(err)
      setError('Failed to load weather data. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!storageLoaded) return

    if (cities.length === 0) {
      loadWeatherData()
    } else {
      setLoading(false)
    }
  }, [storageLoaded, cities.length])

  useEffect(() => {
    if (!currentWeather || !cities.length) return
    const index = cities.findIndex((c) => c.location === currentWeather.location)
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true })
      setActiveIndex(index)
    }
  }, [currentWeather, cities])

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true })
    setActiveIndex(index)
    setCurrentWeather(cities[index])
  }

  const retryLoad = () => {
    loadWeatherData()
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#47abff" style={styles.centered} />
  }

  if (error || !cities.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity onPress={retryLoad} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={cities}
        keyExtractor={(item, index) => `${item.location}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
          setActiveIndex(index)
          setCurrentWeather(cities[index])
        }}
        renderItem={({ item }) => {
          const dailyForecast = groupForecastByDay(item.forecast)
          return (
            <LinearGradient
              colors={['#47abff', '#b6eaff']}
              style={{ width: SCREEN_WIDTH, flex: 1 }}
            >
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                <Text style={styles.location}>
                  {item.currentLocation && (
                    <>
                      <FontAwesome6 name="location-arrow" size={12} style={{ color: '#fff' }} />
                      <Text>My Location</Text>
                    </>
                  )}
                </Text>
                <Text style={styles.city}>{item?.location}</Text>
                <Text style={styles.temp}>{item?.temp}°</Text>
                <Text style={styles.feels}>Feels Like: {item?.feels_like}°</Text>
                <Text style={styles.range}>
                  H:{item?.temp + 2}° L:{item.temp - 2}°
                </Text>
                <Image source={{ uri: item?.icon }} style={styles.icon} />
                <Text style={styles.description}>{item?.description}</Text>

                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Hourly Forecast</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hourlyScroll}
                    nestedScrollEnabled={true}
                  >
                    {item.forecast.map((entry: ForecastEntry, index: number) => (
                      <View key={index} style={styles.forecastItem}>
                        <Text style={styles.forecastTime}>
                          {new Date(entry.dt_txt).getHours()}:00
                        </Text>
                        <Image
                          source={{
                            uri: `${OPENWEATHER_IMG_URL}/${entry.weather[0].icon}@2x.png`,
                          }}
                          style={styles.forecastIcon}
                        />
                        <Text style={styles.forecastTemp}>{Math.round(entry.main.temp)}°</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Daily Forecast */}
                <View style={[styles.block, { maxHeight: 210 }]}>
                  <Text style={styles.blockTitle}>5-Day Forecast</Text>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 8 }}
                    nestedScrollEnabled={true}
                  >
                    {dailyForecast.map((day, index) => (
                      <View key={index} style={styles.dailyItem}>
                        <Text style={styles.dailyDay}>{day.day}</Text>
                        <Image
                          source={{
                            uri: `${OPENWEATHER_IMG_URL}/${day.icon}@2x.png`,
                          }}
                          style={styles.dailyIcon}
                        />
                        <Text style={styles.dailyTemps}>
                          {Math.round(day.min)}° / {Math.round(day.max)}°
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>
            </LinearGradient>
          )
        }}
      />

      <View style={styles.dotContainer}>
        {cities.map((_, index) => (
          <TouchableOpacity key={index} onPress={() => handleDotPress(index)}>
            <View style={[styles.dot, activeIndex === index && styles.activeDot]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 40,
    minHeight: Dimensions.get('window').height,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  location: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 4,
  },
  city: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '600',
  },
  temp: {
    fontSize: 64,
    color: '#fff',
    fontWeight: 'bold',
  },
  feels: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 4,
  },
  range: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    marginTop: 6,
  },
  icon: {
    width: 70,
    height: 70,
    marginVertical: 8,
    marginBottom: -4,
  },
  description: {
    fontSize: 24,
    color: '#ddd',
    marginBottom: 12,
    fontWeight: 700,
    textTransform: 'capitalize',
  },
  block: {
    backgroundColor: '#47abff',
    padding: 16,
    borderRadius: 20,
    marginVertical: 10,
    width: '90%',
  },
  blockTitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  hourlyScroll: {
    flexDirection: 'row',
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: 12,
    justifyContent: 'space-between',
    width: 50,
  },
  forecastTime: {
    color: '#ccc',
    fontSize: 14,
  },
  forecastIcon: {
    width: 40,
    height: 40,
  },
  forecastTemp: {
    color: '#fff',
    fontSize: 16,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  dailyDay: {
    color: '#ccc',
    fontSize: 16,
    width: 60,
  },
  dailyIcon: {
    width: 40,
    height: 40,
  },
  dailyTemps: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 'auto',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70,
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#ffffff88',
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
  },
  retryButton: {
    backgroundColor: '#47abff',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
