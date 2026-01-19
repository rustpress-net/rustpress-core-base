/**
 * RustPress Enterprise Theme - Main JavaScript
 * Handles core functionality and initializations
 */

(function() {
  'use strict';

  // DOM Ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initScrollProgress();
    initBackToTop();
    initSmoothScroll();
    initCodeTabs();
    initThemeToggle();
    initLazyLoading();
    initDashboardZoom();
    initAIPromptCycle();
    initGallerySlider();
  }

  /**
   * Scroll Progress Bar
   */
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /**
   * Back to Top Button
   */
  function initBackToTop() {
    const button = document.getElementById('back-to-top');
    if (!button) return;

    function toggleVisibility() {
      if (window.scrollY > 500) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    }

    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
  }

  /**
   * Smooth Scroll for Anchor Links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update URL
          history.pushState(null, null, href);
        }
      });
    });
  }

  /**
   * Code Tabs
   */
  function initCodeTabs() {
    const tabs = document.querySelectorAll('.code-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        const container = tab.closest('.code-example');

        // Update tabs
        container.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update content
        container.querySelectorAll('.code-block').forEach(block => {
          block.classList.add('hidden');
        });
        const targetBlock = document.getElementById('code-' + tabId);
        if (targetBlock) {
          targetBlock.classList.remove('hidden');
        }
      });
    });
  }

  /**
   * Theme Toggle (Dark/Light Mode)
   */
  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    // Check for saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  /**
   * Lazy Loading Images
   */
  function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px'
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }

  /**
   * AI Prompt Cycling Animation
   */
  function initAIPromptCycle() {
    const prompts = document.querySelectorAll('.ai-prompt');
    if (prompts.length < 2) return;

    let current = 0;

    setInterval(() => {
      prompts[current].classList.remove('active');
      current = (current + 1) % prompts.length;
      prompts[current].classList.add('active');
    }, 2500);
  }

  /**
   * Dashboard Image Cursor-Based Zoom
   */
  function initDashboardZoom() {
    const heroImage = document.querySelector('.hero-image');
    if (!heroImage) return;

    const img = heroImage.querySelector('img');
    if (!img) return;

    let zoomLevel = 1;
    const maxZoom = 3;
    const minZoom = 1;

    heroImage.addEventListener('mousemove', (e) => {
      const rect = heroImage.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      img.style.transformOrigin = `${x}% ${y}%`;
    });

    heroImage.addEventListener('mouseenter', () => {
      zoomLevel = 2;
      img.style.transform = `scale(${zoomLevel})`;
    });

    heroImage.addEventListener('mouseleave', () => {
      zoomLevel = 1;
      img.style.transform = `scale(${zoomLevel})`;
      img.style.transformOrigin = 'center center';
    });

    // Scroll wheel to zoom more
    heroImage.addEventListener('wheel', (e) => {
      e.preventDefault();

      if (e.deltaY < 0) {
        zoomLevel = Math.min(maxZoom, zoomLevel + 0.3);
      } else {
        zoomLevel = Math.max(minZoom, zoomLevel - 0.3);
      }

      img.style.transform = `scale(${zoomLevel})`;
    }, { passive: false });
  }

  /**
   * Gallery Slider for Dashboard Preview
   */
  function initGallerySlider() {
    const slider = document.getElementById('gallery-slider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.gallery-dot');
    const prevBtn = document.querySelector('.gallery-nav--prev');
    const nextBtn = document.querySelector('.gallery-nav--next');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let autoPlayInterval = null;

    function showSlide(index) {
      // Wrap around
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      currentSlide = index;

      // Update slides
      slides.forEach((slide, i) => {
        slide.style.display = i === currentSlide ? 'block' : 'none';
        slide.classList.toggle('active', i === currentSlide);
      });

      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    function prevSlide() {
      showSlide(currentSlide - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    // Event listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        startAutoPlay();
      });
    });

    // Keyboard navigation
    slider.closest('.gallery-container')?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoPlay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoPlay();
      }
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        startAutoPlay();
      }
    }, { passive: true });

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);

    // Initialize
    showSlide(0);
    startAutoPlay();
  }

  /**
   * Utility: Debounce function
   */
  window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * Utility: Throttle function
   */
  window.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

})();
