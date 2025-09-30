/**
 * Team Members Loader
 * Loads team members from JSON and renders them on the page
 */

let cachedMembers = null;

// Load and display members from JSON data
async function loadTeamMembers() {
  const container = document.getElementById('team-members-container');
  if (!container) {
    return;
  }

  if (!cachedMembers) {
    try {
      const response = await fetch('./data/members.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      cachedMembers = await response.json();
    } catch (error) {
      console.error('Error loading team members:', error);
      return;
    }
  }

  renderMembers();
}

function renderMembers() {
  const container = document.getElementById('team-members-container');
  if (!container || !Array.isArray(cachedMembers)) {
    return;
  }

  const lang = getCurrentLanguage();
  const membersToRender = cachedMembers
    .map(member => mergeLocalizedFields(member, lang))
    .sort((a, b) => a.name.localeCompare(b.name, lang === 'sv' ? 'sv' : undefined));

  container.innerHTML = '';

  membersToRender.forEach(member => {
    const memberCard = createMemberCard(member, lang);
    container.appendChild(memberCard);
  });
}

// Create a horizontal member card
function createMemberCard(member, lang) {
  const card = document.createElement('div');
  card.className = 'member-card';

  // Create the HTML structure for the card
  const profileUrl = member.slug
    ? `member.html?slug=${encodeURIComponent(member.slug)}`
    : `member.html?id=${encodeURIComponent(member.id)}`;

  card.innerHTML = `
    <div class="member-image">
      <a href="${profileUrl}">
        <img src="${member.photo}" alt="${member.name}">
      </a>
    </div>
    <div class="member-info">
      <h3>
        <a href="${profileUrl}">${member.name}</a>
      </h3>
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
