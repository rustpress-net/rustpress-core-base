/**
 * RustPress Enterprise Theme - Navigation
 * Handles header, mobile menu, and dropdown functionality
 */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initHeader();
    initMobileMenu();
    initDropdowns();
    initMobileAccordions();
  }

  /**
   * Header Scroll Effects
   */
  function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY;

      // Add scrolled class
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Hide/show on scroll direction (optional)
      if (scrollY > lastScrollY && scrollY > 200) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    updateHeader();
  }

  /**
   * Mobile Menu Toggle
   */
  function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuClose = document.getElementById('mobile-menu-close');
    const backdrop = mobileMenu?.querySelector('.mobile-menu-backdrop');

    if (!menuToggle || !mobileMenu) return;

    function openMenu() {
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('active');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('active');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (menuClose) {
      menuClose.addEventListener('click', closeMenu);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMenu);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  /**
   * Desktop Dropdown Menus
   */
  function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-dropdown-trigger');
      const menu = dropdown.querySelector('.dropdown-menu, .mega-menu');

      if (!trigger || !menu) return;

      let timeout;

      // Mouse enter
      dropdown.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
        trigger.setAttribute('aria-expanded', 'true');
      });

      // Mouse leave with delay
      dropdown.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => {
          trigger.setAttribute('aria-expanded', 'false');
        }, 150);
      });

      // Keyboard navigation
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          trigger.setAttribute('aria-expanded', !isExpanded);
        }

        if (e.key === 'Escape') {
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });

      // Close on click outside
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /**
   * Mobile Menu Accordions
   */
  function initMobileAccordions() {
    const toggles = document.querySelectorAll('.mobile-nav-toggle');

    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const group = toggle.closest('.mobile-nav-group');
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        // Close other groups
        document.querySelectorAll('.mobile-nav-group.active').forEach(activeGroup => {
          if (activeGroup !== group) {
            activeGroup.classList.remove('active');
            activeGroup.querySelector('.mobile-nav-toggle')?.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current group
        if (isExpanded) {
          group.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          group.classList.add('active');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

})();
