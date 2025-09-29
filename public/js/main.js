// Enhanced Main JavaScript for Travel Explorer Homepage
// Save as: public/js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all homepage components
    initializeNavigation();
    initializeSearchForm();
    initializeDestinationCards();
    initializeScrollAnimations();
    initializeFeatures();
    initializeLocationServices();
    
    console.log('Homepage initialized successfully');
});

// Enhanced navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
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

// Enhanced search form functionality
function initializeSearchForm() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = searchForm?.querySelector('input[name="destination"]');
    const searchButton = searchForm?.querySelector('button[type="submit"]');

    if (!searchForm || !searchInput || !searchButton) return;

    // Add enhanced autocomplete
    addAdvancedAutocomplete(searchInput);
    
    // Add real-time validation
    searchInput.addEventListener('input', function() {
        const value = this.value.trim();
        
        // Clear previous validation states
        this.classList.remove('is-valid', 'is-invalid');
        
        if (value.length === 0) {
            return;
        }
        
        if (value.length < 2) {
            this.classList.add('is-invalid');
            showInputFeedback(this, 'Destination name must be at least 2 characters', 'invalid');
        } else if (validateDestinationName(value)) {
            this.classList.add('is-valid');
            showInputFeedback(this, 'Looks good!', 'valid');
        } else {
            this.classList.add('is-invalid');
            showInputFeedback(this, 'Please enter a valid destination name', 'invalid');
        }
    });
    
    // Enhanced form submission
    searchForm.addEventListener('submit', function(e) {
        const destination = searchInput.value.trim();
        
        if (!validateFormSubmission(destination)) {
            e.preventDefault();
            return;
        }
        
        // Show loading state with enhanced animation
        showSearchLoading(searchButton);
        
        // Track search analytics (placeholder)
        trackSearch(destination);
    });
    
    // Add search suggestions on focus
    searchInput.addEventListener('focus', function() {
        if (this.value.trim() === '') {
            showPopularSuggestions(this);
        }
    });
}

// Advanced autocomplete with enhanced features
function addAdvancedAutocomplete(input) {
    const destinations = [
        { name: 'Paris', country: 'France', continent: 'Europe', popular: true, image: 'eiffel-tower' },
        { name: 'London', country: 'United Kingdom', continent: 'Europe', popular: true, image: 'big-ben' },
        { name: 'Tokyo', country: 'Japan', continent: 'Asia', popular: true, image: 'tokyo-skyline' },
        { name: 'New York', country: 'United States', continent: 'North America', popular: true, image: 'statue-liberty' },
        { name: 'Rome', country: 'Italy', continent: 'Europe', popular: true, image: 'colosseum' },
        { name: 'Barcelona', country: 'Spain', continent: 'Europe', popular: true, image: 'sagrada-familia' },
        { name: 'Amsterdam', country: 'Netherlands', continent: 'Europe', popular: false, image: 'canals' },
        { name: 'Berlin', country: 'Germany', continent: 'Europe', popular: false, image: 'brandenburg-gate' },
        { name: 'Vienna', country: 'Austria', continent: 'Europe', popular: false, image: 'palace' },
        { name: 'Prague', country: 'Czech Republic', continent: 'Europe', popular: false, image: 'castle' },
        { name: 'Istanbul', country: 'Turkey', continent: 'Asia/Europe', popular: false, image: 'hagia-sophia' },
        { name: 'Dubai', country: 'UAE', continent: 'Asia', popular: true, image: 'burj-khalifa' },
        { name: 'Sydney', country: 'Australia', continent: 'Oceania', popular: true, image: 'opera-house' },
        { name: 'Melbourne', country: 'Australia', continent: 'Oceania', popular: false, image: 'city-skyline' },
        { name: 'Bangkok', country: 'Thailand', continent: 'Asia', popular: true, image: 'temples' },
        { name: 'Singapore', country: 'Singapore', continent: 'Asia', popular: true, image: 'marina-bay' },
        { name: 'Hong Kong', country: 'Hong Kong', continent: 'Asia', popular: false, image: 'skyline' },
        { name: 'Seoul', country: 'South Korea', continent: 'Asia', popular: false, image: 'palaces' },
        { name: 'Cairo', country: 'Egypt', continent: 'Africa', popular: false, image: 'pyramids' },
        { name: 'Cape Town', country: 'South Africa', continent: 'Africa', popular: false, image: 'table-mountain' }
    ];
    
    let currentFocus = -1;
    let suggestionTimeout;
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();
        clearTimeout(suggestionTimeout);
        clearAutocomplete();
        
        if (!value || value.length < 1) {
            if (value.length === 0) {
                showPopularSuggestions(this);
            }
            return;
        }
        
        suggestionTimeout = setTimeout(() => {
            const matches = destinations.filter(dest => 
                dest.name.toLowerCase().includes(value) ||
                dest.country.toLowerCase().includes(value) ||
                dest.continent.toLowerCase().includes(value)
            ).sort((a, b) => {
                // Prioritize popular destinations and exact matches
                if (a.popular && !b.popular) return -1;
                if (!a.popular && b.popular) return 1;
                if (a.name.toLowerCase().startsWith(value)) return -1;
                if (b.name.toLowerCase().startsWith(value)) return 1;
                return 0;
            }).slice(0, 8);
            
            if (matches.length > 0) {
                showAdvancedAutocomplete(input, matches, value);
            }
        }, 200);
    });
    
    // Enhanced keyboard navigation
    input.addEventListener('keydown', function(e) {
        const autocompleteList = document.querySelector('.autocomplete-advanced');
        if (!autocompleteList) return;
        
        const items = autocompleteList.querySelectorAll('.autocomplete-item-advanced');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentFocus = Math.min(currentFocus + 1, items.length - 1);
                setActiveAutocompleteItem(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                currentFocus = Math.max(currentFocus - 1, -1);
                setActiveAutocompleteItem(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (currentFocus >= 0 && items[currentFocus]) {
                    items[currentFocus].click();
                } else {
                    input.form.dispatchEvent(new Event('submit'));
                }
                break;
            case 'Escape':
                clearAutocomplete();
                break;
            case 'Tab':
                if (currentFocus >= 0 && items[currentFocus]) {
                    e.preventDefault();
                    items[currentFocus].click();
                }
                break;
        }
    });
    
    function showAdvancedAutocomplete(input, matches, query) {
        const container = createAutocompleteContainer(input);
        
        matches.forEach((match, index) => {
            const item = createAutocompleteItem(match, query, index);
            container.appendChild(item);
        });
        
        input.parentNode.appendChild(container);
    }
    
    function showPopularSuggestions(input) {
        const popularDestinations = destinations.filter(dest => dest.popular);
        const container = createAutocompleteContainer(input);
        
        const header = document.createElement('div');
        header.className = 'autocomplete-header p-3 bg-light border-bottom';
        header.innerHTML = '<small class="text-muted fw-semibold">Popular Destinations</small>';
        container.appendChild(header);
        
        popularDestinations.forEach((dest, index) => {
            const item = createAutocompleteItem(dest, '', index);
            container.appendChild(item);
        });
        
        input.parentNode.appendChild(container);
    }
    
    function createAutocompleteContainer(input) {
        const container = document.createElement('div');
        container.className = 'autocomplete-advanced position-absolute w-100 bg-white border rounded-3 shadow-lg';
        container.style.cssText = 'z-index: 1000; top: 100%; left: 0; max-height: 400px; overflow-y: auto;';
        return container;
    }
    
    function createAutocompleteItem(destination, query, index) {
        const item = document.createElement('div');
        item.className = 'autocomplete-item-advanced p-3 border-bottom d-flex align-items-center';
        item.style.cursor = 'pointer';
        
        const flagEmoji = getFlagEmoji(destination.country);
        const popularBadge = destination.popular ? '<span class="badge bg-primary ms-auto">Popular</span>' : '';
        
        const highlightedName = query ? highlightMatch(destination.name, query) : destination.name;
        
        item.innerHTML = `
            <div class="me-3">
                <div class="destination-flag">${flagEmoji}</div>
            </div>
            <div class="flex-grow-1">
                <div class="fw-semibold">${highlightedName}</div>
                <small class="text-muted">${destination.country} • ${destination.continent}</small>
            </div>
            ${popularBadge}
        `;
        
        item.addEventListener('click', function() {
            input.value = destination.name;
            clearAutocomplete();
            input.focus();
            input.classList.add('is-valid');
            showInputFeedback(input, 'Great choice!', 'valid');
        });
        
        item.addEventListener('mouseenter', function() {
            currentFocus = index;
            const items = document.querySelectorAll('.autocomplete-item-advanced');
            setActiveAutocompleteItem(items);
        });
        
        return item;
    }
    
    function setActiveAutocompleteItem(items) {
        items.forEach((item, index) => {
            if (index === currentFocus) {
                item.classList.add('bg-primary', 'text-white');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('bg-primary', 'text-white');
            }
        });
    }
    
    function clearAutocomplete() {
        const existingList = document.querySelector('.autocomplete-advanced');
        if (existingList) {
            existingList.remove();
        }
        currentFocus = -1;
    }
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.autocomplete-advanced') && e.target !== input) {
            clearAutocomplete();
        }
    });
}

// Utility functions
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning bg-opacity-25 rounded">$1</mark>');
}

function getFlagEmoji(country) {
    const flags = {
        'France': '🇫🇷',
        'United Kingdom': '🇬🇧',
        'Japan': '🇯🇵',
        'United States': '🇺🇸',
        'Italy': '🇮🇹',
        'Spain': '🇪🇸',
        'Netherlands': '🇳🇱',
        'Germany': '🇩🇪',
        'Austria': '🇦🇹',
        'Czech Republic': '🇨🇿',
        'Turkey': '🇹🇷',
        'UAE': '🇦🇪',
        'Australia': '🇦🇺',
        'Thailand': '🇹🇭',
        'Singapore': '🇸🇬',
        'Hong Kong': '🇭🇰',
        'South Korea': '🇰🇷',
        'Egypt': '🇪🇬',
        'South Africa': '🇿🇦'
    };
    return flags[country] || '🌍';
}

function validateDestinationName(name) {
    // Basic validation for destination names
    const validPatterns = [
        /^[a-zA-Z\s\-'\.]+$/,  // Basic city names
        /^[a-zA-Z\s\-'\.]+,\s*[a-zA-Z\s]+$/ // City, Country format
    ];
    
    const invalidPatterns = [
        /^\d+$/,  // Only numbers
        /^[!@#$%^&*()_+=\[\]{}|;:,.<>?]+$/,  // Only special characters
        /^.{1,1}$/  // Too short (single character)
    ];
    
    // Check against invalid patterns first
    for (const pattern of invalidPatterns) {
        if (pattern.test(name)) {
            return false;
        }
    }
    
    // Check against valid patterns
    return validPatterns.some(pattern => pattern.test(name));
}

function validateFormSubmission(destination) {
    if (destination === '') {
        showAlert('Please enter a destination name', 'warning');
        return false;
    }
    
    if (destination.length < 2) {
        showAlert('Destination name must be at least 2 characters long', 'warning');
        return false;
    }
    
    if (!validateDestinationName(destination)) {
function validateFormSubmission(destination) {
    if (destination === '') {
        showAlert('Please enter a destination name', 'warning');
        return false;
    }
    
    if (destination.length < 2) {
        showAlert('Destination name must be at least 2 characters long', 'warning');
        return false;
    }
    
    if (!validateDestinationName(destination)) {
        showAlert('Please enter a valid destination name', 'warning');
        return false;
    }
    
    return true;
}

function showInputFeedback(input, message, type) {
    // Remove existing feedback
    const existingFeedback = input.parentNode.querySelector('.form-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create new feedback
    const feedback = document.createElement('div');
    feedback.className = `form-feedback ${type === 'valid' ? 'valid-feedback' : 'invalid-feedback'} mt-2`;
    feedback.innerHTML = `<small><i class="bi bi-${type === 'valid' ? 'check-circle' : 'exclamation-circle'} me-1"></i>${message}</small>`;
    
    input.parentNode.appendChild(feedback);
    
    // Auto-remove after delay
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 4000);
}

function showSearchLoading(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Searching...';
    button.disabled = true;
    
    // Store original text for potential reset
    button.dataset.originalText = originalText;
    
    // Auto-reset after 10 seconds (fallback)
    setTimeout(() => {
        if (button.disabled) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }, 10000);
}

// Initialize destination cards with enhanced interactions
function initializeDestinationCards() {
    const destinationCards = document.querySelectorAll('.card');
    
    destinationCards.forEach((card, index) => {
        // Add intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        // Initial animation state
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        observer.observe(card);
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 1rem 3rem rgba(0, 0, 0, 0.25)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
        
        // Add click tracking
        const cardLink = card.querySelector('a[href*="/destination/"]');
        if (cardLink) {
            cardLink.addEventListener('click', function(e) {
                const destinationName = card.querySelector('.card-title')?.textContent || 'Unknown';
                trackDestinationClick(destinationName);
                
                // Add visual feedback
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            });
        }
    });
}

// Initialize scroll animations for all animated elements
function initializeScrollAnimations() {
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            heroSection.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Animate feature boxes
    const featureBoxes = document.querySelectorAll('.card');
    const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
            }
        });
    }, { threshold: 0.1 });
    
    featureBoxes.forEach((box, index) => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(30px)';
        box.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
        
        featureObserver.observe(box);
    });
    
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-section h1');
    if (heroTitle) {
        addTypingEffect(heroTitle);
    }
}

// Initialize enhanced features section
function initializeFeatures() {
    const featureCards = document.querySelectorAll('.card');
    
    featureCards.forEach(card => {
        const icon = card.querySelector('.bi');
        if (icon) {
            card.addEventListener('mouseenter', function() {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
                icon.style.color = 'var(--primary-color)';
            });
            
            card.addEventListener('mouseleave', function() {
                icon.style.transform = '';
                icon.style.color = '';
            });
        }
    });
}

// Initialize location services
function initializeLocationServices() {
    // Check if geolocation is available
    if ('geolocation' in navigator) {
        addLocationBasedFeatures();
    }
    
    // Initialize network status monitoring
    initializeNetworkMonitoring();
}

function addLocationBasedFeatures() {
    // Add subtle location suggestion (optional)
    const searchInput = document.querySelector('input[name="destination"]');
    if (searchInput && !localStorage.getItem('location-permission-asked')) {
        
        // Add a small location button next to search
        const locationBtn = document.createElement('button');
        locationBtn.type = 'button';
        locationBtn.className = 'btn btn-outline-secondary';
        locationBtn.innerHTML = '<i class="bi bi-geo-alt"></i>';
        locationBtn.title = 'Suggest nearby destinations';
        locationBtn.style.display = 'none'; // Hidden by default
        
        locationBtn.addEventListener('click', function() {
            getSuggestedDestinations();
        });
        
        const searchGroup = searchInput.closest('.input-group');
        if (searchGroup) {
            searchGroup.appendChild(locationBtn);
        }
    }
}

function getSuggestedDestinations() {
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const { latitude, longitude } = position.coords;
            showToast('Location detected! Showing nearby popular destinations', 'info');
            
            // This would typically call an API to get nearby destinations
            // For now, we'll show a mock suggestion
            const mockSuggestions = [
                'Barcelona, Spain',
                'Madrid, Spain', 
                'Lisbon, Portugal',
                'Paris, France'
            ];
            
            const searchInput = document.querySelector('input[name="destination"]');
            if (searchInput) {
                showLocationSuggestions(searchInput, mockSuggestions);
            }
        },
        function(error) {
            let message = 'Location access denied';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location access denied. You can still search manually!';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    message = 'Location request timed out';
                    break;
            }
            showToast(message, 'warning');
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 600000
        }
    );
}

function showLocationSuggestions(input, suggestions) {
    const container = document.createElement('div');
    container.className = 'autocomplete-advanced position-absolute w-100 bg-white border rounded-3 shadow-lg';
    container.style.cssText = 'z-index: 1000; top: 100%; left: 0; max-height: 300px; overflow-y: auto;';
    
    const header = document.createElement('div');
    header.className = 'autocomplete-header p-3 bg-light border-bottom';
    header.innerHTML = '<small class="text-muted fw-semibold"><i class="bi bi-geo-alt me-1"></i>Suggested destinations near you</small>';
    container.appendChild(header);
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item-advanced p-3 border-bottom';
        item.style.cursor = 'pointer';
        item.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-geo-alt me-2 text-primary"></i>
                <span>${suggestion}</span>
            </div>
        `;
        
        item.addEventListener('click', function() {
            input.value = suggestion;
            container.remove();
            input.focus();
        });
        
        container.appendChild(item);
    });
    
    input.parentNode.appendChild(container);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (container.parentNode) {
            container.remove();
        }
    }, 10000);
}

// Initialize network monitoring
function initializeNetworkMonitoring() {
    window.addEventListener('online', function() {
        showToast('Back online! All features are now available', 'success');
    });
    
    window.addEventListener('offline', function() {
        showToast('You are offline. Some features may not work properly', 'warning');
    });
    
    // Check initial connection status
    if (!navigator.onLine) {
        setTimeout(() => {
            showToast('You appear to be offline', 'warning');
        }, 2000);
    }
}

// Utility functions

function addTypingEffect(element) {
    const text = element.textContent;
    element.textContent = '';
    element.style.borderRight = '3px solid white';
    element.style.minHeight = '1.2em';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        } else {
            // Remove cursor after typing is done
            setTimeout(() => {
                element.style.borderRight = 'none';
            }, 1000);
        }
    };
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 1000);
}

function showAlert(message, type = 'info', duration = 5000) {
    // Remove existing alerts
    document.querySelectorAll('.alert-floating').forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed alert-floating shadow-lg`;
    alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;';
    
    const iconClass = {
        'success': 'bi-check-circle',
        'warning': 'bi-exclamation-triangle',
        'danger': 'bi-x-circle',
        'info': 'bi-info-circle'
    }[type] || 'bi-info-circle';
    
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${iconClass} me-2"></i>
            <span>${message}</span>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after specified duration
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 300);
        }
    }, duration);
}

function showToast(message, type = 'info', duration = 4000) {
    // Remove existing toasts
    document.querySelectorAll('.toast-container-homepage').forEach(container => {
        container.remove();
    });
    
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container-homepage position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    
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
    
    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', function() {
        toastContainer.remove();
    });
}

// Analytics and tracking functions
function trackSearch(destination) {
    console.log(`Search initiated for: ${destination}`);
    
    // Store in localStorage for recent searches
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    recentSearches = recentSearches.filter(search => search !== destination);
    recentSearches.unshift(destination);
    recentSearches = recentSearches.slice(0, 5); // Keep only 5 recent searches
    
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
}

function trackDestinationClick(destinationName) {
    console.log(`Destination clicked: ${destinationName}`);
    
    // Store click analytics
    let clickAnalytics = JSON.parse(localStorage.getItem('clickAnalytics') || '{}');
    clickAnalytics[destinationName] = (clickAnalytics[destinationName] || 0) + 1;
    localStorage.setItem('clickAnalytics', JSON.stringify(clickAnalytics));
}

// Performance monitoring
function initializePerformanceMonitoring() {
    window.addEventListener('load', function() {
        if ('performance' in window) {
            setTimeout(() => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`Page loaded in: ${loadTime}ms`);
                
                if (loadTime > 5000) {
                    showToast('Page loaded slowly. Some features may be delayed.', 'info');
                }
            }, 0);
        }
    });
}

// Global utility functions
function focusSearchInput() {
    const searchInput = document.querySelector('input[name="destination"]');
    if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Initialize tooltips if Bootstrap is available
function initializeTooltips() {
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
    initializePerformanceMonitoring();
});

// Export for global access
window.TravelExplorerHome = {
    showToast,
    showAlert,
    focusSearchInput,
    trackDestinationClick,
    trackSearch
};