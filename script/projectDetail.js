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

    const [projects, members] = await Promise.all([
      projectsResponse.json(),
      membersResponse.json(),
    ]);

    const project = findProject(projects, { slug: slugParam, id: idParam });

    if (!project) {
      renderMissingProject();
      return;
    }

    populateHero(project);
    populateOverview(project);
    populateOutcomes(project);
    populateTeam(project, members);
    document.title = `${project.title} | TEP Projects`;
  } catch (error) {
    console.error('Error loading project page:', error);
    renderProjectError();
  }
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

function populateHero(project) {
  const imageEl = document.getElementById('project-image');
  const titleEl = document.getElementById('project-title');
  const categoryEl = document.getElementById('project-category');
  const dateEl = document.getElementById('project-date');
  const technologiesEl = document.getElementById('project-technologies');

  if (imageEl) {
    imageEl.src = project.image;
    imageEl.alt = project.title;
  }

  if (titleEl) {
    titleEl.textContent = project.title;
  }

  if (categoryEl) {
    categoryEl.textContent = project.category || '';
  }

  if (dateEl) {
    dateEl.textContent = formatDate(project.date);
  }

  if (technologiesEl) {
    technologiesEl.innerHTML = '';
    if (Array.isArray(project.technologies) && project.technologies.length > 0) {
      project.technologies.forEach(tech => {
        const li = document.createElement('li');
        li.textContent = tech;
        technologiesEl.appendChild(li);
      });
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

function populateOutcomes(project) {
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
    outcomesEl.innerHTML = '<li>Project outcomes will be added soon.</li>';
  }
}

function populateTeam(project, members) {
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
      subtitle.textContent = 'This project is currently open for new contributors.';
    }
    const empty = document.createElement('p');
    empty.className = 'project-team-empty';
    empty.textContent = 'No team members listed for this project yet.';
    teamContainer.appendChild(empty);
    return;
  }

  if (subtitle) {
    subtitle.textContent = `A ${projectMembers.length}-person team collaborated on this project.`;
  }

  projectMembers.forEach(member => {
    const profileUrl = member.slug
      ? `member.html?slug=${encodeURIComponent(member.slug)}`
      : `member.html?id=${encodeURIComponent(member.id)}`;

    const card = document.createElement('a');
    card.className = 'project-team-card';
    card.href = profileUrl;
    card.setAttribute('aria-label', `Open profile for ${member.name}`);

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
    main.innerHTML = `
      <section class="project-missing">
        <h1>Project not found</h1>
        <p>The project you are looking for is unavailable. Please head back to the <a href="projects.html">projects gallery</a>.</p>
      </section>
    `;
  }
}

function renderProjectError() {
  const main = document.querySelector('.project-page');
  if (main) {
    main.innerHTML = `
      <section class="project-missing">
        <h1>Something went wrong</h1>
        <p>We could not load this project. Please refresh the page or return to the <a href="projects.html">projects gallery</a>.</p>
      </section>
    `;
  }
}

document.addEventListener('DOMContentLoaded', loadProjectPage);

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
