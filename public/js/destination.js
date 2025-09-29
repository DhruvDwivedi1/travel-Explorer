// Enhanced JavaScript for Destination Page
// Save as: public/js/destination.js

let map;
let marker;
let markersLayer;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeMap();
    initializePhotoGallery();
    initializeWeatherRefresh();
    initializeSearch();
    initializeScrollAnimations();
    initializeAnimationObserver();
    
    // Initialize navigation scroll effect
    initializeNavbarScroll();
    
    console.log('Destination page initialized successfully');
});

// Initialize enhanced Leaflet map
function initializeMap() {
    if (typeof window.destinationData === 'undefined') {
        console.warn('Destination data not available for map');
        return;
    }

    const { name, lat, lng } = window.destinationData;
    
    // Default coordinates if none provided
    const mapLat = lat || 0;
    const mapLng = lng || 0;
    
    // Initialize map with enhanced options
    map = L.map('map', {
        center: [mapLat, mapLng],
        zoom: mapLat === 0 ? 2 : 12,
        zoomControl: false,
        attributionControl: true
    });
    
    // Add custom zoom control
    L.control.zoom({
        position: 'topleft'
    }).addTo(map);
    
    // Add multiple tile layer options
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });
    
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
    });
    
    // Add default layer
    osmLayer.addTo(map);
    
    // Layer control
    L.control.layers({
        "Street View": osmLayer,
        "Satellite": satelliteLayer
    }, null, { position: 'topright' }).addTo(map);
    
    // Create markers layer group
    markersLayer = L.layerGroup().addTo(map);
    
    // Add main destination marker if coordinates are available
    if (lat !== 0 || lng !== 0) {
        const mainIcon = L.divIcon({
            className: 'custom-map-marker',
            html: '<i class="bi bi-geo-alt-fill text-primary fs-3"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });
        
        marker = L.marker([mapLat, mapLng], { icon: mainIcon }).addTo(markersLayer);
        marker.bindPopup(`
            <div class="map-popup">
                <h6 class="fw-bold mb-2">${name}</h6>
                <p class="small mb-2">Click to explore this destination!</p>
                <button class="btn btn-primary btn-sm" onclick="exploreDestination('${name}')">
                    <i class="bi bi-search me-1"></i>
                    Explore
                </button>
            </div>
        `).openPopup();
        
        // Add famous places markers if available
        addFamousPlacesMarkers();
    } else {
        // Show world view if no specific coordinates
        map.setView([20, 0], 2);
        showMapMessage('Specific coordinates not available for this location.');
    }
    
    // Add map controls and events
    addMapControls();
    addMapEvents();
    
    // Custom map styling
    const mapElement = document.getElementById('map');
    mapElement.style.border = '2px solid var(--border-color)';
    mapElement.style.borderRadius = 'var(--border-radius-lg)';
}

// Add famous places as markers on the map
function addFamousPlacesMarkers() {
    const places = document.querySelectorAll('.place-card-enhanced');
    places.forEach((placeCard, index) => {
        const placeTitle = placeCard.querySelector('.place-title').textContent;
        const mapButton = placeCard.querySelector('[onclick*="openMap"]');
        
        if (mapButton) {
            const onclickAttr = mapButton.getAttribute('onclick');
            const coords = onclickAttr.match(/openMap\(([-\d.]+),\s*([-\d.]+)/);
            
            if (coords) {
                const lat = parseFloat(coords[1]);
                const lng = parseFloat(coords[2]);
                
                const placeIcon = L.divIcon({
                    className: 'place-map-marker',
                    html: `<i class="bi bi-star-fill text-warning fs-5"></i>`,
                    iconSize: [25, 25],
                    iconAnchor: [12, 25]
                });
                
                const placeMarker = L.marker([lat, lng], { icon: placeIcon }).addTo(markersLayer);
                placeMarker.bindPopup(`
                    <div class="map-popup">
                        <h6 class="fw-bold mb-2">${placeTitle}</h6>
                        <button class="btn btn-outline-primary btn-sm" onclick="scrollToPlace('${placeTitle}')">
                            <i class="bi bi-eye me-1"></i>
                            View Details
                        </button>
                    </div>
                `);
            }
        }
    });
}

// Enhanced photo gallery functionality
function initializePhotoGallery() {
    const photoThumbnails = document.querySelectorAll('.photo-thumbnail');
    
    photoThumbnails.forEach((thumbnail, index) => {
        // Add loading state
        thumbnail.style.opacity = '0';
        thumbnail.addEventListener('load', function() {
            this.style.transition = 'opacity 0.3s ease';
            this.style.opacity = '1';
        });
        
        // Add error handling
        thumbnail.addEventListener('error', function() {
            this.src = `https://via.placeholder.com/400x300/6c757d/ffffff?text=Photo+${index + 1}`;
            this.alt = 'Photo not available';
            this.style.opacity = '1';
        });
        
        // Add intersection observer for lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        if (thumbnail.dataset.src) {
            imageObserver.observe(thumbnail);
        }
    });
    
    // Enhanced modal functionality
    initializePhotoModals();
}

// Initialize photo modals with enhanced features
function initializePhotoModals() {
    const photoModals = document.querySelectorAll('.photo-modal');
    
    photoModals.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
            document.body.classList.add('modal-open-custom');
        });
        
        modal.addEventListener('hidden.bs.modal', function() {
            document.body.classList.remove('modal-open-custom');
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        const openModal = document.querySelector('.photo-modal.show');
        if (openModal) {
            if (e.key === 'ArrowRight') {
                navigatePhoto('next');
            } else if (e.key === 'ArrowLeft') {
                navigatePhoto('prev');
            }
        }
    });
}

// Navigate between photos in modal
function navigatePhoto(direction) {
    const currentModal = document.querySelector('.photo-modal.show');
    if (!currentModal) return;
    
    const currentId = currentModal.id;
    const currentIndex = parseInt(currentId.replace('photoModal', ''));
    const totalPhotos = document.querySelectorAll('.photo-modal').length;
    
    let nextIndex;
    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % totalPhotos;
    } else {
        nextIndex = (currentIndex - 1 + totalPhotos) % totalPhotos;
    }
    
    const nextModal = document.getElementById(`photoModal${nextIndex}`);
    if (nextModal) {
        bootstrap.Modal.getInstance(currentModal).hide();
        setTimeout(() => {
            new bootstrap.Modal(nextModal).show();
        }, 300);
    }
}

// Enhanced weather refresh functionality
function initializeWeatherRefresh() {
    const weatherCard = document.querySelector('.weather-card-modern');
    
    if (weatherCard) {
        // Weather refresh is handled by the existing button in the template
        console.log('Weather card initialized');
    }
}

// Refresh weather data
function refreshWeatherData() {
    const refreshButton = document.querySelector('[onclick="refreshWeatherData()"]');
    if (!refreshButton) return;
    
    const originalContent = refreshButton.innerHTML;
    
    // Show loading state
    refreshButton.innerHTML = '<i class="bi bi-hourglass-split"></i>';
    refreshButton.disabled = true;
    
    // Simulate API call (in a real app, this would call your backend)
    setTimeout(() => {
        // Simulate new weather data
        const tempElement = document.querySelector('.temperature-display');
        if (tempElement) {
            const currentTemp = parseInt(tempElement.textContent);
            const newTemp = currentTemp + Math.round((Math.random() - 0.5) * 4); // ±2 degrees variation
            tempElement.textContent = `${newTemp}°C`;
        }
        
        // Reset button
        refreshButton.innerHTML = originalContent;
        refreshButton.disabled = false;
        
        // Show success message
        showToast('Weather data refreshed!', 'success');
    }, 2000);
}

// Enhanced search functionality
function initializeSearch() {
    const searchForms = document.querySelectorAll('form[action="/search"]');
    
    searchForms.forEach(form => {
        const input = form.querySelector('input[name="destination"]');
        const button = form.querySelector('button[type="submit"]');
        
        if (input && button) {
            // Add enhanced autocomplete
            addEnhancedAutocomplete(input);
            
            // Add form validation
            form.addEventListener('submit', function(e) {
                const destination = input.value.trim();
                
                if (destination === '') {
                    e.preventDefault();
                    showToast('Please enter a destination name', 'warning');
                    input.focus();
                    return;
                }
                
                if (destination.length < 2) {
                    e.preventDefault();
                    showToast('Destination name must be at least 2 characters long', 'warning');
                    input.focus();
                    return;
                }
                
                // Show loading state
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Searching...';
                button.disabled = true;
                
                // Re-enable if form doesn't submit (for error cases)
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 10000);
            });
        }
    });
}

// Enhanced autocomplete with more features
function addEnhancedAutocomplete(input) {
    const suggestions = [
        { name: 'Paris', country: 'France', popular: true },
        { name: 'London', country: 'United Kingdom', popular: true },
        { name: 'Tokyo', country: 'Japan', popular: true },
        { name: 'New York', country: 'United States', popular: true },
        { name: 'Rome', country: 'Italy', popular: true },
        { name: 'Barcelona', country: 'Spain', popular: true },
        { name: 'Amsterdam', country: 'Netherlands', popular: true },
        { name: 'Berlin', country: 'Germany', popular: false },
        { name: 'Vienna', country: 'Austria', popular: false },
        { name: 'Prague', country: 'Czech Republic', popular: false },
        { name: 'Istanbul', country: 'Turkey', popular: false },
        { name: 'Dubai', country: 'UAE', popular: true },
        { name: 'Sydney', country: 'Australia', popular: true },
        { name: 'Melbourne', country: 'Australia', popular: false },
        { name: 'Bangkok', country: 'Thailand', popular: true },
        { name: 'Singapore', country: 'Singapore', popular: true },
        { name: 'Hong Kong', country: 'Hong Kong', popular: false },
        { name: 'Seoul', country: 'South Korea', popular: false }
    ];
    
    let currentFocus = -1;
    let suggestionTimeout;
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();
        clearTimeout(suggestionTimeout);
        closeAutocompleteList();
        
        if (!value || value.length < 2) return;
        
        suggestionTimeout = setTimeout(() => {
            const matches = suggestions.filter(city => 
                city.name.toLowerCase().includes(value) ||
                city.country.toLowerCase().includes(value)
            ).slice(0, 6);
            
            if (matches.length > 0) {
                showEnhancedAutocompleteList(input, matches, value);
            }
        }, 300);
    });
    
    // Enhanced keyboard navigation
    input.addEventListener('keydown', function(e) {
        const autocompleteList = document.querySelector('.autocomplete-list-enhanced');
        if (!autocompleteList) return;
        
        const items = autocompleteList.querySelectorAll('.autocomplete-item-enhanced');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus = Math.min(currentFocus + 1, items.length - 1);
            setActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus = Math.max(currentFocus - 1, -1);
            setActiveItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus >= 0 && items[currentFocus]) {
                items[currentFocus].click();
            } else {
                // Submit form if no item is selected
                input.form.dispatchEvent(new Event('submit'));
            }
        } else if (e.key === 'Escape') {
            closeAutocompleteList();
        }
    });
    
    function showEnhancedAutocompleteList(input, matches, query) {
        const container = document.createElement('div');
        container.className = 'autocomplete-list-enhanced position-absolute w-100 bg-white border rounded-3 shadow-lg';
        container.style.cssText = 'z-index: 1000; top: 100%; left: 0; max-height: 300px; overflow-y: auto;';
        
        matches.forEach((match, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item-enhanced p-3 border-bottom';
            item.style.cursor = 'pointer';
            
            const popularBadge = match.popular ? '<span class="badge bg-primary ms-2">Popular</span>' : '';
            
            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="bi bi-geo-alt me-2 text-muted"></i>
                    <div>
                        <div class="fw-semibold">${highlightMatch(match.name, query)}</div>
                        <small class="text-muted">${match.country}</small>
                    </div>
                    ${popularBadge}
                </div>
            `;
            
            item.addEventListener('click', function() {
                input.value = match.name;
                closeAutocompleteList();
                input.focus();
            });
            
            item.addEventListener('mouseenter', function() {
                currentFocus = index;
                setActiveItem(container.querySelectorAll('.autocomplete-item-enhanced'));
            });
            
            container.appendChild(item);
        });
        
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(container);
    }
    
    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-warning bg-opacity-25">$1</mark>');
    }
    
    function setActiveItem(items) {
        items.forEach((item, index) => {
            if (index === currentFocus) {
                item.classList.add('bg-primary', 'text-white');
            } else {
                item.classList.remove('bg-primary', 'text-white');
            }
        });
    }
    
    function closeAutocompleteList() {
        const existingList = document.querySelector('.autocomplete-list-enhanced');
        if (existingList) {
            existingList.remove();
        }
        currentFocus = -1;
    }
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.autocomplete-list-enhanced') && e.target !== input) {
            closeAutocompleteList();
        }
    });
}

// Initialize scroll animations and effects
function initializeScrollAnimations() {
    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize animation observer for scroll-triggered animations
function initializeAnimationObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                // Optional: unobserve after animation to improve performance
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all elements with animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Initialize navbar scroll effect
function initializeNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class for styling
        if (scrollTop > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Utility functions for enhanced functionality

// Show enhanced toast notifications
function showToast(message, type = 'info', duration = 4000) {
    // Remove existing toasts
    document.querySelectorAll('.toast-container-custom').forEach(container => {
        container.remove();
    });
    
    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container-custom position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
    // Create toast
    const toast = document.createElement('div');
    const bgClass = {
        'success': 'bg-success',
        'warning': 'bg-warning text-dark',
        'error': 'bg-danger',
        'danger': 'bg-danger',
        'info': 'bg-primary'
    }[type] || 'bg-primary';
    
    const iconClass = {
        'success': 'bi-check-circle',
        'warning': 'bi-exclamation-triangle',
        'error': 'bi-x-circle',
        'danger': 'bi-x-circle',
        'info': 'bi-info-circle'
    }[type] || 'bi-info-circle';
    
    toast.className = `toast align-items-center text-white ${bgClass} border-0 shadow-lg`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="${iconClass} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    // Initialize Bootstrap toast
    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();
    
    // Clean up after toast is hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toastContainer.remove();
    });
}

// Enhanced map functions
function openMap(lat, lng, placeName) {
    if (map) {
        map.setView([lat, lng], 16);
        
        // Find existing marker or create new one
        let targetMarker = null;
        markersLayer.eachLayer(layer => {
            if (layer.getLatLng().lat === lat && layer.getLatLng().lng === lng) {
                targetMarker = layer;
            }
        });
        
        if (targetMarker) {
            targetMarker.openPopup();
        }
        
        // Scroll to map
        document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
        
        showToast(`Showing ${placeName} on map`, 'info');
    } else {
        // Fallback to Google Maps
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(mapUrl, '_blank');
    }
}

function toggleMapFullscreen() {
    const mapContainer = document.querySelector('.map-container-enhanced');
    
    if (!document.fullscreenElement) {
        mapContainer.requestFullscreen().then(() => {
            mapContainer.classList.add('fullscreen-map');
            setTimeout(() => map.invalidateSize(), 100);
        }).catch(err => {
            console.warn('Fullscreen not supported:', err);
            showToast('Fullscreen mode not supported', 'warning');
        });
    } else {
        document.exitFullscreen().then(() => {
            mapContainer.classList.remove('fullscreen-map');
            setTimeout(() => map.invalidateSize(), 100);
        });
    }
}

function centerMap() {
    if (map && marker) {
        map.setView(marker.getLatLng(), 12);
        marker.openPopup();
        showToast('Map centered on destination', 'info');
    }
}

// Social sharing functions
function sharePhoto(photoUrl, photoAlt) {
    if (navigator.share) {
        navigator.share({
            title: photoAlt,
            text: `Check out this photo: ${photoAlt}`,
            url: photoUrl
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback to copying URL
        navigator.clipboard.writeText(photoUrl).then(() => {
            showToast('Photo URL copied to clipboard', 'success');
        }).catch(() => {
            showToast('Sharing not supported', 'warning');
        });
    }
}

function sharePlace(placeName, placeDescription) {
    const shareText = `Check out ${placeName}: ${placeDescription}`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: placeName,
            text: shareText,
            url: shareUrl
        }).catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
            showToast('Location details copied to clipboard', 'success');
        }).catch(() => {
            showToast('Sharing not supported', 'warning');
        });
    }
}

function downloadPhoto(photoUrl, photoAlt) {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `${photoAlt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Photo download started', 'success');
}

// Navigation and scrolling functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function scrollToPlace(placeName) {
    const placeCards = document.querySelectorAll('.place-card-enhanced');
    let targetCard = null;
    
    placeCards.forEach(card => {
        const titleElement = card.querySelector('.place-title');
        if (titleElement && titleElement.textContent.includes(placeName)) {
            targetCard = card;
        }
    });
    
    if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.style.transform = 'scale(1.02)';
        targetCard.style.boxShadow = '0 1rem 3rem rgba(0, 123, 255, 0.3)';
        
        setTimeout(() => {
            targetCard.style.transform = '';
            targetCard.style.boxShadow = '';
        }, 2000);
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exploreDestination(destinationName) {
    showToast(`Exploring ${destinationName}`, 'info');
    scrollToSection('places');
}

// Global functions for template access
function focusSearchInput() {
    const searchInput = document.querySelector('input[name="destination"]');
    if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Handle photo loading errors
function handlePhotoError(img) {
    img.src = 'https://via.placeholder.com/400x300/6c757d/ffffff?text=Photo+Unavailable';
    img.alt = 'Photo not available';
    img.classList.add('opacity-75');
}

// Add map controls and events
function addMapControls() {
    if (!map) return;
    
    // Add scale control
    L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false
    }).addTo(map);
    
    // Add loading indicator
    map.on('dataloading', function() {
        document.body.classList.add('map-loading');
    });
    
    map.on('dataload', function() {
        document.body.classList.remove('map-loading');
    });
}

function addMapEvents() {
    if (!map) return;
    
    // Handle map clicks
    map.on('click', function(e) {
        console.log('Map clicked at:', e.latlng);
    });
    
    // Handle zoom events
    map.on('zoomend', function() {
        const zoom = map.getZoom();
        console.log('Map zoom level:', zoom);
    });
}

function showMapMessage(message) {
    const mapContainer = document.getElementById('map').parentNode;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert alert-info mt-3';
    messageDiv.innerHTML = `<i class="bi bi-info-circle me-2"></i>${message}`;
    mapContainer.appendChild(messageDiv);
}

// Initialize additional features when page loads
window.addEventListener('load', function() {
    // Fix map sizing issues
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 500);
    }
    
    // Add loading complete class to body
    document.body.classList.add('page-loaded');
    
    // Initialize lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (map) {
        map.invalidateSize();
    }
});

// Export functions for global access
window.DestinationPage = {
    showToast,
    handlePhotoError,
    refreshWeatherData,
    toggleMapFullscreen,
    centerMap,
    openMap,
    sharePhoto,
    sharePlace,
    downloadPhoto,
    scrollToSection,
    scrollToTop,
    focusSearchInput
};