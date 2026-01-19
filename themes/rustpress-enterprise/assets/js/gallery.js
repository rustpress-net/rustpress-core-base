/**
 * RustPress Enterprise Theme - Gallery
 * Image gallery, lightbox, and carousel functionality
 */

(function() {
  'use strict';

  /**
   * Lightbox Component
   */
  class Lightbox {
    constructor(options = {}) {
      this.options = {
        animation: 'fade',
        closeOnBackdrop: true,
        closeOnEscape: true,
        showCounter: true,
        showCaption: true,
        ...options
      };

      this.images = [];
      this.currentIndex = 0;
      this.isOpen = false;
      this.element = null;

      this.createLightbox();
      this.bindEvents();
    }

    createLightbox() {
      this.element = document.createElement('div');
      this.element.className = 'lightbox';
      this.element.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button class="lightbox-nav lightbox-prev" aria-label="Previous">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="lightbox-nav lightbox-next" aria-label="Next">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div class="lightbox-image-wrapper">
            <img class="lightbox-image" src="" alt="">
            <div class="lightbox-loader">
              <div class="spinner"></div>
            </div>
          </div>
          <div class="lightbox-footer">
            <span class="lightbox-counter"></span>
            <span class="lightbox-caption"></span>
          </div>
        </div>
      `;

      document.body.appendChild(this.element);

      // Cache elements
      this.backdrop = this.element.querySelector('.lightbox-backdrop');
      this.content = this.element.querySelector('.lightbox-content');
      this.image = this.element.querySelector('.lightbox-image');
      this.loader = this.element.querySelector('.lightbox-loader');
      this.counter = this.element.querySelector('.lightbox-counter');
      this.caption = this.element.querySelector('.lightbox-caption');
      this.closeBtn = this.element.querySelector('.lightbox-close');
      this.prevBtn = this.element.querySelector('.lightbox-prev');
      this.nextBtn = this.element.querySelector('.lightbox-next');
    }

    bindEvents() {
      // Close button
      this.closeBtn.addEventListener('click', () => this.close());

      // Navigation
      this.prevBtn.addEventListener('click', () => this.prev());
      this.nextBtn.addEventListener('click', () => this.next());

      // Backdrop click
      if (this.options.closeOnBackdrop) {
        this.backdrop.addEventListener('click', () => this.close());
      }

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;

        switch (e.key) {
          case 'Escape':
            if (this.options.closeOnEscape) this.close();
            break;
          case 'ArrowLeft':
            this.prev();
            break;
          case 'ArrowRight':
            this.next();
            break;
        }
      });

      // Touch swipe
      let touchStartX = 0;
      let touchEndX = 0;

      this.content.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.content.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }, { passive: true });
    }

    open(images, startIndex = 0) {
      this.images = images;
      this.currentIndex = startIndex;
      this.isOpen = true;

      this.element.classList.add('active');
      document.body.style.overflow = 'hidden';

      this.showImage(this.currentIndex);
      this.updateNav();
    }

    close() {
      this.isOpen = false;
      this.element.classList.remove('active');
      document.body.style.overflow = '';
    }

    showImage(index) {
      const imageData = this.images[index];
      if (!imageData) return;

      this.loader.classList.add('visible');
      this.image.classList.remove('loaded');

      // Load image
      const img = new Image();
      img.onload = () => {
        this.image.src = imageData.src;
        this.image.alt = imageData.alt || '';
        this.loader.classList.remove('visible');
        this.image.classList.add('loaded');
      };
      img.onerror = () => {
        this.loader.classList.remove('visible');
      };
      img.src = imageData.src;

      // Update counter
      if (this.options.showCounter && this.images.length > 1) {
        this.counter.textContent = `${index + 1} / ${this.images.length}`;
        this.counter.style.display = '';
      } else {
        this.counter.style.display = 'none';
      }

      // Update caption
      if (this.options.showCaption && imageData.caption) {
        this.caption.textContent = imageData.caption;
        this.caption.style.display = '';
      } else {
        this.caption.style.display = 'none';
      }
    }

    updateNav() {
      const hasMultiple = this.images.length > 1;
      this.prevBtn.style.display = hasMultiple ? '' : 'none';
      this.nextBtn.style.display = hasMultiple ? '' : 'none';
    }

    prev() {
      if (this.images.length <= 1) return;
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.showImage(this.currentIndex);
    }

    next() {
      if (this.images.length <= 1) return;
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.showImage(this.currentIndex);
    }
  }

  /**
   * Image Gallery Component
   */
  class Gallery {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        lightbox: true,
        thumbnails: true,
        autoplay: false,
        autoplayInterval: 5000,
        ...options
      };

      this.images = [];
      this.currentIndex = 0;
      this.autoplayId = null;

      this.init();
    }

    init() {
      this.collectImages();
      this.createGallery();
      this.bindEvents();

      if (this.options.autoplay) {
        this.startAutoplay();
      }
    }

    collectImages() {
      const items = this.element.querySelectorAll('.gallery-item, [data-gallery-item]');

      items.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
          this.images.push({
            src: img.dataset.fullSrc || img.src,
            thumb: img.src,
            alt: img.alt,
            caption: item.dataset.caption || img.alt,
            element: item,
            index
          });
        }
      });
    }

    createGallery() {
      // Add gallery class
      this.element.classList.add('gallery-initialized');

      // Create main display if needed
      if (!this.element.querySelector('.gallery-main')) {
        const main = document.createElement('div');
        main.className = 'gallery-main';
        main.innerHTML = `
          <div class="gallery-main-image">
            <img src="${this.images[0]?.src || ''}" alt="${this.images[0]?.alt || ''}">
          </div>
          <button class="gallery-nav gallery-prev" aria-label="Previous">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="gallery-nav gallery-next" aria-label="Next">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        `;
        this.element.insertBefore(main, this.element.firstChild);
      }

      // Create thumbnails if enabled
      if (this.options.thumbnails && this.images.length > 1) {
        const thumbs = document.createElement('div');
        thumbs.className = 'gallery-thumbnails';

        this.images.forEach((image, index) => {
          const thumb = document.createElement('button');
          thumb.className = 'gallery-thumb' + (index === 0 ? ' active' : '');
          thumb.innerHTML = `<img src="${image.thumb}" alt="${image.alt}">`;
          thumb.addEventListener('click', () => this.goTo(index));
          thumbs.appendChild(thumb);
        });

        this.element.appendChild(thumbs);
      }

      // Cache elements
      this.mainImage = this.element.querySelector('.gallery-main-image img');
      this.prevBtn = this.element.querySelector('.gallery-prev');
      this.nextBtn = this.element.querySelector('.gallery-next');
      this.thumbnails = this.element.querySelectorAll('.gallery-thumb');
    }

    bindEvents() {
      // Navigation buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      // Lightbox
      if (this.options.lightbox) {
        this.mainImage?.parentElement.addEventListener('click', () => {
          if (!window.galleryLightbox) {
            window.galleryLightbox = new Lightbox();
          }
          window.galleryLightbox.open(this.images, this.currentIndex);
        });

        // Also open from items
        this.images.forEach((image, index) => {
          image.element.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.galleryLightbox) {
              window.galleryLightbox = new Lightbox();
            }
            window.galleryLightbox.open(this.images, index);
          });
        });
      }

      // Pause autoplay on hover
      if (this.options.autoplay) {
        this.element.addEventListener('mouseenter', () => this.stopAutoplay());
        this.element.addEventListener('mouseleave', () => this.startAutoplay());
      }

      // Keyboard navigation when focused
      this.element.setAttribute('tabindex', '0');
      this.element.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });
    }

    goTo(index) {
      if (index < 0 || index >= this.images.length) return;

      this.currentIndex = index;
      const image = this.images[index];

      // Update main image
      if (this.mainImage) {
        this.mainImage.classList.add('transitioning');
        setTimeout(() => {
          this.mainImage.src = image.src;
          this.mainImage.alt = image.alt;
          this.mainImage.classList.remove('transitioning');
        }, 150);
      }

      // Update thumbnails
      this.thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
      });

      // Update items
      this.images.forEach((img, i) => {
        img.element.classList.toggle('active', i === index);
      });
    }

    prev() {
      const newIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.goTo(newIndex);
    }

    next() {
      const newIndex = (this.currentIndex + 1) % this.images.length;
      this.goTo(newIndex);
    }

    startAutoplay() {
      if (this.autoplayId) return;
      this.autoplayId = setInterval(() => this.next(), this.options.autoplayInterval);
    }

    stopAutoplay() {
      if (this.autoplayId) {
        clearInterval(this.autoplayId);
        this.autoplayId = null;
      }
    }
  }

  /**
   * Slider/Carousel Component
   */
  class Slider {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        slidesPerView: 1,
        gap: 20,
        loop: true,
        autoplay: false,
        autoplayInterval: 4000,
        dots: true,
        arrows: true,
        ...options
      };

      this.slides = [];
      this.currentIndex = 0;
      this.autoplayId = null;

      this.init();
    }

    init() {
      this.slides = Array.from(this.element.querySelectorAll('.slider-slide'));
      if (!this.slides.length) return;

      this.createSlider();
      this.bindEvents();
      this.updateSlider();

      if (this.options.autoplay) {
        this.startAutoplay();
      }
    }

    createSlider() {
      // Wrap slides
      const track = document.createElement('div');
      track.className = 'slider-track';
      this.slides.forEach(slide => track.appendChild(slide));
      this.element.appendChild(track);
      this.track = track;

      // Add navigation arrows
      if (this.options.arrows) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'slider-arrow slider-prev';
        prevBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';
        prevBtn.addEventListener('click', () => this.prev());

        const nextBtn = document.createElement('button');
        nextBtn.className = 'slider-arrow slider-next';
        nextBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
        nextBtn.addEventListener('click', () => this.next());

        this.element.appendChild(prevBtn);
        this.element.appendChild(nextBtn);
      }

      // Add dots
      if (this.options.dots) {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';

        const dotCount = Math.ceil(this.slides.length / this.options.slidesPerView);
        for (let i = 0; i < dotCount; i++) {
          const dot = document.createElement('button');
          dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
          dot.addEventListener('click', () => this.goTo(i * this.options.slidesPerView));
          dotsContainer.appendChild(dot);
        }

        this.element.appendChild(dotsContainer);
        this.dots = dotsContainer.querySelectorAll('.slider-dot');
      }

      this.element.classList.add('slider-initialized');
    }

    bindEvents() {
      // Touch/drag support
      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      this.track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX;
        this.track.style.transition = 'none';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentX = e.pageX - startX;
      });

      document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        this.track.style.transition = '';

        if (currentX > 50) {
          this.prev();
        } else if (currentX < -50) {
          this.next();
        }
        currentX = 0;
      });

      // Touch events
      this.track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
      }, { passive: true });

      this.track.addEventListener('touchend', (e) => {
        const diff = startX - e.changedTouches[0].pageX;
        if (diff > 50) {
          this.next();
        } else if (diff < -50) {
          this.prev();
        }
      }, { passive: true });

      // Pause autoplay on hover
      if (this.options.autoplay) {
        this.element.addEventListener('mouseenter', () => this.stopAutoplay());
        this.element.addEventListener('mouseleave', () => this.startAutoplay());
      }

      // Resize handler
      window.addEventListener('resize', () => this.updateSlider());
    }

    updateSlider() {
      const slideWidth = (this.element.offsetWidth - (this.options.gap * (this.options.slidesPerView - 1))) / this.options.slidesPerView;

      this.slides.forEach(slide => {
        slide.style.width = slideWidth + 'px';
        slide.style.marginRight = this.options.gap + 'px';
      });

      this.goTo(this.currentIndex);
    }

    goTo(index) {
      const maxIndex = this.slides.length - this.options.slidesPerView;
      this.currentIndex = Math.max(0, Math.min(index, maxIndex));

      const slideWidth = this.slides[0].offsetWidth + this.options.gap;
      const offset = -this.currentIndex * slideWidth;
      this.track.style.transform = `translateX(${offset}px)`;

      // Update dots
      if (this.dots) {
        const activeDot = Math.floor(this.currentIndex / this.options.slidesPerView);
        this.dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === activeDot);
        });
      }
    }

    prev() {
      if (this.options.loop && this.currentIndex === 0) {
        this.goTo(this.slides.length - this.options.slidesPerView);
      } else {
        this.goTo(this.currentIndex - this.options.slidesPerView);
      }
    }

    next() {
      if (this.options.loop && this.currentIndex >= this.slides.length - this.options.slidesPerView) {
        this.goTo(0);
      } else {
        this.goTo(this.currentIndex + this.options.slidesPerView);
      }
    }

    startAutoplay() {
      if (this.autoplayId) return;
      this.autoplayId = setInterval(() => this.next(), this.options.autoplayInterval);
    }

    stopAutoplay() {
      if (this.autoplayId) {
        clearInterval(this.autoplayId);
        this.autoplayId = null;
      }
    }
  }

  // Initialize galleries and sliders
  function initGalleries() {
    // Auto-init galleries
    document.querySelectorAll('[data-gallery]').forEach(el => {
      new Gallery(el, {
        lightbox: el.dataset.lightbox !== 'false',
        thumbnails: el.dataset.thumbnails !== 'false',
        autoplay: el.dataset.autoplay === 'true',
        autoplayInterval: parseInt(el.dataset.interval) || 5000
      });
    });

    // Auto-init sliders
    document.querySelectorAll('[data-slider]').forEach(el => {
      new Slider(el, {
        slidesPerView: parseInt(el.dataset.slides) || 1,
        gap: parseInt(el.dataset.gap) || 20,
        loop: el.dataset.loop !== 'false',
        autoplay: el.dataset.autoplay === 'true',
        autoplayInterval: parseInt(el.dataset.interval) || 4000,
        dots: el.dataset.dots !== 'false',
        arrows: el.dataset.arrows !== 'false'
      });
    });

    // Auto-init lightbox triggers
    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (!window.galleryLightbox) {
          window.galleryLightbox = new Lightbox();
        }

        const src = el.dataset.lightbox || el.href || el.querySelector('img')?.src;
        const caption = el.dataset.caption || el.title || el.querySelector('img')?.alt;

        window.galleryLightbox.open([{ src, caption }], 0);
      });
    });
  }

  // DOM Ready
  document.addEventListener('DOMContentLoaded', initGalleries);

  // Expose for manual use
  window.Lightbox = Lightbox;
  window.Gallery = Gallery;
  window.Slider = Slider;

})();
