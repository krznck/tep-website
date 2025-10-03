document.addEventListener('DOMContentLoaded', () => {
    loadResearch();
});

let cachedResearch = null;

async function loadResearch() {
    if (!cachedResearch) {
        try {
            const response = await fetch('./data/research.json');
            if (!response.ok) {
                throw new Error('Failed to fetch research data');
            }
            cachedResearch = await response.json();
        } catch (error) {
            console.error('Error loading research:', error);
            const container = document.getElementById('research-container');
            if (container) {
                const lang = getCurrentLanguage();
                container.innerHTML = `<p>${lang === 'sv'
                    ? 'Fel vid laddning av forskning. Försök igen senare.'
                    : 'Error loading research. Please try again later.'}</p>`;
            }
            return;
        }
    }

    renderResearch();
}

function renderResearch() {
    if (!Array.isArray(cachedResearch)) {
        return;
    }

    const lang = getCurrentLanguage();
    const localizedResearch = cachedResearch.map(research => mergeLocalizedFields(research, lang));

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
            ? `research.html?slug=${encodeURIComponent(item.slug)}`
            : `research.html?id=${encodeURIComponent(item.id)}`;

        const researchEntry = document.createElement("article");
        researchEntry.className = "project-entry";

        const ctaLabel = lang === 'sv'
            ? `Öppna forskningsdetaljer för ${item.title}`
            : `Open research detail for ${item.title}`;

        const technologiesHtml = Array.isArray(item.technologies) && item.technologies.length > 0
            ? `<ul class="project-tags">${item.technologies.map(tech => `<li>${tech}</li>`).join('')}</ul>`
            : '';

        researchEntry.innerHTML = `
            <div class="project-img-cont">
                <img src="${item.image}" alt="${item.title}" class="project-img">
            </div>
            <div class="project-text-wrapper">
                <p class="date">${formatDate(item.date, lang)}</p>
                <h3 class="project-header">${item.title}</h3>
                <p class="p-description">
                    ${item.description}
                </p>
                ${technologiesHtml}
                <div class="project-card-cta">
                    <a class="project-arrow" href="${detailUrl}" aria-label="${ctaLabel}">
                        <img src="/assets/projects/rightArrow.svg" alt="" aria-hidden="true">
                        <span class="sr-only">${ctaLabel}</span>
                    </a>
                </div>
            </div>
        `;

        container.appendChild(researchEntry);
    });
}

function updateCarousel(research, lang) {
    // You can copy the carousel logic from projects.js if needed
}
