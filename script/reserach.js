document.addEventListener('DOMContentLoaded', function() {
    // Load research data
    fetchResearch();
});

// Function to format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Fetch research data from JSON file
async function fetchResearch() {
    try {
        const response = await fetch('/data/research.json');
        if (!response.ok) {
            throw new Error('Failed to fetch research data');
        }
        const researchProjects = await response.json();
        
        // Update the DOM with the research data
        createResearchEntries(researchProjects);
        updateCarousel(researchProjects);
    } catch (error) {
        console.error('Error loading research projects:', error);
        document.getElementById('research-container').innerHTML = 
            '<p>Error loading research projects. Please try again later.</p>';
    }
}

// Create research entries in the main container
function createResearchEntries(researchProjects) {
    const container = document.getElementById("research-container");
    if (!container) return;
    
    container.innerHTML = "";

    researchProjects.forEach(project => {
        const entry = document.createElement("div");
        entry.className = "research-entry";
        entry.innerHTML = `
            <div class="research-img-cont">
                <img src="${project.image}" alt="${project.title}" class="research-img">
            </div>
            <div class="research-text-wrapper">
                <h3 class="research-header">${project.title}</h3>
                <p class="research-date">${formatDate(project.date)}</p>
                <p class="p-description">${project.description}</p>
                <div class="research-actions">
                    <img src="/assets/projects/rightArrow.svg" alt="link to research project page" class="arrow-button">
                </div>
            </div>
        `;
        container.appendChild(entry);
    });
}

// Update the carousel with research data
function updateCarousel(researchProjects) {
    const carouselTrack = document.querySelector('.carousel-track');
    const navDotsContainer = document.querySelector('.carousel-navigator');
    
    if (!carouselTrack || !navDotsContainer) {
        console.error('Carousel elements not found');
        return;
    }
    
    // Clear existing content
    carouselTrack.innerHTML = '';
    navDotsContainer.innerHTML = '';
    
    // Create new carousel items
    researchProjects.forEach((project, index) => {
        const slide = document.createElement('li');
        slide.className = 'slide' + (index === 0 ? ' current-slide' : '');
        slide.innerHTML = `
            <img src="${project.image}" alt="${project.title}">
            <div class="slide-name">
                <h4>${project.title}</h4>
            </div>
        `;
        carouselTrack.appendChild(slide);
        
        // Create dot indicator
        const dot = document.createElement('button');
        dot.className = 'carousel-indicator' + (index === 0 ? ' current-slide' : '');
        navDotsContainer.appendChild(dot);
    });
    
    // After all slides are created, set up the carousel
    setupCarousel();
}

// Set up carousel functionality (same as projects.js)
function setupCarousel() {
    const carousel_track = document.querySelector(".carousel-track");
    const slides = Array.from(carousel_track.children);
    const nextButton = document.querySelector(".carousel-button--right");
    const prevButton = document.querySelector(".carousel-button--left");
    const navDots = document.querySelector(".carousel-navigator");
    const dots = Array.from(navDots.children);
    
    if (slides.length === 0) return;
    
    const slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach((slide, index) => slide.style.left = slideWidth * index + "px");
    
    if (slides.length > 1) nextButton.classList.remove('is-hidden');
    else nextButton.classList.add('is-hidden');
    prevButton.classList.add('is-hidden');
    
    function moveToSlide(currentSlide, targetSlide) {
        carousel_track.style.transform = `translateX(-${targetSlide.style.left})`;
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    }
    
    function updateDots(currentDot, targetDot) {
        currentDot.classList.remove('current-slide');
        targetDot.classList.add('current-slide');
    }
    
    function updateArrows(targetIndex) {
        if (targetIndex === 0) {
            prevButton.classList.add('is-hidden');
            nextButton.classList.remove('is-hidden');
        } else if (targetIndex === slides.length - 1) {
            prevButton.classList.remove('is-hidden');
            nextButton.classList.add('is-hidden');
        } else {
            prevButton.classList.remove('is-hidden');
            nextButton.classList.remove('is-hidden');
        }
    }
    
    nextButton.addEventListener('click', () => {
        const currentSlide = carousel_track.querySelector('.current-slide');
        const nextSlide = currentSlide.nextElementSibling;
        if (!nextSlide) return;
        const currentDot = navDots.querySelector('.current-slide');
        const nextDot = currentDot.nextElementSibling;
        const nextIndex = slides.indexOf(nextSlide);
        moveToSlide(currentSlide, nextSlide);
        updateDots(currentDot, nextDot);
        updateArrows(nextIndex);
    });
    
    prevButton.addEventListener('click', () => {
        const currentSlide = carousel_track.querySelector('.current-slide');
        const prevSlide = currentSlide.previousElementSibling;
        if (!prevSlide) return;
        const currentDot = navDots.querySelector('.current-slide');
        const prevDot = currentDot.previousElementSibling;
        const prevIndex = slides.indexOf(prevSlide);
        moveToSlide(currentSlide, prevSlide);
        updateDots(currentDot, prevDot);
        updateArrows(prevIndex);
    });
    
    navDots.addEventListener('click', e => {
        const targetDot = e.target.closest('button');
        if (!targetDot) return;
        const currentSlide = carousel_track.querySelector('.current-slide');
        const currentDot = navDots.querySelector('.current-slide');
        const targetIndex = dots.indexOf(targetDot);
        const targetSlide = slides[targetIndex];
        moveToSlide(currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
        updateArrows(targetIndex);
    });
    
    // Touch swipe functionality
    let startX, endX;
    carousel_track.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    carousel_track.addEventListener('touchmove', e => endX = e.touches[0].clientX);
    carousel_track.addEventListener('touchend', () => {
        if (!startX || !endX) return;
        const currentSlide = carousel_track.querySelector('.current-slide');
        if (startX > endX + 50 && currentSlide.nextElementSibling) nextButton.click();
        else if (startX + 50 < endX && currentSlide.previousElementSibling) prevButton.click();
        startX = null;
        endX = null;
    });
    
    console.log("Research carousel setup complete");
}
