let membersCache = null;
let projectsCache = null;
let selectedMemberBase = null;

async function loadMemberProfile() {
  const params = new URLSearchParams(window.location.search);
  const slugParam = params.get('slug');
  const idParam = params.get('id');

  try {
    const [membersResponse, projectsResponse] = await Promise.all([
      fetch('./data/members.json'),
      fetch('./data/projects.json'),
    ]);

    if (!membersResponse.ok || !projectsResponse.ok) {
      throw new Error('Failed to load profile data.');
    }

    const [members, projects] = await Promise.all([
      membersResponse.json(),
      projectsResponse.json(),
    ]);

    membersCache = members;
    projectsCache = projects;

    const member = findMember(members, { slug: slugParam, id: idParam });

    if (!member) {
      renderMissingMember();
      return;
    }

    selectedMemberBase = member;
    renderMemberProfile();
  } catch (error) {
    console.error('Error loading member profile:', error);
    renderErrorState();
  }
}

function renderMemberProfile() {
  if (!selectedMemberBase) {
    return;
  }

  const lang = getCurrentLanguage();
  const localizedMember = mergeLocalizedFields(selectedMemberBase, lang);
  const localizedProjects = Array.isArray(projectsCache)
    ? projectsCache.map(project => mergeLocalizedFields(project, lang))
    : [];

  populateHero(localizedMember, lang);
  populateBio(localizedMember);
  populateProjects(localizedMember, localizedProjects, lang);
  document.title = `${localizedMember.name} | ${lang === 'sv' ? 'TEP Profil' : 'TEP Profile'}`;
}

function findMember(members, { slug, id }) {
  if (slug) {
    const normalizedSlug = slug.toLowerCase();
    const bySlug = members.find(member =>
      member.slug && member.slug.toLowerCase() === normalizedSlug
    );
    if (bySlug) {
      return bySlug;
    }
  }

  if (id) {
    return members.find(member => String(member.id) === String(id));
  }

  return undefined;
}

function populateHero(member, lang) {
  const photoEl = document.getElementById('member-photo');
  const nameEl = document.getElementById('member-name');
  const titleEl = document.getElementById('member-title');
  const academicEl = document.getElementById('member-academic');
  const focusEl = document.getElementById('member-focus');

  if (photoEl) {
    photoEl.src = member.photo;
    photoEl.alt = lang === 'sv'
      ? `Porträtt av ${member.name}`
      : `Portrait of ${member.name}`;
  }

  if (nameEl) {
    nameEl.textContent = member.name;
  }

  if (titleEl) {
    titleEl.textContent = member.title || '';
  }

  if (academicEl) {
    academicEl.textContent = formatMemberAcademicInfo(member, lang);
  }

  if (focusEl) {
    focusEl.innerHTML = '';
    if (Array.isArray(member.focusAreas) && member.focusAreas.length > 0) {
      member.focusAreas.forEach(area => {
        const li = document.createElement('li');
        li.textContent = area;
        focusEl.appendChild(li);
      });
      focusEl.style.display = '';
    } else {
      focusEl.style.display = 'none';
    }
  }
}

function populateBio(member) {
  const bioEl = document.getElementById('member-bio');
  if (bioEl) {
    bioEl.textContent = member.bio || member.description || '';
  }
}

function populateProjects(member, projects, lang) {
  const container = document.getElementById('member-projects');
  const subtitle = document.getElementById('member-projects-subtitle');

  if (!container) {
    return;
  }

  container.innerHTML = '';

  const memberProjects = Array.isArray(member.projects)
    ? projects.filter(project => member.projects.includes(project.id))
    : [];

  if (memberProjects.length === 0) {
    if (subtitle) {
      subtitle.textContent = formatMemberEmptyProjectsMessage(member.name, lang);
    }
    const emptyState = document.createElement('p');
    emptyState.className = 'member-projects-empty';
    emptyState.textContent = formatMemberEmptyProjectsBody(lang);
    container.appendChild(emptyState);
    return;
  }

  if (subtitle) {
    const projectWord = lang === 'sv' ? 'projekt' : `project${memberProjects.length > 1 ? 's' : ''}`;
    const verb = lang === 'sv' ? 'bidrar till' : 'contributes to';
    subtitle.textContent = lang === 'sv'
      ? `${member.name} ${verb} ${memberProjects.length} ${projectWord}.`
      : `${member.name} currently contributes to ${memberProjects.length} ${projectWord}.`;
  }

  memberProjects.forEach(project => {
    const detailUrl = project.slug
      ? `project.html?slug=${encodeURIComponent(project.slug)}`
      : `project.html?id=${encodeURIComponent(project.id)}`;

    const card = document.createElement('a');
    card.className = 'member-project-card';
    card.href = detailUrl;
    const ariaLabel = lang === 'sv'
      ? `Läs mer om ${project.title}`
      : `Read more about ${project.title}`;
    card.setAttribute('aria-label', ariaLabel);

    const technologiesHtml = Array.isArray(project.technologies) && project.technologies.length > 0
      ? `<ul class="member-project-tags">${project.technologies.map(tech => `<li>${tech}</li>`).join('')}</ul>`
      : '';

    card.innerHTML = `
      <div class="member-project-image">
        <img src="${project.image}" alt="${project.title}">
      </div>
      <div class="member-project-body">
        <p class="member-project-date">${formatDate(project.date, lang)}</p>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        ${technologiesHtml}
      </div>
    `;

    container.appendChild(card);
  });
}

function renderMissingMember() {
  const main = document.querySelector('.member-page');
  if (main) {
    const lang = getCurrentLanguage();
    main.innerHTML = `
      <section class="member-missing">
        <h1>${lang === 'sv' ? 'Medlem hittades inte' : 'Member not found'}</h1>
        <p>${lang === 'sv'
          ? 'Profilen du letar efter är inte tillgänglig. Gå tillbaka till <a href="about.html">teamet</a>.'
          : 'The profile you are looking for is not available. Please return to the <a href="about.html">team page</a>.'}</p>
      </section>
    `;
  }
}

function renderErrorState() {
  const main = document.querySelector('.member-page');
  if (main) {
    const lang = getCurrentLanguage();
    main.innerHTML = `
      <section class="member-missing">
        <h1>${lang === 'sv' ? 'Något gick fel' : 'Something went wrong'}</h1>
        <p>${lang === 'sv'
          ? 'Vi kunde inte ladda den här profilen. Uppdatera sidan eller återvänd till <a href="about.html">teamet</a>.'
          : 'We could not load this profile. Please refresh the page or return to the <a href="about.html">team page</a>.'}</p>
      </section>
    `;
  }
}

document.addEventListener('DOMContentLoaded', loadMemberProfile);

window.addEventListener('languagechange', () => {
  renderMemberProfile();
});

// Reuse date formatting from projects view
function formatDate(dateString, lang) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(lang === 'sv' ? 'sv-SE' : undefined, options);
}
