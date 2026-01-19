/**
 * SubscriptionSettings - Manage subscription plans and billing
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Check, X, Sparkles, Zap, Crown, Building2,
  Users, Database, Globe, Shield, Clock, Cpu, Bot,
  BarChart3, Mail, Headphones, Infinity, ArrowRight, Heart,
  Target, ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PlanFeature {
  name: string;
  free: boolean | string | number;
  pro: boolean | string | number;
  business: boolean | string | number;
  tooltip?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  icon: React.ElementType;
  color: string;
  popular?: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Perfect for personal blogs and small projects',
    icon: Zap,
    color: 'gray',
    features: [
      '1 Website',
      '5 GB Storage',
      'Basic themes',
      'Community support',
      'Basic analytics',
      'Standard SSL'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    period: 'month',
    description: 'For professionals and growing businesses',
    icon: Crown,
    color: 'orange',
    popular: true,
    features: [
      '5 Websites',
      '50 GB Storage',
      'All premium themes',
      'AI Writing Assistant',
      'AI Image Generation',
      'Priority support',
      'Advanced analytics',
      'Custom domain',
      'Remove branding',
      'API access',
      'Scheduled posts',
      'SEO tools'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 199,
    period: 'month',
    description: 'For agencies and enterprise teams',
    icon: Building2,
    color: 'purple',
    features: [
      'Unlimited Websites',
      '500 GB Storage',
      'White-label solution',
      'Unlimited AI usage',
      'Dedicated support',
      'Advanced analytics & reports',
      'Team collaboration',
      'Role-based access',
      'Custom integrations',
      'SLA guarantee',
      'Priority feature requests',
      'Onboarding assistance'
    ]
  }
];

const featureComparison: PlanFeature[] = [
  { name: 'Websites', free: '1', pro: '5', business: 'Unlimited' },
  { name: 'Storage', free: '5 GB', pro: '50 GB', business: '500 GB' },
  { name: 'Bandwidth', free: '10 GB/mo', pro: '100 GB/mo', business: 'Unlimited' },
  { name: 'Custom Domain', free: false, pro: true, business: true },
  { name: 'Remove Branding', free: false, pro: true, business: true },
  { name: 'SSL Certificate', free: true, pro: true, business: true },
  { name: 'Premium Themes', free: false, pro: true, business: true },
  { name: 'Theme Customization', free: 'Basic', pro: 'Advanced', business: 'Full' },
  { name: 'AI Writing Assistant', free: false, pro: '100 requests/mo', business: 'Unlimited', tooltip: 'AI-powered content generation' },
  { name: 'AI Image Generation', free: false, pro: '50 images/mo', business: 'Unlimited', tooltip: 'Generate images with AI' },
  { name: 'AI SEO Optimization', free: false, pro: true, business: true },
  { name: 'AI Code Assistant', free: false, pro: '50 requests/mo', business: 'Unlimited' },
  { name: 'Scheduled Posts', free: false, pro: true, business: true },
  { name: 'SEO Tools', free: 'Basic', pro: 'Advanced', business: 'Enterprise' },
  { name: 'Analytics', free: 'Basic', pro: 'Advanced', business: 'Enterprise + Custom' },
  { name: 'API Access', free: false, pro: '10,000 req/mo', business: 'Unlimited' },
  { name: 'Webhooks', free: false, pro: '10', business: 'Unlimited' },
  { name: 'Team Members', free: '1', pro: '5', business: 'Unlimited' },
  { name: 'Role-based Access', free: false, pro: false, business: true },
  { name: 'White-label', free: false, pro: false, business: true },
  { name: 'Priority Support', free: false, pro: true, business: true },
  { name: 'Dedicated Support', free: false, pro: false, business: true },
  { name: 'SLA Guarantee', free: false, pro: false, business: '99.9%' },
  { name: 'Custom Integrations', free: false, pro: false, business: true },
  { name: 'Onboarding Assistance', free: false, pro: false, business: true },
];

const PAYPAL_LINK = 'https://paypal.me/maurotommasi';
const LAUNCH_GOAL = 1000000; // $1 million

export const SubscriptionSettings: React.FC = () => {
  const [currentPlan] = useState('free');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [showComparison, setShowComparison] = useState(false);

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount for yearly
  };

  const handleUpgrade = (planId: string) => {
    if (planId === 'free') {
      toast.success('Joining the waitlist...');
    } else {
      // Redirect to PayPal for paid plans
      window.open(PAYPAL_LINK, '_blank');
      toast.success(`Redirecting to PayPal for ${planId} plan...`);
    }
  };

  const renderFeatureValue = (value: boolean | string | number) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-400" />
      ) : (
        <X className="w-5 h-5 text-gray-600" />
      );
    }
    return <span className="text-white">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 border border-orange-500/30 rounded-xl text-center"
        >
          <div className="flex items-center justify-center gap-2 text-orange-400 font-medium">
            <Sparkles className="w-5 h-5" />
            <span>RustPress is launching soon! Join the waitlist to be notified when we go live.</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-orange-500" />
            Subscription Plans
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All paid plans include AI features and can be cancelled anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className={billingPeriod === 'month' ? 'text-white' : 'text-gray-500'}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(prev => prev === 'month' ? 'year' : 'month')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingPeriod === 'year' ? 'bg-orange-600' : 'bg-gray-700'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingPeriod === 'year' ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
            <span className={billingPeriod === 'year' ? 'text-white' : 'text-gray-500'}>
              Yearly
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;
            const price = billingPeriod === 'year' && plan.price > 0
              ? getYearlyPrice(plan.price)
              : plan.price;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl border p-6 ${
                  plan.popular
                    ? 'border-orange-500 bg-gradient-to-b from-orange-500/10 to-transparent'
                    : 'border-gray-800 bg-gray-900'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-600 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${
                    plan.color === 'orange' ? 'bg-orange-500/20' :
                    plan.color === 'purple' ? 'bg-purple-500/20' :
                    'bg-gray-800'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      plan.color === 'orange' ? 'text-orange-400' :
                      plan.color === 'purple' ? 'text-purple-400' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.description}</p>

                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-gray-500">/{billingPeriod === 'year' ? 'year' : 'mo'}</span>
                  </div>
                  {billingPeriod === 'year' && plan.price > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${Math.round(price / 12)}/month billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.color === 'orange' ? 'text-orange-400' :
                        plan.color === 'purple' ? 'text-purple-400' :
                        'text-green-400'
                      }`} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : (
                    <>
                      {plan.price === 0 ? 'Join Waitlist' : 'Select Plan'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* AI Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl border border-orange-500/20 p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Bot className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold">AI Features Included from Pro</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Starting from the Pro plan, you get access to all AI-powered features to supercharge your content creation.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Sparkles, name: 'AI Writing Assistant', desc: 'Generate blog posts, descriptions, and more' },
              { icon: Bot, name: 'AI Image Generation', desc: 'Create unique images for your content' },
              { icon: BarChart3, name: 'AI SEO Optimization', desc: 'Get AI-powered SEO recommendations' },
              { icon: Cpu, name: 'AI Code Assistant', desc: 'Get help with theme and plugin development' }
            ].map((feature, i) => {
              const FeatureIcon = feature.icon;
              return (
                <div key={i} className="bg-gray-900/50 rounded-lg p-4">
                  <FeatureIcon className="w-5 h-5 text-orange-400 mb-2" />
                  <h4 className="font-medium text-sm mb-1">{feature.name}</h4>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Feature Comparison Toggle */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {showComparison ? 'Hide' : 'Show'} Full Feature Comparison
          </button>
        </div>

        {/* Feature Comparison Table */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 font-medium">Feature</th>
                  <th className="text-center p-4 font-medium">
                    <div className="flex flex-col items-center">
                      <span>Free</span>
                      <span className="text-gray-500 text-sm font-normal">$0/mo</span>
                    </div>
                  </th>
                  <th className="text-center p-4 font-medium bg-orange-500/5">
                    <div className="flex flex-col items-center">
                      <span className="text-orange-400">Pro</span>
                      <span className="text-gray-500 text-sm font-normal">$49/mo</span>
                    </div>
                  </th>
                  <th className="text-center p-4 font-medium">
                    <div className="flex flex-col items-center">
                      <span className="text-purple-400">Business</span>
                      <span className="text-gray-500 text-sm font-normal">$199/mo</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((feature, i) => (
                  <tr key={i} className={`border-b border-gray-800/50 ${i % 2 === 0 ? 'bg-gray-900/50' : ''}`}>
                    <td className="p-4 text-sm text-gray-300">
                      {feature.name}
                      {feature.tooltip && (
                        <span className="ml-1 text-gray-600 text-xs">(?)</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-sm">{renderFeatureValue(feature.free)}</td>
                    <td className="p-4 text-center text-sm bg-orange-500/5">{renderFeatureValue(feature.pro)}</td>
                    <td className="p-4 text-center text-sm">{renderFeatureValue(feature.business)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Support RustPress - Funding Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl border border-purple-500/30 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-purple-500/20 rounded-xl mb-4">
                <Heart className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Support RustPress Development</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                RustPress is an independent project. Your support helps us build the best CMS platform and reach our launch goal.
              </p>
            </div>

            {/* Launch Goal Progress */}
            <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">Launch Goal</span>
                </div>
                <span className="text-2xl font-bold text-orange-400">
                  ${LAUNCH_GOAL.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: '0%' }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Help us reach our $1,000,000 launch goal to bring RustPress to life
              </p>
            </div>

            {/* PayPal Support Button */}
            <div className="text-center">
              <a
                href={PAYPAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.651h6.6c2.189 0 3.834.465 4.89 1.382.98.858 1.429 2.13 1.334 3.784-.004.06-.007.121-.012.182a8.334 8.334 0 0 1-.096.787c-.71 3.738-3.149 5.036-6.262 5.036H9.86a.946.946 0 0 0-.933.796l-.867 5.498a.64.64 0 0 1-.633.54h-.35v.263z"/>
                  <path d="M19.952 8.095c-.004.06-.007.121-.012.182-.71 3.737-3.149 5.035-6.262 5.035h-2.295a.946.946 0 0 0-.933.797l-1.058 6.716a.476.476 0 0 0 .47.551h3.306a.832.832 0 0 0 .822-.7l.034-.172.652-4.127.042-.228a.832.832 0 0 1 .822-.7h.518c3.351 0 5.974-1.361 6.74-5.3.32-1.644.154-3.016-.693-3.982a3.323 3.323 0 0 0-.952-.772c-.022.233-.053.466-.096.787-.004.06-.007.121-.012.182z" opacity=".7"/>
                </svg>
                Support with PayPal
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-sm text-gray-500 mt-4">
                Secure payments via PayPal
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'Can I upgrade or downgrade anytime?',
                a: 'Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your billing period.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We currently accept PayPal for all transactions. More payment options will be available at launch.'
              },
              {
                q: 'When will RustPress launch?',
                a: 'We are working hard to bring RustPress to you. Join the waitlist to be notified when we launch and get early access.'
              },
              {
                q: 'How can I support the project?',
                a: 'You can support RustPress by contributing via PayPal. Every contribution helps us reach our launch goal and build a better product.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="font-medium mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
            <Headphones className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Questions?</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Have questions about RustPress or want to discuss custom solutions? Get in touch with us.
            </p>
            <a
              href={PAYPAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Contact Us
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
