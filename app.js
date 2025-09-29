// app.js - Main Application File
const express = require('express');
const axios = require('axios');
const path = require('path');
const ejsMate = require('ejs-mate');
require('dotenv').config();

const app = express();

// Import route modules
const indexRoutes = require('./routes/index');
const destinationRoutes = require('./routes/destinations');
const apiRoutes = require('./routes/api');

// Set EJS as templating engine with ejs-mate for layouts
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files with caching for performance
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0'
}));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API Keys from environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY || process.env.UNSPLASH_ACCESS_KEY;
const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY || '5ae2e3f221c38a28845f05b610529b46bfad11336fdc4a0ffc6c6e1c';

// Make API keys and services available to routes
app.locals.apiKeys = {
  weather: WEATHER_API_KEY,
  unsplash: UNSPLASH_API_KEY,
  opentripmap: OPENTRIPMAP_API_KEY
};

// Log API key status
console.log('🔑 API Key Status:');
console.log(`   Weather API: ${WEATHER_API_KEY ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Unsplash API: ${UNSPLASH_API_KEY ? '✅ Configured' : '❌ Missing'}`);
console.log(`   OpenTripMap API: ✅ Configured (for places discovery)`);

// Use route modules
app.use('/', indexRoutes);
app.use('/destination', destinationRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    page: 'error',
    message: 'The page you are looking for does not exist.'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).render('error', {
    title: '500 - Server Error',
    page: 'error',
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Travel Explorer Server Started');
  console.log(`🌍 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Available Endpoints:');
  console.log(`   🏠 Homepage: http://localhost:${PORT}`);
  console.log(`   🔍 Search: http://localhost:${PORT}/destination/[city-name]`);
  console.log(`   📡 Places API: http://localhost:${PORT}/api/places/[city]`);
  console.log(`   🧪 Test Places: http://localhost:${PORT}/api/test-places`);
  console.log(`   💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🔧 Configuration:');
  console.log(`   Weather API: ${WEATHER_API_KEY ? '✅ Active' : '⚠️  Mock data'}`);
  console.log(`   Photos API: ${UNSPLASH_API_KEY ? '✅ Active' : '⚠️  Fallback images'}`);
  console.log(`   Places API: ✅ OpenTripMap Active`);
  console.log('');
  console.log('💡 Tips:');
  console.log('   - Add API keys to .env file for full functionality');
  console.log('   - Visit /api/test-places to verify API integration');
  console.log('   - OpenTripMap provides real-time places data for any city');
  console.log('   - Try searching for any city to see dynamic places discovery!');
});