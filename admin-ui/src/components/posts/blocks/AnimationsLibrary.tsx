import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  Play,
  Pause,
  Settings,
  Search,
  Star,
  Clock,
  Zap,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  RotateCw,
  Maximize2,
  Minimize2,
  Move,
  Sparkles,
  Eye,
  Copy,
  Check,
  ChevronDown,
  Filter,
  Grid3X3,
  List,
  X,
  RefreshCw,
  Sliders,
  Type,
} from 'lucide-react'
import clsx from 'clsx'

// Animation configuration types
export interface AnimationConfig {
  id: string
  name: string
  description: string
  category: AnimationCategory
  keywords: string[]
  cssClass: string
  duration: number
  delay: number
  easing: string
  iterations: number | 'infinite'
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode: 'none' | 'forwards' | 'backwards' | 'both'
  isPremium: boolean
  previewElement: 'box' | 'text' | 'icon' | 'image'
  customizable: AnimationCustomization
}

export interface AnimationCustomization {
  duration: { min: number; max: number; step: number }
  delay: { min: number; max: number; step: number }
  iterations: { min: number; max: number; allowInfinite: boolean }
  easing: string[]
  customProperties?: { name: string; type: 'number' | 'color' | 'select'; options?: string[]; default: any }[]
}

type AnimationCategory =
  | 'entrance'
  | 'exit'
  | 'attention'
  | 'background'
  | 'text'
  | 'hover'
  | 'scroll'
  | 'loading'
  | 'special'

interface AnimationsLibraryProps {
  onSelectAnimation?: (animation: AnimationConfig, settings: AnimationSettings) => void
  selectedAnimation?: string
  enabledCategories?: AnimationCategory[]
  showPreview?: boolean
  isAdminMode?: boolean
  className?: string
  content?: string
}

interface AnimationSettings {
  duration: number
  delay: number
  easing: string
  iterations: number | 'infinite'
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode: 'none' | 'forwards' | 'backwards' | 'both'
  customProperties?: Record<string, any>
}

// Default customization options
const defaultCustomization: AnimationCustomization = {
  duration: { min: 0.1, max: 5, step: 0.1 },
  delay: { min: 0, max: 3, step: 0.1 },
  iterations: { min: 1, max: 10, allowInfinite: true },
  easing: [
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Back
    'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Elastic
    'cubic-bezier(0.22, 1, 0.36, 1)', // Expo out
    'steps(10)',
  ],
}

// 50+ Animation definitions
const animations: AnimationConfig[] = [
  // ============ ENTRANCE ANIMATIONS (15) ============
  {
    id: 'fade-in',
    name: 'Fade In',
    description: 'Simple fade in from transparent',
    category: 'entrance',
    keywords: ['fade', 'appear', 'show'],
    cssClass: 'animate-fade-in',
    duration: 0.5,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'fade-in-up',
    name: 'Fade In Up',
    description: 'Fade in while moving up',
    category: 'entrance',
    keywords: ['fade', 'up', 'slide'],
    cssClass: 'animate-fade-in-up',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'distance', type: 'number', default: 20 },
      ],
    },
  },
  {
    id: 'fade-in-down',
    name: 'Fade In Down',
    description: 'Fade in while moving down',
    category: 'entrance',
    keywords: ['fade', 'down', 'slide'],
    cssClass: 'animate-fade-in-down',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'fade-in-left',
    name: 'Fade In Left',
    description: 'Fade in from the left',
    category: 'entrance',
    keywords: ['fade', 'left', 'slide'],
    cssClass: 'animate-fade-in-left',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'fade-in-right',
    name: 'Fade In Right',
    description: 'Fade in from the right',
    category: 'entrance',
    keywords: ['fade', 'right', 'slide'],
    cssClass: 'animate-fade-in-right',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Scale up from small',
    category: 'entrance',
    keywords: ['zoom', 'scale', 'grow'],
    cssClass: 'animate-zoom-in',
    duration: 0.5,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'startScale', type: 'number', default: 0.5 },
      ],
    },
  },
  {
    id: 'zoom-in-up',
    name: 'Zoom In Up',
    description: 'Scale and move up',
    category: 'entrance',
    keywords: ['zoom', 'scale', 'up'],
    cssClass: 'animate-zoom-in-up',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'slide-in-up',
    name: 'Slide In Up',
    description: 'Slide up into view',
    category: 'entrance',
    keywords: ['slide', 'up'],
    cssClass: 'animate-slide-in-up',
    duration: 0.5,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'slide-in-down',
    name: 'Slide In Down',
    description: 'Slide down into view',
    category: 'entrance',
    keywords: ['slide', 'down'],
    cssClass: 'animate-slide-in-down',
    duration: 0.5,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'bounce-in',
    name: 'Bounce In',
    description: 'Bouncy entrance effect',
    category: 'entrance',
    keywords: ['bounce', 'elastic', 'spring'],
    cssClass: 'animate-bounce-in',
    duration: 0.75,
    delay: 0,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'bounce-in-up',
    name: 'Bounce In Up',
    description: 'Bounce in from below',
    category: 'entrance',
    keywords: ['bounce', 'up', 'spring'],
    cssClass: 'animate-bounce-in-up',
    duration: 0.8,
    delay: 0,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'flip-in-x',
    name: 'Flip In X',
    description: '3D flip on X axis',
    category: 'entrance',
    keywords: ['flip', '3d', 'rotate'],
    cssClass: 'animate-flip-in-x',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'flip-in-y',
    name: 'Flip In Y',
    description: '3D flip on Y axis',
    category: 'entrance',
    keywords: ['flip', '3d', 'rotate'],
    cssClass: 'animate-flip-in-y',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    description: 'Rotate while fading in',
    category: 'entrance',
    keywords: ['rotate', 'spin', 'turn'],
    cssClass: 'animate-rotate-in',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'rotation', type: 'number', default: 180 },
      ],
    },
  },
  {
    id: 'roll-in',
    name: 'Roll In',
    description: 'Roll in from the left',
    category: 'entrance',
    keywords: ['roll', 'rotate', 'slide'],
    cssClass: 'animate-roll-in',
    duration: 0.8,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'box',
    customizable: defaultCustomization,
  },

  // ============ EXIT ANIMATIONS (10) ============
  {
    id: 'fade-out',
    name: 'Fade Out',
    description: 'Simple fade out to transparent',
    category: 'exit',
    keywords: ['fade', 'disappear', 'hide'],
    cssClass: 'animate-fade-out',
    duration: 0.5,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'fade-out-up',
    name: 'Fade Out Up',
    description: 'Fade out while moving up',
    category: 'exit',
    keywords: ['fade', 'up', 'exit'],
    cssClass: 'animate-fade-out-up',
    duration: 0.5,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'fade-out-down',
    name: 'Fade Out Down',
    description: 'Fade out while moving down',
    category: 'exit',
    keywords: ['fade', 'down', 'exit'],
    cssClass: 'animate-fade-out-down',
    duration: 0.5,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Scale down and fade out',
    category: 'exit',
    keywords: ['zoom', 'scale', 'shrink'],
    cssClass: 'animate-zoom-out',
    duration: 0.5,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'slide-out-up',
    name: 'Slide Out Up',
    description: 'Slide up out of view',
    category: 'exit',
    keywords: ['slide', 'up', 'exit'],
    cssClass: 'animate-slide-out-up',
    duration: 0.5,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'slide-out-down',
    name: 'Slide Out Down',
    description: 'Slide down out of view',
    category: 'exit',
    keywords: ['slide', 'down', 'exit'],
    cssClass: 'animate-slide-out-down',
    duration: 0.5,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'bounce-out',
    name: 'Bounce Out',
    description: 'Bouncy exit effect',
    category: 'exit',
    keywords: ['bounce', 'exit', 'spring'],
    cssClass: 'animate-bounce-out',
    duration: 0.6,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'flip-out-x',
    name: 'Flip Out X',
    description: '3D flip out on X axis',
    category: 'exit',
    keywords: ['flip', '3d', 'exit'],
    cssClass: 'animate-flip-out-x',
    duration: 0.6,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'rotate-out',
    name: 'Rotate Out',
    description: 'Rotate while fading out',
    category: 'exit',
    keywords: ['rotate', 'spin', 'exit'],
    cssClass: 'animate-rotate-out',
    duration: 0.6,
    delay: 0,
    easing: 'ease-in',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'hinge',
    name: 'Hinge',
    description: 'Fall off like a broken hinge',
    category: 'exit',
    keywords: ['hinge', 'fall', 'swing'],
    cssClass: 'animate-hinge',
    duration: 2,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'box',
    customizable: defaultCustomization,
  },

  // ============ ATTENTION ANIMATIONS (12) ============
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Gentle pulsing effect',
    category: 'attention',
    keywords: ['pulse', 'beat', 'throb'],
    cssClass: 'animate-pulse',
    duration: 1,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'scaleAmount', type: 'number', default: 1.05 },
      ],
    },
  },
  {
    id: 'bounce',
    name: 'Bounce',
    description: 'Bouncing animation',
    category: 'attention',
    keywords: ['bounce', 'jump', 'hop'],
    cssClass: 'animate-bounce',
    duration: 1,
    delay: 0,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'shake',
    name: 'Shake',
    description: 'Side-to-side shaking',
    category: 'attention',
    keywords: ['shake', 'wiggle', 'vibrate'],
    cssClass: 'animate-shake',
    duration: 0.5,
    delay: 0,
    easing: 'linear',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'intensity', type: 'number', default: 10 },
      ],
    },
  },
  {
    id: 'swing',
    name: 'Swing',
    description: 'Swinging pendulum effect',
    category: 'attention',
    keywords: ['swing', 'pendulum', 'rock'],
    cssClass: 'animate-swing',
    duration: 1,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'tada',
    name: 'Tada',
    description: 'Attention-grabbing tada',
    category: 'attention',
    keywords: ['tada', 'celebrate', 'attention'],
    cssClass: 'animate-tada',
    duration: 1,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'wobble',
    name: 'Wobble',
    description: 'Wobbly jelly effect',
    category: 'attention',
    keywords: ['wobble', 'jelly', 'wiggle'],
    cssClass: 'animate-wobble',
    duration: 1,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'jello',
    name: 'Jello',
    description: 'Jelly-like wiggle',
    category: 'attention',
    keywords: ['jello', 'jelly', 'wiggle'],
    cssClass: 'animate-jello',
    duration: 1,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    description: 'Pulsing like a heartbeat',
    category: 'attention',
    keywords: ['heartbeat', 'pulse', 'love'],
    cssClass: 'animate-heartbeat',
    duration: 1.3,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'icon',
    customizable: defaultCustomization,
  },
  {
    id: 'rubber-band',
    name: 'Rubber Band',
    description: 'Stretchy rubber band effect',
    category: 'attention',
    keywords: ['rubber', 'stretch', 'elastic'],
    cssClass: 'animate-rubber-band',
    duration: 1,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'flash',
    name: 'Flash',
    description: 'Flashing opacity change',
    category: 'attention',
    keywords: ['flash', 'blink', 'strobe'],
    cssClass: 'animate-flash',
    duration: 1,
    delay: 0,
    easing: 'linear',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'head-shake',
    name: 'Head Shake',
    description: 'No gesture shake',
    category: 'attention',
    keywords: ['head', 'shake', 'no'],
    cssClass: 'animate-head-shake',
    duration: 1,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'float',
    name: 'Float',
    description: 'Gentle floating up and down',
    category: 'attention',
    keywords: ['float', 'hover', 'levitate'],
    cssClass: 'animate-float',
    duration: 3,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },

  // ============ BACKGROUND ANIMATIONS (5) ============
  {
    id: 'gradient-shift',
    name: 'Gradient Shift',
    description: 'Animated gradient background',
    category: 'background',
    keywords: ['gradient', 'background', 'color'],
    cssClass: 'animate-gradient-shift',
    duration: 5,
    delay: 0,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'color1', type: 'color', default: '#667eea' },
        { name: 'color2', type: 'color', default: '#764ba2' },
        { name: 'color3', type: 'color', default: '#f093fb' },
      ],
    },
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Shimmering light effect',
    category: 'background',
    keywords: ['shimmer', 'shine', 'loading'],
    cssClass: 'animate-shimmer',
    duration: 2,
    delay: 0,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'glow',
    name: 'Glow',
    description: 'Pulsing glow effect',
    category: 'background',
    keywords: ['glow', 'light', 'neon'],
    cssClass: 'animate-glow',
    duration: 2,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'glowColor', type: 'color', default: '#3b82f6' },
        { name: 'glowSize', type: 'number', default: 20 },
      ],
    },
  },
  {
    id: 'color-cycle',
    name: 'Color Cycle',
    description: 'Cycling through colors',
    category: 'background',
    keywords: ['color', 'rainbow', 'cycle'],
    cssClass: 'animate-color-cycle',
    duration: 5,
    delay: 0,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    description: 'Moving spotlight effect',
    category: 'background',
    keywords: ['spotlight', 'light', 'focus'],
    cssClass: 'animate-spotlight',
    duration: 3,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'box',
    customizable: defaultCustomization,
  },

  // ============ TEXT ANIMATIONS (8) ============
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Text typing effect',
    category: 'text',
    keywords: ['typewriter', 'typing', 'text'],
    cssClass: 'animate-typewriter',
    duration: 2,
    delay: 0,
    easing: 'steps(40)',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'text',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'cursorColor', type: 'color', default: '#000000' },
      ],
    },
  },
  {
    id: 'text-reveal',
    name: 'Text Reveal',
    description: 'Reveal text with a mask',
    category: 'text',
    keywords: ['reveal', 'text', 'mask'],
    cssClass: 'animate-text-reveal',
    duration: 1,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'text',
    customizable: defaultCustomization,
  },
  {
    id: 'blur-in',
    name: 'Blur In',
    description: 'Text unblurs into view',
    category: 'text',
    keywords: ['blur', 'focus', 'text'],
    cssClass: 'animate-blur-in',
    duration: 0.8,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'text',
    customizable: defaultCustomization,
  },
  {
    id: 'letter-spacing',
    name: 'Letter Spacing',
    description: 'Animate letter spacing',
    category: 'text',
    keywords: ['letter', 'spacing', 'tracking'],
    cssClass: 'animate-letter-spacing',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'text',
    customizable: defaultCustomization,
  },
  {
    id: 'text-shadow-pop',
    name: 'Text Shadow Pop',
    description: '3D shadow text effect',
    category: 'text',
    keywords: ['shadow', '3d', 'pop'],
    cssClass: 'animate-text-shadow-pop',
    duration: 0.5,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'text',
    customizable: defaultCustomization,
  },
  {
    id: 'text-flicker',
    name: 'Text Flicker',
    description: 'Neon sign flicker',
    category: 'text',
    keywords: ['flicker', 'neon', 'blink'],
    cssClass: 'animate-text-flicker',
    duration: 2,
    delay: 0,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'text',
    customizable: defaultCustomization,
  },
  {
    id: 'wave-text',
    name: 'Wave Text',
    description: 'Letters wave up and down',
    category: 'text',
    keywords: ['wave', 'text', 'bounce'],
    cssClass: 'animate-wave-text',
    duration: 1.5,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'text',
    customizable: defaultCustomization,
  },
  {
    id: 'glitch-text',
    name: 'Glitch Text',
    description: 'Digital glitch effect',
    category: 'text',
    keywords: ['glitch', 'digital', 'distort'],
    cssClass: 'animate-glitch-text',
    duration: 1,
    delay: 0,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'text',
    customizable: defaultCustomization,
  },

  // ============ HOVER ANIMATIONS (5) ============
  {
    id: 'hover-grow',
    name: 'Hover Grow',
    description: 'Scale up on hover',
    category: 'hover',
    keywords: ['hover', 'grow', 'scale'],
    cssClass: 'hover-animate-grow',
    duration: 0.3,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'hover-shrink',
    name: 'Hover Shrink',
    description: 'Scale down on hover',
    category: 'hover',
    keywords: ['hover', 'shrink', 'scale'],
    cssClass: 'hover-animate-shrink',
    duration: 0.3,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'hover-rotate',
    name: 'Hover Rotate',
    description: 'Rotate on hover',
    category: 'hover',
    keywords: ['hover', 'rotate', 'spin'],
    cssClass: 'hover-animate-rotate',
    duration: 0.3,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'hover-shadow',
    name: 'Hover Shadow',
    description: 'Add shadow on hover',
    category: 'hover',
    keywords: ['hover', 'shadow', 'lift'],
    cssClass: 'hover-animate-shadow',
    duration: 0.3,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'hover-underline',
    name: 'Hover Underline',
    description: 'Animated underline on hover',
    category: 'hover',
    keywords: ['hover', 'underline', 'text'],
    cssClass: 'hover-animate-underline',
    duration: 0.3,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'text',
    customizable: defaultCustomization,
  },

  // ============ SCROLL ANIMATIONS (5) ============
  {
    id: 'scroll-fade-up',
    name: 'Scroll Fade Up',
    description: 'Fade in when scrolled into view',
    category: 'scroll',
    keywords: ['scroll', 'fade', 'reveal'],
    cssClass: 'scroll-animate-fade-up',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'triggerPoint', type: 'select', options: ['top', 'center', 'bottom'], default: 'center' },
      ],
    },
  },
  {
    id: 'scroll-zoom',
    name: 'Scroll Zoom',
    description: 'Zoom in on scroll',
    category: 'scroll',
    keywords: ['scroll', 'zoom', 'scale'],
    cssClass: 'scroll-animate-zoom',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'scroll-slide-left',
    name: 'Scroll Slide Left',
    description: 'Slide in from left on scroll',
    category: 'scroll',
    keywords: ['scroll', 'slide', 'left'],
    cssClass: 'scroll-animate-slide-left',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'scroll-slide-right',
    name: 'Scroll Slide Right',
    description: 'Slide in from right on scroll',
    category: 'scroll',
    keywords: ['scroll', 'slide', 'right'],
    cssClass: 'scroll-animate-slide-right',
    duration: 0.6,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'parallax',
    name: 'Parallax',
    description: 'Parallax scrolling effect',
    category: 'scroll',
    keywords: ['parallax', 'scroll', '3d'],
    cssClass: 'scroll-animate-parallax',
    duration: 0,
    delay: 0,
    easing: 'linear',
    iterations: 1,
    direction: 'normal',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'speed', type: 'number', default: 0.5 },
      ],
    },
  },

  // ============ LOADING ANIMATIONS (5) ============
  {
    id: 'spinner',
    name: 'Spinner',
    description: 'Rotating loading spinner',
    category: 'loading',
    keywords: ['spinner', 'loading', 'rotate'],
    cssClass: 'animate-spinner',
    duration: 1,
    delay: 0,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'icon',
    customizable: defaultCustomization,
  },
  {
    id: 'dots-loading',
    name: 'Loading Dots',
    description: 'Bouncing dots loader',
    category: 'loading',
    keywords: ['dots', 'loading', 'bounce'],
    cssClass: 'animate-dots-loading',
    duration: 1.4,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'progress-bar',
    name: 'Progress Bar',
    description: 'Animated progress bar',
    category: 'loading',
    keywords: ['progress', 'bar', 'loading'],
    cssClass: 'animate-progress-bar',
    duration: 2,
    delay: 0,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    description: 'Skeleton loading placeholder',
    category: 'loading',
    keywords: ['skeleton', 'placeholder', 'loading'],
    cssClass: 'animate-skeleton',
    duration: 1.5,
    delay: 0,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'ring-spinner',
    name: 'Ring Spinner',
    description: 'Animated ring loader',
    category: 'loading',
    keywords: ['ring', 'spinner', 'loading'],
    cssClass: 'animate-ring-spinner',
    duration: 1.2,
    delay: 0,
    easing: 'cubic-bezier(0.5, 0, 0.5, 1)',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: false,
    previewElement: 'icon',
    customizable: defaultCustomization,
  },

  // ============ SPECIAL ANIMATIONS (5) ============
  {
    id: 'morph',
    name: 'Morph',
    description: 'Shape morphing animation',
    category: 'special',
    keywords: ['morph', 'shape', 'transform'],
    cssClass: 'animate-morph',
    duration: 3,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'alternate',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'particle-explosion',
    name: 'Particle Explosion',
    description: 'Exploding particles effect',
    category: 'special',
    keywords: ['particle', 'explosion', 'burst'],
    cssClass: 'animate-particle-explosion',
    duration: 1,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'particleCount', type: 'number', default: 20 },
        { name: 'particleColor', type: 'color', default: '#fbbf24' },
      ],
    },
  },
  {
    id: 'confetti',
    name: 'Confetti',
    description: 'Falling confetti celebration',
    category: 'special',
    keywords: ['confetti', 'celebration', 'party'],
    cssClass: 'animate-confetti',
    duration: 3,
    delay: 0,
    easing: 'linear',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'box',
    customizable: defaultCustomization,
  },
  {
    id: 'ripple',
    name: 'Ripple',
    description: 'Water ripple effect',
    category: 'special',
    keywords: ['ripple', 'water', 'wave'],
    cssClass: 'animate-ripple',
    duration: 1.5,
    delay: 0,
    easing: 'ease-out',
    iterations: 'infinite',
    direction: 'normal',
    fillMode: 'none',
    isPremium: true,
    previewElement: 'box',
    customizable: {
      ...defaultCustomization,
      customProperties: [
        { name: 'rippleColor', type: 'color', default: '#3b82f6' },
      ],
    },
  },
  {
    id: 'path-draw',
    name: 'Path Draw',
    description: 'SVG path drawing animation',
    category: 'special',
    keywords: ['path', 'draw', 'svg', 'stroke'],
    cssClass: 'animate-path-draw',
    duration: 2,
    delay: 0,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
    isPremium: true,
    previewElement: 'icon',
    customizable: defaultCustomization,
  },
]

// Category metadata
const categoryInfo: Record<AnimationCategory, { name: string; icon: React.ReactNode; description: string }> = {
  entrance: { name: 'Entrance', icon: <ArrowRight className="w-4 h-4" />, description: 'Animations for elements appearing' },
  exit: { name: 'Exit', icon: <ArrowLeft className="w-4 h-4" />, description: 'Animations for elements disappearing' },
  attention: { name: 'Attention', icon: <Zap className="w-4 h-4" />, description: 'Grab user attention' },
  background: { name: 'Background', icon: <Sparkles className="w-4 h-4" />, description: 'Background effects' },
  text: { name: 'Text', icon: <Type className="w-4 h-4" />, description: 'Text-specific animations' },
  hover: { name: 'Hover', icon: <Move className="w-4 h-4" />, description: 'Mouse hover effects' },
  scroll: { name: 'Scroll', icon: <ArrowDown className="w-4 h-4" />, description: 'Scroll-triggered animations' },
  loading: { name: 'Loading', icon: <RefreshCw className="w-4 h-4" />, description: 'Loading state animations' },
  special: { name: 'Special', icon: <Star className="w-4 h-4" />, description: 'Unique special effects' },
}

// Animation preview component
function AnimationPreview({ animation, settings, isPlaying }: { animation: AnimationConfig; settings: AnimationSettings; isPlaying: boolean }) {
  const getPreviewContent = () => {
    switch (animation.previewElement) {
      case 'text':
        return <span className="text-xl font-bold">Hello World</span>
      case 'icon':
        return <Star className="w-8 h-8" />
      case 'image':
        return <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg" />
      default:
        return <div className="w-12 h-12 bg-primary-500 rounded-lg" />
    }
  }

  const getMotionVariants = (): Variants => {
    // Create framer-motion variants based on animation type
    const baseVariant = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    }

    // Add specific animation properties based on animation ID
    switch (animation.id) {
      case 'fade-in':
        return { initial: { opacity: 0 }, animate: { opacity: 1 } }
      case 'fade-in-up':
        return { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
      case 'fade-in-down':
        return { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } }
      case 'fade-in-left':
        return { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } }
      case 'fade-in-right':
        return { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } }
      case 'zoom-in':
        return { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 } }
      case 'zoom-in-up':
        return { initial: { opacity: 0, scale: 0.5, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 } }
      case 'slide-in-up':
        return { initial: { y: 50 }, animate: { y: 0 } }
      case 'slide-in-down':
        return { initial: { y: -50 }, animate: { y: 0 } }
      case 'bounce-in':
        return { initial: { opacity: 0, scale: 0.3 }, animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 15 } } }
      case 'rotate-in':
        return { initial: { opacity: 0, rotate: -180 }, animate: { opacity: 1, rotate: 0 } }
      case 'flip-in-x':
        return { initial: { opacity: 0, rotateX: 90 }, animate: { opacity: 1, rotateX: 0 } }
      case 'flip-in-y':
        return { initial: { opacity: 0, rotateY: 90 }, animate: { opacity: 1, rotateY: 0 } }
      case 'pulse':
        return { animate: { scale: [1, 1.05, 1], transition: { duration: settings.duration, repeat: Infinity } } }
      case 'bounce':
        return { animate: { y: [0, -10, 0], transition: { duration: settings.duration, repeat: Infinity } } }
      case 'shake':
        return { animate: { x: [0, -10, 10, -10, 10, 0], transition: { duration: settings.duration } } }
      case 'swing':
        return { animate: { rotate: [0, 15, -10, 5, -5, 0], transition: { duration: settings.duration } } }
      case 'tada':
        return { animate: { scale: [1, 0.9, 1.1, 1.1, 1], rotate: [0, -3, 3, -3, 0], transition: { duration: settings.duration } } }
      case 'wobble':
        return { animate: { x: [0, -25, 20, -15, 10, -5, 0], rotate: [0, -5, 3, -3, 2, -1, 0], transition: { duration: settings.duration } } }
      case 'jello':
        return { animate: { skewX: [0, -12.5, 6.25, -3.125, 1.5625, 0], skewY: [0, -12.5, 6.25, -3.125, 1.5625, 0], transition: { duration: settings.duration } } }
      case 'heartbeat':
        return { animate: { scale: [1, 1.3, 1, 1.3, 1], transition: { duration: settings.duration, repeat: Infinity } } }
      case 'rubber-band':
        return { animate: { scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1], scaleY: [1, 0.75, 1.25, 0.85, 1.05, 1], transition: { duration: settings.duration } } }
      case 'float':
        return { animate: { y: [0, -10, 0], transition: { duration: settings.duration, repeat: Infinity, repeatType: 'reverse' } } }
      case 'spinner':
        return { animate: { rotate: 360, transition: { duration: settings.duration, repeat: Infinity, ease: 'linear' } } }
      default:
        return baseVariant
    }
  }

  return (
    <div className="w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      <AnimatePresence mode="wait">
        {isPlaying && (
          <motion.div
            key={animation.id}
            variants={getMotionVariants()}
            initial="initial"
            animate="animate"
            exit="initial"
            transition={{
              duration: settings.duration,
              delay: settings.delay,
              ease: settings.easing === 'linear' ? 'linear' : 'easeOut',
            }}
            className="flex items-center justify-center text-primary-600 dark:text-primary-400"
          >
            {getPreviewContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Settings panel component
function AnimationSettingsPanel({
  animation,
  settings,
  onChange,
}: {
  animation: AnimationConfig
  settings: AnimationSettings
  onChange: (settings: AnimationSettings) => void
}) {
  const updateSetting = <K extends keyof AnimationSettings>(key: K, value: AnimationSettings[K]) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <Sliders className="w-4 h-4" />
        Animation Settings
      </h4>

      {/* Duration */}
      <div>
        <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Duration</span>
          <span className="font-mono">{settings.duration}s</span>
        </label>
        <input
          type="range"
          min={animation.customizable.duration.min}
          max={animation.customizable.duration.max}
          step={animation.customizable.duration.step}
          value={settings.duration}
          onChange={e => updateSetting('duration', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Delay */}
      <div>
        <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Delay</span>
          <span className="font-mono">{settings.delay}s</span>
        </label>
        <input
          type="range"
          min={animation.customizable.delay.min}
          max={animation.customizable.delay.max}
          step={animation.customizable.delay.step}
          value={settings.delay}
          onChange={e => updateSetting('delay', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Easing */}
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Easing</label>
        <select
          value={settings.easing}
          onChange={e => updateSetting('easing', e.target.value)}
          className="input w-full"
        >
          {animation.customizable.easing.map(easing => (
            <option key={easing} value={easing}>
              {easing.includes('cubic-bezier') ? 'Custom Bezier' : easing}
            </option>
          ))}
        </select>
      </div>

      {/* Iterations */}
      <div>
        <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Iterations</span>
          <span className="font-mono">{settings.iterations === 'infinite' ? '∞' : settings.iterations}</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={animation.customizable.iterations.min}
            max={animation.customizable.iterations.max}
            value={settings.iterations === 'infinite' ? animation.customizable.iterations.max : settings.iterations}
            onChange={e => updateSetting('iterations', parseInt(e.target.value))}
            disabled={settings.iterations === 'infinite'}
            className="flex-1"
          />
          {animation.customizable.iterations.allowInfinite && (
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={settings.iterations === 'infinite'}
                onChange={e => updateSetting('iterations', e.target.checked ? 'infinite' : 1)}
                className="rounded"
              />
              Infinite
            </label>
          )}
        </div>
      </div>

      {/* Direction */}
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Direction</label>
        <select
          value={settings.direction}
          onChange={e => updateSetting('direction', e.target.value as AnimationSettings['direction'])}
          className="input w-full"
        >
          <option value="normal">Normal</option>
          <option value="reverse">Reverse</option>
          <option value="alternate">Alternate</option>
          <option value="alternate-reverse">Alternate Reverse</option>
        </select>
      </div>

      {/* Fill Mode */}
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Fill Mode</label>
        <select
          value={settings.fillMode}
          onChange={e => updateSetting('fillMode', e.target.value as AnimationSettings['fillMode'])}
          className="input w-full"
        >
          <option value="none">None</option>
          <option value="forwards">Forwards</option>
          <option value="backwards">Backwards</option>
          <option value="both">Both</option>
        </select>
      </div>

      {/* Custom Properties */}
      {animation.customizable.customProperties?.map(prop => (
        <div key={prop.name}>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
            {prop.name.replace(/([A-Z])/g, ' $1')}
          </label>
          {prop.type === 'color' ? (
            <input
              type="color"
              value={settings.customProperties?.[prop.name] ?? prop.default}
              onChange={e => onChange({
                ...settings,
                customProperties: { ...settings.customProperties, [prop.name]: e.target.value },
              })}
              className="w-full h-10 rounded cursor-pointer"
            />
          ) : prop.type === 'select' ? (
            <select
              value={settings.customProperties?.[prop.name] ?? prop.default}
              onChange={e => onChange({
                ...settings,
                customProperties: { ...settings.customProperties, [prop.name]: e.target.value },
              })}
              className="input w-full"
            >
              {prop.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              value={settings.customProperties?.[prop.name] ?? prop.default}
              onChange={e => onChange({
                ...settings,
                customProperties: { ...settings.customProperties, [prop.name]: parseFloat(e.target.value) },
              })}
              className="input w-full"
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function AnimationsLibrary({
  onSelectAnimation,
  selectedAnimation,
  enabledCategories,
  showPreview = true,
  isAdminMode = false,
}: AnimationsLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AnimationCategory | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewAnimation, setPreviewAnimation] = useState<AnimationConfig | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>({
    duration: 0.5,
    delay: 0,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
    fillMode: 'both',
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Filter animations
  const filteredAnimations = animations.filter(anim => {
    if (enabledCategories && !enabledCategories.includes(anim.category)) return false

    const matchesSearch = searchQuery === '' ||
      anim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anim.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || anim.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Group animations by category
  const groupedAnimations = filteredAnimations.reduce((acc, anim) => {
    if (!acc[anim.category]) acc[anim.category] = []
    acc[anim.category].push(anim)
    return acc
  }, {} as Record<AnimationCategory, AnimationConfig[]>)

  const handleSelectAnimation = (animation: AnimationConfig) => {
    setPreviewAnimation(animation)
    setAnimationSettings({
      duration: animation.duration,
      delay: animation.delay,
      easing: animation.easing,
      iterations: animation.iterations,
      direction: animation.direction,
      fillMode: animation.fillMode,
    })
    setIsPlaying(true)
  }

  const handleApplyAnimation = () => {
    if (previewAnimation && onSelectAnimation) {
      onSelectAnimation(previewAnimation, animationSettings)
    }
  }

  const handleCopyCSS = (animation: AnimationConfig) => {
    const css = `.${animation.cssClass} {
  animation: ${animation.id} ${animationSettings.duration}s ${animationSettings.easing} ${animationSettings.delay}s ${animationSettings.iterations === 'infinite' ? 'infinite' : animationSettings.iterations} ${animationSettings.direction} ${animationSettings.fillMode};
}`
    navigator.clipboard.writeText(css)
    setCopiedId(animation.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const categories = Object.keys(categoryInfo) as AnimationCategory[]
  const filteredCategories = enabledCategories || categories

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            Animation Library
            <span className="text-sm font-normal text-gray-500">({animations.length} animations)</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'p-2 rounded',
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-2 rounded',
                viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search animations..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors',
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            All
          </button>
          {filteredCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors flex items-center gap-1',
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {categoryInfo[cat].icon}
              {categoryInfo[cat].name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Animation List */}
        <div className={clsx('overflow-y-auto p-4', previewAnimation ? 'w-1/2' : 'w-full')}>
          {selectedCategory === 'all' ? (
            // Show grouped by category
            Object.entries(groupedAnimations).map(([category, anims]) => (
              <div key={category} className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  {categoryInfo[category as AnimationCategory].icon}
                  {categoryInfo[category as AnimationCategory].name}
                  <span className="text-xs font-normal">({anims.length})</span>
                </h4>
                <div className={clsx(
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 lg:grid-cols-3 gap-3'
                    : 'space-y-2'
                )}>
                  {anims.map(anim => (
                    <AnimationCard
                      key={anim.id}
                      animation={anim}
                      isSelected={previewAnimation?.id === anim.id}
                      viewMode={viewMode}
                      onSelect={() => handleSelectAnimation(anim)}
                      onCopy={() => handleCopyCSS(anim)}
                      isCopied={copiedId === anim.id}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Show flat list for selected category
            <div className={clsx(
              viewMode === 'grid'
                ? 'grid grid-cols-2 lg:grid-cols-3 gap-3'
                : 'space-y-2'
            )}>
              {filteredAnimations.map(anim => (
                <AnimationCard
                  key={anim.id}
                  animation={anim}
                  isSelected={previewAnimation?.id === anim.id}
                  viewMode={viewMode}
                  onSelect={() => handleSelectAnimation(anim)}
                  onCopy={() => handleCopyCSS(anim)}
                  isCopied={copiedId === anim.id}
                />
              ))}
            </div>
          )}

          {filteredAnimations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No animations found</p>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {previewAnimation && (
          <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {previewAnimation.name}
                  {previewAnimation.isPremium && (
                    <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Pro</span>
                  )}
                </h4>
                <p className="text-sm text-gray-500">{previewAnimation.description}</p>
              </div>
              <button
                onClick={() => setPreviewAnimation(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setIsPlaying(false); setTimeout(() => setIsPlaying(true), 100) }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <AnimationPreview
                animation={previewAnimation}
                settings={animationSettings}
                isPlaying={isPlaying}
              />
            </div>

            {/* Settings */}
            <AnimationSettingsPanel
              animation={previewAnimation}
              settings={animationSettings}
              onChange={setAnimationSettings}
            />

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleApplyAnimation}
                className="flex-1 btn btn-primary"
              >
                Apply Animation
              </button>
              <button
                onClick={() => handleCopyCSS(previewAnimation)}
                className="btn btn-secondary flex items-center gap-2"
              >
                {copiedId === previewAnimation.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                CSS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Animation card component
function AnimationCard({
  animation,
  isSelected,
  viewMode,
  onSelect,
  onCopy,
  isCopied,
}: {
  animation: AnimationConfig
  isSelected: boolean
  viewMode: 'grid' | 'list'
  onSelect: () => void
  onCopy: () => void
  isCopied: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  if (viewMode === 'list') {
    return (
      <button
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
          'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
          isSelected
            ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
        )}
      >
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <motion.div
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Play className="w-5 h-5 text-gray-500" />
          </motion.div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white truncate">{animation.name}</span>
            {animation.isPremium && (
              <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded">Pro</span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{animation.description}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onCopy() }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100"
        >
          {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
        </button>
      </button>
    )
  }

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        'relative p-3 rounded-lg transition-all text-left group',
        isSelected
          ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-500'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md'
      )}
    >
      {/* Preview area */}
      <div className="w-full h-16 bg-gray-50 dark:bg-gray-700 rounded mb-2 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={isHovered ? { scale: [1, 1.2, 1], rotate: [0, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-8 h-8 bg-primary-500 rounded"
        />
      </div>

      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{animation.name}</span>
            {animation.isPremium && (
              <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{animation.category}</p>
        </div>
      </div>

      {/* Quick actions on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={e => { e.stopPropagation(); onCopy() }}
          className="p-1 bg-white dark:bg-gray-700 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-600"
          title="Copy CSS"
        >
          {isCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-500" />}
        </button>
      </div>
    </button>
  )
}

// Export animation data for admin settings
export { animations, categoryInfo }
