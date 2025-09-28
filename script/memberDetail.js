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

    const member = findMember(members, { slug: slugParam, id: idParam });

    if (!member) {
      renderMissingMember();
      return;
    }

    populateHero(member);
    populateBio(member);
    populateProjects(member, projects);
    document.title = `${member.name} | TEP Profile`;
  } catch (error) {
    console.error('Error loading member profile:', error);
    renderErrorState();
  }
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

function populateHero(member) {
  const photoEl = document.getElementById('member-photo');
  const nameEl = document.getElementById('member-name');
  const titleEl = document.getElementById('member-title');
  const academicEl = document.getElementById('member-academic');
  const focusEl = document.getElementById('member-focus');

  if (photoEl) {
    photoEl.src = member.photo;
    photoEl.alt = `Portrait of ${member.name}`;
  }

  if (nameEl) {
    nameEl.textContent = member.name;
  }

  if (titleEl) {
    titleEl.textContent = member.title || '';
  }

  if (academicEl) {
    academicEl.textContent = `${member.degreeLevel} in ${member.programName} · Year ${member.yearOfStudy}`;
  }

  if (focusEl) {
    focusEl.innerHTML = '';
    if (Array.isArray(member.focusAreas) && member.focusAreas.length > 0) {
      member.focusAreas.forEach(area => {
        const li = document.createElement('li');
        li.textContent = area;
        focusEl.appendChild(li);
      });
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

function populateProjects(member, projects) {
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
      subtitle.textContent = `${member.name} is getting ready to join new initiatives.`;
    }
    const emptyState = document.createElement('p');
    emptyState.className = 'member-projects-empty';
    emptyState.textContent = 'No public projects to display yet.';
    container.appendChild(emptyState);
    return;
  }

  if (subtitle) {
    subtitle.textContent = `${member.name} currently contributes to ${memberProjects.length} project${memberProjects.length > 1 ? 's' : ''}.`;
  }

  memberProjects.forEach(project => {
    const detailUrl = project.slug
      ? `project.html?slug=${encodeURIComponent(project.slug)}`
      : `project.html?id=${encodeURIComponent(project.id)}`;

    const card = document.createElement('a');
    card.className = 'member-project-card';
    card.href = detailUrl;
    card.setAttribute('aria-label', `Read more about ${project.title}`);

    const technologiesHtml = Array.isArray(project.technologies) && project.technologies.length > 0
      ? `<ul class="member-project-tags">${project.technologies.map(tech => `<li>${tech}</li>`).join('')}</ul>`
      : '';

    card.innerHTML = `
      <div class="member-project-image">
        <img src="${project.image}" alt="${project.title}">
      </div>
      <div class="member-project-body">
        <p class="member-project-date">${formatDate(project.date)}</p>
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
    main.innerHTML = `
      <section class="member-missing">
        <h1>Member not found</h1>
        <p>The profile you are looking for is not available. Please return to the <a href="about.html">team page</a>.</p>
      </section>
    `;
  }
}

function renderErrorState() {
  const main = document.querySelector('.member-page');
  if (main) {
    main.innerHTML = `
      <section class="member-missing">
        <h1>Something went wrong</h1>
        <p>We could not load this profile. Please refresh the page or return to the <a href="about.html">team page</a>.</p>
      </section>
    `;
  }
}

document.addEventListener('DOMContentLoaded', loadMemberProfile);

// Reuse date formatting from projects view
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
