import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  BookOpen,
  ShoppingBag,
  User,
  Search,
  Archive,
  Tag,
  MessageSquare,
  Image,
  Grid,
  List,
  Columns,
  Square,
  Maximize,
  PanelLeft,
  Layers,
  X,
  Settings,
  ExternalLink,
  RefreshCw,
  Download,
  Share2,
  Code,
  Palette,
  Check,
  Loader2,
  Heart
} from 'lucide-react';
import clsx from 'clsx';

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  previewContent: React.ReactNode;
  layout: {
    header: boolean;
    footer: boolean;
    sidebar: 'none' | 'left' | 'right' | 'both';
    width: 'full' | 'contained' | 'narrow';
  };
}

const sampleContent = {
  heroImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  thumbnail1: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
  thumbnail2: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
  thumbnail3: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
  product1: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
  product2: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  product3: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
};

const pageTemplates: PageTemplate[] = [
  {
    id: 'homepage',
    name: 'Homepage',
    description: 'Full width landing page with hero section',
    icon: Home,
    category: 'General',
    layout: { header: true, footer: true, sidebar: 'none', width: 'full' },
    previewContent: (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative h-[400px] bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Welcome to RustPress</h1>
              <p className="text-xl opacity-90 mb-6">The modern CMS built for performance</p>
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 bg-gray-50 rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Feature {i}</h3>
              <p className="text-sm text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 text-white p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-6">Join thousands of users building amazing websites.</p>
          <button className="px-8 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Start Free Trial
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'blog-index',
    name: 'Blog Index',
    description: 'Blog listing with sidebar',
    icon: BookOpen,
    category: 'Blog',
    layout: { header: true, footer: true, sidebar: 'right', width: 'contained' },
    previewContent: (
      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Latest Posts</h1>
          {[1, 2, 3].map(i => (
            <article key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100" />
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>Category</span>
                  <span>•</span>
                  <span>Dec 20, 2025</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Blog Post Title {i}</h2>
                <p className="text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
                <a href="#" className="text-blue-600 font-medium">Read more →</a>
              </div>
            </article>
          ))}
        </div>
        <aside className="w-80 flex-shrink-0 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Search</h3>
            <input type="text" placeholder="Search posts..." className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
            <ul className="space-y-2">
              {['Technology', 'Design', 'Business', 'Lifestyle'].map(cat => (
                <li key={cat} className="text-gray-600 hover:text-blue-600 cursor-pointer">{cat}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-3">Subscribe to our newsletter</p>
            <input type="email" placeholder="Enter email" className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2" />
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg">Subscribe</button>
          </div>
        </aside>
      </div>
    )
  },
  {
    id: 'single-post',
    name: 'Single Post',
    description: 'Blog post article layout',
    icon: FileText,
    category: 'Blog',
    layout: { header: true, footer: true, sidebar: 'right', width: 'contained' },
    previewContent: (
      <div className="flex gap-8">
        <article className="flex-1">
          <div className="h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-lg mb-6" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div>
              <p className="font-medium text-gray-800">John Doe</p>
              <p className="text-sm text-gray-500">Dec 20, 2025 • 5 min read</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">How to Build a Modern CMS with Rust</h1>
          <div className="prose prose-gray max-w-none">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            <h2>Getting Started</h2>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`fn main() {
    println!("Hello, RustPress!");
}`}</code>
            </pre>
            <h2>Best Practices</h2>
            <p>Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem.</p>
          </div>
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <span className="text-sm text-gray-500">Share:</span>
            <button className="p-2 hover:bg-gray-100 rounded-lg"><Share2 className="w-4 h-4" /></button>
          </div>
        </article>
        <aside className="w-72 flex-shrink-0">
          <div className="sticky top-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Table of Contents</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-blue-600">Getting Started</li>
                <li className="text-gray-600 hover:text-blue-600 cursor-pointer">Best Practices</li>
                <li className="text-gray-600 hover:text-blue-600 cursor-pointer">Conclusion</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Related Posts</h3>
              <ul className="space-y-3">
                {[1, 2, 3].map(i => (
                  <li key={i} className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                    Related Article Title {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    )
  },
  {
    id: 'page-default',
    name: 'Standard Page',
    description: 'Full width content page',
    icon: FileText,
    category: 'General',
    layout: { header: true, footer: true, sidebar: 'none', width: 'contained' },
    previewContent: (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
        <div className="prose prose-lg prose-gray">
          <p className="lead text-xl text-gray-600">We are a team of passionate developers building the next generation of content management systems.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <h2>Our Mission</h2>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <h2>Our Values</h2>
          <ul>
            <li>Performance First</li>
            <li>Developer Experience</li>
            <li>Open Source</li>
            <li>Community Driven</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'shop',
    name: 'Shop',
    description: 'E-commerce product listing',
    icon: ShoppingBag,
    category: 'E-Commerce',
    layout: { header: true, footer: true, sidebar: 'left', width: 'contained' },
    previewContent: (
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
            <ul className="space-y-2">
              {['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'].map(cat => (
                <li key={cat} className="text-gray-600 hover:text-blue-600 cursor-pointer flex justify-between">
                  <span>{cat}</span>
                  <span className="text-gray-400">(24)</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Price Range</h3>
            <div className="space-y-2">
              <input type="range" className="w-full" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>$0</span>
                <span>$500</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Brand</h3>
            <div className="space-y-2">
              {['Apple', 'Samsung', 'Sony', 'LG'].map(brand => (
                <label key={brand} className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" className="rounded" />
                  {brand}
                </label>
              ))}
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <select className="px-3 py-2 border border-gray-200 rounded-lg">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 mb-1">Product Name {i}</h3>
                  <p className="text-sm text-gray-500 mb-2">Category</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">$99.99</span>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'product',
    name: 'Single Product',
    description: 'Product detail page',
    icon: ShoppingBag,
    category: 'E-Commerce',
    layout: { header: true, footer: true, sidebar: 'none', width: 'contained' },
    previewContent: (
      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-100 rounded-lg cursor-pointer hover:ring-2 ring-blue-500" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Electronics / Headphones</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Wireless Headphones</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">{'★'.repeat(5)}</div>
              <span className="text-sm text-gray-500">(128 reviews)</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">$299.99</p>
          </div>
          <p className="text-gray-600">Experience premium sound quality with our flagship wireless headphones. Featuring active noise cancellation, 30-hour battery life, and ultra-comfortable design.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2">
                {['Black', 'White', 'Blue'].map(color => (
                  <button key={color} className="px-4 py-2 border border-gray-200 rounded-lg hover:border-blue-500">
                    {color}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 border border-gray-200 rounded-lg">-</button>
                <input type="number" value="1" className="w-16 h-10 text-center border border-gray-200 rounded-lg" readOnly />
                <button className="w-10 h-10 border border-gray-200 rounded-lg">+</button>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Add to Cart
            </button>
            <button className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'author',
    name: 'Author Page',
    description: 'Author profile with posts',
    icon: User,
    category: 'Blog',
    layout: { header: true, footer: true, sidebar: 'none', width: 'narrow' },
    previewContent: (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">John Doe</h1>
          <p className="text-gray-600 mb-4">Senior Developer & Tech Writer</p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">Passionate about building great software and sharing knowledge with the community. Writing about Rust, WebAssembly, and modern web development.</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-gray-400 hover:text-blue-600">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-blue-600">GitHub</a>
            <a href="#" className="text-gray-400 hover:text-blue-600">LinkedIn</a>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Articles</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <article key={i} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Article Title {i}</h3>
                <p className="text-sm text-gray-500 mb-2">Dec 20, 2025</p>
                <p className="text-sm text-gray-600">Short excerpt of the article content goes here...</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'archive',
    name: 'Archive',
    description: 'Category/tag archive page',
    icon: Archive,
    category: 'Blog',
    layout: { header: true, footer: true, sidebar: 'right', width: 'contained' },
    previewContent: (
      <div className="flex gap-8">
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Technology</h1>
            <p className="text-gray-600 mt-2">42 articles</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <article key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200" />
                <div className="p-4">
                  <span className="text-xs text-blue-600 font-medium">Tutorial</span>
                  <h2 className="font-semibold text-gray-800 mt-1 mb-2">Archive Post Title {i}</h2>
                  <p className="text-sm text-gray-500">Dec 20, 2025</p>
                </div>
              </article>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-8">
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-2 border border-gray-200 rounded-lg">2</button>
            <button className="px-3 py-2 border border-gray-200 rounded-lg">3</button>
            <button className="px-3 py-2 border border-gray-200 rounded-lg">Next →</button>
          </div>
        </div>
        <aside className="w-72 flex-shrink-0 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['Rust', 'React', 'TypeScript', 'WebAssembly', 'Performance'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-blue-100 hover:text-blue-600 cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    )
  },
  {
    id: 'search-results',
    name: 'Search Results',
    description: 'Search results page',
    icon: Search,
    category: 'Utility',
    layout: { header: true, footer: true, sidebar: 'none', width: 'contained' },
    previewContent: (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                defaultValue="rust cms"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg"
              />
            </div>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg">Search</button>
          </div>
          <p className="text-gray-600">Found 24 results for "rust cms"</p>
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <article key={i} className="pb-6 border-b border-gray-200 last:border-0">
              <a href="#" className="text-xl text-blue-600 hover:underline font-medium">
                Search Result Title {i} - Rust CMS Development
              </a>
              <p className="text-sm text-green-600 mt-1">yoursite.com/posts/search-result-{i}</p>
              <p className="text-gray-600 mt-2">
                Lorem ipsum dolor sit amet, <mark className="bg-yellow-200">Rust CMS</mark> consectetur adipiscing elit. Sed do eiusmod tempor incididunt...
              </p>
            </article>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'contact',
    name: 'Contact',
    description: 'Contact form page',
    icon: MessageSquare,
    category: 'General',
    layout: { header: true, footer: true, sidebar: 'none', width: 'narrow' },
    previewContent: (
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Contact Us</h1>
        <p className="text-gray-600 text-center mb-8">Have a question? We'd love to hear from you.</p>
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option>General Inquiry</option>
              <option>Technical Support</option>
              <option>Sales</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none" />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Send Message
          </button>
        </form>
      </div>
    )
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Image gallery page',
    icon: Image,
    category: 'Media',
    layout: { header: true, footer: true, sidebar: 'none', width: 'full' },
    previewContent: (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Photo Gallery</h1>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
            <div
              key={i}
              className={clsx(
                'bg-gradient-to-br rounded-lg cursor-pointer hover:opacity-90 transition-opacity',
                i % 3 === 0 ? 'from-blue-200 to-purple-200 row-span-2' : 'from-gray-100 to-gray-200',
                i % 5 === 0 ? 'col-span-2' : ''
              )}
              style={{ height: i % 3 === 0 ? 320 : 150 }}
            />
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Portfolio showcase',
    icon: Grid,
    category: 'Creative',
    layout: { header: true, footer: true, sidebar: 'none', width: 'contained' },
    previewContent: (
      <div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Work</h1>
          <p className="text-gray-600">A showcase of our best projects</p>
        </div>
        <div className="flex justify-center gap-2 mb-8">
          {['All', 'Web Design', 'Branding', 'Photography', 'UI/UX'].map((filter, i) => (
            <button
              key={filter}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                i === 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="group relative overflow-hidden rounded-lg">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-200" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="font-semibold mb-1">Project {i}</h3>
                  <p className="text-sm opacity-80">Web Design</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: '404',
    name: '404 Error',
    description: 'Page not found',
    icon: X,
    category: 'Utility',
    layout: { header: false, footer: false, sidebar: 'none', width: 'full' },
    previewContent: (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <h1 className="text-[150px] font-bold text-gray-200 leading-none">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Go to Homepage
          </button>
        </div>
      </div>
    )
  },
  {
    id: 'empty',
    name: 'Empty Page',
    description: 'Blank canvas for custom content',
    icon: Square,
    category: 'Utility',
    layout: { header: false, footer: false, sidebar: 'none', width: 'full' },
    previewContent: (
      <div className="min-h-[60vh] flex items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-lg m-8">
        <div className="text-gray-400">
          <Square className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Empty Page Template</p>
          <p className="text-sm">No header, footer, or sidebar. Full creative freedom.</p>
        </div>
      </div>
    )
  }
];

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

const defaultColors: ThemeColors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#EC4899',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const colorPresets = [
  { name: 'Default Blue', colors: { ...defaultColors } },
  { name: 'Purple Dream', colors: { ...defaultColors, primary: '#8B5CF6', secondary: '#A855F7', accent: '#D946EF' } },
  { name: 'Forest Green', colors: { ...defaultColors, primary: '#059669', secondary: '#10B981', accent: '#34D399' } },
  { name: 'Sunset Orange', colors: { ...defaultColors, primary: '#EA580C', secondary: '#F97316', accent: '#FB923C' } },
  { name: 'Ocean Teal', colors: { ...defaultColors, primary: '#0D9488', secondary: '#14B8A6', accent: '#2DD4BF' } },
  { name: 'Dark Mode', colors: { ...defaultColors, primary: '#60A5FA', background: '#111827', surface: '#1F2937', text: '#F9FAFB', textMuted: '#9CA3AF', border: '#374151' } },
  { name: 'Rose Pink', colors: { ...defaultColors, primary: '#E11D48', secondary: '#F43F5E', accent: '#FB7185' } },
  { name: 'Warm Amber', colors: { ...defaultColors, primary: '#D97706', secondary: '#F59E0B', accent: '#FBBF24' } },
];

export default function ThemePreview() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('homepage');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [themeColors, setThemeColors] = useState<ThemeColors>(defaultColors);
  const [showColorEditor, setShowColorEditor] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('Default Blue');

  const template = pageTemplates.find(t => t.id === selectedTemplate);
  const categories = [...new Set(pageTemplates.map(t => t.category))];

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setThemeColors(prev => ({ ...prev, [key]: value }));
    setSelectedPreset('Custom');
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setThemeColors(preset.colors);
    setSelectedPreset(preset.name);
  };

  const generateCSSVariables = () => {
    return `
:root {
  --color-primary: ${themeColors.primary};
  --color-secondary: ${themeColors.secondary};
  --color-accent: ${themeColors.accent};
  --color-background: ${themeColors.background};
  --color-surface: ${themeColors.surface};
  --color-text: ${themeColors.text};
  --color-text-muted: ${themeColors.textMuted};
  --color-border: ${themeColors.border};
  --color-success: ${themeColors.success};
  --color-warning: ${themeColors.warning};
  --color-error: ${themeColors.error};
}
    `.trim();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex">
      {/* Sidebar - Template List */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Palette className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Theme Preview</h2>
                  <p className="text-xs text-gray-500">Preview all page templates</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {pageTemplates.filter(t => t.category === category).map(t => {
                      const Icon = t.icon;
                      const isSelected = selectedTemplate === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTemplate(t.id)}
                          className={clsx(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                            isSelected
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          )}
                        >
                          <Icon size={18} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{t.name}</p>
                            <p className="text-xs text-gray-500 truncate">{t.description}</p>
                          </div>
                          {isSelected && <Check size={16} className="text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                {pageTemplates.length} templates available
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={clsx(
          "absolute top-1/2 -translate-y-1/2 z-10 p-1 bg-white dark:bg-gray-800 border rounded-r-lg shadow-md transition-all",
          sidebarOpen ? "left-[320px]" : "left-0"
        )}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Main Preview Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {template?.name || 'Select a template'}
              </h1>
              <p className="text-sm text-gray-500">{template?.description}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Layout Info */}
              {template && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    {template.layout.header && <Check size={14} className="text-green-500" />}
                    Header
                  </span>
                  <span className="flex items-center gap-1">
                    {template.layout.footer && <Check size={14} className="text-green-500" />}
                    Footer
                  </span>
                  <span className="flex items-center gap-1">
                    Sidebar: {template.layout.sidebar}
                  </span>
                </div>
              )}

              {/* Device Preview */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  { device: 'desktop' as const, icon: Monitor },
                  { device: 'tablet' as const, icon: Tablet },
                  { device: 'mobile' as const, icon: Smartphone }
                ].map(({ device, icon: Icon }) => (
                  <button
                    key={device}
                    onClick={() => setPreviewDevice(device)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      previewDevice === device
                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    viewMode === 'preview'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Eye size={16} className="inline mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    viewMode === 'code'
                      ? 'bg-white dark:bg-gray-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Code size={16} className="inline mr-1" />
                  Code
                </button>
              </div>

              {/* Color Editor Toggle */}
              <button
                onClick={() => setShowColorEditor(!showColorEditor)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  showColorEditor
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                <Palette size={16} />
                Colors
                <span
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: themeColors.primary }}
                />
              </button>

              {/* Actions */}
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <RefreshCw size={18} className="text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <ExternalLink size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Color Editor Panel */}
        <AnimatePresence>
          {showColorEditor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-4">
                {/* Preset Selector */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Presets</h4>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className={clsx(
                          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                          selectedPreset === preset.name
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        )}
                      >
                        <div className="flex -space-x-1">
                          <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: preset.colors.primary }} />
                          <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: preset.colors.secondary }} />
                          <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: preset.colors.accent }} />
                        </div>
                        {preset.name}
                      </button>
                    ))}
                    {selectedPreset === 'Custom' && (
                      <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        <div className="flex -space-x-1">
                          <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: themeColors.primary }} />
                          <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: themeColors.secondary }} />
                          <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: themeColors.accent }} />
                        </div>
                        Custom
                      </span>
                    )}
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-6 gap-4">
                  {[
                    { key: 'primary' as const, label: 'Primary' },
                    { key: 'secondary' as const, label: 'Secondary' },
                    { key: 'accent' as const, label: 'Accent' },
                    { key: 'background' as const, label: 'Background' },
                    { key: 'surface' as const, label: 'Surface' },
                    { key: 'text' as const, label: 'Text' },
                    { key: 'textMuted' as const, label: 'Text Muted' },
                    { key: 'border' as const, label: 'Border' },
                    { key: 'success' as const, label: 'Success' },
                    { key: 'warning' as const, label: 'Warning' },
                    { key: 'error' as const, label: 'Error' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">{label}</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={themeColors[key]}
                          onChange={(e) => updateColor(key, e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={themeColors[key]}
                          onChange={(e) => updateColor(key, e.target.value)}
                          className="flex-1 w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Export CSS */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS Variables</h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateCSSVariables());
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Code size={12} />
                      Copy CSS
                    </button>
                  </div>
                  <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto">
                    {generateCSSVariables()}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-200 dark:bg-gray-950">
          <div
            className={clsx(
              'mx-auto transition-all duration-300 bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden',
              previewDevice === 'desktop' && 'w-full max-w-[1400px]',
              previewDevice === 'tablet' && 'w-[768px]',
              previewDevice === 'mobile' && 'w-[375px]'
            )}
          >
            {viewMode === 'preview' ? (
              <div
                className="min-h-[600px]"
                style={{
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                }}
              >
                {/* Header */}
                {template?.layout.header && (
                  <header
                    className="px-6 py-4"
                    style={{
                      backgroundColor: themeColors.surface,
                      borderBottom: `1px solid ${themeColors.border}`,
                    }}
                  >
                    <div className="flex items-center justify-between max-w-6xl mx-auto">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg"
                          style={{ backgroundColor: themeColors.primary }}
                        />
                        <span className="font-bold" style={{ color: themeColors.text }}>RustPress</span>
                      </div>
                      <nav className="flex items-center gap-6">
                        {['Home', 'Blog', 'About', 'Contact'].map(item => (
                          <a
                            key={item}
                            href="#"
                            className="text-sm hover:opacity-80 transition-opacity"
                            style={{ color: themeColors.textMuted }}
                          >
                            {item}
                          </a>
                        ))}
                        <button
                          className="px-4 py-2 rounded-lg text-sm text-white"
                          style={{ backgroundColor: themeColors.primary }}
                        >
                          Get Started
                        </button>
                      </nav>
                    </div>
                  </header>
                )}

                {/* Content */}
                <div className={clsx(
                  'p-8',
                  template?.layout.width === 'contained' && 'max-w-6xl mx-auto',
                  template?.layout.width === 'narrow' && 'max-w-3xl mx-auto'
                )}>
                  {template?.previewContent}
                </div>

                {/* Footer */}
                {template?.layout.footer && (
                  <footer className="bg-gray-900 text-white px-6 py-12">
                    <div className="max-w-6xl mx-auto">
                      <div className="grid grid-cols-4 gap-8 mb-8">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg" />
                            <span className="font-bold">RustPress</span>
                          </div>
                          <p className="text-gray-400 text-sm">The modern CMS built for performance.</p>
                        </div>
                        {['Product', 'Resources', 'Company'].map(title => (
                          <div key={title}>
                            <h4 className="font-semibold mb-4">{title}</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                              <li><a href="#" className="hover:text-white">Link 1</a></li>
                              <li><a href="#" className="hover:text-white">Link 2</a></li>
                              <li><a href="#" className="hover:text-white">Link 3</a></li>
                            </ul>
                          </div>
                        ))}
                      </div>
                      <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
                        &copy; 2025 RustPress. All rights reserved.
                      </div>
                    </div>
                  </footer>
                )}
              </div>
            ) : (
              <div className="p-6">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
                  <code>{`<!-- ${template?.name} Template -->
<template id="${template?.id}">
  <layout>
    <header>${template?.layout.header ? 'enabled' : 'disabled'}</header>
    <footer>${template?.layout.footer ? 'enabled' : 'disabled'}</footer>
    <sidebar>${template?.layout.sidebar}</sidebar>
    <width>${template?.layout.width}</width>
  </layout>

  <content>
    <!-- Your page content here -->
  </content>
</template>

<!-- Template Settings -->
{
  "id": "${template?.id}",
  "name": "${template?.name}",
  "category": "${template?.category}",
  "layout": ${JSON.stringify(template?.layout, null, 4)}
}`}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
