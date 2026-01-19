/**
 * RustPress Enterprise Theme - Forms
 * Form validation, submission, and UI interactions
 */

(function() {
  'use strict';

  // Form validation rules
  const validators = {
    required: (value) => {
      return value.trim() !== '';
    },
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    minLength: (value, length) => {
      return value.length >= parseInt(length);
    },
    maxLength: (value, length) => {
      return value.length <= parseInt(length);
    },
    phone: (value) => {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
    },
    url: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    match: (value, fieldId) => {
      const matchField = document.getElementById(fieldId);
      return matchField && value === matchField.value;
    }
  };

  // Error messages
  const errorMessages = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {0} characters',
    maxLength: 'Must be no more than {0} characters',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    match: 'Fields do not match'
  };

  class FormValidator {
    constructor(form, options = {}) {
      this.form = form;
      this.options = {
        validateOnBlur: true,
        validateOnInput: true,
        showSuccessState: true,
        scrollToError: true,
        ...options
      };
      this.fields = [];
      this.isSubmitting = false;

      this.init();
    }

    init() {
      // Find all form fields with validation
      const inputs = this.form.querySelectorAll('[data-validate]');

      inputs.forEach(input => {
        const field = {
          element: input,
          rules: this.parseRules(input.dataset.validate),
          errorElement: null,
          isValid: true
        };

        // Create error element
        field.errorElement = this.createErrorElement(input);
        this.fields.push(field);

        // Bind events
        if (this.options.validateOnBlur) {
          input.addEventListener('blur', () => this.validateField(field));
        }

        if (this.options.validateOnInput) {
          input.addEventListener('input', () => {
            // Only validate on input if field has been touched
            if (input.dataset.touched === 'true') {
              this.validateField(field);
            }
          });
        }

        input.addEventListener('blur', () => {
          input.dataset.touched = 'true';
        });
      });

      // Form submit handler
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    parseRules(rulesString) {
      const rules = [];
      const ruleParts = rulesString.split('|');

      ruleParts.forEach(rule => {
        const [name, param] = rule.split(':');
        rules.push({ name, param });
      });

      return rules;
    }

    createErrorElement(input) {
      const wrapper = input.closest('.form-group') || input.parentElement;
      let errorElement = wrapper.querySelector('.form-error');

      if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'form-error';
        errorElement.setAttribute('role', 'alert');
        wrapper.appendChild(errorElement);
      }

      return errorElement;
    }

    validateField(field) {
      const { element, rules, errorElement } = field;
      const value = element.value;
      let isValid = true;
      let errorMessage = '';

      for (const rule of rules) {
        const validator = validators[rule.name];

        if (validator) {
          const valid = validator(value, rule.param);

          if (!valid) {
            isValid = false;
            errorMessage = element.dataset[`error${rule.name.charAt(0).toUpperCase() + rule.name.slice(1)}`]
              || errorMessages[rule.name].replace('{0}', rule.param);
            break;
          }
        }
      }

      field.isValid = isValid;

      // Update UI
      if (isValid) {
        element.classList.remove('input--error');
        if (this.options.showSuccessState && value.trim() !== '') {
          element.classList.add('input--success');
        }
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
      } else {
        element.classList.add('input--error');
        element.classList.remove('input--success');
        errorElement.textContent = errorMessage;
        errorElement.classList.add('visible');
      }

      return isValid;
    }

    validateAll() {
      let allValid = true;
      let firstInvalid = null;

      this.fields.forEach(field => {
        const valid = this.validateField(field);
        if (!valid && !firstInvalid) {
          firstInvalid = field.element;
        }
        allValid = allValid && valid;
      });

      if (!allValid && firstInvalid && this.options.scrollToError) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }

      return allValid;
    }

    async handleSubmit(e) {
      e.preventDefault();

      if (this.isSubmitting) return;

      // Mark all fields as touched
      this.fields.forEach(field => {
        field.element.dataset.touched = 'true';
      });

      // Validate all fields
      if (!this.validateAll()) {
        return;
      }

      this.isSubmitting = true;
      const submitBtn = this.form.querySelector('[type="submit"]');

      // Show loading state
      if (submitBtn) {
        submitBtn.classList.add('btn--loading');
        submitBtn.disabled = true;
      }

      try {
        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        // Check for custom submit handler
        if (this.options.onSubmit) {
          await this.options.onSubmit(data, this.form);
        } else {
          // Default AJAX submission
          const action = this.form.action || window.location.href;
          const method = this.form.method || 'POST';

          const response = await fetch(action, {
            method: method.toUpperCase(),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(data)
          });

          if (!response.ok) {
            throw new Error('Submission failed');
          }

          const result = await response.json();
          this.showSuccess(result.message || 'Form submitted successfully!');

          if (this.options.onSuccess) {
            this.options.onSuccess(result, this.form);
          }
        }
      } catch (error) {
        console.error('Form submission error:', error);
        this.showError(error.message || 'An error occurred. Please try again.');

        if (this.options.onError) {
          this.options.onError(error, this.form);
        }
      } finally {
        this.isSubmitting = false;

        if (submitBtn) {
          submitBtn.classList.remove('btn--loading');
          submitBtn.disabled = false;
        }
      }
    }

    showSuccess(message) {
      const existingAlert = this.form.querySelector('.form-alert');
      if (existingAlert) {
        existingAlert.remove();
      }

      const alert = document.createElement('div');
      alert.className = 'form-alert form-alert--success';
      alert.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span>${message}</span>
      `;

      this.form.insertBefore(alert, this.form.firstChild);
      alert.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Reset form
      this.form.reset();
      this.fields.forEach(field => {
        field.element.classList.remove('input--success', 'input--error');
        field.element.dataset.touched = 'false';
        field.errorElement.textContent = '';
        field.errorElement.classList.remove('visible');
      });
    }

    showError(message) {
      const existingAlert = this.form.querySelector('.form-alert');
      if (existingAlert) {
        existingAlert.remove();
      }

      const alert = document.createElement('div');
      alert.className = 'form-alert form-alert--error';
      alert.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>${message}</span>
      `;

      this.form.insertBefore(alert, this.form.firstChild);
      alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // API endpoints configuration
  const API_ENDPOINTS = {
    newsletter: '/api/newsletter/subscribe',
    contact: '/api/contact/submit',
    earlyAccess: '/api/early-access/signup',
    waitlist: '/api/waitlist/join'
  };

  // Helper function to submit to API with fallback
  async function submitToAPI(endpoint, data) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Submission failed');
      }

      return await response.json();
    } catch (error) {
      // For demo/development, simulate success
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Demo mode: Simulating successful submission', data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: 'Submitted successfully!' };
      }
      throw error;
    }
  }

  // Newsletter form handler
  function initNewsletterForms() {
    const newsletterForms = document.querySelectorAll('.newsletter-form, .newsletter-widget-form');

    newsletterForms.forEach(form => {
      const validator = new FormValidator(form, {
        onSubmit: async (data, formEl) => {
          const result = await submitToAPI(API_ENDPOINTS.newsletter, {
            email: data.email,
            source: formEl.dataset.source || 'website',
            timestamp: new Date().toISOString()
          });

          validator.showSuccess(result.message || 'Thank you for subscribing! Check your email for confirmation.');
        },
        onError: (error, formEl) => {
          validator.showError(error.message || 'Subscription failed. Please try again.');
        }
      });

      form.__validator = validator;
    });
  }

  // Contact form handler
  function initContactForms() {
    const contactForms = document.querySelectorAll('.contact-form');

    contactForms.forEach(form => {
      const validator = new FormValidator(form, {
        onSubmit: async (data, formEl) => {
          const result = await submitToAPI(API_ENDPOINTS.contact, {
            name: data.name,
            email: data.email,
            subject: data.subject || 'Contact Form Submission',
            message: data.message,
            company: data.company || '',
            timestamp: new Date().toISOString()
          });

          validator.showSuccess(result.message || 'Message sent successfully! We\'ll get back to you soon.');
        },
        onError: (error, formEl) => {
          validator.showError(error.message || 'Failed to send message. Please try again.');
        }
      });

      form.__validator = validator;
    });
  }

  // Early Access / Waitlist form handler
  function initEarlyAccessForms() {
    const earlyAccessForms = document.querySelectorAll('.early-access-form, .waitlist-form');

    earlyAccessForms.forEach(form => {
      const validator = new FormValidator(form, {
        onSubmit: async (data, formEl) => {
          const isWaitlist = formEl.classList.contains('waitlist-form');
          const endpoint = isWaitlist ? API_ENDPOINTS.waitlist : API_ENDPOINTS.earlyAccess;

          const result = await submitToAPI(endpoint, {
            email: data.email,
            name: data.name || '',
            company: data.company || '',
            plan: data.plan || 'professional',
            source: formEl.dataset.source || 'website',
            referrer: document.referrer || '',
            timestamp: new Date().toISOString()
          });

          // Show success with custom messaging
          const successMessage = isWaitlist
            ? "You're on the list! We'll notify you when RustPress launches."
            : "Welcome to early access! Check your email for next steps.";

          validator.showSuccess(result.message || successMessage);

          // Optionally redirect after signup
          const redirectUrl = formEl.dataset.redirect;
          if (redirectUrl) {
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 2000);
          }
        },
        onError: (error, formEl) => {
          validator.showError(error.message || 'Signup failed. Please try again.');
        }
      });

      form.__validator = validator;
    });
  }

  // Download tracking form handler
  function initDownloadForms() {
    const downloadButtons = document.querySelectorAll('[data-download]');

    downloadButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const platform = button.dataset.download;
        const version = button.dataset.version || 'latest';

        // Track download
        try {
          await submitToAPI('/api/downloads/track', {
            platform,
            version,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          });
        } catch (error) {
          console.log('Download tracking failed (non-blocking):', error);
        }
      });
    });
  }

  // Floating labels
  function initFloatingLabels() {
    const inputs = document.querySelectorAll('.input-floating input, .input-floating textarea');

    inputs.forEach(input => {
      // Check initial state
      if (input.value) {
        input.classList.add('has-value');
      }

      input.addEventListener('input', () => {
        if (input.value) {
          input.classList.add('has-value');
        } else {
          input.classList.remove('has-value');
        }
      });

      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
      });
    });
  }

  // Character counter
  function initCharacterCounters() {
    const textareas = document.querySelectorAll('textarea[maxlength]');

    textareas.forEach(textarea => {
      const maxLength = parseInt(textarea.getAttribute('maxlength'));
      const wrapper = textarea.closest('.form-group') || textarea.parentElement;

      let counter = wrapper.querySelector('.char-counter');
      if (!counter) {
        counter = document.createElement('span');
        counter.className = 'char-counter';
        wrapper.appendChild(counter);
      }

      const updateCounter = () => {
        const remaining = maxLength - textarea.value.length;
        counter.textContent = `${textarea.value.length}/${maxLength}`;
        counter.classList.toggle('char-counter--warning', remaining < 50);
        counter.classList.toggle('char-counter--danger', remaining < 20);
      };

      textarea.addEventListener('input', updateCounter);
      updateCounter();
    });
  }

  // DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    initNewsletterForms();
    initContactForms();
    initEarlyAccessForms();
    initDownloadForms();
    initFloatingLabels();
    initCharacterCounters();
  });

  // Expose for manual use
  window.FormValidator = FormValidator;
  window.RustPressForms = {
    submitToAPI,
    API_ENDPOINTS
  };

})();
