import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Pipette,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Upload,
  Download,
  Copy,
  Check,
  X,
  Plus,
  RefreshCw,
  Sparkles,
  Image,
  History,
  AlertTriangle,
  CheckCircle,
  Info,
  Sliders,
  Circle,
  Square,
  Triangle,
  Hexagon,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Layers,
  Blend,
  Contrast,
  Loader2,
  Wand2,
  Droplet,
  Paintbrush,
  GripVertical,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// ============================================
// TYPES & INTERFACES
// ============================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorStop {
  color: string;
  position: number;
}

interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  stops: ColorStop[];
}

interface SavedPalette {
  id: string;
  name: string;
  colors: ThemeColors;
  createdAt: string;
  isFavorite: boolean;
}

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

interface ColorCustomizerProps {
  colors: ThemeColors;
  onColorsChange: (colors: ThemeColors) => void;
  onClose?: () => void;
}

type ColorBlindMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
type HarmonyType = 'complementary' | 'triadic' | 'tetradic' | 'analogous' | 'split-complementary';

// ============================================
// COLOR UTILITY FUNCTIONS
// ============================================

// Hex to RGB
const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

// RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// RGB to HSL
const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

// HSL to RGB
const hslToRgb = (h: number, s: number, l: number): RGB => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

// HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

// Calculate relative luminance
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio
const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

// WCAG compliance level
const getWCAGLevel = (ratio: number): { level: string; aa: boolean; aaa: boolean; aaLarge: boolean; aaaLarge: boolean } => {
  return {
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail',
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
    aaLarge: ratio >= 3,
    aaaLarge: ratio >= 4.5,
  };
};

// Color blind simulation matrices
const colorBlindMatrices: Record<ColorBlindMode, number[][]> = {
  normal: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
};

// Apply color blind simulation
const simulateColorBlindness = (hex: string, mode: ColorBlindMode): string => {
  if (mode === 'normal') return hex;
  const { r, g, b } = hexToRgb(hex);
  const matrix = colorBlindMatrices[mode];
  const newR = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
  const newG = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
  const newB = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];
  return rgbToHex(newR, newG, newB);
};

// Generate color harmonies
const generateHarmony = (baseHex: string, type: HarmonyType): string[] => {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);

  switch (type) {
    case 'complementary':
      return [baseHex, hslToHex((h + 180) % 360, s, l)];
    case 'triadic':
      return [
        baseHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
      ];
    case 'tetradic':
      return [
        baseHex,
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
      ];
    case 'analogous':
      return [
        hslToHex((h - 30 + 360) % 360, s, l),
        baseHex,
        hslToHex((h + 30) % 360, s, l),
      ];
    case 'split-complementary':
      return [
        baseHex,
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
      ];
    default:
      return [baseHex];
  }
};

// Generate palette from primary color
const generatePaletteFromPrimary = (primaryHex: string): ThemeColors => {
  const { r, g, b } = hexToRgb(primaryHex);
  const { h, s, l } = rgbToHsl(r, g, b);

  return {
    primary: primaryHex,
    secondary: hslToHex((h + 30) % 360, Math.max(s - 10, 0), l),
    accent: hslToHex((h + 180) % 360, Math.min(s + 10, 100), l),
    background: hslToHex(h, 5, 98),
    surface: '#FFFFFF',
    text: hslToHex(h, 10, 15),
    textMuted: hslToHex(h, 5, 45),
    border: hslToHex(h, 10, 88),
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  };
};

// Generate dark mode from light palette
const generateDarkMode = (lightColors: ThemeColors): ThemeColors => {
  const { r, g, b } = hexToRgb(lightColors.primary);
  const { h, s } = rgbToHsl(r, g, b);

  return {
    primary: hslToHex(h, Math.min(s + 10, 100), 60),
    secondary: hslToHex((h + 30) % 360, Math.min(s, 80), 55),
    accent: hslToHex((h + 180) % 360, Math.min(s + 15, 100), 65),
    background: hslToHex(h, 15, 10),
    surface: hslToHex(h, 12, 15),
    text: hslToHex(h, 5, 95),
    textMuted: hslToHex(h, 5, 60),
    border: hslToHex(h, 10, 25),
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
  };
};

// Extract dominant colors from image
const extractColorsFromImage = (imageData: ImageData, colorCount: number = 5): string[] => {
  const pixels: RGB[] = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels.push({
      r: imageData.data[i],
      g: imageData.data[i + 1],
      b: imageData.data[i + 2],
    });
  }

  // Simple k-means clustering for color extraction
  const clusters: RGB[] = [];
  for (let i = 0; i < colorCount; i++) {
    clusters.push(pixels[Math.floor(Math.random() * pixels.length)]);
  }

  for (let iteration = 0; iteration < 10; iteration++) {
    const assignments: number[][] = Array(colorCount).fill(null).map(() => []);

    pixels.forEach((pixel, idx) => {
      let minDist = Infinity;
      let closestCluster = 0;
      clusters.forEach((cluster, clusterIdx) => {
        const dist = Math.sqrt(
          Math.pow(pixel.r - cluster.r, 2) +
          Math.pow(pixel.g - cluster.g, 2) +
          Math.pow(pixel.b - cluster.b, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          closestCluster = clusterIdx;
        }
      });
      assignments[closestCluster].push(idx);
    });

    clusters.forEach((_, idx) => {
      if (assignments[idx].length === 0) return;
      const sum = { r: 0, g: 0, b: 0 };
      assignments[idx].forEach(pixelIdx => {
        sum.r += pixels[pixelIdx].r;
        sum.g += pixels[pixelIdx].g;
        sum.b += pixels[pixelIdx].b;
      });
      clusters[idx] = {
        r: sum.r / assignments[idx].length,
        g: sum.g / assignments[idx].length,
        b: sum.b / assignments[idx].length,
      };
    });
  }

  return clusters.map(c => rgbToHex(c.r, c.g, c.b));
};

// ============================================
// ENHANCEMENT 19: COLOR PALETTE GENERATOR
// ============================================

interface PaletteGeneratorProps {
  onApplyPalette: (colors: ThemeColors) => void;
  currentPrimary: string;
}

const PaletteGenerator: React.FC<PaletteGeneratorProps> = ({ onApplyPalette, currentPrimary }) => {
  const [primaryColor, setPrimaryColor] = useState(currentPrimary);
  const [generatedPalette, setGeneratedPalette] = useState<ThemeColors | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const palette = generatePaletteFromPrimary(primaryColor);
      setGeneratedPalette(palette);
      setIsGenerating(false);
    }, 500);
  };

  const handleRandomize = () => {
    const randomHue = Math.floor(Math.random() * 360);
    const randomSat = 50 + Math.floor(Math.random() * 40);
    const randomLight = 40 + Math.floor(Math.random() * 20);
    const randomColor = hslToHex(randomHue, randomSat, randomLight);
    setPrimaryColor(randomColor);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Primary Color
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono"
            />
            <button
              onClick={handleRandomize}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Random color"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Wand2 className="w-5 h-5" />
        )}
        {isGenerating ? 'Generating...' : 'Generate Palette'}
      </button>

      {generatedPalette && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Palette</h4>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(generatedPalette).slice(0, 6).map(([key, color]) => (
              <div key={key} className="text-center">
                <div
                  className="w-full aspect-square rounded-lg mb-1 border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-500 capitalize">{key}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onApplyPalette(generatedPalette)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Palette
          </button>
        </motion.div>
      )}
    </div>
  );
};

// ============================================
// ENHANCEMENT 20: EYEDROPPER TOOL
// ============================================

interface EyedropperProps {
  onColorPick: (color: string) => void;
}

const EyedropperTool: React.FC<EyedropperProps> = ({ onColorPick }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

  useEffect(() => {
    // Check if EyeDropper API is supported
    setIsSupported('EyeDropper' in window);
  }, []);

  const handlePick = async () => {
    if (!isSupported) {
      toast.error('Eyedropper not supported in this browser');
      return;
    }

    setIsPicking(true);
    try {
      // @ts-ignore - EyeDropper API
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onColorPick(result.sRGBHex);
      toast.success(`Picked: ${result.sRGBHex}`);
    } catch (err) {
      // User cancelled
    }
    setIsPicking(false);
  };

  return (
    <button
      onClick={handlePick}
      disabled={!isSupported || isPicking}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
        isPicking
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
        !isSupported && 'opacity-50 cursor-not-allowed'
      )}
      title={isSupported ? 'Pick color from screen' : 'Not supported in this browser'}
    >
      <Pipette className={clsx('w-5 h-5', isPicking && 'animate-pulse')} />
      {isPicking ? 'Picking...' : 'Eyedropper'}
    </button>
  );
};

// ============================================
// ENHANCEMENT 21: COLOR CONTRAST CHECKER
// ============================================

interface ContrastCheckerProps {
  foreground: string;
  background: string;
  onSwap: () => void;
}

const ContrastChecker: React.FC<ContrastCheckerProps> = ({ foreground, background, onSwap }) => {
  const ratio = getContrastRatio(foreground, background);
  const wcag = getWCAGLevel(ratio);

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Contrast className="w-4 h-4" />
          Contrast Checker
        </h4>
        <button
          onClick={onSwap}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Swap colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Preview */}
      <div className="flex gap-3">
        <div
          className="flex-1 p-4 rounded-lg text-center"
          style={{ backgroundColor: background, color: foreground }}
        >
          <p className="font-bold text-lg">Sample Text</p>
          <p className="text-sm opacity-80">Regular body text</p>
        </div>
        <div
          className="flex-1 p-4 rounded-lg text-center"
          style={{ backgroundColor: foreground, color: background }}
        >
          <p className="font-bold text-lg">Sample Text</p>
          <p className="text-sm opacity-80">Regular body text</p>
        </div>
      </div>

      {/* Ratio Display */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {ratio.toFixed(2)}:1
        </div>
        <div className={clsx(
          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2',
          wcag.aaa ? 'bg-green-100 text-green-700' :
          wcag.aa ? 'bg-blue-100 text-blue-700' :
          wcag.aaLarge ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        )}>
          {wcag.aaa ? <CheckCircle className="w-4 h-4" /> :
           wcag.aa ? <CheckCircle className="w-4 h-4" /> :
           wcag.aaLarge ? <AlertTriangle className="w-4 h-4" /> :
           <X className="w-4 h-4" />}
          {wcag.level}
        </div>
      </div>

      {/* WCAG Levels */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className={clsx(
          'flex items-center justify-between p-2 rounded-lg',
          wcag.aa ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
        )}>
          <span>AA Normal</span>
          {wcag.aa ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
        <div className={clsx(
          'flex items-center justify-between p-2 rounded-lg',
          wcag.aaa ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
        )}>
          <span>AAA Normal</span>
          {wcag.aaa ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
        <div className={clsx(
          'flex items-center justify-between p-2 rounded-lg',
          wcag.aaLarge ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
        )}>
          <span>AA Large</span>
          {wcag.aaLarge ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
        <div className={clsx(
          'flex items-center justify-between p-2 rounded-lg',
          wcag.aaaLarge ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
        )}>
          <span>AAA Large</span>
          {wcag.aaaLarge ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 22: GRADIENT BUILDER
// ============================================

interface GradientBuilderProps {
  onGradientChange: (css: string) => void;
}

const GradientBuilder: React.FC<GradientBuilderProps> = ({ onGradientChange }) => {
  const [gradient, setGradient] = useState<GradientConfig>({
    type: 'linear',
    angle: 90,
    stops: [
      { color: '#3B82F6', position: 0 },
      { color: '#8B5CF6', position: 100 },
    ],
  });
  const [copied, setCopied] = useState(false);

  const generateCSS = useCallback(() => {
    const stopsStr = gradient.stops
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');

    switch (gradient.type) {
      case 'linear':
        return `linear-gradient(${gradient.angle}deg, ${stopsStr})`;
      case 'radial':
        return `radial-gradient(circle, ${stopsStr})`;
      case 'conic':
        return `conic-gradient(from ${gradient.angle}deg, ${stopsStr})`;
      default:
        return '';
    }
  }, [gradient]);

  useEffect(() => {
    onGradientChange(generateCSS());
  }, [gradient, generateCSS, onGradientChange]);

  const addStop = () => {
    if (gradient.stops.length >= 5) return;
    const newPosition = 50;
    const newColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setGradient(prev => ({
      ...prev,
      stops: [...prev.stops, { color: newColor, position: newPosition }].sort((a, b) => a.position - b.position),
    }));
  };

  const removeStop = (index: number) => {
    if (gradient.stops.length <= 2) return;
    setGradient(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }));
  };

  const updateStop = (index: number, updates: Partial<ColorStop>) => {
    setGradient(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => i === index ? { ...stop, ...updates } : stop),
    }));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateCSS());
    setCopied(true);
    toast.success('CSS copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div
        className="h-24 rounded-xl border border-gray-200 dark:border-gray-700"
        style={{ background: generateCSS() }}
      />

      {/* Type Selector */}
      <div className="flex gap-2">
        {(['linear', 'radial', 'conic'] as const).map(type => (
          <button
            key={type}
            onClick={() => setGradient(prev => ({ ...prev, type }))}
            className={clsx(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              gradient.type === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Angle Control */}
      {(gradient.type === 'linear' || gradient.type === 'conic') && (
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Angle: {gradient.angle}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={gradient.angle}
            onChange={(e) => setGradient(prev => ({ ...prev, angle: parseInt(e.target.value) }))}
            className="w-full"
          />
        </div>
      )}

      {/* Color Stops */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Stops</label>
          <button
            onClick={addStop}
            disabled={gradient.stops.length >= 5}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {gradient.stops.map((stop, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => updateStop(idx, { color: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={stop.position}
              onChange={(e) => updateStop(idx, { position: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-10">{stop.position}%</span>
            <button
              onClick={() => removeStop(idx)}
              disabled={gradient.stops.length <= 2}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* CSS Output */}
      <div className="relative">
        <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
          {generateCSS()}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
        </button>
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 23: COLOR HISTORY PANEL
// ============================================

interface ColorHistoryProps {
  history: string[];
  onSelectColor: (color: string) => void;
  onClear: () => void;
}

const ColorHistory: React.FC<ColorHistoryProps> = ({ history, onSelectColor, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No color history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Colors</h4>
        <button
          onClick={onClear}
          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((color, idx) => (
          <button
            key={`${color}-${idx}`}
            onClick={() => onSelectColor(color)}
            className="group relative"
            title={color}
          >
            <div
              className="w-8 h-8 rounded-lg border-2 border-white dark:border-gray-800 shadow-sm hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {color}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 24: IMPORT FROM IMAGE
// ============================================

interface ImageColorExtractorProps {
  onExtractColors: (colors: string[]) => void;
}

const ImageColorExtractor: React.FC<ImageColorExtractorProps> = ({ onExtractColors }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        setPreviewUrl(event.target?.result as string);

        // Draw to canvas and extract colors
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize for performance
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractColorsFromImage(imageData, 6);

        setExtractedColors(colors);
        setIsLoading(false);
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      {!previewUrl ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex flex-col items-center gap-2 text-gray-500 hover:text-blue-600"
        >
          <Upload className="w-8 h-8" />
          <span className="text-sm font-medium">Upload image to extract colors</span>
          <span className="text-xs">PNG, JPG, or WebP</span>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Uploaded"
              className="w-full h-32 object-cover rounded-xl"
            />
            <button
              onClick={() => {
                setPreviewUrl(null);
                setExtractedColors([]);
              }}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Extracted Colors</h4>
              <div className="flex gap-2">
                {extractedColors.map((color, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 mb-1"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-gray-500 font-mono">{color.slice(0, 7)}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onExtractColors(extractedColors)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Apply as Palette
              </button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

// ============================================
// ENHANCEMENT 25: COLOR BLIND PREVIEW
// ============================================

interface ColorBlindPreviewProps {
  colors: ThemeColors;
}

const ColorBlindPreview: React.FC<ColorBlindPreviewProps> = ({ colors }) => {
  const [activeMode, setActiveMode] = useState<ColorBlindMode>('normal');

  const modes: { mode: ColorBlindMode; label: string; description: string }[] = [
    { mode: 'normal', label: 'Normal', description: 'Normal vision' },
    { mode: 'protanopia', label: 'Protanopia', description: 'Red-blind (~1% of males)' },
    { mode: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind (~6% of males)' },
    { mode: 'tritanopia', label: 'Tritanopia', description: 'Blue-blind (rare)' },
    { mode: 'achromatopsia', label: 'Achromatopsia', description: 'Complete color blindness' },
  ];

  const simulatedColors = useMemo(() => {
    const result: Record<string, string> = {};
    Object.entries(colors).forEach(([key, value]) => {
      result[key] = simulateColorBlindness(value, activeMode);
    });
    return result as ThemeColors;
  }, [colors, activeMode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {modes.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-500">
        {modes.find(m => m.mode === activeMode)?.description}
      </div>

      {/* Color Preview Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <h5 className="text-xs font-medium text-gray-500 mb-2">Original</h5>
          <div className="flex flex-wrap gap-1">
            {Object.entries(colors).slice(0, 8).map(([key, color]) => (
              <div
                key={key}
                className="w-8 h-8 rounded"
                style={{ backgroundColor: color }}
                title={`${key}: ${color}`}
              />
            ))}
          </div>
        </div>
        <div>
          <h5 className="text-xs font-medium text-gray-500 mb-2">Simulated</h5>
          <div className="flex flex-wrap gap-1">
            {Object.entries(simulatedColors).slice(0, 8).map(([key, color]) => (
              <div
                key={key}
                className="w-8 h-8 rounded"
                style={{ backgroundColor: color }}
                title={`${key}: ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sample UI Preview */}
      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: simulatedColors.background }}
      >
        <div
          className="p-3 rounded-lg mb-3"
          style={{ backgroundColor: simulatedColors.surface, borderColor: simulatedColors.border, borderWidth: 1 }}
        >
          <p style={{ color: simulatedColors.text }} className="font-medium mb-1">Sample Card Title</p>
          <p style={{ color: simulatedColors.textMuted }} className="text-sm">This is how your content will appear.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded-lg text-white text-sm"
            style={{ backgroundColor: simulatedColors.primary }}
          >
            Primary
          </button>
          <button
            className="px-3 py-1.5 rounded-lg text-white text-sm"
            style={{ backgroundColor: simulatedColors.success }}
          >
            Success
          </button>
          <button
            className="px-3 py-1.5 rounded-lg text-white text-sm"
            style={{ backgroundColor: simulatedColors.error }}
          >
            Error
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 26: SAVED PALETTE LIBRARY
// ============================================

interface PaletteLibraryProps {
  palettes: SavedPalette[];
  onApply: (palette: SavedPalette) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const PaletteLibrary: React.FC<PaletteLibraryProps> = ({
  palettes,
  onApply,
  onSave,
  onDelete,
  onToggleFavorite,
}) => {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  const filteredPalettes = filter === 'favorites'
    ? palettes.filter(p => p.isFavorite)
    : palettes;

  const handleSave = () => {
    if (!newPaletteName.trim()) return;
    onSave(newPaletteName.trim());
    setNewPaletteName('');
    setShowSaveInput(false);
    toast.success('Palette saved!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            All ({palettes.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              filter === 'favorites'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            Favorites ({palettes.filter(p => p.isFavorite).length})
          </button>
        </div>
        <button
          onClick={() => setShowSaveInput(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Save Current
        </button>
      </div>

      {showSaveInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newPaletteName}
            onChange={(e) => setNewPaletteName(e.target.value)}
            placeholder="Palette name..."
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSaveInput(false)}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {filteredPalettes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No saved palettes yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredPalettes.map(palette => (
            <div
              key={palette.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="flex -space-x-1">
                {Object.values(palette.colors).slice(0, 5).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{palette.name}</p>
                <p className="text-xs text-gray-500">{new Date(palette.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleFavorite(palette.id)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  {palette.isFavorite ? (
                    <BookmarkCheck className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => onApply(palette)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <Check className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={() => onDelete(palette.id)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// ENHANCEMENT 27: COLOR HARMONY WHEEL
// ============================================

interface ColorHarmonyWheelProps {
  baseColor: string;
  onSelectHarmony: (colors: string[]) => void;
}

const ColorHarmonyWheel: React.FC<ColorHarmonyWheelProps> = ({ baseColor, onSelectHarmony }) => {
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('complementary');
  const [hue, setHue] = useState(() => {
    const { r, g, b } = hexToRgb(baseColor);
    return rgbToHsl(r, g, b).h;
  });

  const harmonies = useMemo(() => generateHarmony(baseColor, harmonyType), [baseColor, harmonyType]);

  const harmonyOptions: { type: HarmonyType; label: string; count: number }[] = [
    { type: 'complementary', label: 'Complementary', count: 2 },
    { type: 'triadic', label: 'Triadic', count: 3 },
    { type: 'tetradic', label: 'Tetradic', count: 4 },
    { type: 'analogous', label: 'Analogous', count: 3 },
    { type: 'split-complementary', label: 'Split', count: 3 },
  ];

  // Generate wheel segments
  const wheelSegments = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div className="space-y-4">
      {/* Color Wheel */}
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Wheel segments */}
          {wheelSegments.map((angle, idx) => {
            const startAngle = (angle - 15) * (Math.PI / 180);
            const endAngle = (angle + 15) * (Math.PI / 180);
            const x1 = 50 + 45 * Math.cos(startAngle);
            const y1 = 50 + 45 * Math.sin(startAngle);
            const x2 = 50 + 45 * Math.cos(endAngle);
            const y2 = 50 + 45 * Math.sin(endAngle);

            return (
              <path
                key={idx}
                d={`M 50 50 L ${x1} ${y1} A 45 45 0 0 1 ${x2} ${y2} Z`}
                fill={hslToHex(angle, 70, 50)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  const newColor = hslToHex(angle, 70, 50);
                  onSelectHarmony(generateHarmony(newColor, harmonyType));
                }}
              />
            );
          })}

          {/* Center circle */}
          <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-gray-900" />

          {/* Harmony markers */}
          {harmonies.map((color, idx) => {
            const { h } = rgbToHsl(...Object.values(hexToRgb(color)) as [number, number, number]);
            const angle = (h - 90) * (Math.PI / 180);
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 35 * Math.sin(angle);

            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="6"
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-lg"
              />
            );
          })}
        </svg>

        {/* Base color in center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
          style={{ backgroundColor: baseColor }}
        />
      </div>

      {/* Harmony Type Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {harmonyOptions.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => setHarmonyType(type)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              harmonyType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Harmony Colors */}
      <div className="flex justify-center gap-3">
        {harmonies.map((color, idx) => (
          <div key={idx} className="text-center">
            <div
              className="w-12 h-12 rounded-xl border-2 border-white dark:border-gray-800 shadow-lg mb-1"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-500 font-mono">{color}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSelectHarmony(harmonies)}
        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Apply Harmony
      </button>
    </div>
  );
};

// ============================================
// ENHANCEMENT 28: DARK/LIGHT MODE TOGGLE
// ============================================

interface DarkLightToggleProps {
  colors: ThemeColors;
  isDarkMode: boolean;
  onToggle: () => void;
  onApplyGenerated: (colors: ThemeColors) => void;
}

const DarkLightToggle: React.FC<DarkLightToggleProps> = ({
  colors,
  isDarkMode,
  onToggle,
  onApplyGenerated,
}) => {
  const [showGenerated, setShowGenerated] = useState(false);
  const generatedColors = useMemo(() =>
    isDarkMode ? colors : generateDarkMode(colors),
    [colors, isDarkMode]
  );

  return (
    <div className="space-y-4">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center gap-3">
          <Sun className={clsx('w-5 h-5', !isDarkMode ? 'text-yellow-500' : 'text-gray-400')} />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
        <button
          onClick={onToggle}
          className={clsx(
            'relative w-14 h-7 rounded-full transition-colors',
            isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
          )}
        >
          <motion.div
            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ left: isDarkMode ? 32 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
        <Moon className={clsx('w-5 h-5', isDarkMode ? 'text-blue-400' : 'text-gray-400')} />
      </div>

      {/* Auto-generate opposite mode */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              Auto-generate {isDarkMode ? 'Light' : 'Dark'} Mode
            </h4>
            <p className="text-sm text-gray-500">
              Create matching colors for the opposite mode
            </p>
          </div>
          <button
            onClick={() => setShowGenerated(!showGenerated)}
            className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors"
          >
            {showGenerated ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {showGenerated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Current vs Generated comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <h5 className="text-xs font-medium text-gray-500 mb-2">Current</h5>
                  <div className="flex flex-wrap gap-1">
                    {Object.values(colors).slice(0, 6).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-500 mb-2">Generated {isDarkMode ? 'Light' : 'Dark'}</h5>
                  <div className="flex flex-wrap gap-1">
                    {Object.values(generatedColors).slice(0, 6).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview card */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: generatedColors.background }}
              >
                <div
                  className="p-3 rounded-lg mb-2"
                  style={{
                    backgroundColor: generatedColors.surface,
                    borderColor: generatedColors.border,
                    borderWidth: 1,
                  }}
                >
                  <p style={{ color: generatedColors.text }} className="font-medium">Preview Card</p>
                  <p style={{ color: generatedColors.textMuted }} className="text-sm">Sample text content</p>
                </div>
                <div className="flex gap-2">
                  <span
                    className="px-2 py-1 rounded text-white text-xs"
                    style={{ backgroundColor: generatedColors.primary }}
                  >
                    Primary
                  </span>
                  <span
                    className="px-2 py-1 rounded text-white text-xs"
                    style={{ backgroundColor: generatedColors.secondary }}
                  >
                    Secondary
                  </span>
                </div>
              </div>

              <button
                onClick={() => onApplyGenerated(generatedColors)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Apply Generated Colors
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================
// MAIN COLOR CUSTOMIZER COMPONENT
// ============================================

const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  colors,
  onColorsChange,
  onClose,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'palette' | 'tools' | 'accessibility' | 'library'>('palette');
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedColorKey, setSelectedColorKey] = useState<keyof ThemeColors>('primary');
  const [gradientCSS, setGradientCSS] = useState('');

  // Add color to history
  const addToHistory = (color: string) => {
    setColorHistory(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 20);
    });
  };

  // Update single color
  const updateColor = (key: keyof ThemeColors, value: string) => {
    addToHistory(value);
    onColorsChange({ ...colors, [key]: value });
  };

  // Apply full palette
  const applyPalette = (newColors: ThemeColors) => {
    onColorsChange(newColors);
    toast.success('Palette applied!');
  };

  // Save current palette
  const savePalette = (name: string) => {
    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      name,
      colors: { ...colors },
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    setSavedPalettes(prev => [newPalette, ...prev]);
  };

  // Apply colors from image
  const applyImageColors = (extractedColors: string[]) => {
    if (extractedColors.length >= 3) {
      onColorsChange({
        ...colors,
        primary: extractedColors[0],
        secondary: extractedColors[1],
        accent: extractedColors[2],
        background: extractedColors[3] || colors.background,
        surface: extractedColors[4] || colors.surface,
        text: extractedColors[5] || colors.text,
      });
      toast.success('Colors extracted from image!');
    }
  };

  // Apply harmony colors
  const applyHarmonyColors = (harmonyColors: string[]) => {
    onColorsChange({
      ...colors,
      primary: harmonyColors[0],
      secondary: harmonyColors[1] || colors.secondary,
      accent: harmonyColors[2] || colors.accent,
    });
    toast.success('Harmony colors applied!');
  };

  const tabs = [
    { id: 'palette', label: 'Palette', icon: Palette },
    { id: 'tools', label: 'Tools', icon: Sliders },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'library', label: 'Library', icon: Bookmark },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-[90vw] w-full max-h-[95vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Paintbrush className="w-6 h-6 text-blue-600" />
          Color Customizer
        </h2>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              activeTab === id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'palette' && (
            <motion.div
              key="palette"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Color Grid */}
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-xs font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => updateColor(key as keyof ThemeColors, e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateColor(key as keyof ThemeColors, e.target.value)}
                        className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Palette Generator */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  AI Palette Generator
                </h3>
                <PaletteGenerator
                  currentPrimary={colors.primary}
                  onApplyPalette={applyPalette}
                />
              </div>

              {/* Color Harmony */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <Circle className="w-4 h-4" />
                  Color Harmony Wheel
                </h3>
                <ColorHarmonyWheel
                  baseColor={colors.primary}
                  onSelectHarmony={applyHarmonyColors}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Eyedropper */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pick Color</h3>
                <EyedropperTool onColorPick={(color) => updateColor(selectedColorKey, color)} />
              </div>

              {/* Gradient Builder */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Blend className="w-4 h-4" />
                  Gradient Builder
                </h3>
                <GradientBuilder onGradientChange={setGradientCSS} />
              </div>

              {/* Import from Image */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Extract from Image
                </h3>
                <ImageColorExtractor onExtractColors={applyImageColors} />
              </div>

              {/* Color History */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <ColorHistory
                  history={colorHistory}
                  onSelectColor={(color) => updateColor(selectedColorKey, color)}
                  onClear={() => setColorHistory([])}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'accessibility' && (
            <motion.div
              key="accessibility"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Contrast Checker */}
              <ContrastChecker
                foreground={colors.text}
                background={colors.background}
                onSwap={() => {
                  onColorsChange({
                    ...colors,
                    text: colors.background,
                    background: colors.text,
                  });
                }}
              />

              {/* Color Blind Preview */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Color Blind Simulation
                </h3>
                <ColorBlindPreview colors={colors} />
              </div>

              {/* Dark/Light Mode */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <DarkLightToggle
                  colors={colors}
                  isDarkMode={isDarkMode}
                  onToggle={() => setIsDarkMode(!isDarkMode)}
                  onApplyGenerated={applyPalette}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <PaletteLibrary
                palettes={savedPalettes}
                onApply={(palette) => applyPalette(palette.colors)}
                onSave={savePalette}
                onDelete={(id) => setSavedPalettes(prev => prev.filter(p => p.id !== id))}
                onToggleFavorite={(id) =>
                  setSavedPalettes(prev =>
                    prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
                  )
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <button
          onClick={() => {
            const css = Object.entries(colors)
              .map(([key, value]) => `  --color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
              .join('\n');
            navigator.clipboard.writeText(`:root {\n${css}\n}`);
            toast.success('CSS variables copied!');
          }}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <Copy className="w-4 h-4" />
          Copy CSS Variables
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => savePalette(`Palette ${new Date().toLocaleDateString()}`)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Palette
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorCustomizer;
