/**
 * RustPress Enterprise Theme - Particles
 * Canvas-based particle animation for hero sections
 */

(function() {
  'use strict';

  class ParticleSystem {
    constructor(canvasId, options = {}) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.animationId = null;
      this.isRunning = false;

      // Default options
      this.options = {
        particleCount: options.particleCount || 80,
        particleColor: options.particleColor || 'rgba(206, 66, 43, 0.6)',
        lineColor: options.lineColor || 'rgba(206, 66, 43, 0.15)',
        particleRadius: options.particleRadius || 2,
        lineDistance: options.lineDistance || 150,
        speed: options.speed || 0.5,
        mouseInteraction: options.mouseInteraction !== false,
        mouseRadius: options.mouseRadius || 200,
        ...options
      };

      this.mouse = {
        x: null,
        y: null,
        radius: this.options.mouseRadius
      };

      this.init();
    }

    init() {
      this.resize();
      this.createParticles();
      this.bindEvents();
      this.start();
    }

    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.options.particleCount; i++) {
        this.particles.push(new Particle(this));
      }
    }

    bindEvents() {
      // Resize handler
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.resize();
          this.createParticles();
        }, 200);
      });

      // Mouse interaction
      if (this.options.mouseInteraction) {
        this.canvas.addEventListener('mousemove', (e) => {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
          this.mouse.x = null;
          this.mouse.y = null;
        });
      }

      // Visibility change - pause when not visible
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });

      // Intersection Observer - only animate when visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.start();
          } else {
            this.stop();
          }
        });
      }, { threshold: 0.1 });

      observer.observe(this.canvas);
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.animate();
    }

    stop() {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    animate() {
      if (!this.isRunning) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Update and draw particles
      this.particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      this.connectParticles();

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    connectParticles() {
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.options.lineDistance) {
            const opacity = 1 - (distance / this.options.lineDistance);
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.options.lineColor.replace(/[\d.]+\)$/, opacity * 0.8 + ')');
            this.ctx.lineWidth = this.options.lineWidth || 1.5;
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    }
  }

  class Particle {
    constructor(system) {
      this.system = system;
      this.canvas = system.canvas;
      this.ctx = system.ctx;
      this.options = system.options;

      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.vx = (Math.random() - 0.5) * this.options.speed;
      this.vy = (Math.random() - 0.5) * this.options.speed;
      this.radius = Math.random() * this.options.particleRadius + 1;
      this.originalRadius = this.radius;
    }

    update() {
      // Mouse interaction
      if (this.system.mouse.x !== null && this.options.mouseInteraction) {
        const dx = this.x - this.system.mouse.x;
        const dy = this.y - this.system.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.system.mouse.radius) {
          const force = (this.system.mouse.radius - distance) / this.system.mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.5;
          this.vy += Math.sin(angle) * force * 0.5;
          this.radius = this.originalRadius * (1 + force);
        } else {
          this.radius = this.originalRadius;
        }
      }

      // Apply velocity with damping
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.99;
      this.vy *= 0.99;

      // Re-add some random velocity
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy += (Math.random() - 0.5) * 0.1;

      // Clamp velocity
      const maxSpeed = this.options.speed * 2;
      this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));
      this.vy = Math.max(-maxSpeed, Math.min(maxSpeed, this.vy));

      // Boundary collision
      if (this.x < 0 || this.x > this.canvas.width) {
        this.vx *= -1;
        this.x = Math.max(0, Math.min(this.canvas.width, this.x));
      }
      if (this.y < 0 || this.y > this.canvas.height) {
        this.vy *= -1;
        this.y = Math.max(0, Math.min(this.canvas.height, this.y));
      }
    }

    draw() {
      // Only draw particles if showParticles is true
      if (this.options.showParticles !== false) {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.options.particleColor;
        this.ctx.fill();
      }
    }
  }

  // Initialize particles on page load
  document.addEventListener('DOMContentLoaded', () => {
    // Hero particles - lines only
    const heroParticles = new ParticleSystem('particles-canvas', {
      particleCount: 100,
      showParticles: false,
      lineColor: 'rgba(206, 66, 43, 0.25)',
      lineDistance: 200,
      speed: 0.3,
      mouseRadius: 250
    });

    // CTA section particles (if present)
    const ctaParticles = new ParticleSystem('cta-particles', {
      particleCount: 50,
      showParticles: false,
      lineColor: 'rgba(255, 255, 255, 0.15)',
      lineDistance: 150,
      speed: 0.2,
      mouseInteraction: false
    });
  });

  // Expose for manual initialization
  window.ParticleSystem = ParticleSystem;

})();
