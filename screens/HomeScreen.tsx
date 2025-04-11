import React, { useState, useRef, useEffect } from 'react';
import * as Location from 'expo-location';
import {
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, FlatList,
  Dimensions, TouchableOpacity,
} from 'react-native';
import { ForecastEntry, groupForecastByDay, getWeatherData, getCityCoordinates } from '@/utils';
import { LinearGradient } from 'expo-linear-gradient';
import { useCityContext } from '@/context/CityContext';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const SCREEN_WIDTH = Dimensions.get('window').width;
const defaultCities: string[] = ['London', 'Dublin', 'New York'];

export default function HomeScreen(): JSX.Element {
  const {
    cities, setCities, currentWeather, setCurrentWeather
  } = useCityContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Permission denied');

        const location = await Location.getCurrentPositionAsync({});
        const weather = await getWeatherData(location.coords.latitude, location.coords.longitude);
        weather.location = 'Current Location';
        setCurrentWeather(weather);

        const weatherPromises = defaultCities.map(async (cityName) => {
          const coords = await getCityCoordinates(cityName);
          return await getWeatherData(coords.lat, coords.lon);
        });

        const results = await Promise.all(weatherPromises);
        const allCities = [weather, ...results];

        const deduplicated = Array.from(
          new Map(allCities.map((city) => [city.location.toLowerCase(), city])).values()
        );

        setCities(deduplicated);
      } catch (err) {
        console.error(err);
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#fff" style={styles.centered} />;
  }

  if (error || !cities.length) {
    return <Text style={styles.error}>{error || 'No weather data'}</Text>;
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
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => {
          const dailyForecast = groupForecastByDay(item.forecast);
          return (
            <LinearGradient colors={['#47abff', '#b6eaff']} style={{ width: SCREEN_WIDTH, flex: 1 }}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.location}>
                  {item.location === 'Current Location' && (
                    <>
                      <FontAwesome6 name="location-arrow" size={12} style={{paddingRight:6, color:'#fff'}} />
                      <Text>Your Location</Text>
                    </>
                  )}
                </Text>
                <Text style={styles.city}>{item?.location}</Text>
                <Text style={styles.temp}>{item?.temp}°</Text>
                <Text style={styles.feels}>Feels Like: {item?.feels_like}°</Text>
                <Text style={styles.range}>H:{item?.temp + 2}°  L:{item.temp - 2}°</Text>
                <Image source={{ uri: item?.icon }} style={styles.icon} />
                <Text style={styles.description}>{item?.description}</Text>

                {/* Hourly Forecast */}
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>Hourly Forecast</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.hourlyScroll}
                  >
                    {item?.forecast.map((entry:ForecastEntry, index:number) => (
                      <View key={index} style={styles.forecastItem}>
                        <Text style={styles.forecastTime}>
                          {new Date(entry?.dt_txt).getHours()}:00
                        </Text>
                        <Image
                          source={{
                            uri: `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`,
                          }}
                          style={styles.forecastIcon}
                        />
                        <Text style={styles.forecastTemp}>
                          {Math.round(entry.main.temp)}°
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Daily Forecast */}
                <View style={styles.block}>
                  <Text style={styles.blockTitle}>5-Day Forecast</Text>
                  {dailyForecast.map((day, index) => (
                    <View key={index} style={styles.dailyItem}>
                      <Text style={styles.dailyDay}>{day.day}</Text>
                      <Image
                        source={{ uri: `https://openweathermap.org/img/wn/${day.icon}@2x.png` }}
                        style={styles.dailyIcon}
                      />
                      <Text style={styles.dailyTemps}>
                        {Math.round(day.min)}° / {Math.round(day.max)}°
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </LinearGradient>
          );
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
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  location: {
    color: '#bbb',
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
  },
  description: {
    fontSize: 18,
    color: '#eee',
    marginBottom: 20,
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
    bottom: 20,
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
});
