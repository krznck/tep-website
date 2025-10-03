let membersCache = null;
let projectsCache = null;
let selectedMemberBase = null;

async function loadMemberProfile() {
  const params = new URLSearchParams(window.location.search);
  const slugParam = params.get('slug');
  const idParam = params.get('id');

  try {
    // Add timeout to fetch requests
    const timeout = 5000; // 5 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const [membersResponse, projectsResponse, researchResponse] = await Promise.all([
      fetch('./data/members.json', { signal: controller.signal }),
      fetch('./data/projects.json', { signal: controller.signal }),
      fetch('./data/research.json', { signal: controller.signal }),
    ]);

    clearTimeout(timeoutId);

    if (!membersResponse.ok) {
      console.error('Failed to fetch members.json:', membersResponse.status, membersResponse.statusText);
      throw new Error('Failed to load members data.');
    }
    if (!projectsResponse.ok) {
      console.error('Failed to fetch projects.json:', projectsResponse.status, projectsResponse.statusText);
      throw new Error('Failed to load projects data.');
    }
    if (!researchResponse.ok) {
      console.error('Failed to fetch research.json:', researchResponse.status, researchResponse.statusText);
      throw new Error('Failed to load research data.');
    }

    const [members, projects, research] = await Promise.all([
      membersResponse.json(),
      projectsResponse.json(),
      researchResponse.json(),
    ]);

    membersCache = members;
    projectsCache = projects;
    window.researchCache = research;

    let member = findMember(members, { slug: slugParam, id: idParam });
    if (!member) {
      // Try fallback: match by name if slug fails
      if (slugParam) {
        member = members.find(m => m.name && m.name.toLowerCase().replace(/\s+/g, '-') === slugParam.toLowerCase());
      }
    }
    if (!member && members.length > 0) {
      // Fallback: use first member in the list
      member = members[0];
      console.warn('Fallback: using first member in list:', member);
    }
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

  // Count research projects for this member
  const memberResearchCount = Array.isArray(window.researchCache)
    ? window.researchCache.filter(research =>
        Array.isArray(research.students) &&
        research.students.some(student =>
          (student.slug && localizedMember.slug && student.slug === localizedMember.slug) ||
          (student.name && localizedMember.name && student.name === localizedMember.name)
        )
      ).length
    : 0;

  populateHero(localizedMember, lang);
  populateBio(localizedMember);
  populateProjects(localizedMember, localizedProjects, lang);
  populateResearch(localizedMember, window.researchCache, lang);
  
  // Add research count to member's title
  const titleEl = document.getElementById('member-title');
  if (titleEl && titleEl.textContent) {
    const researchText = lang === 'sv'
      ? `${memberResearchCount} forskningsprojekt`
      : `${memberResearchCount} research project${memberResearchCount !== 1 ? 's' : ''}`;
    titleEl.textContent = `${titleEl.textContent} • ${researchText}`;
  }

  document.title = `${localizedMember.name} | ${lang === 'sv' ? 'TEP Profil' : 'TEP Profile'}`;

// Display research projects for the member
function populateResearch(member, researchList, lang) {
  // Debug: log member and research matching
  console.log('Checking research for member:', member.slug, member.name);
  if (Array.isArray(researchList)) {
    researchList.forEach(research => {
      if (Array.isArray(research.students)) {
        research.students.forEach(student => {
          if ((student.slug && member.slug && student.slug === member.slug) ||
              (student.name && member.name && student.name === member.name)) {
            console.log('Matched research:', research.title, 'with student:', student);
          }
        });
      }
    });
  }
  const container = document.getElementById('member-research');
  const subtitle = document.getElementById('member-research-subtitle');

  if (!container) {
    return;
  }

  container.innerHTML = '';

  // Find research projects where this member is listed as a student
  const memberResearch = Array.isArray(researchList)
    ? researchList.filter(research =>
        Array.isArray(research.students) &&
        research.students.some(student =>
          (student.slug && member.slug && student.slug === member.slug) ||
          (student.name && member.name && student.name === member.name)
        )
      )
    : [];

  if (memberResearch.length === 0) {
    if (subtitle) {
      subtitle.textContent = lang === 'sv'
        ? 'Inga forskningsprojekt registrerade.'
        : 'No research projects registered.';
    }
    const emptyState = document.createElement('p');
    emptyState.className = 'member-research-empty';
    emptyState.textContent = lang === 'sv'
      ? 'Denna medlem har inte deltagit i några forskningsprojekt.'
      : 'This member has not participated in any research projects.';
    container.appendChild(emptyState);
    return;
  }

  if (subtitle) {
    const projectWord = lang === 'sv' ? 'forskningsprojekt' : `research project${memberResearch.length > 1 ? 's' : ''}`;
    const verb = lang === 'sv' ? 'bidrar till' : 'currently contributes to';
    subtitle.textContent = lang === 'sv'
      ? `${member.name} ${verb} ${memberResearch.length} ${projectWord}.`
      : `${member.name} currently contributes to ${memberResearch.length} ${projectWord}.`;
  }

  // If only one research, add single-research class for full width
  if (memberResearch.length === 1) {
    container.classList.add('single-research');
  } else {
    container.classList.remove('single-research');
  }

  memberResearch.forEach(research => {
    const detailUrl = `researchDetail.html?id=${encodeURIComponent(research.id)}`;
    const card = document.createElement('a');
    card.className = 'member-research-card';
    card.href = detailUrl;
    // Translation logic for research title and description
    let researchTitle = research.title || '';
    let researchDescription = research.description || '';
    let researchCategory = research.category || '';
    let researchTags = Array.isArray(research.keywords) ? research.keywords : [];
    if (lang === 'sv' && research.translations && research.translations.sv) {
      researchTitle = research.translations.sv.title || researchTitle;
      researchDescription = research.translations.sv.description || researchDescription;
      researchCategory = research.translations.sv.category || researchCategory;
      if (Array.isArray(research.translations.sv.keywords)) {
        researchTags = research.translations.sv.keywords;
      }
    }
    const ariaLabel = lang === 'sv'
      ? `Läs mer om ${researchTitle}`
      : `Read more about ${researchTitle}`;
    card.setAttribute('aria-label', ariaLabel);

    const tagsHtml = researchTags.length > 0
      ? `<ul class="member-project-tags">${researchTags.map(tag => `<li>${tag}</li>`).join('')}</ul>`
      : '';

    const defaultImage = './assets/researchs_pic/placeholder.png';
    card.innerHTML = `
      <div class="member-project-image">
        <img src="${research.image || defaultImage}" alt="${researchTitle}" onerror="this.src='${defaultImage}'">
      </div>
      <div class="member-project-body">
        <p class="member-project-date">${formatDate(research.date, lang)}</p>
        <h3>${researchTitle}</h3>
        <p>${researchDescription}</p>
        <p>${researchCategory}</p>
        ${tagsHtml}
      </div>
    `;
    container.appendChild(card);
  });
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
