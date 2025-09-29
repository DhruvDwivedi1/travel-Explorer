// services/placesService.js - Places Service
// ============================================

const axios = require('axios');

// Geocode city to get coordinates using free OpenStreetMap API
async function geocodeCity(city) {
  try {
    console.log(`📍 Geocoding city: ${city}`);
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1&addressdetails=1`,
      {
        timeout: 5000,
        headers: { 'User-Agent': 'Travel-Explorer-App/1.0' }
      }
    );
    
    if (response.data && response.data.length > 0) {
      const lat = parseFloat(response.data[0].lat);
      const lng = parseFloat(response.data[0].lon);
      console.log(`✅ Geocoded ${city} to: ${lat}, ${lng}`);
      return { lat, lng };
    }

    return { lat: 0, lng: 0 };
  } catch (error) {
    console.warn('⚠️  Geocoding failed:', error.message);
    return { lat: 0, lng: 0 };
  }
}

// Main function to get famous places using OpenTripMap API
async function getFamousPlaces(city, lat = null, lng = null, apiKey) {
  console.log(`🏛️  Fetching famous places for: ${city} using OpenTripMap API`);
  
  try {
    // Get coordinates if not provided
    let coordinates = { lat, lng };
    if (!lat || !lng || lat === 0 || lng === 0) {
      coordinates = await geocodeCity(city);
    }

    if (coordinates.lat === 0 && coordinates.lng === 0) {
      console.warn(`⚠️  No coordinates found for ${city}, using fallback`);
      return getFallbackPlacesEnhanced(city, 0, 0);
    }

    // Fetch places from OpenTripMap
    const places = await getOpenTripMapPlaces(coordinates.lat, coordinates.lng, city, apiKey);
    
    if (places.length === 0) {
      console.warn(`⚠️  No places found for ${city}, using fallback`);
      return getFallbackPlacesEnhanced(city, coordinates.lat, coordinates.lng);
    }

    // Sort by rating and category importance
    const sortedPlaces = places
      .filter(place => place.name && place.name.length > 2)
      .sort((a, b) => {
        const categoryWeight = getCategoryWeight(a.category) - getCategoryWeight(b.category);
        if (categoryWeight !== 0) return categoryWeight;
        return (b.rating || 3.5) - (a.rating || 3.5);
      })
      .slice(0, 25);

    console.log(`✅ Successfully fetched ${sortedPlaces.length} places for ${city}`);
    return sortedPlaces;

  } catch (error) {
    console.error('❌ Error fetching places from OpenTripMap:', error.message);
    return getFallbackPlacesEnhanced(city, lat, lng);
  }
}

// Get places from OpenTripMap API
async function getOpenTripMapPlaces(lat, lng, cityName, apiKey) {
  try {
    const places = [];
    const radius = 15000; // 15km radius
    
    // Different rate levels to get variety of places (3 = most interesting, 1 = also interesting)
    const rateFilters = [3, 2, 1];
    
    for (const rate of rateFilters) {
      try {
        console.log(`📍 Searching OpenTripMap with rate ${rate} for radius ${radius}m...`);
        
        const response = await axios.get(
          `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lng}&lat=${lat}&rate=${rate}&limit=15&format=json&apikey=${apiKey}`,
          { 
            timeout: 10000,
            headers: {
              'User-Agent': 'Travel-Explorer-App/1.0'
            }
          }
        );

        if (response.data && Array.isArray(response.data)) {
          console.log(`📍 Found ${response.data.length} places with rate ${rate}`);
          
          // Get details for each place
          for (const place of response.data.slice(0, 10)) { // Limit to 10 per rate to avoid timeout
            if (places.length >= 30) break; // Total limit
            
            try {
              const placeDetails = await getOpenTripMapPlaceDetails(place.xid, apiKey);
              if (placeDetails) {
                places.push(placeDetails);
              }
              
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (detailError) {
              console.warn(`⚠️  Failed to get details for ${place.name}:`, detailError.message);
            }
          }
        }
        
        // Delay between rate requests
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (rateError) {
        console.warn(`⚠️  Failed to fetch places with rate ${rate}:`, rateError.message);
      }
    }

    // Remove duplicates
    const uniquePlaces = deduplicatePlacesByName(places);
    
    return uniquePlaces.map(place => ({
      ...place,
      source: 'OpenTripMap'
    }));

  } catch (error) {
    console.error('❌ OpenTripMap API error:', error.message);
    return [];
  }
}

// Get detailed information for a specific place
async function getOpenTripMapPlaceDetails(xid, apiKey) {
  try {
    const response = await axios.get(
      `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${apiKey}`,
      {
        timeout: 8000,
        headers: { 'User-Agent': 'Travel-Explorer-App/1.0' }
      }
    );

    const details = response.data;
    if (!details || !details.name || details.name.length < 2) {
      return null;
    }

    const category = categorizeOpenTripMapPlace(details.kinds);
    const rating = calculateRating(details.rate, details.kinds);

    return {
      id: xid,
      name: details.name,
      category: category,
      address: formatAddress(details.address),
      description: formatDescription(details),
      rating: rating,
      reviewCount: 0, // OpenTripMap doesn't provide review counts
      coordinates: {
        lat: details.point.lat,
        lng: details.point.lon
      },
      website: details.url,
      openingHours: generateOpeningHours(category),
      ticketPrice: generateTicketPrice(category, rating),
      image: details.preview?.source || details.image || null,
      source: 'OpenTripMap'
    };

  } catch (error) {
    console.warn(`⚠️  Failed to get place details for ${xid}:`, error.message);
    return null;
  }
}

// Helper functions for OpenTripMap data processing
function categorizeOpenTripMapPlace(kinds) {
  if (!kinds) return 'Attraction';
  
  const categoryMap = {
    'museums': 'Museum',
    'churches': 'Religious Site', 
    'theatres': 'Theater',
    'bridges': 'Bridge',
    'towers': 'Tower',
    'monuments_and_memorials': 'Monument',
    'castles': 'Castle',
    'gardens': 'Garden',
    'parks': 'Park',
    'historic': 'Historic Site',
    'archaeology': 'Archaeological Site',
    'architecture': 'Architecture',
    'galleries': 'Gallery',
    'palaces': 'Palace',
    'natural': 'Natural Site'
  };

  for (const [key, category] of Object.entries(categoryMap)) {
    if (kinds.includes(key)) {
      return category;
    }
  }
  
  return 'Attraction';
}

function formatAddress(address) {
  if (!address) return '';
  
  const parts = [];
  if (address.road) parts.push(address.road);
  if (address.city) parts.push(address.city);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
}

function formatDescription(details) {
  if (details.wikipedia_extracts?.text) {
    return details.wikipedia_extracts.text.substring(0, 200) + '...';
  }
  
  const category = categorizeOpenTripMapPlace(details.kinds);
  const descriptions = {
    'Museum': `Explore the collections and exhibits at ${details.name}.`,
    'Religious Site': `Visit the historic ${details.name}.`,
    'Park': `Enjoy nature and relaxation at ${details.name}.`,
    'Monument': `Discover the historic ${details.name}.`,
    'Castle': `Experience history at ${details.name}.`,
    'Bridge': `Cross the famous ${details.name}.`,
    'Tower': `Get views from ${details.name}.`,
    'Gallery': `View art at ${details.name}.`,
    'Theater': `Catch a performance at ${details.name}.`,
    'Palace': `Tour the magnificent ${details.name}.`
  };
  
  return descriptions[category] || `Visit the notable ${details.name}.`;
}

function generateOpeningHours(category) {
  const hoursByCategory = {
    'Museum': ['9:00 AM - 5:00 PM', '10:00 AM - 6:00 PM', '9:30 AM - 5:30 PM', '10:00 AM - 5:00 PM'],
    'Religious Site': ['6:00 AM - 8:00 PM', '7:00 AM - 7:00 PM', '6:30 AM - 8:30 PM', '24 hours'],
    'Park': ['6:00 AM - 10:00 PM', '5:00 AM - 11:00 PM', '24 hours', '6:00 AM - 9:00 PM'],
    'Monument': ['9:00 AM - 6:00 PM', '8:00 AM - 7:00 PM', '10:00 AM - 5:00 PM', '9:30 AM - 6:30 PM'],
    'Castle': ['9:00 AM - 5:00 PM', '10:00 AM - 6:00 PM', '9:30 AM - 5:30 PM'],
    'Tower': ['9:00 AM - 6:00 PM', '10:00 AM - 7:00 PM', '8:30 AM - 6:30 PM'],
    'Gallery': ['10:00 AM - 6:00 PM', '11:00 AM - 7:00 PM', '10:00 AM - 5:00 PM'],
    'Theater': ['Box office: 10:00 AM - 8:00 PM', 'Shows: 7:30 PM - 10:30 PM', 'Varies by show schedule'],
    'Palace': ['9:00 AM - 5:00 PM', '10:00 AM - 4:00 PM', '9:30 AM - 5:30 PM'],
    'Bridge': ['24 hours', 'Open access', 'Always accessible'],
    'Historic Site': ['9:00 AM - 6:00 PM', '8:00 AM - 7:00 PM', '10:00 AM - 5:00 PM'],
    'Garden': ['8:00 AM - 6:00 PM', '7:00 AM - 7:00 PM', '6:00 AM - 8:00 PM']
  };
  
  const hours = hoursByCategory[category] || ['9:00 AM - 5:00 PM', '10:00 AM - 6:00 PM'];
  return hours[Math.floor(Math.random() * hours.length)];
}

function generateTicketPrice(category, rating) {
  const priceRanges = {
    'Museum': ['€8', '€12', '€15', '€18', '€22', 'Free'],
    'Religious Site': ['Free', 'Free', 'Donation welcome', '€3', '€5'],
    'Park': ['Free', 'Free', '€2', '€5'],
    'Monument': ['€5', '€8', '€12', '€15', '€18'],
    'Castle': ['€12', '€15', '€18', '€22', '€25'],
    'Tower': ['€10', '€15', '€20', '€25'],
    'Gallery': ['€6', '€10', '€12', '€15', 'Free'],
    'Theater': ['€25', '€35', '€45', '€55', '€75'],
    'Palace': ['€15', '€20', '€25', '€30'],
    'Bridge': ['Free', 'Free'],
    'Historic Site': ['€5', '€8', '€10', '€12', '€15'],
    'Garden': ['Free', '€3', '€5', '€8']
  };
  
  let prices = priceRanges[category] || ['€8', '€12', '€15'];
  
  // Higher rated places tend to have higher prices
  if (rating >= 4.5) {
    prices = prices.slice(-3); // Take higher prices
  } else if (rating <= 3.5) {
    prices = prices.slice(0, 3); // Take lower prices
  }
  
  return prices[Math.floor(Math.random() * prices.length)];
}

function calculateRating(rate, kinds) {
  if (!rate) return 4.0;
  
  // OpenTripMap rate is 1-3, convert to 1-5 scale
  let rating = (rate / 3) * 5;
  
  // Boost rating for certain categories
  if (kinds) {
    if (kinds.includes('museums') || kinds.includes('monuments_and_memorials')) {
      rating += 0.3;
    }
    if (kinds.includes('historic') || kinds.includes('architecture')) {
      rating += 0.2;
    }
  }
  
  // Ensure rating is between 3.0 and 5.0, and format to 1 decimal place
  const finalRating = Math.min(5.0, Math.max(3.0, rating));
  return Math.round(finalRating * 10) / 10; // Round to 1 decimal place
}

function getCategoryWeight(category) {
  const weights = {
    'Monument': 1,
    'Museum': 2,
    'Historic Site': 3,
    'Castle': 4,
    'Palace': 5,
    'Religious Site': 6,
    'Tower': 7,
    'Bridge': 8,
    'Gallery': 9,
    'Theater': 10,
    'Park': 11,
    'Garden': 12,
    'Architecture': 13,
    'Natural Site': 14,
    'Attraction': 15
  };
  
  return weights[category] || 16;
}

function deduplicatePlacesByName(places) {
  const unique = [];
  const seen = new Set();

  for (const place of places) {
    const key = place.name.toLowerCase().replace(/[^\w]/g, '');
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(place);
    }
  }

  return unique;
}

function getFallbackPlacesEnhanced(city, lat, lng) {
  console.log(`⚠️  Using enhanced fallback places for ${city}`);
  
  const fallbackPlaces = getFallbackPlaces(city);
  
  return fallbackPlaces.map((place, index) => {
    const rating = Math.round(place.rating * 10) / 10; // Format to 1 decimal place
    
    return {
      id: `fallback-${city.toLowerCase()}-${index}`,
      name: place.name,
      category: place.category,
      address: place.address,
      description: place.description,
      rating: rating,
      reviewCount: Math.floor(Math.random() * 1000) + 100,
      coordinates: {
        lat: lat ? lat + (Math.random() - 0.5) * 0.02 : 0,
        lng: lng ? lng + (Math.random() - 0.5) * 0.02 : 0
      },
      openingHours: generateOpeningHours(place.category),
      ticketPrice: generateTicketPrice(place.category, rating),
      website: null,
      image: null,
      source: 'Fallback'
    };
  });
}

// Enhanced fallback places with more cities
function getFallbackPlaces(city) {
  const cityLower = city.toLowerCase();
  
  const famousPlaces = {
    'paris': [
      { name: 'Eiffel Tower', category: 'Tower', address: 'Champ de Mars, Paris', rating: 4.5, description: 'Iconic iron tower and symbol of Paris.' },
      { name: 'Louvre Museum', category: 'Museum', address: 'Rue de Rivoli, Paris', rating: 4.6, description: 'World\'s largest art museum, home to the Mona Lisa.' },
      { name: 'Notre-Dame Cathedral', category: 'Religious Site', address: 'Île de la Cité, Paris', rating: 4.4, description: 'Gothic masterpiece on the Seine River.' },
      { name: 'Arc de Triomphe', category: 'Monument', address: 'Place Charles de Gaulle, Paris', rating: 4.5, description: 'Triumphal arch honoring French military victories.' },
      { name: 'Sacré-Cœur Basilica', category: 'Religious Site', address: 'Montmartre, Paris', rating: 4.4, description: 'Beautiful basilica atop Montmartre hill.' }
    ],
    'london': [
      { name: 'Big Ben', category: 'Tower', address: 'Westminster, London', rating: 4.5, description: 'Iconic clock tower at the Palace of Westminster.' },
      { name: 'Tower of London', category: 'Castle', address: 'Tower Hill, London', rating: 4.4, description: 'Historic castle housing the Crown Jewels.' },
      { name: 'London Eye', category: 'Attraction', address: 'South Bank, London', rating: 4.3, description: 'Giant observation wheel with city views.' },
      { name: 'British Museum', category: 'Museum', address: 'Great Russell St, London', rating: 4.6, description: 'World-renowned museum of human history.' },
      { name: 'Tower Bridge', category: 'Bridge', address: 'Tower Bridge Rd, London', rating: 4.5, description: 'Victorian bridge with glass floor walkway.' }
    ],
    'tokyo': [
      { name: 'Senso-ji Temple', category: 'Religious Site', address: 'Asakusa, Tokyo', rating: 4.3, description: 'Ancient Buddhist temple in Asakusa district.' },
      { name: 'Tokyo Skytree', category: 'Tower', address: 'Sumida, Tokyo', rating: 4.2, description: 'Tallest structure in Japan with observation decks.' },
      { name: 'Meiji Shrine', category: 'Religious Site', address: 'Shibuya, Tokyo', rating: 4.4, description: 'Shinto shrine surrounded by forest in the city.' },
      { name: 'Imperial Palace', category: 'Palace', address: 'Chiyoda, Tokyo', rating: 4.0, description: 'Primary residence of the Emperor of Japan.' },
      { name: 'Shibuya Crossing', category: 'Attraction', address: 'Shibuya, Tokyo', rating: 4.3, description: 'World\'s busiest pedestrian crossing.' }
    ],
    'new york': [
      { name: 'Statue of Liberty', category: 'Monument', address: 'Liberty Island, NY', rating: 4.5, description: 'Symbol of freedom and democracy.' },
      { name: 'Central Park', category: 'Park', address: 'Manhattan, New York', rating: 4.6, description: 'Large public park in the heart of Manhattan.' },
      { name: 'Times Square', category: 'Attraction', address: 'Manhattan, New York', rating: 4.2, description: 'Bright lights and Broadway theaters.' },
      { name: 'Empire State Building', category: 'Tower', address: 'Midtown Manhattan, NY', rating: 4.4, description: 'Art Deco skyscraper with city views.' },
      { name: 'Brooklyn Bridge', category: 'Bridge', address: 'Brooklyn, New York', rating: 4.5, description: 'Historic suspension bridge over East River.' }
    ],
    'rome': [
      { name: 'Colosseum', category: 'Historic Site', address: 'Rome, Italy', rating: 4.6, description: 'Ancient amphitheater, symbol of Imperial Rome.' },
      { name: 'Vatican City', category: 'Religious Site', address: 'Vatican City', rating: 4.7, description: 'Papal residence with Sistine Chapel.' },
      { name: 'Trevi Fountain', category: 'Monument', address: 'Rome, Italy', rating: 4.5, description: 'Baroque fountain, famous for coin tossing.' },
      { name: 'Pantheon', category: 'Historic Site', address: 'Rome, Italy', rating: 4.6, description: 'Best-preserved Roman building.' },
      { name: 'Roman Forum', category: 'Historic Site', address: 'Rome, Italy', rating: 4.4, description: 'Center of ancient Roman public life.' }
    ],
    'barcelona': [
      { name: 'Sagrada Familia', category: 'Religious Site', address: 'Barcelona, Spain', rating: 4.6, description: 'Gaudí\'s unfinished masterpiece basilica.' },
      { name: 'Park Güell', category: 'Park', address: 'Barcelona, Spain', rating: 4.4, description: 'Colorful mosaic park by Gaudí.' },
      { name: 'Casa Batlló', category: 'Architecture', address: 'Barcelona, Spain', rating: 4.5, description: 'Gaudí\'s fantastical modernist house.' },
      { name: 'La Rambla', category: 'Attraction', address: 'Barcelona, Spain', rating: 4.2, description: 'Famous tree-lined pedestrian street.' },
      { name: 'Gothic Quarter', category: 'Historic Site', address: 'Barcelona, Spain', rating: 4.3, description: 'Medieval neighborhood with narrow streets.' }
    ]
  };

  const cityPlaces = famousPlaces[cityLower];
  if (cityPlaces) {
    return cityPlaces;
  }

  // Generic fallback for unknown cities
  return [
    { name: 'City Center', category: 'Attraction', address: `Downtown ${city}`, rating: 4.0, description: 'Main commercial and cultural district.' },
    { name: 'Historic Old Town', category: 'Historic Site', address: `${city}`, rating: 4.1, description: 'Historic heart of the city.' },
    { name: 'Main Square', category: 'Attraction', address: `Central ${city}`, rating: 4.1, description: 'Central meeting place and landmark.' },
    { name: 'City Museum', category: 'Museum', address: `${city}`, rating: 4.0, description: 'Local history and culture museum.' }
  ];
}

module.exports = { 
  getFamousPlaces, 
  getOpenTripMapPlaces, 
  geocodeCity 
};