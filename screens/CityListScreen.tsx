import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, ImageBackground,
} from 'react-native';
import { getCityCoordinates, getWeatherData, weatherBackgrounds } from '@/utils';
import { useCityContext } from '@/context/CityContext';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SwipeRow } from 'react-native-swipe-list-view';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CityListScreen(): JSX.Element {
  const { cities, setCities, addCity } = useCityContext();
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const SCREEN_WIDTH = Dimensions.get('window').width;

  const handleSearch = async () => {
    if (!city.trim()) return;
    const isAlreadyAdded = cities.some(
      (c) => c.location.toLowerCase() === city.trim().toLowerCase()
    );
    if (isAlreadyAdded) {
      setError('City already added');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const coords = await getCityCoordinates(city);
      const data = await getWeatherData(coords.lat, coords.lon);
      setCities((prev) => [data, ...prev]);
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

  const renderCard = ({ item }: any) => {
    const bgImage = weatherBackgrounds[item.description] || weatherBackgrounds['clear sky'];
    let hasDeleted = false;

    return (
      <SwipeRow
        disableRightSwipe
        rightOpenValue={-SCREEN_WIDTH * 0.75}
        stopRightSwipe={-SCREEN_WIDTH * 0.75}
        onSwipeValueChange={({ value }) => {
          if (value < -SCREEN_WIDTH / 2 && !hasDeleted) {
            hasDeleted = true;
            handleDelete(cities.indexOf(item));
          }
        }}
      >
        <View style={styles.hiddenRow}>
          <TouchableOpacity
            onPress={() => handleDelete(cities.indexOf(item))}
            style={styles.deleteButton}
          >
            <FontAwesome name="trash" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            addCity(item);
            router.push('/');
          }}
        >
          <ImageBackground
            source={bgImage}
            resizeMode="cover"
            style={styles.card}
            imageStyle={{ borderRadius: 8 }}
          >
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.city}>{item.location}</Text>
              <Text style={styles.desc}>{item.description}</Text>
            </View>
            <Text style={styles.temp}>{item.temp}°</Text>
          </ImageBackground>
        </TouchableOpacity>
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
    padding: 16,
    paddingRight: 0,
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
    fontSize: 32,
    fontWeight: 'bold',
    paddingRight: 8,
  },
  desc: {
    color: '#fff',
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  hiddenRow: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 11,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    padding: 24,
    borderRadius: 8,
    width: 75,
  },
});
