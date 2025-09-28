/**
 * Team Members Loader
 * Loads team members from JSON and renders them on the page
 */

// Load and display members from JSON data
async function loadTeamMembers() {
  try {
    const response = await fetch('./data/members.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const members = await response.json();
    const container = document.getElementById('team-members-container');
    
    if (!container) {
      console.error('Team members container not found!');
      return;
    }
    
    // Clear any existing content
    container.innerHTML = '';

    // sort members by name alphabetically
    members.sort((a, b) => a.name.localeCompare(b.name));
    
    // Create horizontal cards for each member
    members.forEach(member => {
      const memberCard = createMemberCard(member);
      container.appendChild(memberCard);
    });
    
  } catch (error) {
    console.error('Error loading team members:', error);
  }
}

// Create a horizontal member card
function createMemberCard(member) {
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
      <h3 data-lang="member-${member.id}-name">
        <a href="${profileUrl}">${member.name}</a>
      </h3>
      <p class="program-info" data-lang="member-${member.id}-info">
        ${member.degreeLevel} in ${member.programName}, Year ${member.yearOfStudy}
      </p>
      <q data-lang="member-${member.id}-quote">${member.description}</q>
      <div class="project-container">
        <a href="${profileUrl}" class="project-button" data-member="${member.id}">View profile</a>
      </div>
    </div>
  `;
  
  return card;
}

// Load members when page loads
document.addEventListener('DOMContentLoaded', loadTeamMembers);
