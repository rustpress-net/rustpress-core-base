/**
 * Commerce Components
 * Product cards, pricing, cart, and e-commerce elements
 */

import React, { useState } from 'react';
import {
  ShoppingCart, Heart, Star, Plus, Minus, Trash2, Tag, Percent,
  Package, Truck, Check, X, CreditCard, ArrowRight, Gift, Clock,
} from 'lucide-react';
import clsx from 'clsx';

// ============================================
// 1. PRODUCT CARD
// ============================================

export interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  inStock?: boolean;
  variant?: 'default' | 'horizontal' | 'compact';
  onAddToCart?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function ProductCard({
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  badge,
  inStock = true,
  variant = 'default',
  onAddToCart,
  onFavorite,
  isFavorite,
}: ProductCardProps) {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  if (variant === 'horizontal') {
    return (
      <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="relative w-40 flex-shrink-0">
          <img src={image} alt={name} className="w-full h-full object-cover" />
          {badge && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="flex-1 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{name}</h3>
          {rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
              {reviews && <span className="text-sm text-gray-400">({reviews})</span>}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">${price}</span>
              {originalPrice && (
                <span className="ml-2 text-sm text-gray-400 line-through">${originalPrice}</span>
              )}
            </div>
            {onAddToCart && (
              <button
                onClick={onAddToCart}
                disabled={!inStock}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <img src={image} alt={name} className="w-16 h-16 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">{name}</h4>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">${price}</span>
            {originalPrice && <span className="text-sm text-gray-400 line-through">${originalPrice}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group">
      <div className="relative aspect-square">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        {badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
            {badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
            -{discount}%
          </span>
        )}
        {onFavorite && (
          <button
            onClick={onFavorite}
            className={clsx(
              'absolute bottom-2 right-2 p-2 rounded-full transition-colors',
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
            )}
          >
            <Heart className={clsx('w-5 h-5', isFavorite && 'fill-current')} />
          </button>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-3 py-1 bg-gray-900 text-white text-sm rounded">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{name}</h3>
        {rating && (
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={clsx('w-4 h-4', i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300')}
              />
            ))}
            {reviews && <span className="text-sm text-gray-400 ml-1">({reviews})</span>}
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">${price}</span>
            {originalPrice && (
              <span className="ml-2 text-sm text-gray-400 line-through">${originalPrice}</span>
            )}
          </div>
          {onAddToCart && (
            <button
              onClick={onAddToCart}
              disabled={!inStock}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 2. CART ITEM
// ============================================

export interface CartItemProps {
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({
  name,
  price,
  quantity,
  image,
  variant,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <img src={image} alt={name} className="w-20 h-20 rounded-lg object-cover" />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{name}</h4>
            {variant && <p className="text-sm text-gray-500">{variant}</p>}
          </div>
          <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">${(price * quantity).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. CART SUMMARY
// ============================================

export interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  onCheckout?: () => void;
  promoCode?: string;
  onApplyPromo?: (code: string) => void;
}

export function CartSummary({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  total,
  onCheckout,
  promoCode,
  onApplyPromo,
}: CartSummaryProps) {
  const [code, setCode] = useState('');

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
        </div>
        {shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Shipping</span>
            <span className="text-gray-900 dark:text-white">${shipping.toFixed(2)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tax</span>
            <span className="text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {onApplyPromo && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Promo code"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          />
          <button
            onClick={() => onApplyPromo(code)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Apply
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">Total</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
        </div>
      </div>

      {onCheckout && (
        <button
          onClick={onCheckout}
          className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          Checkout
        </button>
      )}
    </div>
  );
}

// ============================================
// 4. PRICING TIER
// ============================================

export interface PricingTierProps {
  name: string;
  price: number;
  period?: 'month' | 'year';
  description?: string;
  features: Array<{ text: string; included: boolean }>;
  cta?: { label: string; onClick?: () => void };
  popular?: boolean;
  highlighted?: boolean;
}

export function PricingTier({
  name,
  price,
  period = 'month',
  description,
  features,
  cta,
  popular,
  highlighted,
}: PricingTierProps) {
  return (
    <div
      className={clsx(
        'p-6 rounded-xl',
        highlighted
          ? 'bg-blue-600 text-white'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        popular && !highlighted && 'ring-2 ring-blue-500'
      )}
    >
      {popular && !highlighted && (
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full mb-4">
          Most Popular
        </span>
      )}
      <h3 className={clsx('text-lg font-semibold', highlighted ? 'text-white' : 'text-gray-900 dark:text-white')}>
        {name}
      </h3>
      {description && (
        <p className={clsx('text-sm mt-1', highlighted ? 'text-white/80' : 'text-gray-500')}>{description}</p>
      )}
      <div className="mt-4">
        <span className={clsx('text-4xl font-bold', highlighted ? 'text-white' : 'text-gray-900 dark:text-white')}>
          ${price}
        </span>
        <span className={clsx('text-sm', highlighted ? 'text-white/70' : 'text-gray-500')}>/{period}</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            {feature.included ? (
              <Check className={clsx('w-4 h-4', highlighted ? 'text-white' : 'text-green-500')} />
            ) : (
              <X className={clsx('w-4 h-4', highlighted ? 'text-white/50' : 'text-gray-300')} />
            )}
            <span className={clsx(!feature.included && (highlighted ? 'text-white/50' : 'text-gray-400'))}>
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
            highlighted
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
// 5. COUPON CARD
// ============================================

export interface CouponCardProps {
  code: string;
  discount: string;
  description?: string;
  expiresAt?: string;
  minOrder?: number;
  onApply?: () => void;
}

export function CouponCard({
  code,
  discount,
  description,
  expiresAt,
  minOrder,
  onApply,
}: CouponCardProps) {
  return (
    <div className="flex overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
      <div className="flex-1 p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5" />
          <span className="font-bold text-lg">{discount}</span>
        </div>
        <p className="text-sm text-white/90">{description}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-white/70">
          {expiresAt && <span>Expires: {expiresAt}</span>}
          {minOrder && <span>Min. order: ${minOrder}</span>}
        </div>
      </div>
      <div className="w-32 bg-white/10 flex flex-col items-center justify-center p-4 border-l border-dashed border-white/30">
        <p className="text-xs text-white/70 mb-1">CODE</p>
        <p className="font-mono font-bold text-white">{code}</p>
        {onApply && (
          <button
            onClick={onApply}
            className="mt-2 px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded hover:bg-gray-100"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// 6. ORDER STATUS
// ============================================

export interface OrderStatusProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderNumber?: string;
  date?: string;
  estimatedDelivery?: string;
}

export function OrderStatus({
  status,
  orderNumber,
  date,
  estimatedDelivery,
}: OrderStatusProps) {
  const statuses = {
    pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-100', step: 0 },
    processing: { label: 'Processing', color: 'text-blue-600 bg-blue-100', step: 1 },
    shipped: { label: 'Shipped', color: 'text-purple-600 bg-purple-100', step: 2 },
    delivered: { label: 'Delivered', color: 'text-green-600 bg-green-100', step: 3 },
    cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-100', step: -1 },
  };

  const current = statuses[status];
  const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          {orderNumber && <p className="text-sm text-gray-500">Order #{orderNumber}</p>}
          <span className={clsx('inline-block px-2 py-0.5 text-xs font-medium rounded mt-1', current.color)}>
            {current.label}
          </span>
        </div>
        {date && <p className="text-sm text-gray-500">{date}</p>}
      </div>

      {status !== 'cancelled' && (
        <div className="relative">
          <div className="flex justify-between mb-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    idx <= current.step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  )}
                >
                  {idx < current.step ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-xs text-gray-500 mt-1 text-center">{step}</span>
              </div>
            ))}
          </div>
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(current.step / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {estimatedDelivery && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Truck className="w-4 h-4" />
          Estimated delivery: {estimatedDelivery}
        </div>
      )}
    </div>
  );
}

// ============================================
// 7. RATING INPUT
// ============================================

export interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

export function RatingInput({
  value,
  onChange,
  max = 5,
  size = 'md',
  readOnly,
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, idx) => {
        const filled = idx < (hoverValue || value);
        return (
          <button
            key={idx}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange(idx + 1)}
            onMouseEnter={() => !readOnly && setHoverValue(idx + 1)}
            onMouseLeave={() => setHoverValue(0)}
            className={clsx('transition-colors', !readOnly && 'cursor-pointer hover:scale-110')}
          >
            <Star
              className={clsx(
                sizes[size],
                filled ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// 8. PRODUCT GALLERY
// ============================================

export interface ProductGalleryProps {
  images: string[];
  productName?: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={images[selectedIndex]}
          alt={productName || 'Product'}
          className="w-full h-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={clsx(
                'w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0',
                idx === selectedIndex ? 'border-blue-500' : 'border-transparent'
              )}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 9. SPECIAL OFFER BANNER
// ============================================

export interface SpecialOfferProps {
  title: string;
  description?: string;
  discount?: string;
  code?: string;
  expiresIn?: string;
  cta?: { label: string; onClick?: () => void };
  variant?: 'default' | 'compact';
}

export function SpecialOffer({
  title,
  description,
  discount,
  code,
  expiresIn,
  cta,
  variant = 'default',
}: SpecialOfferProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
        <Gift className="w-8 h-8" />
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          {code && <p className="text-sm text-white/80">Use code: {code}</p>}
        </div>
        {cta && (
          <button onClick={cta.onClick} className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium">
            {cta.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-center">
      <Gift className="w-12 h-12 mx-auto mb-4" />
      {discount && <p className="text-3xl font-bold mb-2">{discount}</p>}
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && <p className="text-white/80 mt-2">{description}</p>}
      {code && (
        <div className="mt-4 inline-block px-4 py-2 bg-white/20 rounded-lg font-mono font-bold">
          {code}
        </div>
      )}
      {expiresIn && (
        <p className="mt-3 text-sm text-white/70 flex items-center justify-center gap-1">
          <Clock className="w-4 h-4" />
          Expires in {expiresIn}
        </p>
      )}
      {cta && (
        <button
          onClick={cta.onClick}
          className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100"
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}

// ============================================
// 10. SHIPPING OPTIONS
// ============================================

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  icon?: React.ReactNode;
}

export interface ShippingOptionsProps {
  options: ShippingOption[];
  selected: string;
  onChange: (id: string) => void;
}

export function ShippingOptions({ options, selected, onChange }: ShippingOptionsProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.id}
          className={clsx(
            'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors',
            option.id === selected
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          )}
        >
          <input
            type="radio"
            name="shipping"
            value={option.id}
            checked={option.id === selected}
            onChange={() => onChange(option.id)}
            className="sr-only"
          />
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {option.icon || <Truck className="w-5 h-5 text-gray-500" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">{option.name}</p>
            <p className="text-sm text-gray-500">{option.estimatedDays}</p>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
          </span>
        </label>
      ))}
    </div>
  );
}
