// Destination Page JavaScript - Production Version
// Save as: public/js/destination.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Destination page loaded');
    
    // Initialize features
    initializePhotoGallery();
    initializeAnimations();
    initializeSearch();
});

// Photo Gallery Initialization
function initializePhotoGallery() {
    const photoImages = document.querySelectorAll('.photo-image');
    
    photoImages.forEach((img) => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.addEventListener('error', function() {
            this.src = 'https://via.placeholder.com/400x300/6c757d/ffffff?text=Image+Not+Available';
        });
    });
}

// Scroll Animations
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Search Form Enhancement
function initializeSearch() {
    const searchForms = document.querySelectorAll('form[action="/search"]');
    
    searchForms.forEach(form => {
        const input = form.querySelector('input[name="destination"]');
        const button = form.querySelector('button[type="submit"]');
        
        if (input && button) {
            form.addEventListener('submit', function(e) {
                const destination = input.value.trim();
                
                if (!destination || destination.length < 2) {
                    e.preventDefault();
                    alert('Please enter a valid destination name (at least 2 characters)');
                    input.focus();
                    return;
                }
                
                button.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Searching...';
                button.disabled = true;
            });
        }
    });
}

// Global error handler for images
function handlePhotoError(img) {
    img.src = 'https://via.placeholder.com/400x300/6c757d/ffffff?text=Image+Not+Available';
    img.alt = 'Photo not available';
}

// Page load complete
window.addEventListener('load', function() {
    document.body.classList.add('page-loaded');
    console.log('All resources loaded');
});