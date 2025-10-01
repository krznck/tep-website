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
  const card = document.createElement('a');
  card.className = 'member-card';

  const profileUrl = member.slug
    ? `member.html?slug=${encodeURIComponent(member.slug)}`
    : `member.html?id=${encodeURIComponent(member.id)}`;

  card.href = profileUrl;
  const ariaLabel = lang === 'sv'
    ? `Öppna ${member.name}s profil`
    : `Open ${member.name}'s profile`;
  card.setAttribute('aria-label', ariaLabel);

  card.innerHTML = `
    <div class="member-image">
      <img src="${member.photo}" alt="${member.name}">
    </div>
    <div class="member-info">
      <h3>${member.name}</h3>
      <p class="program-info">
        ${formatMemberAcademicInfo(member, lang)}
      </p>
      <q>${member.description}</q>
      <span class="member-card-cta">${lang === 'sv' ? 'Visa profil →' : 'View profile →'}</span>
    </div>
  `;

  return card;
}

// Load members when page loads
document.addEventListener('DOMContentLoaded', loadTeamMembers);

window.addEventListener('languagechange', () => {
  renderMembers();
});
