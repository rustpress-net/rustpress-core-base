/**
 * RustPress Enterprise Theme - Animations
 * Scroll-triggered animations using Intersection Observer
 */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initScrollAnimations();
    initStaggerAnimations();
    initParallax();
    initTypewriter();
  }

  /**
   * Scroll-Triggered Animations
   */
  function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');
    if (!elements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add delay if specified
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, parseInt(delay));

          // Unobserve after animation (one-time)
          if (!entry.target.dataset.animateRepeat) {
            observer.unobserve(entry.target);
          }
        } else if (entry.target.dataset.animateRepeat) {
          entry.target.classList.remove('animated');
        }
      });
    }, observerOptions);

    elements.forEach(el => observer.observe(el));
  }

  /**
   * Staggered Children Animations
   */
  function initStaggerAnimations() {
    const containers = document.querySelectorAll('[data-animate-stagger]');
    if (!containers.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -5% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    containers.forEach(container => observer.observe(container));
  }

  /**
   * Parallax Effects
   */
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;

      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;

        if (inView) {
          const offset = (scrollY - el.offsetTop) * speed;
          el.style.transform = `translateY(${offset}px)`;
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Typewriter Effect
   */
  function initTypewriter() {
    const typewriters = document.querySelectorAll('.typewriter');
    if (!typewriters.length) return;

    typewriters.forEach(el => {
      const text = el.textContent;
      const speed = parseInt(el.dataset.speed) || 50;

      // Only animate if in viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateTypewriter(el, text, speed);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(el);
    });
  }

  function animateTypewriter(element, text, speed) {
    element.textContent = '';
    element.style.width = 'auto';
    let i = 0;

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }

    type();
  }

  /**
   * Reveal Animation on Scroll
   */
  window.revealOnScroll = function(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '0px',
      once: true
    };

    const config = { ...defaultOptions, ...options };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (config.once) {
            observer.unobserve(entry.target);
          }
        } else if (!config.once) {
          entry.target.classList.remove('revealed');
        }
      });
    }, {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    });

    elements.forEach(el => {
      el.classList.add('reveal-element');
      observer.observe(el);
    });
  };

})();
