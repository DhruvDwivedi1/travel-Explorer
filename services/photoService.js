const axios = require('axios');

// Improved photo service that actually fetches city images from API
async function getPhotos(query, apiKey) {
  try {
    if (!apiKey) {
      console.log('⚠️  Unsplash API key not found, using fallback photos');
      return getFallbackPhotos(query);
    }

    console.log(`📸 Fetching city photos via API for: ${query}`);
    
    // Extract city name properly
    const cityName = query.replace(/\s+(travel|city|tourism|attractions|landmarks).*$/i, '').toLowerCase().trim();
    console.log(`🎯 Searching for: "${cityName}"`);
    
    // Progressive search strategy - start broad, then narrow down
    const searchStrategies = [
      // Strategy 1: Simple city name (most likely to return results)
      [`${cityName}`],
      
      // Strategy 2: City with context
      [`${cityName} city`, `${cityName} tourism`],
      
      // Strategy 3: City with architectural terms
      [`${cityName} architecture`, `${cityName} landmark`, `${cityName} building`],
      
      // Strategy 4: City with travel terms
      [`${cityName} travel`, `${cityName} destination`, `${cityName} sightseeing`]
    ];
    
    let allPhotos = [];
    const targetCount = 8;
    const minCount = 6;
    
    // Try each strategy until we have enough photos
    for (let strategy = 0; strategy < searchStrategies.length && allPhotos.length < targetCount; strategy++) {
      console.log(`🔍 Strategy ${strategy + 1}: Trying ${searchStrategies[strategy].length} queries`);
      
      for (let i = 0; i < searchStrategies[strategy].length && allPhotos.length < targetCount; i++) {
        const searchQuery = searchStrategies[strategy][i];
        
        try {
          console.log(`   📡 API Query: "${searchQuery}"`);
          
          const response = await axios.get(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=30&client_id=${apiKey}`,
            { 
              timeout: 10000,
              headers: {
                'Accept': 'application/json',
                'Accept-Version': 'v1'
              }
            }
          );
          
          if (response.data?.results?.length > 0) {
            console.log(`   📊 Found ${response.data.results.length} total photos`);
            
            // Less restrictive filtering - focus on excluding obviously unrelated content
            const relevantPhotos = response.data.results.filter(photo => {
              const description = (photo.description || '').toLowerCase();
              const altDescription = (photo.alt_description || '').toLowerCase();
              const allText = `${description} ${altDescription}`;
              
              // Exclude clearly unrelated content
              const excludeTerms = [
                'food', 'meal', 'dish', 'recipe', 'cooking', 'restaurant menu',
                'portrait', 'selfie', 'headshot', 'face close', 'person looking',
                'animal', 'pet', 'dog', 'cat', 'bird', 'wildlife',
                'flower close', 'plant macro', 'leaf detail', 'garden flower',
                'bedroom', 'kitchen interior', 'bathroom', 'living room',
                'office desk', 'workplace', 'computer screen', 'laptop',
                'abstract pattern', 'texture close', 'wallpaper design'
              ];
              
              const hasExcludedContent = excludeTerms.some(term => 
                allText.includes(term)
              );
              
              // For first strategy (simple city name), be very permissive
              if (strategy === 0) {
                return !hasExcludedContent;
              }
              
              // For other strategies, look for city-related terms
              const cityRelatedTerms = [
                'city', 'urban', 'downtown', 'street', 'building', 'architecture',
                'skyline', 'view', 'landscape', 'aerial', 'panorama',
                'landmark', 'monument', 'bridge', 'tower', 'square', 'plaza',
                'historic', 'tourism', 'travel', 'destination', 'sight'
              ];
              
              const hasCityContent = cityRelatedTerms.some(term => 
                allText.includes(term) || searchQuery.includes(term)
              );
              
              return !hasExcludedContent && hasCityContent;
            });
            
            console.log(`   ✅ Filtered to ${relevantPhotos.length} relevant photos`);
            
            // Convert to our format and add to collection
            relevantPhotos.forEach(photo => {
              if (allPhotos.length < targetCount && !allPhotos.find(existing => existing.id === photo.id)) {
                allPhotos.push({
                  id: photo.id,
                  url: photo.urls.regular || photo.urls.full,
                  thumbnail: photo.urls.small || photo.urls.thumb,
                  alt: photo.alt_description || photo.description || `${cityName} view`
                });
              }
            });
            
            console.log(`   📈 Total collected: ${allPhotos.length} photos`);
          } else {
            console.log(`   ❌ No results for "${searchQuery}"`);
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (queryError) {
          console.warn(`   ⚠️  Query failed: "${searchQuery}" - ${queryError.message}`);
        }
      }
    }
    
    // Return results
    if (allPhotos.length >= minCount) {
      const finalPhotos = allPhotos.slice(0, targetCount);
      console.log(`🎉 SUCCESS: Returning ${finalPhotos.length} API photos for "${cityName}"`);
      return finalPhotos;
    } else if (allPhotos.length > 0) {
      console.log(`📸 Found ${allPhotos.length} API photos, supplementing with generic city photos`);
      // Add generic city photos to reach minimum count
      const genericPhotos = getGenericCityPhotos(cityName, minCount - allPhotos.length);
      return [...allPhotos, ...genericPhotos].slice(0, targetCount);
    } else {
      console.log(`❌ No relevant photos found via API for "${cityName}", using generic city photos`);
      return getGenericCityPhotos(cityName, targetCount);
    }
    
  } catch (error) {
    console.error('❌ Unsplash API Error:', error.message);
    return getGenericCityPhotos(query, 8);
  }
}

// Generic city photos as last resort (not manually curated per city)
function getGenericCityPhotos(cityName, count = 8) {
  console.log(`🏙️  Using ${count} generic city photos for: ${cityName}`);
  
  // Generic city/urban photos that work for any city
  const genericUrbanPhotos = [
    { id: 'generic1', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300', alt: `${cityName} urban view` },
    { id: 'generic2', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300', alt: `${cityName} cityscape` },
    { id: 'generic3', url: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800', thumbnail: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=300', alt: `${cityName} skyline` },
    { id: 'generic4', url: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=800', thumbnail: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300', alt: `${cityName} street scene` },
    { id: 'generic5', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300', alt: `${cityName} architecture` },
    { id: 'generic6', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800', thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=300', alt: `${cityName} buildings` },
    { id: 'generic7', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800', thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300', alt: `${cityName} downtown` },
    { id: 'generic8', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', thumbnail: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300', alt: `${cityName} city view` }
  ];
  
  return genericUrbanPhotos.slice(0, count);
}

// Keep minimal fallback function for API key missing scenario
function getFallbackPhotos(query) {
  const cityName = query.replace(/\s+(travel|city|tourism|attractions|landmarks).*$/i, '').toLowerCase().trim();
  return getGenericCityPhotos(cityName, 8);
}

module.exports = { getPhotos };