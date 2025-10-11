/**
 * Team Members Loader
 * Loads team members from JSON and renders them on the page
 */

let cachedMembers = null;

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

// Load and display members from JSON data
async function loadTeamMembers() {
  if (!cachedMembers) {
    try {
      const response = await fetch('./data/members.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const payload = await response.json();
      cachedMembers = normalizeMembersPayload(payload);
    } catch (error) {
      console.error('Error loading team members:', error);
      return;
    }
  }

  renderMembers();
}

function renderMembers() {
  const currentContainer = document.getElementById('team-members-container');
  const alumniContainer = document.getElementById('team-alumni-container');

  if (!currentContainer && !alumniContainer) {
    return;
  }

  const lang = getCurrentLanguage();
  const { current = [], alumni = [] } = cachedMembers || { current: [], alumni: [] };
  const currentMembers = current.map(member => mergeLocalizedFields(member, lang));
  const alumniMembers = alumni.map(member => mergeLocalizedFields(member, lang));

  currentMembers.sort((a, b) => a.name.localeCompare(b.name, lang === 'sv' ? 'sv' : undefined));
  alumniMembers.sort((a, b) => a.name.localeCompare(b.name, lang === 'sv' ? 'sv' : undefined));

  if (currentContainer) {
    currentContainer.innerHTML = '';

    if (!currentMembers.length) {
      const empty = document.createElement('p');
      empty.className = 'team-empty';
      empty.setAttribute('data-lang', 'team-empty-current');
      empty.textContent = lang === 'sv'
        ? 'Inga aktiva medlemmar att visa just nu.'
        : 'No active members to show right now.';
      currentContainer.appendChild(empty);
    } else {
      currentMembers.forEach(member => {
        const memberCard = createMemberCard(member, lang, { isAlumni: false });
        currentContainer.appendChild(memberCard);
      });
    }
  }

  if (alumniContainer) {
    alumniContainer.innerHTML = '';

    if (!alumniMembers.length) {
      const empty = document.createElement('p');
      empty.className = 'team-empty team-empty--alumni';
      empty.setAttribute('data-lang', 'team-empty-alumni');
      empty.textContent = lang === 'sv'
        ? 'Alumner presenteras snart.'
        : 'Alumni will be listed soon.';
      alumniContainer.appendChild(empty);
    } else {
      alumniMembers.forEach(member => {
        const memberCard = createMemberCard(member, lang, { isAlumni: true });
        alumniContainer.appendChild(memberCard);
      });
    }
  }
}

// Create a horizontal member card
function createMemberCard(member, lang, options = {}) {
  const { isAlumni = false } = options;

  const card = document.createElement('div');
  card.className = isAlumni ? 'member-card member-card--alumni' : 'member-card';

  // Create the HTML structure for the card
  const profileUrl = member.slug
    ? `member.html?slug=${encodeURIComponent(member.slug)}`
    : `member.html?id=${encodeURIComponent(member.id)}`;

  const badge = isAlumni
    ? `<span class="member-status-badge" data-lang="team-alumni-badge">${lang === 'sv' ? 'Alumn' : 'Alumni'}</span>`
    : '';

  card.innerHTML = `
    <div class="member-image">
      <a href="${profileUrl}">
        <img src="${member.photo}" alt="${member.name}">
      </a>
    </div>
    <div class="member-info">
      <div class="member-info__top">
        <h3>
          <a href="${profileUrl}">${member.name}</a>
        </h3>
        ${badge}
      </div>
      <p class="program-info">
        ${formatMemberAcademicInfo(member, lang)}
      </p>
      <q>${member.description}</q>
      <div class="project-container">
        <a href="${profileUrl}" class="project-button" data-member="${member.id}">
          ${lang === 'sv' ? 'Visa profil' : 'View profile'}
        </a>
      </div>
    </div>
  `;

  return card;
}

// Load members when page loads
document.addEventListener('DOMContentLoaded', loadTeamMembers);

window.addEventListener('languagechange', () => {
  renderMembers();
});
