export function renderHeader(activePage = 'home') {
  const headerHtml = `
    <header class="site-header">
      <div class="container">
        <a href="index.html" class="logo">
          <i data-lucide="package" style="color: var(--color-accent); width: 28px; height: 28px;"></i>
          SwiftTrack
        </a>
        
        <nav class="nav-links">
          <a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
          <a href="about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
          <a href="services.html" class="nav-link ${activePage === 'services' ? 'active' : ''}">Services</a>
          <a href="contact.html" class="nav-link ${activePage === 'contact' ? 'active' : ''}">Contact</a>
          <a href="track.html" class="btn btn-primary">Track Package</a>
        </nav>

        <button class="mobile-menu-btn" id="mobileMenuBtn">
          <i data-lucide="menu"></i>
        </button>
      </div>
    </header>
  `;

  document.getElementById('header-placeholder').innerHTML = headerHtml;

  // Initialize icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = navLinks.classList.contains('active') ? 'x' : 'menu';
      mobileMenuBtn.innerHTML = `<i data-lucide="${icon}"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }
}
