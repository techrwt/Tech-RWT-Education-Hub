// Tab Switcher
window.switchSection = function(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => sec.classList.remove('active-section'));

  // Remove active highlight from sidebar items
  const menuItems = document.querySelectorAll('.sidebar ul li');
  menuItems.forEach(item => item.classList.remove('active'));

  // Show target section
  const targetSection = document.getElementById(`section-${sectionName}`);
  if (targetSection) {
    targetSection.classList.add('active-section');
  }

  // Highlight active menu
  const targetMenu = document.getElementById(`menu-${sectionName}`);
  if (targetMenu) {
    targetMenu.classList.add('active');
  }
};

// Toggle Form Visibility
window.toggleAddForm = function() {
  const formBox = document.getElementById('add-answer-form-box');
  if (formBox) {
    formBox.style.display = (formBox.style.display === 'none' || formBox.style.display === '') ? 'block' : 'none';
  }
};

// Logout Function
window.logout = function() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "login.html";
};
