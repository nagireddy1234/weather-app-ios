import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Platform } from 'react-native';
import { CityProvider } from '@/context/CityContext';

export default function TabLayout() {
  return (
    <CityProvider>
      <Tabs
         screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            position: 'absolute',
            borderRadius: 6,
            borderBottomEndRadius:0,
            borderBottomStartRadius:0,
            padding:20,
            height: Platform.OS === 'ios' ? 75 : 60,
            paddingBottom: Platform.OS === 'ios' ? 40 : 10,
            paddingTop: Platform.OS === 'ios' ? 0 : 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            borderTopWidth: 0,
            textShadow: "0 1px 1px rgba(0, 0, 0, 0.1)",
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          tabBarActiveTintColor: '#004d99',
          tabBarInactiveTintColor: '#004d99',
          tabBarIcon: ({ color, size = 24 }) => {
            let iconName: keyof typeof FontAwesome.glyphMap;
            if (route.name === 'index') {
              iconName = 'home';
            } else if (route.name === 'CityListScreen') {
                iconName = 'list-ul';
              } else {
                iconName = 'home';
              }

            return <FontAwesome name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="CityListScreen" />
      </Tabs>
     </CityProvider>
  );
}
