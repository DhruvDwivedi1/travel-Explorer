// ============================================
// routes/index.js - Homepage Routes
// ============================================

const express = require('express');
const router = express.Router();
const { featuredDestinations } = require('../data/destinations');

// Homepage
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Travel Explorer - Discover Amazing Destinations',
    page: 'home',
    description: 'Discover amazing destinations worldwide with real-time weather, stunning photography, and curated travel information.',
    destinations: featuredDestinations
  });
});

// Search route
router.post('/search', async (req, res) => {
  const { destination } = req.body;
  if (!destination) {
    return res.redirect('/');
  }
  
  // Redirect to destination page
  res.redirect(`/destination/${encodeURIComponent(destination.toLowerCase().replace(/\s+/g, '-'))}`);
});

module.exports = router;