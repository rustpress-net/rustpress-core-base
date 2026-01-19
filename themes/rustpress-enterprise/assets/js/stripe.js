/**
 * RustPress Enterprise - Stripe Payment Integration
 * Handles subscription payments, card processing, and payment intents
 */

class RustPressPayments {
  constructor(config = {}) {
    this.stripe = null;
    this.elements = null;
    this.cardElement = null;
    this.paymentIntent = null;

    // Configuration
    this.config = {
      publicKey: config.publicKey || 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX',
      apiEndpoint: config.apiEndpoint || '/api',
      currency: config.currency || 'usd',
      locale: config.locale || 'en',
      ...config
    };

    // State
    this.state = {
      isProcessing: false,
      selectedPlan: null,
      billingCycle: 'yearly',
      promoCode: null,
      promoDiscount: 0,
      customerEmail: null,
      customerId: null
    };

    // Plan definitions
    this.plans = {
      developer: {
        name: 'Developer',
        monthly: 19,
        yearly: 190,
        priceIdMonthly: 'price_developer_monthly',
        priceIdYearly: 'price_developer_yearly',
        features: ['Premium themes library', 'Premium plugins access', 'Advanced IDE extensions', 'Priority email support', 'Early access to features', 'Commercial license']
      },
      business: {
        name: 'Business',
        monthly: 49,
        yearly: 490,
        priceIdMonthly: 'price_business_monthly',
        priceIdYearly: 'price_business_yearly',
        features: ['Everything in Developer', 'Up to 10 team members', 'Team collaboration tools', 'Advanced analytics', 'White-label options', 'Priority chat support', 'Custom integrations']
      },
      enterprise: {
        name: 'Enterprise',
        monthly: 199,
        yearly: 1990,
        priceIdMonthly: 'price_enterprise_monthly',
        priceIdYearly: 'price_enterprise_yearly',
        features: ['Everything in Business', 'Unlimited team members', 'On-premise deployment', 'Dedicated account manager', '24/7 phone support', 'Custom development', 'SLA guarantee']
      }
    };

    // Callbacks
    this.callbacks = {
      onPaymentSuccess: config.onPaymentSuccess || this.defaultPaymentSuccess.bind(this),
      onPaymentError: config.onPaymentError || this.defaultPaymentError.bind(this),
      onValidationError: config.onValidationError || this.defaultValidationError.bind(this),
      onProcessingStart: config.onProcessingStart || (() => {}),
      onProcessingEnd: config.onProcessingEnd || (() => {})
    };
  }

  /**
   * Initialize Stripe and mount card element
   */
  async init() {
    try {
      // Load Stripe
      if (typeof Stripe === 'undefined') {
        throw new Error('Stripe.js not loaded. Please include the Stripe script.');
      }

      this.stripe = Stripe(this.config.publicKey, {
        locale: this.config.locale
      });

      // Create Elements instance
      this.elements = this.stripe.elements({
        fonts: [
          {
            cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
          }
        ]
      });

      // Create and mount card element
      this.createCardElement();

      // Set up event listeners
      this.setupEventListeners();

      // Check URL parameters for plan selection
      this.checkUrlParameters();

      console.log('RustPress Payments initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.callbacks.onPaymentError(error);
      return false;
    }
  }

  /**
   * Create and configure the card element
   */
  createCardElement() {
    const cardElementContainer = document.getElementById('card-element');
    if (!cardElementContainer) {
      console.warn('Card element container not found');
      return;
    }

    // Card element styling
    const style = {
      base: {
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        fontWeight: '500',
        lineHeight: '24px',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)'
        },
        ':-webkit-autofill': {
          color: '#ffffff'
        }
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444'
      },
      complete: {
        color: '#10b981',
        iconColor: '#10b981'
      }
    };

    // Create card element with options
    this.cardElement = this.elements.create('card', {
      style,
      hidePostalCode: false,
      iconStyle: 'solid',
      classes: {
        base: 'stripe-card-element',
        complete: 'stripe-card-complete',
        empty: 'stripe-card-empty',
        focus: 'stripe-card-focus',
        invalid: 'stripe-card-invalid',
        webkitAutofill: 'stripe-card-autofill'
      }
    });

    // Mount the element
    this.cardElement.mount('#card-element');

    // Handle card element events
    this.cardElement.on('change', (event) => {
      this.handleCardChange(event);
    });

    this.cardElement.on('ready', () => {
      console.log('Card element ready');
    });
  }

  /**
   * Handle card element changes
   */
  handleCardChange(event) {
    const errorDisplay = document.getElementById('card-errors');

    if (event.error) {
      if (errorDisplay) {
        errorDisplay.textContent = event.error.message;
        errorDisplay.classList.add('visible');
      }
    } else {
      if (errorDisplay) {
        errorDisplay.textContent = '';
        errorDisplay.classList.remove('visible');
      }
    }

    // Update submit button state
    const submitButton = document.getElementById('submit-payment');
    if (submitButton) {
      submitButton.disabled = !event.complete || this.state.isProcessing;
    }
  }

  /**
   * Set up form event listeners
   */
  setupEventListeners() {
    // Payment form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
      paymentForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Billing cycle toggle
    const billingToggle = document.getElementById('billing-toggle');
    if (billingToggle) {
      billingToggle.addEventListener('change', (e) => {
        this.state.billingCycle = e.target.checked ? 'yearly' : 'monthly';
        this.updatePriceDisplay();
      });
    }

    // Plan selection buttons
    document.querySelectorAll('[data-plan]').forEach(button => {
      button.addEventListener('click', (e) => {
        const plan = e.currentTarget.dataset.plan;
        this.selectPlan(plan);
      });
    });

    // Promo code application
    const applyPromoButton = document.getElementById('apply-promo');
    if (applyPromoButton) {
      applyPromoButton.addEventListener('click', () => this.applyPromoCode());
    }

    const promoInput = document.getElementById('promo-code');
    if (promoInput) {
      promoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.applyPromoCode();
        }
      });
    }
  }

  /**
   * Check URL parameters for plan pre-selection
   */
  checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    const billing = urlParams.get('billing');

    if (plan && this.plans[plan]) {
      this.selectPlan(plan);
    }

    if (billing === 'monthly' || billing === 'yearly') {
      this.state.billingCycle = billing;
      const billingToggle = document.getElementById('billing-toggle');
      if (billingToggle) {
        billingToggle.checked = billing === 'yearly';
      }
      this.updatePriceDisplay();
    }
  }

  /**
   * Select a subscription plan
   */
  selectPlan(planId) {
    if (!this.plans[planId]) {
      console.error('Invalid plan:', planId);
      return;
    }

    this.state.selectedPlan = planId;

    // Update UI
    document.querySelectorAll('[data-plan]').forEach(button => {
      button.classList.remove('selected');
      if (button.dataset.plan === planId) {
        button.classList.add('selected');
      }
    });

    // Update plan display
    const planNameDisplay = document.getElementById('selected-plan-name');
    if (planNameDisplay) {
      planNameDisplay.textContent = this.plans[planId].name;
    }

    this.updatePriceDisplay();
  }

  /**
   * Update price display based on selected plan and billing cycle
   */
  updatePriceDisplay() {
    if (!this.state.selectedPlan) return;

    const plan = this.plans[this.state.selectedPlan];
    const isYearly = this.state.billingCycle === 'yearly';
    let price = isYearly ? plan.yearly : plan.monthly;

    // Apply promo discount
    if (this.state.promoDiscount > 0) {
      price = price * (1 - this.state.promoDiscount / 100);
    }

    // Update displays
    const priceDisplay = document.getElementById('plan-price');
    if (priceDisplay) {
      priceDisplay.textContent = `$${price.toFixed(2)}`;
    }

    const cycleDisplay = document.getElementById('billing-cycle-text');
    if (cycleDisplay) {
      cycleDisplay.textContent = isYearly ? '/year' : '/month';
    }

    const totalDisplay = document.getElementById('order-total');
    if (totalDisplay) {
      totalDisplay.textContent = `$${price.toFixed(2)}`;
    }

    // Show savings for yearly
    const savingsDisplay = document.getElementById('yearly-savings');
    if (savingsDisplay) {
      if (isYearly) {
        const monthlyCost = plan.monthly * 12;
        const savings = monthlyCost - plan.yearly;
        savingsDisplay.textContent = `Save $${savings} with yearly billing`;
        savingsDisplay.style.display = 'block';
      } else {
        savingsDisplay.style.display = 'none';
      }
    }
  }

  /**
   * Apply promo code
   */
  async applyPromoCode() {
    const promoInput = document.getElementById('promo-code');
    const promoButton = document.getElementById('apply-promo');
    const promoMessage = document.getElementById('promo-message');

    if (!promoInput) return;

    const code = promoInput.value.trim().toUpperCase();
    if (!code) {
      this.showPromoMessage('Please enter a promo code', 'error');
      return;
    }

    // Disable button during validation
    if (promoButton) {
      promoButton.disabled = true;
      promoButton.textContent = 'Validating...';
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/promo/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (data.valid) {
        this.state.promoCode = code;
        this.state.promoDiscount = data.discount;
        this.showPromoMessage(`${data.discount}% discount applied!`, 'success');
        this.updatePriceDisplay();
        promoInput.disabled = true;
        if (promoButton) {
          promoButton.textContent = 'Applied';
        }
      } else {
        this.showPromoMessage(data.message || 'Invalid promo code', 'error');
        if (promoButton) {
          promoButton.disabled = false;
          promoButton.textContent = 'Apply';
        }
      }
    } catch (error) {
      // For demo/testing, accept certain codes locally
      const testCodes = {
        'EARLYBIRD': 20,
        'SPONSOR': 30,
        'LAUNCH2026': 15,
        'RUSTDEV': 10
      };

      if (testCodes[code]) {
        this.state.promoCode = code;
        this.state.promoDiscount = testCodes[code];
        this.showPromoMessage(`${testCodes[code]}% discount applied!`, 'success');
        this.updatePriceDisplay();
        promoInput.disabled = true;
        if (promoButton) {
          promoButton.textContent = 'Applied';
        }
      } else {
        this.showPromoMessage('Invalid promo code', 'error');
        if (promoButton) {
          promoButton.disabled = false;
          promoButton.textContent = 'Apply';
        }
      }
    }
  }

  /**
   * Show promo code message
   */
  showPromoMessage(message, type) {
    const promoMessage = document.getElementById('promo-message');
    if (promoMessage) {
      promoMessage.textContent = message;
      promoMessage.className = `promo-message ${type}`;
      promoMessage.style.display = 'block';
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit(event) {
    event.preventDefault();

    if (this.state.isProcessing) return;

    // Validate form
    if (!this.validateForm()) return;

    this.setProcessing(true);

    try {
      // Get form data
      const formData = this.getFormData();

      // Create payment method
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
        billing_details: {
          name: formData.name,
          email: formData.email,
          address: {
            country: formData.country
          }
        }
      });

      if (error) {
        throw error;
      }

      // Create subscription on server
      const subscription = await this.createSubscription({
        paymentMethodId: paymentMethod.id,
        planId: this.state.selectedPlan,
        billingCycle: this.state.billingCycle,
        promoCode: this.state.promoCode,
        ...formData
      });

      // Handle subscription status
      await this.handleSubscriptionStatus(subscription);

    } catch (error) {
      console.error('Payment error:', error);
      this.callbacks.onPaymentError(error);
    } finally {
      this.setProcessing(false);
    }
  }

  /**
   * Validate form fields
   */
  validateForm() {
    const errors = [];

    // Check plan selection
    if (!this.state.selectedPlan) {
      errors.push('Please select a subscription plan');
    }

    // Check required fields
    const requiredFields = ['full-name', 'email'];
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field || !field.value.trim()) {
        errors.push(`${fieldId.replace('-', ' ')} is required`);
      }
    });

    // Validate email
    const emailField = document.getElementById('email');
    if (emailField && emailField.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        errors.push('Please enter a valid email address');
      }
    }

    // Check terms acceptance
    const termsCheckbox = document.getElementById('accept-terms');
    if (termsCheckbox && !termsCheckbox.checked) {
      errors.push('Please accept the terms and conditions');
    }

    if (errors.length > 0) {
      this.callbacks.onValidationError(errors);
      return false;
    }

    return true;
  }

  /**
   * Get form data
   */
  getFormData() {
    return {
      name: document.getElementById('full-name')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      company: document.getElementById('company')?.value.trim() || '',
      country: document.getElementById('country')?.value || 'US'
    };
  }

  /**
   * Create subscription on server
   */
  async createSubscription(data) {
    const response = await fetch(`${this.config.apiEndpoint}/subscriptions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment_method_id: data.paymentMethodId,
        plan_id: data.planId,
        billing_cycle: data.billingCycle,
        promo_code: data.promoCode,
        customer: {
          name: data.name,
          email: data.email,
          company: data.company,
          country: data.country
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create subscription');
    }

    return response.json();
  }

  /**
   * Handle subscription status (including 3D Secure)
   */
  async handleSubscriptionStatus(subscription) {
    const { status, client_secret, subscription_id } = subscription;

    switch (status) {
      case 'active':
      case 'trialing':
        // Subscription created successfully
        this.callbacks.onPaymentSuccess({
          subscriptionId: subscription_id,
          status
        });
        break;

      case 'requires_action':
      case 'requires_payment_method':
        // 3D Secure authentication required
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(client_secret);

        if (error) {
          throw error;
        }

        if (paymentIntent.status === 'succeeded') {
          // Confirm subscription on server
          await this.confirmSubscription(subscription_id);
          this.callbacks.onPaymentSuccess({
            subscriptionId: subscription_id,
            status: 'active'
          });
        }
        break;

      case 'incomplete':
        throw new Error('Payment incomplete. Please try again.');

      default:
        throw new Error(`Unexpected subscription status: ${status}`);
    }
  }

  /**
   * Confirm subscription after 3D Secure
   */
  async confirmSubscription(subscriptionId) {
    const response = await fetch(`${this.config.apiEndpoint}/subscriptions/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subscription_id: subscriptionId })
    });

    if (!response.ok) {
      throw new Error('Failed to confirm subscription');
    }

    return response.json();
  }

  /**
   * Set processing state
   */
  setProcessing(isProcessing) {
    this.state.isProcessing = isProcessing;

    const submitButton = document.getElementById('submit-payment');
    const buttonText = document.getElementById('button-text');
    const buttonSpinner = document.getElementById('button-spinner');

    if (submitButton) {
      submitButton.disabled = isProcessing;
    }

    if (buttonText) {
      buttonText.style.display = isProcessing ? 'none' : 'inline';
    }

    if (buttonSpinner) {
      buttonSpinner.style.display = isProcessing ? 'inline-flex' : 'none';
    }

    if (isProcessing) {
      this.callbacks.onProcessingStart();
    } else {
      this.callbacks.onProcessingEnd();
    }
  }

  /**
   * Default success handler
   */
  defaultPaymentSuccess(data) {
    // Redirect to thank you page
    const redirectUrl = `/thank-you?subscription=${data.subscriptionId}&status=${data.status}`;
    window.location.href = redirectUrl;
  }

  /**
   * Default error handler
   */
  defaultPaymentError(error) {
    const errorDisplay = document.getElementById('payment-error');
    const errorMessage = error.message || 'An unexpected error occurred. Please try again.';

    if (errorDisplay) {
      errorDisplay.textContent = errorMessage;
      errorDisplay.style.display = 'block';

      // Scroll to error
      errorDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Hide after 10 seconds
      setTimeout(() => {
        errorDisplay.style.display = 'none';
      }, 10000);
    } else {
      alert(errorMessage);
    }
  }

  /**
   * Default validation error handler
   */
  defaultValidationError(errors) {
    const errorDisplay = document.getElementById('validation-errors');

    if (errorDisplay) {
      errorDisplay.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
      errorDisplay.style.display = 'block';
      errorDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      alert(errors.join('\n'));
    }
  }

  /**
   * Get plan details
   */
  getPlanDetails(planId) {
    return this.plans[planId] || null;
  }

  /**
   * Calculate total price
   */
  calculateTotal() {
    if (!this.state.selectedPlan) return 0;

    const plan = this.plans[this.state.selectedPlan];
    const isYearly = this.state.billingCycle === 'yearly';
    let price = isYearly ? plan.yearly : plan.monthly;

    if (this.state.promoDiscount > 0) {
      price = price * (1 - this.state.promoDiscount / 100);
    }

    return price;
  }

  /**
   * Destroy the payment form
   */
  destroy() {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    this.elements = null;
    this.stripe = null;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RustPressPayments;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on checkout page
  if (document.getElementById('payment-form') || document.getElementById('card-element')) {
    const stripeKey = document.querySelector('meta[name="stripe-public-key"]')?.content
      || window.STRIPE_PUBLIC_KEY
      || 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX';

    window.rustPressPayments = new RustPressPayments({
      publicKey: stripeKey,
      onPaymentSuccess: (data) => {
        window.location.href = `/thank-you?subscription=${data.subscriptionId}`;
      }
    });

    window.rustPressPayments.init();
  }
});
