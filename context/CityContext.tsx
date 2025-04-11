import React, { createContext, ReactNode, useContext, useState } from 'react';

export type WeatherData = {
  location: string;
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  forecast: any[];
};

interface CityContextType {
  cities: WeatherData[];
  setCities: React.Dispatch<React.SetStateAction<WeatherData[]>>;
  currentWeather: WeatherData | null;
  setCurrentWeather: React.Dispatch<React.SetStateAction<WeatherData | null>>;
  addCity: (weather: WeatherData) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [cities, setCities] = useState<WeatherData[]>([]);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);

  const addCity = (weather: WeatherData) => {
    setCities((prev) => {
      const exists = prev.some((c) => c.location.toLowerCase() === weather.location.toLowerCase());
      return exists ? prev : [weather, ...prev];
    });
  };

  return (
    <CityContext.Provider
      value={{ cities, setCities, currentWeather, setCurrentWeather, addCity }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCityContext = () => {
  const context = useContext(CityContext);
  if (!context) throw new Error('useCityContext must be used within a CityProvider');
  return context;
};
