// routes/destinations.js - Destination Routes
// ============================================

const express = require('express');
const router = express.Router();
const { featuredDestinations } = require('../data/destinations');
const { getWeatherData } = require('../services/weatherService');
const { getPhotos } = require('../services/photoService');
const { getFamousPlaces } = require('../services/placesService');

// Destination page
router.get('/:city', async (req, res) => {
  const citySlug = req.params.city;
  const cityName = citySlug.replace(/-/g, ' ');
  
  try {
    let destinationInfo = featuredDestinations.find(
      dest => dest.name.toLowerCase() === cityName.toLowerCase()
    );
    
    if (!destinationInfo) {
      destinationInfo = {
        name: cityName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        country: 'Unknown',
        description: `Explore the beautiful city of ${cityName}.`,
        lat: 0,
        lng: 0
      };
    }
    
    console.log(`🌍 Loading destination: ${destinationInfo.name}`);
    
    // Fetch weather, photos, and famous places in parallel for faster loading
    const [weather, photos, famousPlaces] = await Promise.all([
      getWeatherData(cityName, req.app.locals.apiKeys.weather),
      getPhotos(`${cityName} travel city`, req.app.locals.apiKeys.unsplash),
      getFamousPlaces(cityName, destinationInfo.lat, destinationInfo.lng, req.app.locals.apiKeys.opentripmap)
    ]);
    
    console.log(`📊 Data summary for ${cityName}:`);
    console.log(`   - Photos: ${photos.length}`);
    console.log(`   - Places: ${famousPlaces.length}`);
    console.log(`   - Weather: ${weather.temperature}°C`);
    
    res.render('destination', {
      title: `${destinationInfo.name} - Travel Explorer`,
      page: 'destination',
      description: `Explore ${destinationInfo.name}, ${destinationInfo.country}. ${destinationInfo.description}`,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      ogImage: photos.length > 0 ? photos[0].url : `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&fit=crop`,
      destination: destinationInfo,
      weather,
      photos,
      famousPlaces
    });
    
  } catch (error) {
    console.error('❌ Error loading destination:', error);
    res.status(500).render('error', {
      title: 'Error - Travel Explorer',
      page: 'error',
      description: 'An error occurred while loading the destination information.',
      message: 'Sorry, we could not load the destination information.',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router;