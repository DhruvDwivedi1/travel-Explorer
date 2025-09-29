// services/weatherService.js - Weather Service
// ============================================

const axios = require('axios');

// Helper function to get weather data
async function getWeatherData(city, apiKey) {
  try {
    if (!apiKey) {
      console.log('⚠️  Weather API key not found in .env file, using mock data');
      return getMockWeatherData();
    }

    console.log(`🌤️  Fetching weather for: ${city}`);
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      {
        timeout: 8000,
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ Successfully fetched weather data');
    return {
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: Math.round(response.data.wind.speed * 10) / 10,
      icon: response.data.weather[0].icon
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('❌ Weather API Error: Invalid API key. Please check your WEATHER_API_KEY in .env file');
    } else if (error.response && error.response.status === 404) {
      console.error(`❌ Weather API Error: City "${city}" not found`);
    } else {
      console.error('❌ Weather API Error:', error.message);
    }
    return getMockWeatherData();
  }
}

// Mock weather data when API is not available
function getMockWeatherData() {
  const mockWeatherOptions = [
    { temperature: 22, description: 'partly cloudy', humidity: 65, windSpeed: 3.2, icon: '02d' },
    { temperature: 18, description: 'light rain', humidity: 80, windSpeed: 2.1, icon: '10d' },
    { temperature: 25, description: 'clear sky', humidity: 45, windSpeed: 1.5, icon: '01d' },
    { temperature: 15, description: 'scattered clouds', humidity: 70, windSpeed: 4.0, icon: '03d' },
    { temperature: 28, description: 'sunny', humidity: 40, windSpeed: 2.8, icon: '01d' }
  ];
  
  return mockWeatherOptions[Math.floor(Math.random() * mockWeatherOptions.length)];
}

module.exports = { getWeatherData };