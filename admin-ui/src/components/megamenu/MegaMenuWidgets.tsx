import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MapPin,
  Phone,
  Mail,
  Clock,
  Check,
  X,
  Search,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Quote,
  User,
  Calendar,
  Tag,
  Heart,
  ShoppingCart,
  Eye,
  Loader2
} from 'lucide-react';
import clsx from 'clsx';
import type { MegaMenuWidget, WidgetConfig, WidgetStyle, WidgetAnimation } from './MegaMenuBuilder';

// ==================== SHARED TYPES ====================

interface WidgetRendererProps {
  widget: MegaMenuWidget;
  isPreview?: boolean;
  onEdit?: () => void;
}

// ==================== ANIMATION VARIANTS ====================

const getEntranceAnimation = (entrance: WidgetAnimation['entrance']) => {
  const variants: Record<string, any> = {
    none: { opacity: 1, y: 0, x: 0, scale: 1 },
    fade: { opacity: 0 },
    'slide-up': { opacity: 0, y: 20 },
    'slide-down': { opacity: 0, y: -20 },
    'slide-left': { opacity: 0, x: 20 },
    'slide-right': { opacity: 0, x: -20 },
    zoom: { opacity: 0, scale: 0.8 },
    flip: { opacity: 0, rotateX: 90 },
    bounce: { opacity: 0, y: 30 }
  };
  return variants[entrance] || variants.fade;
};

const getHoverAnimation = (hover: WidgetAnimation['hover']) => {
  const variants: Record<string, any> = {
    none: {},
    lift: { y: -4, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' },
    grow: { scale: 1.02 },
    shrink: { scale: 0.98 },
    glow: { boxShadow: '0 0 20px rgba(59,130,246,0.5)' },
    shake: { x: [-2, 2, -2, 2, 0] },
    pulse: { scale: [1, 1.02, 1] }
  };
  return variants[hover || 'none'] || {};
};

// ==================== LINKS WIDGET ====================

export const LinksWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = (widget.config.links || { links: [] }) as { links: any[] };

  return (
    <div className="mega-widget-links">
      {widget.showTitle && (
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
          {widget.title}
        </h3>
      )}
      <ul className="space-y-1">
        {config.links?.map((link, index) => (
          <motion.li
            key={link.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <a
              href={isPreview ? '#' : link.url}
              target={link.target}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-all"
            >
              {link.image && (
                <img
                  src={link.image}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">
                    {link.label}
                  </span>
                  {link.badge && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: link.badgeColor || '#3b82f6', color: 'white' }}
                    >
                      {link.badge}
                    </span>
                  )}
                  {link.target === '_blank' && (
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                {link.description && (
                  <p className="text-xs text-gray-500 truncate">{link.description}</p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </a>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

// ==================== IMAGE WIDGET ====================

export const ImageWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.image;
  if (!config) return null;

  const aspectRatioClass = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]',
    'auto': ''
  }[config.aspectRatio || 'auto'];

  const hoverEffect = {
    none: '',
    zoom: 'group-hover:scale-110',
    brightness: 'group-hover:brightness-110',
    blur: 'group-hover:blur-sm',
    grayscale: 'grayscale group-hover:grayscale-0',
    sepia: 'group-hover:sepia'
  }[config.hover?.effect || 'none'];

  return (
    <div className="mega-widget-image">
      {widget.showTitle && (
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
          {widget.title}
        </h3>
      )}
      <a
        href={isPreview ? '#' : config.link}
        target={config.linkTarget}
        className="group block relative rounded-xl overflow-hidden"
      >
        <div className={clsx('relative', aspectRatioClass)}>
          {config.src ? (
            <img
              src={config.src}
              alt={config.alt}
              className={clsx(
                'w-full h-full transition-transform duration-500',
                config.objectFit === 'cover' && 'object-cover',
                config.objectFit === 'contain' && 'object-contain',
                config.objectFit === 'fill' && 'object-fill',
                hoverEffect
              )}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}

          {config.overlay?.enabled && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundColor: config.overlay.color,
                opacity: config.overlay.opacity
              }}
            >
              {config.overlay.text && (
                <p className="text-white font-semibold text-lg text-center px-4">
                  {config.overlay.text}
                </p>
              )}
            </div>
          )}
        </div>

        {config.caption && (
          <p className="mt-2 text-sm text-gray-500 text-center">{config.caption}</p>
        )}
      </a>
    </div>
  );
};

// ==================== IMAGE GALLERY WIDGET ====================

export const ImageGalleryWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.gallery;
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!config) return null;

  return (
    <div className="mega-widget-gallery">
      {widget.showTitle && (
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
          {widget.title}
        </h3>
      )}

      {config.layout === 'carousel' ? (
        <div className="relative overflow-hidden rounded-xl">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {config.images.map((img) => (
              <div key={img.id} className="flex-shrink-0 w-full">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full aspect-video object-cover"
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {config.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={clsx(
                  'w-2 h-2 rounded-full transition-colors',
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            'grid',
            config.layout === 'masonry' ? 'masonry' : ''
          )}
          style={{
            gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
            gap: config.gap
          }}
        >
          {config.images.map((img) => (
            <motion.div
              key={img.id}
              whileHover={{ scale: 1.02 }}
              className="relative rounded-lg overflow-hidden cursor-pointer"
              onClick={() => config.lightbox && setLightboxImage(img.src)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== POSTS WIDGET ====================

export const PostsWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.posts;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!config) return null;

  // Simulate posts data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPosts([
        {
          id: 1,
          title: 'Getting Started with RustPress',
          excerpt: 'Learn how to build your first website with RustPress CMS...',
          image: 'https://via.placeholder.com/400x300',
          date: '2024-01-15',
          author: 'John Doe',
          category: 'Tutorials'
        },
        {
          id: 2,
          title: 'Advanced Theme Development',
          excerpt: 'Take your themes to the next level with advanced techniques...',
          image: 'https://via.placeholder.com/400x300',
          date: '2024-01-12',
          author: 'Jane Smith',
          category: 'Development'
        },
        {
          id: 3,
          title: 'Performance Optimization Tips',
          excerpt: 'Speed up your website with these optimization strategies...',
          image: 'https://via.placeholder.com/400x300',
          date: '2024-01-10',
          author: 'Mike Johnson',
          category: 'Performance'
        },
        {
          id: 4,
          title: 'Security Best Practices',
          excerpt: 'Keep your website secure with these essential tips...',
          image: 'https://via.placeholder.com/400x300',
          date: '2024-01-08',
          author: 'Sarah Wilson',
          category: 'Security'
        }
      ].slice(0, config.count));
      setLoading(false);
    }, 500);
  }, [config.count]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mega-widget-posts">
      {widget.showTitle && (
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
          {widget.title}
        </h3>
      )}

      {config.layout === 'grid' ? (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${config.columns || 2}, 1fr)` }}
        >
          {posts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              {config.showImage && (
                <a href="#" className="block relative rounded-lg overflow-hidden mb-3">
                  <img
                    src={post.image}
                    alt={post.title}
                    className={clsx(
                      'w-full object-cover transition-transform duration-300 group-hover:scale-105',
                      config.imageAspectRatio === '1:1' && 'aspect-square',
                      config.imageAspectRatio === '4:3' && 'aspect-[4/3]',
                      config.imageAspectRatio === '16:9' && 'aspect-video'
                    )}
                  />
                </a>
              )}

              {config.showCategory && (
                <span className="text-xs font-medium text-blue-600 mb-1 inline-block">
                  {post.category}
                </span>
              )}

              <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                <a href="#">{post.title}</a>
              </h4>

              {config.showExcerpt && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                  {post.excerpt.slice(0, config.excerptLength)}...
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-400">
                {config.showDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                )}
                {config.showAuthor && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4 group"
            >
              {config.showImage && (
                <a href="#" className="flex-shrink-0 relative rounded-lg overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate mb-1">
                  <a href="#">{post.title}</a>
                </h4>

                {config.showExcerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {post.excerpt.slice(0, config.excerptLength)}...
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  {config.showDate && (
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== PRODUCTS WIDGET ====================

export const ProductsWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.products;
  const [products, setProducts] = useState<any[]>([]);

  if (!config) return null;

  useEffect(() => {
    setProducts([
      {
        id: 1,
        name: 'Premium Headphones',
        price: 299.99,
        salePrice: 249.99,
        image: 'https://via.placeholder.com/300',
        rating: 4.5,
        badge: 'Sale'
      },
      {
        id: 2,
        name: 'Wireless Keyboard',
        price: 149.99,
        image: 'https://via.placeholder.com/300',
        rating: 4.8,
        badge: 'New'
      },
      {
        id: 3,
        name: 'Ergonomic Mouse',
        price: 79.99,
        image: 'https://via.placeholder.com/300',
        rating: 4.2
      },
      {
        id: 4,
        name: 'USB-C Hub',
        price: 59.99,
        image: 'https://via.placeholder.com/300',
        rating: 4.6,
        badge: 'Bestseller'
      }
    ].slice(0, config.count));
  }, [config.count]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={clsx(
              'w-3 h-3',
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mega-widget-products">
      {widget.showTitle && (
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
          {widget.title}
        </h3>
      )}

      <div
        className={clsx(
          config.layout === 'grid' ? 'grid gap-4' : 'space-y-3'
        )}
        style={config.layout === 'grid' ? { gridTemplateColumns: `repeat(${config.columns || 2}, 1fr)` } : {}}
      >
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={clsx(
              'group relative',
              config.layout === 'list' && 'flex gap-4'
            )}
          >
            {config.showImage && (
              <a href="#" className={clsx(
                'relative rounded-lg overflow-hidden block',
                config.layout === 'list' ? 'flex-shrink-0 w-24 h-24' : ''
              )}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={clsx(
                    'w-full object-cover transition-transform duration-300 group-hover:scale-105',
                    config.layout === 'grid' && 'aspect-square'
                  )}
                />
                {config.showBadge && product.badge && (
                  <span className="absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full bg-red-500 text-white">
                    {product.badge}
                  </span>
                )}
              </a>
            )}

            <div className={clsx(config.layout === 'grid' && 'mt-2')}>
              <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                <a href="#">{product.name}</a>
              </h4>

              {config.showRating && (
                <div className="mt-1">
                  {renderStars(product.rating)}
                </div>
              )}

              {config.showPrice && (
                <div className="mt-2 flex items-center gap-2">
                  {product.salePrice ? (
                    <>
                      <span className="font-bold text-red-600">${product.salePrice}</span>
                      <span className="text-sm text-gray-400 line-through">${product.price}</span>
                    </>
                  ) : (
                    <span className="font-bold text-gray-800">${product.price}</span>
                  )}
                </div>
              )}

              {config.showAddToCart && (
                <button className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== ICON BOX WIDGET ====================

export const IconBoxWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.iconBox;
  if (!config) return null;

  const iconSizeClass = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }[config.iconSize || 'md'];

  const iconContainerClass = clsx(
    'flex items-center justify-center transition-transform',
    {
      'rounded-full': config.iconStyle === 'circle',
      'rounded-lg': config.iconStyle === 'square' || config.iconStyle === 'rounded',
      'bg-gradient-to-br': config.iconStyle === 'gradient',
    },
    iconSizeClass.replace(/w-(\d+)/, 'w-$1').replace(/h-(\d+)/, 'p-3')
  );

  return (
    <motion.div
      className={clsx(
        'mega-widget-icon-box group cursor-pointer',
        config.layout === 'horizontal' && 'flex gap-4'
      )}
      whileHover={{ y: -4 }}
    >
      <div
        className={iconContainerClass}
        style={{
          backgroundColor: config.iconBgColor,
          color: config.iconColor
        }}
      >
        <Star className={iconSizeClass} />
      </div>

      <div className={config.layout === 'vertical' ? 'mt-4' : ''}>
        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {config.title}
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          {config.description}
        </p>
        {config.link && config.linkText && (
          <a
            href={isPreview ? '#' : config.link}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mt-3"
          >
            {config.linkText}
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

// ==================== CTA BUTTON WIDGET ====================

export const CTAButtonWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.ctaButton;
  if (!config) return null;

  const sizeClass = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
    xl: 'px-10 py-4 text-xl'
  }[config.size || 'md'];

  const styleClass = clsx(
    'inline-flex items-center gap-2 font-semibold rounded-lg transition-all',
    sizeClass,
    config.fullWidth && 'w-full justify-center',
    {
      'text-white': config.style === 'solid' || config.style === 'gradient',
      'border-2': config.style === 'outline',
      'bg-transparent hover:bg-gray-100': config.style === 'ghost'
    }
  );

  const animationClass = {
    none: '',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    shake: 'hover:animate-shake',
    glow: 'shadow-lg shadow-blue-500/50'
  }[config.animation || 'none'];

  return (
    <div className="mega-widget-cta-button">
      <motion.a
        href={isPreview ? '#' : config.url}
        target={config.target}
        className={clsx(styleClass, animationClass)}
        style={{
          backgroundColor: config.style === 'solid' ? config.color : 'transparent',
          borderColor: config.style === 'outline' ? config.color : undefined,
          color: config.style === 'outline' || config.style === 'ghost' ? config.color : undefined,
          background: config.style === 'gradient' ? `linear-gradient(135deg, ${config.color}, ${config.hoverColor || config.color})` : undefined
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {config.icon && config.iconPosition === 'left' && (
          <ArrowRight className="w-5 h-5" />
        )}
        {config.text}
        {config.icon && config.iconPosition === 'right' && (
          <ArrowRight className="w-5 h-5" />
        )}
      </motion.a>
    </div>
  );
};

// ==================== CTA BANNER WIDGET ====================

export const CTABannerWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.ctaBanner;
  if (!config) return null;

  return (
    <div
      className="mega-widget-cta-banner relative rounded-xl overflow-hidden"
      style={{ minHeight: config.minHeight }}
    >
      {config.backgroundImage && (
        <img
          src={config.backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          backgroundColor: config.overlayColor || config.backgroundColor,
          opacity: config.overlayOpacity || 1
        }}
      />

      <div className={clsx(
        'relative z-10 p-8 flex flex-col justify-center h-full',
        {
          'items-start text-left': config.alignment === 'left',
          'items-center text-center': config.alignment === 'center',
          'items-end text-right': config.alignment === 'right'
        }
      )}>
        <h3 className="text-2xl font-bold text-white mb-2">{config.title}</h3>
        {config.subtitle && (
          <p className="text-white/80 mb-6">{config.subtitle}</p>
        )}
        <motion.a
          href={isPreview ? '#' : config.buttonUrl}
          className={clsx(
            'inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all',
            config.buttonStyle === 'solid' && 'text-gray-800',
            config.buttonStyle === 'outline' && 'border-2 border-white text-white',
            config.buttonStyle === 'ghost' && 'text-white hover:bg-white/20'
          )}
          style={{
            backgroundColor: config.buttonStyle === 'solid' ? config.buttonColor : 'transparent'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {config.buttonText}
          <ArrowRight className="w-5 h-5" />
        </motion.a>
      </div>
    </div>
  );
};

// ==================== CONTACT INFO WIDGET ====================

export const ContactInfoWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.contactInfo;
  if (!config) return null;

  const getIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      address: MapPin,
      phone: Phone,
      email: Mail,
      hours: Clock
    };
    return icons[type] || MapPin;
  };

  return (
    <div className="mega-widget-contact-info">
      {widget.showTitle && (
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
          {widget.title}
        </h3>
      )}

      <div className={clsx(
        config.layout === 'horizontal' && 'flex flex-wrap gap-6',
        config.layout === 'vertical' && 'space-y-4',
        config.layout === 'inline' && 'flex flex-wrap gap-4'
      )}>
        {config.items.map((item, idx) => {
          const Icon = getIcon(item.type);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={clsx(
                'flex items-start gap-3',
                config.layout === 'inline' && 'items-center'
              )}
            >
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                {item.link ? (
                  <a
                    href={isPreview ? '#' : item.link}
                    className="text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-gray-800">{item.value}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== SOCIAL LINKS WIDGET ====================

export const SocialLinksWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.socialLinks;
  if (!config) return null;

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      facebook: Facebook,
      twitter: Twitter,
      instagram: Instagram,
      linkedin: Linkedin,
      youtube: Youtube,
      github: Github
    };
    return icons[platform.toLowerCase()] || ExternalLink;
  };

  const getSocialColor = (platform: string) => {
    const colors: Record<string, string> = {
      facebook: '#1877f2',
      twitter: '#1da1f2',
      instagram: '#e4405f',
      linkedin: '#0077b5',
      youtube: '#ff0000',
      github: '#333333'
    };
    return colors[platform.toLowerCase()] || '#6b7280';
  };

  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }[config.size || 'md'];

  return (
    <div className="mega-widget-social-links">
      {widget.showTitle && (
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
          {widget.title}
        </h3>
      )}

      <div className={clsx(
        'flex gap-3',
        config.layout === 'vertical' && 'flex-col'
      )}>
        {config.networks.map((network, idx) => {
          const Icon = getSocialIcon(network.platform);
          const color = config.colorStyle === 'brand'
            ? getSocialColor(network.platform)
            : config.colorStyle === 'mono'
              ? '#6b7280'
              : config.customColor || '#6b7280';

          return (
            <motion.a
              key={network.id}
              href={isPreview ? '#' : network.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.1 }}
              className={clsx(
                'flex items-center justify-center rounded-full transition-all',
                sizeClass,
                config.style === 'icons' && 'hover:bg-gray-100',
                config.style === 'buttons' && 'text-white'
              )}
              style={{
                backgroundColor: config.style === 'buttons' ? color : 'transparent',
                color: config.style === 'buttons' ? 'white' : color
              }}
            >
              <Icon className={clsx(
                config.size === 'sm' && 'w-4 h-4',
                config.size === 'md' && 'w-5 h-5',
                config.size === 'lg' && 'w-6 h-6'
              )} />
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

// ==================== NEWSLETTER WIDGET ====================

export const NewsletterWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.newsletter;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!config) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPreview) {
      setSubmitted(true);
    }
  };

  return (
    <div className="mega-widget-newsletter">
      {widget.showTitle && config.title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {config.title}
        </h3>
      )}

      {config.description && (
        <p className="text-sm text-gray-500 mb-4">{config.description}</p>
      )}

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg"
        >
          <Check className="w-5 h-5" />
          <span>Thanks for subscribing!</span>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className={clsx(
          'flex gap-2',
          config.layout === 'vertical' && 'flex-col'
        )}>
          {config.showName && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={config.placeholder}
            required
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 font-semibold text-white rounded-lg transition-colors flex items-center gap-2"
            style={{ backgroundColor: config.buttonColor }}
          >
            <Send className="w-4 h-4" />
            {config.buttonText}
          </motion.button>
        </form>
      )}

      {config.privacyText && (
        <p className="text-xs text-gray-400 mt-3">
          {config.privacyText}
          {config.privacyLink && (
            <a href={config.privacyLink} className="text-blue-500 hover:underline ml-1">
              Privacy Policy
            </a>
          )}
        </p>
      )}
    </div>
  );
};

// ==================== TESTIMONIAL WIDGET ====================

export const TestimonialWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.testimonial;
  if (!config) return null;

  return (
    <motion.div
      className={clsx(
        'mega-widget-testimonial',
        config.style === 'card' && 'bg-white rounded-xl p-6 shadow-sm border border-gray-100',
        config.style === 'bordered' && 'border-l-4 border-blue-500 pl-6',
        config.style === 'minimal' && ''
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Quote className="w-8 h-8 text-blue-200 mb-4" />

      <blockquote className="text-gray-700 text-lg mb-6">
        "{config.quote}"
      </blockquote>

      <div className="flex items-center gap-4">
        {config.avatar && (
          <img
            src={config.avatar}
            alt={config.author}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}

        <div>
          <div className="font-semibold text-gray-800">{config.author}</div>
          {(config.role || config.company) && (
            <div className="text-sm text-gray-500">
              {config.role}
              {config.role && config.company && ' at '}
              {config.company}
            </div>
          )}
        </div>

        {config.rating && (
          <div className="ml-auto flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={clsx(
                  'w-4 h-4',
                  star <= config.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ==================== COUNTDOWN WIDGET ====================

export const CountdownWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.countdown;
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  if (!config) return null;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(config.targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setIsComplete(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [config.targetDate]);

  if (isComplete) {
    if (config.completedAction === 'hide') return null;
    if (config.completedAction === 'show-text') {
      return (
        <div className="mega-widget-countdown text-center p-6 bg-gray-50 rounded-xl">
          <p className="text-lg font-semibold text-gray-700">{config.completedText}</p>
        </div>
      );
    }
  }

  const timeUnits = [
    { value: timeLeft.days, label: config.labels.days },
    { value: timeLeft.hours, label: config.labels.hours },
    { value: timeLeft.minutes, label: config.labels.minutes },
    { value: timeLeft.seconds, label: config.labels.seconds }
  ];

  return (
    <div className="mega-widget-countdown">
      {widget.showTitle && (
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 text-center">
          {widget.title}
        </h3>
      )}

      <div className={clsx(
        'flex justify-center gap-4',
        config.style === 'inline' && 'gap-2'
      )}>
        {timeUnits.map((unit, idx) => (
          <motion.div
            key={unit.label}
            className={clsx(
              config.style === 'boxes' && 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-4 min-w-[80px] text-center',
              config.style === 'inline' && 'text-center',
              config.style === 'flip' && 'relative perspective-1000'
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className={clsx(
              'font-bold tabular-nums',
              config.style === 'boxes' && 'text-3xl',
              config.style === 'inline' && 'text-4xl text-gray-800',
              config.style === 'flip' && 'text-4xl text-gray-800'
            )}>
              {String(unit.value).padStart(2, '0')}
            </div>
            {config.showLabels && (
              <div className={clsx(
                'text-sm uppercase tracking-wider mt-1',
                config.style === 'boxes' && 'text-white/70',
                (config.style === 'inline' || config.style === 'flip') && 'text-gray-500'
              )}>
                {unit.label}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== STATS WIDGET ====================

export const StatsWidget: React.FC<WidgetRendererProps> = ({ widget, isPreview }) => {
  const config = widget.config.stats;
  if (!config) return null;

  return (
    <div className="mega-widget-stats">
      {widget.showTitle && (
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">
          {widget.title}
        </h3>
      )}

      <div className={clsx(
        config.layout === 'horizontal' && 'flex justify-around gap-8',
        config.layout === 'grid' && 'grid gap-6',
      )}
      style={config.layout === 'grid' ? { gridTemplateColumns: `repeat(${config.columns || 3}, 1fr)` } : {}}
      >
        {config.items.map((stat, idx) => (
          <motion.div
            key={stat.id}
            className={clsx(
              'text-center',
              config.style === 'bordered' && 'border border-gray-200 rounded-lg p-4',
              config.style === 'card' && 'bg-white shadow-sm rounded-xl p-6'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="text-3xl font-bold text-gray-800">
              {stat.prefix}
              <motion.span
                initial={stat.animated ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
              >
                {stat.value}
              </motion.span>
              {stat.suffix}
            </div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==================== WIDGET RENDERER (Main Export) ====================

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, isPreview, onEdit }) => {
  const widgetComponents: Record<string, React.FC<WidgetRendererProps>> = {
    links: LinksWidget,
    image: ImageWidget,
    'image-gallery': ImageGalleryWidget,
    posts: PostsWidget,
    products: ProductsWidget,
    'icon-box': IconBoxWidget,
    'cta-button': CTAButtonWidget,
    'cta-banner': CTABannerWidget,
    'contact-info': ContactInfoWidget,
    'social-links': SocialLinksWidget,
    newsletter: NewsletterWidget,
    testimonial: TestimonialWidget,
    countdown: CountdownWidget,
    stats: StatsWidget,
  };

  const Component = widgetComponents[widget.type];

  if (!Component) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
        Widget type "{widget.type}" not implemented yet
      </div>
    );
  }

  const hoverAnimation = getHoverAnimation(widget.animation?.hover);
  const entranceAnimation = getEntranceAnimation(widget.animation?.entrance || 'fade');

  return (
    <motion.div
      initial={entranceAnimation}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1, rotateX: 0 }}
      transition={{ duration: (widget.animation?.duration || 200) / 1000 }}
      whileHover={hoverAnimation}
      style={{
        padding: widget.style.padding
          ? `${widget.style.padding.top}px ${widget.style.padding.right}px ${widget.style.padding.bottom}px ${widget.style.padding.left}px`
          : undefined,
        borderRadius: widget.style.borderRadius
      }}
      className="mega-menu-widget"
    >
      <Component widget={widget} isPreview={isPreview} onEdit={onEdit} />
    </motion.div>
  );
};

export default WidgetRenderer;
