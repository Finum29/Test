// auth.js - Authentication and navigation management
document.addEventListener('DOMContentLoaded', async () => {
  await refreshNav();
});

async function refreshNav() {
  try {
    const response = await fetch('/session');
    const data = await response.json();

    const navAuth = document.querySelector('.nav-auth');
    const navAdmin = document.querySelector('.nav-admin');
    const navChat = document.querySelector('.nav-chat');
    const navTickets = document.querySelector('.nav-tickets');
    const navUser = document.querySelector('.nav-user');

    if (data.loggedIn) {
      // Hide login/signup buttons
      const loginBtn = document.querySelector('.nav-login');
      const signupBtn = document.querySelector('.nav-signup');
      if (loginBtn) loginBtn.style.display = 'none';
      if (signupBtn) signupBtn.style.display = 'none';

      // Show user info
      if (navUser) {
        navUser.textContent = data.user.username;
        navUser.style.display = 'inline';
      }

      // Show admin panel link if admin
      if (navAdmin && data.user.isAdmin) {
        navAdmin.style.display = 'inline-block';
      }

      // Show chat link
      if (navChat) {
        navChat.style.display = 'inline-block';
      }

      // Show tickets link
      if (navTickets) {
        navTickets.style.display = 'inline-block';
      }

      // Show team buttons
      const createTeamBtn = document.querySelector('.nav-create-team');
      const joinTeamBtn = document.querySelector('.nav-join-team');
      const viewTeamBtn = document.querySelector('.nav-view-team');

      if (data.user.teamId) {
        if (createTeamBtn) createTeamBtn.style.display = 'none';
        if (joinTeamBtn) joinTeamBtn.style.display = 'none';
        if (viewTeamBtn) {
          viewTeamBtn.style.display = 'inline-block';
          viewTeamBtn.onclick = () => window.location.href = 'undersites/team-management.html';
        }
      } else {
        if (createTeamBtn) {
          createTeamBtn.style.display = 'inline-block';
          createTeamBtn.onclick = showCreateTeamModal;
        }
        if (joinTeamBtn) {
          joinTeamBtn.style.display = 'inline-block';
          joinTeamBtn.onclick = openJoinTeamModal;
        }
        if (viewTeamBtn) viewTeamBtn.style.display = 'none';
      }

      // Show logout button
      const logoutBtn = document.querySelector('.nav-logout');
      if (logoutBtn) {
        logoutBtn.style.display = 'inline-block';
        logoutBtn.onclick = logout;
      }

      // Check if banned
      if (data.user.status === 'banned') {
        alert('Your account has been banned. You will be logged out.');
        await logout();
      }

      // Check if suspended
      if (data.user.status === 'suspended') {
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
          card.style.opacity = '0.5';
          card.style.pointerEvents = 'none';
        });
      }
    } else {
      // Show login/signup buttons
      const loginBtn = document.querySelector('.nav-login');
      const signupBtn = document.querySelector('.nav-signup');
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (signupBtn) signupBtn.style.display = 'inline-block';

      // Hide user elements
      if (navUser) navUser.style.display = 'none';
      if (navAdmin) navAdmin.style.display = 'none';
      if (navChat) navChat.style.display = 'none';
      if (navTickets) navTickets.style.display = 'none';
      
      const createTeamBtn = document.querySelector('.nav-create-team');
      const joinTeamBtn = document.querySelector('.nav-join-team');
      const viewTeamBtn = document.querySelector('.nav-view-team');
      const logoutBtn = document.querySelector('.nav-logout');
      
      if (createTeamBtn) createTeamBtn.style.display = 'none';
      if (joinTeamBtn) joinTeamBtn.style.display = 'none';
      if (viewTeamBtn) viewTeamBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Error refreshing nav:', error);
  }
}

async function logout() {
  try {
    await fetch('/logout');
    window.location.href = '/index.html';
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

function showCreateTeamModal() {
  const name = prompt('Enter team name:');
  if (!name) return;

  const description = prompt('Enter team description (optional):') || '';
  const motto = prompt('Enter team motto (optional):') || '';

  createTeam(name, description, motto);
}

async function createTeam(name, description, motto) {
  try {
    const response = await fetch('/teams/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, motto })
    });

    const data = await response.json();

    if (data.ok) {
      alert(`Team "${name}" created successfully!\nInvite Code: ${data.team.inviteCode}\n\nShare this code with your friends to invite them!`);
      await refreshNav();
      window.location.href = 'undersites/team-management.html';
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error creating team:', error);
    alert('Failed to create team');
  }
}

async function viewTeam(teamId) {
  try {
    const response = await fetch(`/teams/${teamId}`);
    const data = await response.json();

    if (data.ok) {
      displayTeam(data.team);
    } else {
      alert('Failed to load team');
    }
  } catch (error) {
    console.error('Error viewing team:', error);
  }
}

function displayTeam(team) {
  const teamDisplay = document.getElementById('teamDisplay');
  if (!teamDisplay) return;

  const membersHTML = team.memberDetails.map(member => `
    <div class="member-card ${member.isCaptain ? 'captain' : ''}">
      <p>${member.username}</p>
      ${member.isCaptain ? '<small>Captain</small>' : ''}
    </div>
  `).join('');

  teamDisplay.innerHTML = `
    <div class="team-container">
      <div class="team-header">
        <h2>${team.name}</h2>
        <p>${team.description}</p>
        ${team.motto ? `<p><em>"${team.motto}"</em></p>` : ''}
      </div>
      <div class="team-members">
        ${membersHTML}
      </div>
      <div class="invite-section">
        <h3>Invite Code</h3>
        <div class="invite-code">${team.inviteCode}</div>
        <p>Share this code with players to join your team</p>
      </div>
    </div>
  `;

  teamDisplay.scrollIntoView({ behavior: 'smooth' });
}