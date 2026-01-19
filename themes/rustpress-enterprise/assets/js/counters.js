/**
 * RustPress Enterprise Theme - Counters
 * Animated number counters with Intersection Observer
 */

(function() {
  'use strict';

  class Counter {
    constructor(element, options = {}) {
      this.element = element;
      // Support both data-target and data-counter for the target value
      this.target = parseFloat(element.dataset.target || element.dataset.counter) || 0;
      this.duration = parseInt(element.dataset.duration) || options.duration || 2000;
      this.prefix = element.dataset.prefix || options.prefix || '';
      this.suffix = element.dataset.suffix || options.suffix || '';
      this.decimals = parseInt(element.dataset.decimals) || options.decimals || 0;
      this.easing = options.easing || this.easeOutExpo;
      this.separator = options.separator !== false;

      this.current = 0;
      this.startTime = null;
      this.animationId = null;
      this.hasAnimated = false;
    }

    easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    formatNumber(num) {
      if (this.separator) {
        const parts = num.toFixed(this.decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
      }
      return num.toFixed(this.decimals);
    }

    animate(timestamp) {
      if (!this.startTime) {
        this.startTime = timestamp;
      }

      const elapsed = timestamp - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      const easedProgress = this.easing(progress);

      this.current = easedProgress * this.target;
      this.element.textContent = this.prefix + this.formatNumber(this.current) + this.suffix;

      if (progress < 1) {
        this.animationId = requestAnimationFrame((t) => this.animate(t));
      } else {
        this.element.textContent = this.prefix + this.formatNumber(this.target) + this.suffix;
        this.hasAnimated = true;
      }
    }

    start() {
      if (this.hasAnimated) return;

      this.startTime = null;
      this.current = 0;
      this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    reset() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      this.current = 0;
      this.startTime = null;
      this.hasAnimated = false;
      this.element.textContent = this.prefix + '0' + this.suffix;
    }
  }

  // Initialize counters
  function initCounters() {
    const counterElements = document.querySelectorAll('[data-counter]');
    if (!counterElements.length) return;

    const counters = [];

    counterElements.forEach(element => {
      counters.push(new Counter(element));
    });

    // Use Intersection Observer to trigger animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Array.from(counterElements).indexOf(entry.target);
          if (index !== -1 && counters[index]) {
            // Add slight delay for staggered effect
            const delay = parseInt(entry.target.dataset.delay) || 0;
            setTimeout(() => {
              counters[index].start();
            }, delay);
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -10% 0px'
    });

    counterElements.forEach(element => observer.observe(element));
  }

  // Stats counter with live updates (simulated)
  class LiveCounter {
    constructor(element, options = {}) {
      this.element = element;
      this.baseValue = parseFloat(element.dataset.baseValue) || 0;
      this.increment = parseFloat(element.dataset.increment) || 1;
      this.interval = parseInt(element.dataset.interval) || 5000;
      this.prefix = element.dataset.prefix || '';
      this.suffix = element.dataset.suffix || '';
      this.maxVariation = parseFloat(element.dataset.variation) || 0;

      this.currentValue = this.baseValue;
      this.intervalId = null;
    }

    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toLocaleString();
    }

    update() {
      // Add some randomness
      const variation = this.maxVariation ? (Math.random() - 0.5) * 2 * this.maxVariation : 0;
      this.currentValue += this.increment + variation;

      // Animate the update
      this.element.classList.add('counter-updating');
      this.element.textContent = this.prefix + this.formatNumber(Math.round(this.currentValue)) + this.suffix;

      setTimeout(() => {
        this.element.classList.remove('counter-updating');
      }, 300);
    }

    start() {
      this.element.textContent = this.prefix + this.formatNumber(Math.round(this.currentValue)) + this.suffix;
      this.intervalId = setInterval(() => this.update(), this.interval);
    }

    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }

  // Initialize live counters
  function initLiveCounters() {
    const liveCounterElements = document.querySelectorAll('[data-live-counter]');
    if (!liveCounterElements.length) return;

    const liveCounters = [];

    liveCounterElements.forEach(element => {
      const counter = new LiveCounter(element);
      liveCounters.push(counter);
    });

    // Use Intersection Observer to start/stop
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const index = Array.from(liveCounterElements).indexOf(entry.target);
        if (index !== -1 && liveCounters[index]) {
          if (entry.isIntersecting) {
            liveCounters[index].start();
          } else {
            liveCounters[index].stop();
          }
        }
      });
    }, {
      threshold: 0.1
    });

    liveCounterElements.forEach(element => observer.observe(element));
  }

  // Progress bar animation
  function initProgressBars() {
    const progressBars = document.querySelectorAll('[data-progress]');
    if (!progressBars.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const value = parseFloat(bar.dataset.progress) || 0;
          const delay = parseInt(bar.dataset.delay) || 0;

          setTimeout(() => {
            bar.style.width = value + '%';
            bar.classList.add('animated');
          }, delay);

          observer.unobserve(bar);
        }
      });
    }, {
      threshold: 0.5
    });

    progressBars.forEach(bar => {
      bar.style.width = '0%';
      observer.observe(bar);
    });
  }

  // DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    initCounters();
    initLiveCounters();
    initProgressBars();
  });

  // Expose for manual use
  window.Counter = Counter;
  window.LiveCounter = LiveCounter;

})();
