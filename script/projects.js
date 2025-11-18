document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});

let cachedProjects = null;

async function loadProjects() {
    if (!cachedProjects) {
        try {
            const response = await fetch('./data/projects.json');
            if (!response.ok) {
                throw new Error('Failed to fetch projects data');
            }
            cachedProjects = await response.json();
        } catch (error) {
            console.error('Error loading projects:', error);
            const container = document.getElementById('project-container');
            if (container) {
                const lang = getCurrentLanguage();
                container.innerHTML = `<p>${lang === 'sv'
                    ? 'Fel vid laddning av projekt. Försök igen senare.'
                    : 'Error loading projects. Please try again later.'}</p>`;
            }
            return;
        }
    }

    renderProjects();
}

function renderProjects() {
    if (!Array.isArray(cachedProjects)) {
        return;
    }

    const lang = getCurrentLanguage();
    const localizedProjects = cachedProjects.map(project => mergeLocalizedFields(project, lang));

    createProjectEntries(localizedProjects, lang);
    updateProjectsHero(localizedProjects, lang);
}

// Function to format date for display
function formatDate(dateString, lang) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(lang === 'sv' ? 'sv-SE' : undefined, options);
}

// Create project entries in the main container
function createProjectEntries(projects, lang) {
    const container = document.getElementById("project-container");
    if (!container) return;
    
    container.innerHTML = "";

    projects.forEach(project => {
        const detailUrl = project.slug
            ? `project.html?slug=${encodeURIComponent(project.slug)}`
            : `project.html?id=${encodeURIComponent(project.id)}`;

        const projectEntry = document.createElement("article");
        projectEntry.className = "project-entry";

        const ctaLabel = lang === 'sv'
            ? `Öppna projektdetaljer för ${project.title}`
            : `Open project detail for ${project.title}`;

        const technologiesHtml = Array.isArray(project.technologies) && project.technologies.length > 0
            ? `<ul class="project-tags">${project.technologies.map(tech => `<li>${tech}</li>`).join('')}</ul>`
            : '';

        projectEntry.innerHTML = `
            <div class="project-img-cont">
                <img src="${project.image}" alt="${project.title}" class="project-img">
            </div>
            <div class="project-text-wrapper">
                <p class="date">${formatDate(project.date, lang)}</p>
                <h3 class="project-header">${project.title}</h3>
                <p class="p-description">
                    ${project.description}
                </p>
                ${technologiesHtml}
                <div class="project-card-cta">
                    <a class="project-arrow" href="${detailUrl}" aria-label="${ctaLabel}">
                        <img src="assets/projects/rightArrow.svg" alt="" aria-hidden="true">
                        <span class="sr-only">${formatProjectCardCta(lang)}</span>
                    </a>
                </div>
            </div>
        `;

        container.appendChild(projectEntry);
    });
}

function updateProjectsHero(projects, lang) {
    const activeCountEl = document.getElementById('project-active-count');
    if (activeCountEl) {
        activeCountEl.textContent = projects.length.toString();
    }

    const memberIds = new Set();
    projects.forEach(project => {
        if (Array.isArray(project.members)) {
            project.members.forEach(memberId => memberIds.add(memberId));
        }
    });
    const memberCountEl = document.getElementById('project-member-count');
    if (memberCountEl) {
        memberCountEl.textContent = memberIds.size > 0 ? memberIds.size.toString() : '—';
    }

    const datedProjects = projects
        .filter(project => Boolean(project.date))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const latestNameEl = document.getElementById('project-latest-name');
    const latestDateEl = document.getElementById('project-latest-date');
    if (datedProjects.length > 0 && latestNameEl && latestDateEl) {
        const latestProject = datedProjects[0];
        latestNameEl.textContent = latestProject.title;
        latestDateEl.textContent = formatDate(latestProject.date, lang);
    } else if (latestNameEl && latestDateEl) {
        latestNameEl.textContent = lang === 'sv' ? 'Uppdateras' : 'Updating';
        latestDateEl.textContent = lang === 'sv' ? 'Snart tillgängligt' : 'Available soon';
    }

    const focusAreas = Array.from(
        new Set(
            projects
                .map(project => project.category)
                .filter(Boolean)
        )
    );
    const focusList = document.getElementById('project-focus-areas');
    if (focusList) {
        focusList.innerHTML = '';
        if (focusAreas.length === 0) {
            const fallbackItem = document.createElement('li');
            fallbackItem.textContent = lang === 'sv' ? 'Detaljer kommer snart' : 'Details coming soon';
            focusList.appendChild(fallbackItem);
            return;
        }

        focusAreas.forEach(area => {
            const li = document.createElement('li');
            li.textContent = area;
            focusList.appendChild(li);
        });
    }
}

window.addEventListener('languagechange', () => {
    renderProjects();
});
