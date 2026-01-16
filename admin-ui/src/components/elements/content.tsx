/**
 * Content Display Components
 * Cards, lists, stats, and content presentation elements
 */

import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, ExternalLink, MoreHorizontal, Clock, Calendar,
  Eye, Heart, MessageSquare, Share2, Bookmark, Tag, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, Star, Check, X, AlertCircle, Info, ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================
// 1. BASIC CARD
// ============================================

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick,
  className,
}: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-gray-800',
    bordered: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    ghost: 'bg-transparent',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl',
        variants[variant],
        paddings[padding],
        hover && 'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// 2. POST CARD
// ============================================

export interface PostCardProps {
  title: string;
  excerpt?: string;
  image?: string;
  author?: { name: string; avatar?: string };
  date?: string;
  readTime?: string;
  category?: string;
  tags?: string[];
  stats?: { views?: number; likes?: number; comments?: number };
  href?: string;
  variant?: 'horizontal' | 'vertical' | 'compact';
  featured?: boolean;
}

export function PostCard({
  title,
  excerpt,
  image,
  author,
  date,
  readTime,
  category,
  tags,
  stats,
  href,
  variant = 'vertical',
  featured = false,
}: PostCardProps) {
  const content = (
    <>
      {image && (
        <div
          className={clsx(
            'bg-gray-200 dark:bg-gray-700 overflow-hidden',
            variant === 'horizontal' ? 'w-1/3 flex-shrink-0' : 'w-full aspect-video',
            variant === 'compact' && 'w-20 h-20 rounded-lg'
          )}
        >
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className={clsx('flex-1', variant === 'horizontal' ? 'p-4' : 'p-4')}>
        {category && (
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded mb-2">
            {category}
          </span>
        )}
        <h3 className={clsx('font-semibold text-gray-900 dark:text-white', variant === 'compact' ? 'text-sm line-clamp-2' : 'text-lg line-clamp-2')}>
          {title}
        </h3>
        {excerpt && variant !== 'compact' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{excerpt}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          {author && (
            <div className="flex items-center gap-2">
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                  {author.name.charAt(0)}
                </div>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">{author.name}</span>
            </div>
          )}
          {date && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
          )}
          {readTime && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {readTime}
            </span>
          )}
        </div>
        {stats && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {stats.views !== undefined && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="w-3 h-3" />
                {stats.views}
              </span>
            )}
            {stats.likes !== undefined && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Heart className="w-3 h-3" />
                {stats.likes}
              </span>
            )}
            {stats.comments !== undefined && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MessageSquare className="w-3 h-3" />
                {stats.comments}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );

  const wrapperClass = clsx(
    'bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700',
    variant === 'horizontal' && 'flex',
    featured && 'ring-2 ring-blue-500',
    'hover:shadow-lg transition-shadow'
  );

  return href ? (
    <a href={href} className={wrapperClass}>{content}</a>
  ) : (
    <div className={wrapperClass}>{content}</div>
  );
}

// ============================================
// 3. STAT CARD
// ============================================

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; type: 'increase' | 'decrease' };
  icon?: React.ReactNode;
  trend?: number[];
  variant?: 'default' | 'compact' | 'large';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export function StatCard({
  label,
  value,
  change,
  icon,
  trend,
  variant = 'default',
  color = 'blue',
}: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {icon && (
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colors[color])}>
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className={clsx('font-bold text-gray-900 dark:text-white', variant === 'large' ? 'text-4xl' : 'text-2xl')}>
            {value}
          </p>
          {change && (
            <div className={clsx('flex items-center gap-1 text-sm mt-1', change.type === 'increase' ? 'text-green-600' : 'text-red-600')}>
              {change.type === 'increase' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {change.value}%
            </div>
          )}
        </div>
        {icon && (
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colors[color])}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-end gap-0.5 mt-4 h-10">
          {trend.map((val, idx) => (
            <div
              key={idx}
              className={clsx('flex-1 rounded-sm', colors[color].split(' ')[0])}
              style={{ height: `${(val / Math.max(...trend)) * 100}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 4. LIST ITEM
// ============================================

export interface ListItemProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: { label: string; color?: string };
  href?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function ListItem({
  title,
  description,
  icon,
  image,
  meta,
  actions,
  badge,
  href,
  selected,
  onClick,
}: ListItemProps) {
  const content = (
    <div
      className={clsx(
        'flex items-center gap-3 p-3 rounded-lg transition-colors',
        selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      {image && <img src={image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
      {icon && !image && (
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-white truncate">{title}</p>
          {badge && (
            <span className={clsx('px-1.5 py-0.5 text-xs rounded', badge.color || 'bg-gray-100 dark:bg-gray-700')}>
              {badge.label}
            </span>
          )}
        </div>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{description}</p>}
      </div>
      {meta && <div className="text-sm text-gray-500 dark:text-gray-400">{meta}</div>}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
}

// ============================================
// 5. FEATURE CARD
// ============================================

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  variant?: 'default' | 'centered' | 'horizontal';
  color?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  variant = 'default',
  color = 'blue',
}: FeatureCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  };

  const content = (
    <div
      className={clsx(
        'p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
        variant === 'horizontal' && 'flex items-start gap-4',
        variant === 'centered' && 'text-center',
        href && 'hover:shadow-lg transition-shadow'
      )}
    >
      <div
        className={clsx(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          colorClasses[color as keyof typeof colorClasses] || colorClasses.blue,
          variant === 'centered' && 'mx-auto'
        )}
      >
        {icon}
      </div>
      <div className={clsx(variant === 'horizontal' ? 'flex-1' : 'mt-4')}>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        {href && (
          <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-2">
            Learn more <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
}

// ============================================
// 6. TESTIMONIAL CARD
// ============================================

export interface TestimonialCardProps {
  quote: string;
  author: { name: string; title?: string; avatar?: string; company?: string };
  rating?: number;
  variant?: 'default' | 'featured' | 'minimal';
}

export function TestimonialCard({
  quote,
  author,
  rating,
  variant = 'default',
}: TestimonialCardProps) {
  return (
    <div
      className={clsx(
        'p-6 rounded-xl',
        variant === 'featured'
          ? 'bg-blue-600 text-white'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      )}
    >
      {rating && (
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={clsx(
                'w-4 h-4',
                i < rating
                  ? variant === 'featured'
                    ? 'text-yellow-300 fill-yellow-300'
                    : 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              )}
            />
          ))}
        </div>
      )}
      <p className={clsx('text-base italic', variant === 'featured' ? 'text-white/90' : 'text-gray-600 dark:text-gray-400')}>
        "{quote}"
      </p>
      <div className="flex items-center gap-3 mt-4">
        {author.avatar ? (
          <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full" />
        ) : (
          <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium', variant === 'featured' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700')}>
            {author.name.charAt(0)}
          </div>
        )}
        <div>
          <p className={clsx('font-medium', variant === 'featured' ? 'text-white' : 'text-gray-900 dark:text-white')}>
            {author.name}
          </p>
          {(author.title || author.company) && (
            <p className={clsx('text-sm', variant === 'featured' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400')}>
              {author.title}{author.title && author.company && ' at '}{author.company}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 7. TIMELINE
// ============================================

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'upcoming';
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'alternating';
}

export function Timeline({ items, variant = 'default' }: TimelineProps) {
  return (
    <div className="relative">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={clsx('relative pb-8 last:pb-0', variant === 'alternating' && idx % 2 === 1 && 'text-right')}
        >
          {idx < items.length - 1 && (
            <div
              className={clsx(
                'absolute w-0.5 bg-gray-200 dark:bg-gray-700',
                variant === 'compact' ? 'left-3 top-6 bottom-0' : 'left-4 top-8 bottom-0'
              )}
            />
          )}
          <div className={clsx('flex gap-4', variant === 'alternating' && idx % 2 === 1 && 'flex-row-reverse')}>
            <div
              className={clsx(
                'flex-shrink-0 rounded-full flex items-center justify-center',
                variant === 'compact' ? 'w-6 h-6' : 'w-8 h-8',
                item.status === 'completed' && 'bg-green-500 text-white',
                item.status === 'current' && 'bg-blue-500 text-white',
                item.status === 'upcoming' && 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              )}
            >
              {item.icon || (item.status === 'completed' ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
              <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// 8. ACCORDION
// ============================================

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  variant?: 'default' | 'bordered' | 'separated';
  defaultOpen?: string[];
}

export function Accordion({
  items,
  allowMultiple = false,
  variant = 'default',
  defaultOpen = [],
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      if (!allowMultiple) {
        newOpen.clear();
      }
      newOpen.add(id);
    }
    setOpenItems(newOpen);
  };

  const variantClasses = {
    default: '',
    bordered: 'border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden',
    separated: 'space-y-2',
  };

  return (
    <div className={variantClasses[variant]}>
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={clsx(
            variant === 'separated' && 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
            variant === 'bordered' && idx > 0 && 'border-t border-gray-200 dark:border-gray-700'
          )}
        >
          <button
            onClick={() => toggle(item.id)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
            </div>
            <ChevronDown
              className={clsx('w-5 h-5 text-gray-500 transition-transform', openItems.has(item.id) && 'rotate-180')}
            />
          </button>
          {openItems.has(item.id) && (
            <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// 9. TAG CLOUD
// ============================================

export interface TagCloudProps {
  tags: Array<{ label: string; count?: number; href?: string }>;
  variant?: 'default' | 'pills' | 'links';
  maxTags?: number;
}

export function TagCloud({ tags, variant = 'default', maxTags }: TagCloudProps) {
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;

  const tagClasses = {
    default: 'px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600',
    pills: 'px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50',
    links: 'text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map((tag, idx) => (
        <a key={idx} href={tag.href || `#${tag.label}`} className={tagClasses[variant]}>
          {variant === 'links' && '#'}{tag.label}
          {tag.count !== undefined && variant !== 'links' && (
            <span className="ml-1 text-xs opacity-70">({tag.count})</span>
          )}
        </a>
      ))}
      {maxTags && tags.length > maxTags && (
        <span className="text-sm text-gray-500">+{tags.length - maxTags} more</span>
      )}
    </div>
  );
}

// ============================================
// 10. PRICE CARD
// ============================================

export interface PriceCardProps {
  name: string;
  price: string | number;
  period?: string;
  description?: string;
  features: Array<{ text: string; included: boolean }>;
  cta?: { label: string; href?: string; onClick?: () => void };
  popular?: boolean;
  variant?: 'default' | 'featured';
}

export function PriceCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  popular,
  variant = 'default',
}: PriceCardProps) {
  return (
    <div
      className={clsx(
        'p-6 rounded-xl',
        variant === 'featured'
          ? 'bg-blue-600 text-white'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        popular && variant !== 'featured' && 'ring-2 ring-blue-500'
      )}
    >
      {popular && variant !== 'featured' && (
        <div className="text-xs font-semibold text-blue-600 mb-2">Most Popular</div>
      )}
      <h3 className={clsx('text-lg font-semibold', variant === 'featured' ? 'text-white' : 'text-gray-900 dark:text-white')}>
        {name}
      </h3>
      {description && (
        <p className={clsx('text-sm mt-1', variant === 'featured' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400')}>
          {description}
        </p>
      )}
      <div className="mt-4">
        <span className={clsx('text-4xl font-bold', variant === 'featured' ? 'text-white' : 'text-gray-900 dark:text-white')}>
          {typeof price === 'number' ? `$${price}` : price}
        </span>
        {period && (
          <span className={clsx('text-sm', variant === 'featured' ? 'text-white/70' : 'text-gray-500')}>/{period}</span>
        )}
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            {feature.included ? (
              <Check className={clsx('w-4 h-4', variant === 'featured' ? 'text-white' : 'text-green-500')} />
            ) : (
              <X className={clsx('w-4 h-4', variant === 'featured' ? 'text-white/50' : 'text-gray-300')} />
            )}
            <span className={clsx(!feature.included && (variant === 'featured' ? 'text-white/50' : 'text-gray-400'))}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      {cta && (
        <button
          onClick={cta.onClick}
          className={clsx(
            'w-full mt-6 py-2.5 px-4 rounded-lg font-medium transition-colors',
            variant === 'featured'
              ? 'bg-white text-blue-600 hover:bg-gray-100'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}

// ============================================
// 11. ALERT
// ============================================

export interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

export function Alert({ type, title, children, dismissible, onDismiss, icon }: AlertProps) {
  const types = {
    info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200', icon: <Info className="w-5 h-5" /> },
    success: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-200', icon: <Check className="w-5 h-5" /> },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-200', icon: <AlertCircle className="w-5 h-5" /> },
    error: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-200', icon: <X className="w-5 h-5" /> },
  };

  const style = types[type];

  return (
    <div className={clsx('flex gap-3 p-4 rounded-lg border', style.bg, style.border)}>
      <div className={style.text}>{icon || style.icon}</div>
      <div className="flex-1">
        {title && <h4 className={clsx('font-medium', style.text)}>{title}</h4>}
        <div className={clsx('text-sm', style.text, title && 'mt-1')}>{children}</div>
      </div>
      {dismissible && (
        <button onClick={onDismiss} className={clsx('p-1 rounded hover:bg-black/10', style.text)}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================
// 12. EMPTY STATE
// ============================================

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  variant?: 'default' | 'compact';
}

export function EmptyState({ icon, title, description, action, variant = 'default' }: EmptyStateProps) {
  return (
    <div className={clsx('text-center', variant === 'default' ? 'py-12' : 'py-6')}>
      {icon && (
        <div className={clsx('mx-auto text-gray-400', variant === 'default' ? 'w-16 h-16' : 'w-10 h-10')}>
          {icon}
        </div>
      )}
      <h3 className={clsx('font-medium text-gray-900 dark:text-white', icon && 'mt-4', variant === 'compact' && 'text-sm')}>
        {title}
      </h3>
      {description && (
        <p className={clsx('text-gray-500 dark:text-gray-400 mt-1', variant === 'compact' ? 'text-xs' : 'text-sm')}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================
// 13. DATA TABLE ROW
// ============================================

export interface DataTableRowProps {
  cells: React.ReactNode[];
  selected?: boolean;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function DataTableRow({ cells, selected, onClick, actions }: DataTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'border-b border-gray-200 dark:border-gray-700 last:border-0',
        selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
        onClick && 'cursor-pointer'
      )}
    >
      {cells.map((cell, idx) => (
        <td key={idx} className="px-4 py-3 text-sm">
          {cell}
        </td>
      ))}
      {actions && (
        <td className="px-4 py-3 text-right">
          {actions}
        </td>
      )}
    </tr>
  );
}

// ============================================
// 14. CALLOUT
// ============================================

export interface CalloutProps {
  icon?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
  variant?: 'note' | 'tip' | 'important' | 'warning' | 'caution';
}

export function Callout({ icon, title, children, variant = 'note' }: CalloutProps) {
  const variants = {
    note: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600', icon: <Info className="w-5 h-5" />, color: 'text-gray-700 dark:text-gray-300' },
    tip: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-300 dark:border-green-700', icon: <Check className="w-5 h-5" />, color: 'text-green-700 dark:text-green-300' },
    important: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-700', icon: <Info className="w-5 h-5" />, color: 'text-blue-700 dark:text-blue-300' },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-700', icon: <AlertCircle className="w-5 h-5" />, color: 'text-yellow-700 dark:text-yellow-300' },
    caution: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700', icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-700 dark:text-red-300' },
  };

  const style = variants[variant];

  return (
    <div className={clsx('p-4 rounded-lg border-l-4', style.bg, style.border)}>
      <div className={clsx('flex items-center gap-2', style.color)}>
        {icon || style.icon}
        {title && <span className="font-medium">{title}</span>}
      </div>
      <div className={clsx('text-sm mt-2', style.color)}>{children}</div>
    </div>
  );
}

// ============================================
// 15. COUNTER
// ============================================

export interface CounterProps {
  value: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export function Counter({ value, label, prefix, suffix, size = 'md', animated }: CounterProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
  };

  return (
    <div className="text-center">
      <div className={clsx('font-bold text-gray-900 dark:text-white', sizeClasses[size])}>
        {prefix}{value.toLocaleString()}{suffix}
      </div>
      {label && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>}
    </div>
  );
}

// ============================================
// 16. QUOTE
// ============================================

export interface QuoteProps {
  children: React.ReactNode;
  author?: string;
  source?: string;
  variant?: 'default' | 'large' | 'bordered';
}

export function Quote({ children, author, source, variant = 'default' }: QuoteProps) {
  return (
    <blockquote
      className={clsx(
        variant === 'bordered' && 'border-l-4 border-blue-500 pl-4',
        variant === 'large' && 'text-xl'
      )}
    >
      <p className={clsx('italic text-gray-700 dark:text-gray-300', variant === 'large' ? 'text-xl' : 'text-base')}>
        "{children}"
      </p>
      {(author || source) && (
        <footer className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {author && <span className="font-medium">— {author}</span>}
          {source && <cite className="ml-1">{source}</cite>}
        </footer>
      )}
    </blockquote>
  );
}

// ============================================
// 17. CATEGORY LIST
// ============================================

export interface CategoryListProps {
  categories: Array<{ name: string; count?: number; href?: string; icon?: React.ReactNode }>;
  variant?: 'default' | 'pills' | 'cards';
  showCounts?: boolean;
}

export function CategoryList({ categories, variant = 'default', showCounts = true }: CategoryListProps) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat, idx) => (
          <a
            key={idx}
            href={cat.href}
            className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {cat.icon && <span className="text-blue-500">{cat.icon}</span>}
            <span className="flex-1 font-medium text-gray-900 dark:text-white">{cat.name}</span>
            {showCounts && cat.count !== undefined && (
              <span className="text-xs text-gray-500">{cat.count}</span>
            )}
          </a>
        ))}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className="flex flex-wrap gap-2">
        {categories.map((cat, idx) => (
          <a
            key={idx}
            href={cat.href}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {cat.name}
            {showCounts && cat.count !== undefined && (
              <span className="ml-1 text-gray-500">({cat.count})</span>
            )}
          </a>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {categories.map((cat, idx) => (
        <li key={idx}>
          <a
            href={cat.href}
            className="flex items-center justify-between py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <span className="flex items-center gap-2">
              {cat.icon}
              {cat.name}
            </span>
            {showCounts && cat.count !== undefined && (
              <span className="text-sm text-gray-400">{cat.count}</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}

// ============================================
// 18. PROGRESS CARD
// ============================================

export interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  unit?: string;
  description?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function ProgressCard({ title, value, max, unit, description, color = 'blue' }: ProgressCardProps) {
  const percentage = Math.round((value / max) * 100);

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <span className="text-sm text-gray-500">
          {value}{unit} / {max}{unit}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full', colors[color])} style={{ width: `${percentage}%` }} />
      </div>
      {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
    </div>
  );
}

// ============================================
// 19. INFO ROW
// ============================================

export interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
}

export function InfoRow({ label, value, icon, href }: InfoRowProps) {
  const content = (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-white">{value}</div>
    </div>
  );

  return href ? (
    <a href={href} className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 rounded">
      {content}
    </a>
  ) : (
    content
  );
}

// ============================================
// 20. NOTIFICATION ITEM
// ============================================

export interface NotificationItemProps {
  title: string;
  description?: string;
  time: string;
  icon?: React.ReactNode;
  read?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function NotificationItem({
  title,
  description,
  time,
  icon,
  read = false,
  type = 'info',
  onClick,
  actions,
}: NotificationItemProps) {
  const typeColors = {
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-600',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex gap-3 p-3 rounded-lg transition-colors',
        !read && 'bg-blue-50 dark:bg-blue-900/10',
        onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'
      )}
    >
      {icon && (
        <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', typeColors[type])}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={clsx('text-sm font-medium', !read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
            {title}
          </p>
          {!read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
        </div>
        {description && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{description}</p>}
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

// ============================================
// 21. COMPARISON TABLE ROW
// ============================================

export interface ComparisonRowProps {
  feature: string;
  values: Array<boolean | string | React.ReactNode>;
}

export function ComparisonRow({ feature, values }: ComparisonRowProps) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{feature}</td>
      {values.map((val, idx) => (
        <td key={idx} className="py-3 px-4 text-center">
          {typeof val === 'boolean' ? (
            val ? (
              <Check className="w-5 h-5 text-green-500 mx-auto" />
            ) : (
              <X className="w-5 h-5 text-gray-300 mx-auto" />
            )
          ) : (
            <span className="text-sm text-gray-700 dark:text-gray-300">{val}</span>
          )}
        </td>
      ))}
    </tr>
  );
}
