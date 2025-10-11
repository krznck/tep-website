let projectCache = null;
let memberCache = null;
let selectedProjectBase = null;

function normalizeMembersPayload(payload) {
  if (Array.isArray(payload)) {
    return { current: payload, alumni: [] };
  }

  if (!payload || typeof payload !== 'object') {
    return { current: [], alumni: [] };
  }

  const current = Array.isArray(payload.current) ? payload.current : [];
  const alumni = Array.isArray(payload.alumni) ? payload.alumni : [];
  return { current, alumni };
}

function flattenMembers(payload) {
  if (!payload) {
    return [];
  }
  return [...payload.current, ...payload.alumni];
}

async function loadProjectPage() {
  const params = new URLSearchParams(window.location.search);
  const slugParam = params.get('slug');
  const idParam = params.get('id');

  try {
    const [projectsResponse, membersResponse] = await Promise.all([
      fetch('./data/projects.json'),
      fetch('./data/members.json'),
    ]);

    if (!projectsResponse.ok || !membersResponse.ok) {
      throw new Error('Failed to fetch project data.');
    }

    const [projects, membersPayload] = await Promise.all([
      projectsResponse.json(),
      membersResponse.json(),
    ]);

    projectCache = projects;
    memberCache = normalizeMembersPayload(membersPayload);

    const project = findProject(projects, { slug: slugParam, id: idParam });

    if (!project) {
      renderMissingProject();
      return;
    }

    selectedProjectBase = project;
    renderProjectPage();
  } catch (error) {
    console.error('Error loading project page:', error);
    renderProjectError();
  }
}

function renderProjectPage() {
  if (!selectedProjectBase) {
    return;
  }

  const lang = getCurrentLanguage();
  const localizedProject = mergeLocalizedFields(selectedProjectBase, lang);
  const localizedMembers = flattenMembers(memberCache).map(member => mergeLocalizedFields(member, lang));

  populateHero(localizedProject, lang);
  populateOverview(localizedProject);
  populateOutcomes(localizedProject, lang);
  populateTeam(localizedProject, localizedMembers, lang);
  document.title = `${localizedProject.title} | ${lang === 'sv' ? 'TEP Projekt' : 'TEP Projects'}`;
}

function findProject(projects, { slug, id }) {
  if (slug) {
    const normalizedSlug = slug.toLowerCase();
    const bySlug = projects.find(project =>
      project.slug && project.slug.toLowerCase() === normalizedSlug
    );
    if (bySlug) {
      return bySlug;
    }
  }

  if (id) {
    return projects.find(project => String(project.id) === String(id));
  }

  return undefined;
}

function populateHero(project, lang) {
  const imageEl = document.getElementById('project-image');
  const titleEl = document.getElementById('project-title');
  const categoryEl = document.getElementById('project-category');
  const dateEl = document.getElementById('project-date');
  const technologiesEl = document.getElementById('project-technologies');

  if (imageEl) {
    imageEl.src = project.image;
    imageEl.alt = lang === 'sv' ? `Bild för ${project.title}` : project.title;
  }

  if (titleEl) {
    titleEl.textContent = project.title;
  }

  if (categoryEl) {
    categoryEl.textContent = project.category || '';
  }

  if (dateEl) {
    dateEl.textContent = formatDate(project.date, lang);
  }

  if (technologiesEl) {
    technologiesEl.innerHTML = '';
    if (Array.isArray(project.technologies) && project.technologies.length > 0) {
      project.technologies.forEach(tech => {
        const li = document.createElement('li');
        li.textContent = tech;
        technologiesEl.appendChild(li);
      });
      technologiesEl.style.display = '';
    } else {
      technologiesEl.style.display = 'none';
    }
  }
}

function populateOverview(project) {
  const overviewEl = document.getElementById('project-overview');
  if (overviewEl) {
    overviewEl.textContent = project.overview || project.description || '';
  }
}

function populateOutcomes(project, lang) {
  const outcomesEl = document.getElementById('project-outcomes');
  if (!outcomesEl) {
    return;
  }

  outcomesEl.innerHTML = '';

  if (Array.isArray(project.outcomes) && project.outcomes.length > 0) {
    project.outcomes.forEach(outcome => {
      const li = document.createElement('li');
      li.textContent = outcome;
      outcomesEl.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = lang === 'sv'
      ? 'Projektresultat läggs till snart.'
      : 'Project outcomes will be added soon.';
    outcomesEl.appendChild(li);
  }
}

function populateTeam(project, members, lang) {
  const teamContainer = document.getElementById('project-team');
  const subtitle = document.getElementById('project-team-subtitle');

  if (!teamContainer) {
    return;
  }

  teamContainer.innerHTML = '';

  const projectMembers = Array.isArray(project.members)
    ? project.members
        .map(memberId => members.find(member => member.id === memberId))
        .filter(Boolean)
    : [];

  if (projectMembers.length === 0) {
    if (subtitle) {
      subtitle.textContent = formatProjectEmptyTeamMessage(lang);
    }
    const empty = document.createElement('p');
    empty.className = 'project-team-empty';
    empty.textContent = formatProjectEmptyTeamBody(lang);
    teamContainer.appendChild(empty);
    return;
  }

  if (subtitle) {
    const teamCount = projectMembers.length;
    const teamDescription = lang === 'sv'
      ? `${teamCount} ${teamCount === 1 ? 'person' : 'personer'} arbetade med det här projektet.`
      : `A ${teamCount}-person team collaborated on this project.`;
    subtitle.textContent = teamDescription;
  }

  projectMembers.forEach(member => {
    const profileUrl = member.slug
      ? `member.html?slug=${encodeURIComponent(member.slug)}`
      : `member.html?id=${encodeURIComponent(member.id)}`;

    const card = document.createElement('a');
    card.className = 'project-team-card';
    card.href = profileUrl;
    const ariaLabel = lang === 'sv'
      ? `Öppna profilen för ${member.name}`
      : `Open profile for ${member.name}`;
    card.setAttribute('aria-label', ariaLabel);

    card.innerHTML = `
      <div class="project-team-photo">
        <img src="${member.photo}" alt="${member.name}">
      </div>
      <div class="project-team-body">
        <h3>${member.name}</h3>
        <p>${member.title || ''}</p>
      </div>
    `;

    teamContainer.appendChild(card);
  });
}

function renderMissingProject() {
  const main = document.querySelector('.project-page');
  if (main) {
    const lang = getCurrentLanguage();
    main.innerHTML = `
      <section class="project-missing">
        <h1>${lang === 'sv' ? 'Projektet hittades inte' : 'Project not found'}</h1>
        <p>${lang === 'sv'
          ? 'Projektet du letar efter är inte tillgängligt. Gå tillbaka till <a href="projects.html">projektgalleriet</a>.'
          : 'The project you are looking for is unavailable. Please head back to the <a href="projects.html">projects gallery</a>.'}</p>
      </section>
    `;
  }
}

function renderProjectError() {
  const main = document.querySelector('.project-page');
  if (main) {
    const lang = getCurrentLanguage();
    main.innerHTML = `
      <section class="project-missing">
        <h1>${lang === 'sv' ? 'Något gick fel' : 'Something went wrong'}</h1>
        <p>${lang === 'sv'
          ? 'Vi kunde inte ladda det här projektet. Uppdatera sidan eller återvänd till <a href="projects.html">projektgalleriet</a>.'
          : 'We could not load this project. Please refresh the page or return to the <a href="projects.html">projects gallery</a>.'}</p>
      </section>
    `;
  }
}

document.addEventListener('DOMContentLoaded', loadProjectPage);

window.addEventListener('languagechange', () => {
  renderProjectPage();
});

function formatDate(dateString, lang) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(lang === 'sv' ? 'sv-SE' : undefined, options);
}
