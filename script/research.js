document.addEventListener('DOMContentLoaded', () => {
    loadResearch();
});

let cachedResearch = null;

async function loadResearch() {
    try {
        const response = await fetch('./data/research.json');
        if (!response.ok) {
            throw new Error('Failed to fetch research data');
        }
        cachedResearch = await response.json();
        renderResearch();
    } catch (error) {
        console.error('Error loading research:', error);
        const container = document.getElementById('research-container');
        if (container) {
            container.innerHTML = `<p>Error loading research. Please try again later.</p>`;
        }
    }
}

function renderResearch() {
    if (!Array.isArray(cachedResearch)) return;
    const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
    const localizedResearch = cachedResearch.map(research => window.mergeLocalizedFields ? window.mergeLocalizedFields(research, lang) : research);
    createResearchEntries(localizedResearch, lang);
    updateCarousel(localizedResearch, lang);
}

function formatDate(dateString, lang) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(lang === 'sv' ? 'sv-SE' : undefined, options);
}

function createResearchEntries(research, lang) {
    const container = document.getElementById("research-container");
    if (!container) return;
    container.innerHTML = "";
    research.forEach(item => {
        const detailUrl = item.slug
            ? `researchDetail.html?slug=${encodeURIComponent(item.slug)}`
            : `researchDetail.html?id=${encodeURIComponent(item.id)}`;
        const researchEntry = document.createElement("article");
        researchEntry.className = "project-entry";
        const ctaLabel = lang === 'sv'
            ? `Öppna forskningsdetaljer för ${item.title}`
            : `Open research detail for ${item.title}`;
        const technologiesHtml = Array.isArray(item.technologies) && item.technologies.length > 0
            ? `<ul class='project-tags'>${item.technologies.map(tech => `<li>${tech}</li>`).join('')}</ul>`
            : '';
        researchEntry.innerHTML = `
            <div class='project-img-cont'>
                <a href='${detailUrl}'>
                    <img src='${item.image}' alt='${item.title}' class='project-img'>
                </a>
            </div>
            <div class='project-text-wrapper'>
                <p class='date'>${formatDate(item.date, lang)}</p>
                <h3 class='project-header'><a href='${detailUrl}'>${item.title}</a></h3>
                <p class='p-description'>${item.description}</p>
                ${technologiesHtml}
                <div class='project-card-cta'>
                    <a class='project-arrow' href='${detailUrl}' aria-label='${ctaLabel}'>
                        <img src='/assets/projects/rightArrow.svg' alt='' aria-hidden='true'>
                        <span class='sr-only'>${ctaLabel}</span>
                    </a>
                </div>
            </div>
        `;
        container.appendChild(researchEntry);
    });
}

function updateCarousel(research, lang) {
    const carouselTrack = document.querySelector('.carousel-track');
    const navDotsContainer = document.querySelector('.carousel-navigator');
    if (!carouselTrack || !navDotsContainer) return;
    carouselTrack.innerHTML = '';
    navDotsContainer.innerHTML = '';
    research.forEach((item, index) => {
        const slide = document.createElement('li');
        slide.className = 'slide' + (index === 0 ? ' current-slide' : '');
        const detailUrl = `researchDetail.html?id=${encodeURIComponent(item.id)}`;
        slide.innerHTML = `
            <a href='${detailUrl}'>
                <img src='${item.image}' alt='${item.title}'>
                <div class='slide-name'>
                    <h4>${item.title}</h4>
                </div>
            </a>
        `;
        carouselTrack.appendChild(slide);
        const dot = document.createElement('button');
        dot.className = 'carousel-indicator' + (index === 0 ? ' current-slide' : '');
        navDotsContainer.appendChild(dot);
    });
    setupCarouselResearch();
}

function setupCarouselResearch() {
    const carousel_track = document.querySelector('.carousel-track');
    const slides = Array.from(carousel_track.children);
    const nextButton = document.querySelector('.carousel-button--right');
    const prevButton = document.querySelector('.carousel-button--left');
    const navDots = document.querySelector('.carousel-navigator');
    const dots = Array.from(navDots.children);
    if (slides.length === 0) return;
    const slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach((slide, index) => {
        slide.style.left = slideWidth * index + "px";
    });
    if (slides.length > 1) {
        nextButton.classList.remove('is-hidden');
    } else {
        nextButton.classList.add('is-hidden');
    }
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
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            const currentSlide = carousel_track.querySelector('.current-slide');
            const targetSlide = slides[index];
            const currentDot = navDots.querySelector('.current-slide');
            moveToSlide(currentSlide, targetSlide);
            updateDots(currentDot, dot);
            updateArrows(index);
        });
    });
    let startX;
    let endX;
    carousel_track.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    carousel_track.addEventListener('touchmove', e => {
        endX = e.touches[0].clientX;
    });
    carousel_track.addEventListener('touchend', () => {
        if (startX == null || endX == null) return;
        const currentSlide = carousel_track.querySelector('.current-slide');
        if (startX > endX + 50) {
            const nextSlide = currentSlide.nextElementSibling;
            if (nextSlide) {
                nextButton.click();
            }
        } else if (startX + 50 < endX) {
            const prevSlide = currentSlide.previousElementSibling;
            if (prevSlide) {
                prevButton.click();
            }
        }
        startX = null;
        endX = null;
    });
}
