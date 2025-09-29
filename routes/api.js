// routes/api.js - API Routes
// ============================================

const express = require('express');
const router = express.Router();
const { getFamousPlaces, getOpenTripMapPlaces } = require('../services/placesService');

// API endpoint to get places dynamically (for AJAX requests)
router.get('/places/:city', async (req, res) => {
  const cityName = req.params.city.replace(/-/g, ' ');
  
  try {
    console.log(`🔍 API request for places in: ${cityName}`);
    const places = await getFamousPlaces(cityName, 0, 0, req.app.locals.apiKeys.opentripmap);
    
    res.json({
      success: true,
      city: cityName,
      places: places,
      count: places.length,
      source: places[0]?.source || 'Mixed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint for live search with coordinates
router.get('/search-places', async (req, res) => {
  const { city, lat, lng, radius = 15000 } = req.query;
  
  if (!city && (!lat || !lng)) {
    return res.status(400).json({
      success: false,
      error: 'Either city name or coordinates (lat, lng) are required'
    });
  }

  try {
    let places;
    
    if (lat && lng) {
      // Search by coordinates
      places = await getOpenTripMapPlaces(parseFloat(lat), parseFloat(lng), city || 'Location', req.app.locals.apiKeys.opentripmap);
    } else {
      // Search by city name
      places = await getFamousPlaces(city, 0, 0, req.app.locals.apiKeys.opentripmap);
    }
    
    res.json({
      success: true,
      query: { city, lat, lng, radius },
      places: places,
      count: places.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Search API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch places data',
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint to get places by category
router.get('/places/:city/category/:category', async (req, res) => {
  const { city, category } = req.params;
  
  try {
    const allPlaces = await getFamousPlaces(city, 0, 0, req.app.locals.apiKeys.opentripmap);
    const filteredPlaces = allPlaces.filter(place => 
      place.category.toLowerCase().includes(category.toLowerCase())
    );
    
    res.json({
      success: true,
      city: city,
      category: category,
      places: filteredPlaces,
      count: filteredPlaces.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Category API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint to verify API integration
router.get('/test-places', async (req, res) => {
  try {
    const testCities = ['paris', 'london', 'tokyo', 'new york', 'rome'];
    const results = {};
    
    for (const city of testCities) {
      console.log(`🧪 Testing places API for: ${city}`);
      const places = await getFamousPlaces(city, 0, 0, req.app.locals.apiKeys.opentripmap);
      results[city] = {
        count: places.length,
        source: places[0]?.source || 'Unknown',
        sample: places.slice(0, 3).map(p => ({ 
          name: p.name, 
          category: p.category,
          rating: p.rating,
          coordinates: p.coordinates
        }))
      };
    }
    
    res.json({
      success: true,
      message: 'OpenTripMap API integration test completed',
      testResults: results,
      timestamp: new Date().toISOString(),
      apiStatus: {
        opentripmap: 'Active',
        weather: req.app.locals.apiKeys.weather ? 'Active' : 'Mock',
        photos: req.app.locals.apiKeys.unsplash ? 'Active' : 'Fallback'
      }
    });
    
  } catch (error) {
    console.error('❌ Test Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    apis: {
      weather: req.app.locals.apiKeys.weather ? 'configured' : 'missing',
      photos: req.app.locals.apiKeys.unsplash ? 'configured' : 'missing', 
      places: 'opentripmap-active'
    }
  });
});

module.exports = router;