import React, { useState } from 'react';
import WeatherInput from './components/WeatherInput';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import './App.css';
import { Carousel } from 'react-bootstrap';

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [searchedCities, setSearchedCities] = useState([]);

  const API_KEY = 'b54245bca7f6ca5f040a750a56381f2f'; 

  const searchWeather = (searchQuery, onSuccess) => {
    // Aggiunto parametro onSuccess
    if (typeof searchQuery === 'string') {
      const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=1&appid=${API_KEY}`;
      fetch(GEOCODING_API_URL)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const { lat, lon, name } = data[0];
            fetchWeatherDetails(name, lat, lon, onSuccess); 
          } else {
            alert('Città non trovata.');
          }
        });
    } else if (
      typeof searchQuery === 'object' &&
      searchQuery.latitude &&
      searchQuery.longitude
    ) {
      const REVERSE_GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${searchQuery.latitude}&lon=${searchQuery.longitude}&limit=1&appid=${API_KEY}`;
      fetch(REVERSE_GEOCODING_API_URL)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const { name } = data[0];
            fetchWeatherDetails(
              name,
              searchQuery.latitude,
              searchQuery.longitude,
              onSuccess
            ); 
          } else {
            fetchWeatherDetails(
              'Posizione sconosciuta',
              searchQuery.latitude,
              searchQuery.longitude
            );
          }
        });
    }
  };

  const fetchWeatherDetails = (cityName, lat, lon, onSuccess) => {
  
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=it`;

    fetch(WEATHER_API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.list) {
          const current = data.list[0];
          setCurrentWeather({
            city: cityName,
            temp: current.main.temp.toFixed(1),
            wind: current.wind.speed.toFixed(1),
            humidity: current.main.humidity,
            description: current.weather[0].description,
            icon: current.weather[0].icon,
            date: current.dt_txt,
          });

          const dailyForecast = data.list
            .filter((item, index) => index % 8 === 0)
            .map((item) => ({
              temp: item.main.temp.toFixed(1),
              wind: item.wind.speed.toFixed(1),
              humidity: item.main.humidity,
              description: item.weather[0].description,
              icon: item.weather[0].icon,
              date: item.dt_txt,
            }));

          setForecast(dailyForecast);
          if (onSuccess) {
            onSuccess(cityName); 
          }
        }
      });
  };

  return (
    <div className="App">
      <h1>Meteo</h1>
      <div className="container">
        <WeatherInput
          onSearch={(query) =>
            searchWeather(query, (cityName) => {
              if (!searchedCities.includes(cityName)) {
                setSearchedCities([...searchedCities, cityName]); 
              }
            })
          }
        />
     
        <div className="weatherData">
          <CurrentWeather weather={currentWeather} />
          <Forecast forecast={forecast} />
        </div>
      </div>
    </div>
  );
}

export default App;
