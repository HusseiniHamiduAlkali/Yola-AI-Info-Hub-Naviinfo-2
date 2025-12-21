// A global variable to store the original PC layout HTML for reliable reversion.
let originalPCLayout = null;

function renderNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'navbar';

  // Create the auth buttons container that will be reused
  let authButtonsHTML = `
    <div class="navbar-auth" id="navbar-auth">
      <span class="login-suggestion" style="align-content: center; margin-right: 30px;">Please login for a more personalised experience!</span> 
      <button id="signin-btn" class="auth-btn" type="button">Sign in</button>
      <button id="signup-btn" class="auth-btn" type="button">Sign up</button>
    </div>
  `;
  // If user is signed in, show username and logout button
  if (window.currentUser && window.currentUser.username) {
    authButtonsHTML = `
      <div class="navbar-auth" id="navbar-auth" style="display:flex;align-items:center;gap:0.7rem;">
      <!--  <span class="navbar-username" style="font-weight:600;color:#205080;font-size:1.08rem;">${window.currentUser.username}</span>   -->
        <button id="logout-btn" class="auth-btn" onclick="window.logoutUser()">Logout</button>
      </div>
    `;
  }

  const logoHTML = `
    <div class="navbar-logo-area">
      <div class="navbar-logo-placeholder"><img src=Data/Images/jippujam.jpg style="overflow: hidden;object-fit: fill;width: 100%;height: 100%; border-radius:12px;"></div>
    </div>
    <span class="navbar-appname">Yola AI Info Hub</span>
  `;

  nav.innerHTML = `
    <div class="navbar-container">
      <div class="navbar-left">
        ${logoHTML}
      </div>
      <div class="hamburger" id="hamburger">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </div>
      <div class="navbar-right">
        <div class="navbar-top-section">
          <div class="navbar-username-container" id="navbar-username-container">
            ${window.currentUser && window.currentUser.username ? `
              <a href="/pages/profile.html?u=${encodeURIComponent(window.currentUser.username)}" class="navbar-profile-link" id="navbar-profile-link">
                <span class="navbar-avatar" id="navbar-avatar">${window.currentUser.avatar ? `<img src="${window.currentUser.avatar}" alt="avatar"/>` : ''}</span>
                <span class="navbar-names">
                  <span class="navbar-fullname">${window.currentUser.name || ''}</span>
                  <span class="navbar-username-text">(@${window.currentUser.username})</span>
                </span>
              </a>
            ` : ''}
          </div>
          ${authButtonsHTML}
        </div>
        <ul class="navbar-links">
          <li><button onclick="window.loadSection('home')">Home</button></li>
          <li><button onclick="window.loadSection('eduinfo')">EduInfo</button></li>
          <li><button onclick="window.loadSection('ecoinfo')">EcoInfo</button></li>
          <li><button onclick="window.loadSection('agroinfo')">AgroInfo</button></li>
          <li><button onclick="window.loadSection('mediinfo')">MediInfo</button></li>
          <li><button onclick="window.loadSection('naviinfo')">NaviInfo</button></li>
          <li><button onclick="window.loadSection('communityinfo')">CommunityInfo</button></li>
          <li><button onclick="window.loadSection('serviinfo')">ServiInfo</button></li>
          <li><button onclick="window.loadSection('aboutinfo')">About</button></li>
        </ul>
      </div>
    </div>
  `;
  
  // Wire up auth button events after DOM is in place
  setTimeout(() => {
    const signinBtn = document.getElementById('signin-btn');
    const signupBtn = document.getElementById('signup-btn');
    if (signinBtn) signinBtn.onclick = () => window.location.href = '/pages/signin.html';
    if (signupBtn) signupBtn.onclick = () => window.location.href = '/pages/signup.html';
  }, 0);

  document.getElementById('navbar').innerHTML = ''; // Clear existing content
  document.getElementById('navbar').appendChild(nav);

  // Store the original PC layout HTML to revert to it later
  originalPCLayout = nav.innerHTML;

  // Main function to handle all responsive layouts
  function handleResponsiveLayout() {
    const windowWidth = window.innerWidth;
    const navbarContainer = document.querySelector('.navbar-container');
    
    // Restore to original PC layout before making any changes
    if (originalPCLayout) {
      document.querySelector('.navbar').innerHTML = originalPCLayout;
    }

    // Re-select elements after innerHTML change
    const newNavbarContainer = document.querySelector('.navbar-container');
    const newNavbarLeft = document.querySelector('.navbar-left');
    const newNavbarRight = document.querySelector('.navbar-right');
    const newNavbarAuth = document.querySelector('.navbar-auth');
    const newNavbarLinks = document.querySelector('.navbar-links');
    const newHamburger = document.getElementById('hamburger');
    
    // Apply common styles using JS
    newNavbarContainer.style.display = '';
    newNavbarContainer.style.alignItems = '';
    newNavbarContainer.style.padding = '';
    
    newNavbarLeft.style.display = 'flex';
    newNavbarLeft.style.alignItems = 'center';
    
    newNavbarRight.style.display = 'flex';
    newNavbarRight.style.alignItems = 'flex-end';
    newNavbarLinks.style.display = 'flex';

    // Logic for different screen sizes
    if (windowWidth > 1150) {
      // PC View
      newNavbarContainer.style.justifyContent = '';
      newHamburger.style.display = 'none';
      newNavbarRight.style.display = 'flex';
      // If user is signed in, show only username and logout button
      if (window.currentUser && window.currentUser.username) {
        const navbarAuth = document.getElementById('navbar-auth');
        if (navbarAuth) {
          navbarAuth.style.display = 'flex';
          navbarAuth.style.alignItems = 'center';
        }
      }

    } else if (windowWidth >= 701 && windowWidth <= 1150) {
      // Tablet View
      newNavbarContainer.style.flexDirection = 'column';
      newNavbarContainer.style.justifyContent = 'flex-start';
      newNavbarContainer.style.alignItems = 'flex-start';
      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.justifyContent = 'space-between';
      topRow.style.width = '100%';
      topRow.style.marginBottom = '0.5rem';
      // Move logo and app name to the top row
      topRow.appendChild(newNavbarLeft);
      // Move auth buttons to the top row
      topRow.appendChild(newNavbarAuth);
      // The newNavbarLinks element is now the bottom row
      newNavbarLinks.style.width = '';
      newNavbarLinks.style.justifyContent = '';
      // Rebuild the container with the two rows
      newNavbarContainer.innerHTML = '';
      newNavbarContainer.appendChild(topRow);
      newNavbarContainer.appendChild(newNavbarLinks);
      newHamburger.style.display = 'none';
      // If user is signed in, show only username and logout button
      if (window.currentUser && window.currentUser.username) {
        const navbarAuth = document.getElementById('navbar-auth');
        if (navbarAuth) {
          navbarAuth.style.display = 'flex';
          navbarAuth.style.alignItems = 'center';
        }
      }
      
    } else {
      // Mobile View
      newNavbarContainer.style.justifyContent = '';
      newNavbarContainer.style.flexDirection = ''; // Ensure row layout
      newNavbarContainer.style.alignItems = '';

      newNavbarLeft.style.display = 'flex';
      newNavbarLeft.style.alignItems = 'center';

      newNavbarRight.style.display = 'flex';
      newNavbarRight.style.flexDirection = 'column';
      newNavbarRight.style.alignItems = 'flex-end';
      //newNavbarRight.style.marginRight = '10px';

      newNavbarLinks.style.display = 'none'; // Hide navbar links

      // Adjust auth buttons
      newNavbarAuth.style.display = '';
      newNavbarAuth.style.flexDirection = '';
      newNavbarAuth.style.alignItems = '';
      newNavbarAuth.style.marginRight = '';

      // Place hamburger spans below auth buttons
      newHamburger.style.display = '';
      newHamburger.style.flexDirection = ''; // Ensure spans are stacked vertically
      newHamburger.style.alignItems = '';
      newHamburger.style.marginTop = '';
      newHamburger.style.marginLeft = '';

      // Style the hamburger lines
      const lines = newHamburger.querySelectorAll('.hamburger-line');
      lines.forEach(line => {
          line.style.display = 'block';
          line.style.height = '3px';
          line.style.width = '30px';
          line.style.background = '#fff';
          line.style.borderRadius = '5px';
          line.style.margin = '0';
      });

      // Clear and rebuild the navbar container
      newNavbarContainer.innerHTML = '';
      newNavbarContainer.appendChild(newNavbarLeft); // Add logo and app name
      const rightContainer = document.createElement('div');
      rightContainer.style.display = 'flex';
      rightContainer.style.flexDirection = 'column';
      rightContainer.style.alignItems = 'flex-end';
      rightContainer.style.marginRight = '10px';
      rightContainer.appendChild(newNavbarAuth); // Add auth buttons
      rightContainer.appendChild(newHamburger); // Add hamburger spans
      newNavbarContainer.appendChild(rightContainer);
    }

    // Add event listener for the hamburger menu toggle (mobile)
    newHamburger.onclick = (e) => {
      e.stopPropagation();
      let mobileMenu = document.querySelector('.mobile-menu');
      if (!mobileMenu) {
        // Create mobile menu overlay
        mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // Add click outside handler
        const closeOnClickOutside = (event) => {
          if (mobileMenu && !mobileMenu.contains(event.target) && !newHamburger.contains(event.target)) {
            mobileMenu.classList.remove('show');
            setTimeout(() => {
              mobileMenu.remove();
              document.removeEventListener('click', closeOnClickOutside);
            }, 300);
          }
        };
        document.addEventListener('click', closeOnClickOutside);
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-menu-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
          mobileMenu.classList.remove('show');
          setTimeout(() => mobileMenu.remove(), 300);
        };
        mobileMenu.appendChild(closeBtn);
        // Menu links
        const linksList = document.createElement('ul');
        linksList.className = 'mobile-links';
        [
          { name: 'Home', section: 'home' },
          { name: 'EduInfo', section: 'eduinfo' },
          { name: 'EcoInfo', section: 'ecoinfo' },
          { name: 'AgroInfo', section: 'agroinfo' },
          { name: 'MediInfo', section: 'mediinfo' },
          { name: 'NaviInfo', section: 'naviinfo' },
          { name: 'CommunityInfo', section: 'communityinfo' },
          { name: 'ServiInfo', section: 'serviinfo' },
          { name: 'About', section: 'aboutinfo' }
        ].forEach(link => {
          const li = document.createElement('li');
          const btn = document.createElement('button');
          btn.textContent = link.name;
          // Check if this is the current section
          const currentSection = localStorage.getItem('currentSection') || 'home';
          if (
            (currentSection === 'aboutinfo' && link.name === 'About') ||
            (currentSection === link.section) ||
            (currentSection === 'home' && link.name === 'Home')
          ) {
            btn.classList.add('active');
          }
          btn.onclick = () => {
            window.loadSection(link.section);
            window.highlightActiveNav(link.section);
            mobileMenu.classList.remove('show');
            setTimeout(() => mobileMenu.remove(), 300);
          };
          li.appendChild(btn);
          linksList.appendChild(li);
        });
        mobileMenu.appendChild(linksList);
        document.body.appendChild(mobileMenu);
        setTimeout(() => mobileMenu.classList.add('show'), 10);
      } else {
        mobileMenu.classList.add('show');
      }
    };
    
  }

  // Initial call to set the layout on page load
  handleResponsiveLayout();

  // Listen for window resize events
  window.addEventListener('resize', handleResponsiveLayout);

  // Highlight active section
  window.highlightActiveNav = function(section) {
    // Default to home if no section provided
    if (!section || section === '' || section === 'index.html') {
      section = 'home';
    }

    // Store current section in localStorage
    localStorage.setItem('currentSection', section);

    // Helper function to highlight a button if it matches current section
    const highlightButton = (btn) => {
      btn.classList.remove('active');
      const btnText = btn.textContent.trim();
      const btnSection = btnText.toLowerCase() + (btnText.toLowerCase().endsWith('info') ? '' : 'info');
      
      if (
        (section === 'aboutinfo' && btnText === 'About') ||
        btnSection === section ||
        (section === 'home' && btnText === 'Home')
      ) {
        btn.classList.add('active');
      }
    };

    // Highlight in both desktop and mobile menus
    document.querySelectorAll('.navbar-links button, .mobile-links button').forEach(highlightButton);
  };
}

// Export as Navbar global for compatibility
window.Navbar = {
  render: () => {
    renderNavbar();
  }
};