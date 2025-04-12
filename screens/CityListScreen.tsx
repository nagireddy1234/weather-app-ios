import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, ImageBackground, Pressable, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { getCityCoordinates, getWeatherData, weatherBackgrounds } from '@/api';
import { useCityContext } from '@/context/CityContext';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SwipeRow } from 'react-native-swipe-list-view';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CityListScreen(): JSX.Element {

  const { cities, setCities, addCity, setCurrentWeather } = useCityContext();

  const router = useRouter();

  const SCREEN_WIDTH = Dimensions.get('window').width;

  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCityExists = useMemo(() => {
    return [...cities].some((c) => c.location.toLowerCase() === city.trim().toLowerCase())
  }, [city, cities]);

  const handleSearch = async () => {
    if (!city.trim()) return;
    if (isCityExists) {
      setError('City is already in the list');
      setCity('');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const coords = await getCityCoordinates(city);
      const data = await getWeatherData(coords.lat, coords.lon);
      addCity(data);
      setCity('');
    } catch {
      setError('City not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (index: number) => {
    const updated = [...cities];
    updated.splice(index, 1);
    setCities(updated);
  };

  const renderCard = ({ item, index }: any) => {
    const bgImage = weatherBackgrounds[item.description] || weatherBackgrounds['clear sky'];
    const isCurrentLocation = item.location === 'Current Location';
    let hasDeleted = false;

    return (
      <SwipeRow
        disableRightSwipe
        rightOpenValue={isCurrentLocation ? 0 : -83}
        stopRightSwipe={-SCREEN_WIDTH * 0.9}
        disableLeftSwipe={isCurrentLocation}
        onSwipeValueChange={({ value }) => {
          if (value < -SCREEN_WIDTH / 2 && !hasDeleted) {
            hasDeleted = true;
            handleDelete(cities.indexOf(item));
          }
        }}
      >
        <View style={styles.hiddenRow}>
          {!isCurrentLocation && (
            <TouchableOpacity
              onPress={() => handleDelete(index)}
              style={styles.deleteButton}
            >
              <FontAwesome name="trash" size={24} color="#fff" />
            </TouchableOpacity>)}
        </View>
        <Pressable
          onPress={() => {
            setCurrentWeather(item);
            router.push('/');
          }}
        >
          <ImageBackground
            source={bgImage}
            resizeMode="cover"
            style={styles.card}
            imageStyle={{ borderRadius: 8 }}
          >
            <View style={{ flexDirection: 'column', padding: 16 }}>
              <Text style={styles.city}>{item.location}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Text style={styles.temp}>{item.temp}°</Text>
          </ImageBackground>
        </Pressable>
      </SwipeRow>
    );
  };

  return (
    <LinearGradient colors={['#47abff', '#b6eaff']} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search for a city"
          value={city}
          onChangeText={setCity}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#333"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.button}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            {loading && <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 10 }} />}
            {error && <Text style={styles.error}>{error}</Text>}
            <FlatList
              data={cities}
              keyExtractor={(item, index) => `${item.location}-${index}`}
              renderItem={renderCard}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 20,
  },
  input: {
    backgroundColor: '#ffffffcc',
    color: '#333333',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    outlineColor: '#ffffffcc',
    borderWidth: 1,
    borderColor: '#ffffffcc',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  city: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  temp: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    paddingRight: 8,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  error: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  hiddenRow: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    minHeight: 75,
    height: '100%'
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 3,
    width: 75,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
