document.addEventListener('DOMContentLoaded', function() {
    // Load projects data
    fetchProjects();
});

// Function to format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Fetch projects data from JSON file
async function fetchProjects() {
    try {
        const response = await fetch('./data/projects.json');
        if (!response.ok) {
            throw new Error('Failed to fetch projects data');
        }
        const projects = await response.json();
        
        // Update the DOM with the projects data
        createProjectEntries(projects);
        updateCarousel(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        document.getElementById('project-container').innerHTML = 
            '<p>Error loading projects. Please try again later.</p>';
    }
}

// Create project entries in the main container
function createProjectEntries(projects) {
    const container = document.getElementById("project-container");
    if (!container) return;
    
    container.innerHTML = "";

    projects.forEach(project => {
        const detailUrl = project.slug
            ? `project.html?slug=${encodeURIComponent(project.slug)}`
            : `project.html?id=${encodeURIComponent(project.id)}`;

        const projectEntry = document.createElement("a");
        projectEntry.className = "project-entry";
        projectEntry.href = detailUrl;
        projectEntry.setAttribute('aria-label', `Open project detail for ${project.title}`);

        const technologiesHtml = Array.isArray(project.technologies) && project.technologies.length > 0
            ? `<ul class="project-tags">${project.technologies.map(tech => `<li>${tech}</li>`).join('')}</ul>`
            : '';

        projectEntry.innerHTML = `
            <div class="project-img-cont">
                <img src="${project.image}" alt="${project.title}" class="project-img">
            </div>
            <div class="project-text-wrapper">
                <p class="date">${formatDate(project.date)}</p>
                <h3 class="project-header">${project.title}</h3>
                <p class="p-description">
                    ${project.description}
                </p>
                ${technologiesHtml}
                <span class="project-link">View project →</span>
            </div>
        `;

        container.appendChild(projectEntry);
    });
}

// Update the carousel with project data
function updateCarousel(projects) {
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
    projects.forEach((project, index) => {
        const slide = document.createElement('li');
        slide.className = 'slide' + (index === 0 ? ' current-slide' : '');
        const detailUrl = project.slug
            ? `project.html?slug=${encodeURIComponent(project.slug)}`
            : `project.html?id=${encodeURIComponent(project.id)}`;

        slide.innerHTML = `
            <a href="${detailUrl}">
                <img src="${project.image}" alt="${project.title}">
                <div class="slide-name">
                    <h4>${project.title}</h4>
                </div>
            </a>
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

// Set up carousel functionality after slides are created
function setupCarousel() {
    const carousel_track = document.querySelector(".carousel-track");
    const slides = Array.from(carousel_track.children);
    const nextButton = document.querySelector(".carousel-button--right");
    const prevButton = document.querySelector(".carousel-button--left");
    const navDots = document.querySelector(".carousel-navigator");
    const dots = Array.from(navDots.children);
    
    // Make sure we have slides before proceeding
    if (slides.length === 0) {
        console.log("No slides to display");
        return;
    }
    
    // Get the width of the first slide
    const slideWidth = slides[0].getBoundingClientRect().width;
    
    // Position slides horizontally
    slides.forEach((slide, index) => {
        slide.style.left = slideWidth * index + "px";
    });
    
    // Show/hide buttons based on initial state
    if (slides.length > 1) {
        nextButton.classList.remove('is-hidden');
    } else {
        nextButton.classList.add('is-hidden');
    }
    prevButton.classList.add('is-hidden');
    
    // Move to a specific slide
    function moveToSlide(currentSlide, targetSlide) {
        carousel_track.style.transform = `translateX(-${targetSlide.style.left})`;
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    }
    
    // Update the dot indicators
    function updateDots(currentDot, targetDot) {
        currentDot.classList.remove('current-slide');
        targetDot.classList.add('current-slide');
    }
    
    // Update arrow visibility
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
    
    // Next button click handler
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
    
    // Previous button click handler
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
    
    // Dot indicators click handler
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
    let startX;
    let endX;
    
    carousel_track.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    
    carousel_track.addEventListener('touchmove', e => {
        endX = e.touches[0].clientX;
    });
    
    carousel_track.addEventListener('touchend', () => {
        if (!startX || !endX) return;
        
        const currentSlide = carousel_track.querySelector('.current-slide');
        
        if (startX > endX + 50) {
            // Swipe left - go to next slide
            const nextSlide = currentSlide.nextElementSibling;
            if (nextSlide) {
                nextButton.click();
            }
        } else if (startX + 50 < endX) {
            // Swipe right - go to previous slide
            const prevSlide = currentSlide.previousElementSibling;
            if (prevSlide) {
                prevButton.click();
            }
        }
        
        // Reset touch points
        startX = null;
        endX = null;
    });
    
    console.log("Carousel setup complete");
}
