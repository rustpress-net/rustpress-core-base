/**
 * Signature Component
 *
 * Digital signature pad:
 * - Canvas-based drawing
 * - Touch and mouse support
 * - Stroke customization
 * - Clear and undo functionality
 * - Export to image
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Eraser,
  Undo2,
  Download,
  Pen,
  Check,
  X,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export interface SignatureProps {
  value?: string;
  onChange?: (dataUrl: string | null) => void;
  width?: number | string;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  showControls?: boolean;
  showGuide?: boolean;
  guideLine?: number;
  className?: string;
}

export interface SignaturePadProps {
  onSave?: (dataUrl: string) => void;
  onCancel?: () => void;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  width?: number | string;
  height?: number;
  showTools?: boolean;
  className?: string;
}

// ============================================================================
// Signature Pad Canvas Component
// ============================================================================

export function SignaturePad({
  onSave,
  onCancel,
  strokeColor = '#000000',
  strokeWidth = 2,
  backgroundColor = '#ffffff',
  width = '100%',
  height = 200,
  showTools = true,
  className,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [color, setColor] = useState(strokeColor);
  const [lineWidth, setLineWidth] = useState(strokeWidth);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Initialize canvas size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: typeof height === 'number' ? height : rect.height,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height]);

  // Redraw canvas whenever strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });

    // Draw current stroke
    if (currentStroke.length > 0) {
      drawStroke(ctx, { points: currentStroke, color, width: lineWidth });
    }
  }, [strokes, currentStroke, color, lineWidth, backgroundColor, canvasSize]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      const prevPoint = stroke.points[i - 1];

      // Smooth line using quadratic curves
      const midX = (prevPoint.x + point.x) / 2;
      const midY = (prevPoint.y + point.y) / 2;
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
    }

    ctx.stroke();
  };

  const getPointFromEvent = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPointFromEvent(e);
    setCurrentStroke([point]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getPointFromEvent(e);
    setCurrentStroke((prev) => [...prev, point]);
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      setStrokes((prev) => [
        ...prev,
        { points: currentStroke, color, width: lineWidth },
      ]);
      setCurrentStroke([]);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave?.(dataUrl);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = dataUrl;
    link.click();
  };

  const isEmpty = strokes.length === 0 && currentStroke.length === 0;

  return (
    <div
      ref={containerRef}
      className={cn('rounded-lg overflow-hidden border dark:border-neutral-700', className)}
      style={{ width }}
    >
      {/* Toolbar */}
      {showTools && (
        <div className="flex items-center justify-between px-3 py-2 border-b dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            {/* Color picker */}
            <div className="flex items-center gap-1">
              <Pen className="w-4 h-4 text-neutral-500" />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
              />
            </div>

            {/* Stroke width */}
            <select
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="px-2 py-1 text-sm rounded border dark:border-neutral-700 bg-white dark:bg-neutral-900"
            >
              <option value={1}>Thin</option>
              <option value={2}>Medium</option>
              <option value={4}>Thick</option>
              <option value={6}>Extra Thick</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              disabled={isEmpty}
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear"
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              disabled={isEmpty}
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="touch-none cursor-crosshair"
        style={{ backgroundColor }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {/* Action buttons */}
      {(onSave || onCancel) && (
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-t dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-sm rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
          )}
          {onSave && (
            <button
              onClick={handleSave}
              disabled={isEmpty}
              className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Signature
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Signature Component (with value state)
// ============================================================================

export function Signature({
  value,
  onChange,
  width = '100%',
  height = 150,
  strokeColor = '#000000',
  strokeWidth = 2,
  backgroundColor = '#ffffff',
  placeholder = 'Sign here',
  disabled = false,
  readOnly = false,
  showControls = true,
  showGuide = true,
  guideLine = 0.75,
  className,
}: SignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Load initial value
  useEffect(() => {
    if (value && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    }
  }, [value]);

  // Initialize canvas size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: typeof height === 'number' ? height : rect.height,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height]);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw guide line
    if (showGuide && !value) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(20, canvas.height * guideLine);
      ctx.lineTo(canvas.width - 20, canvas.height * guideLine);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw all strokes
    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });

    // Draw current stroke
    if (currentStroke.length > 0) {
      drawStroke(ctx, { points: currentStroke, color: strokeColor, width: strokeWidth });
    }
  }, [strokes, currentStroke, strokeColor, strokeWidth, backgroundColor, canvasSize, showGuide, guideLine, value]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      const prevPoint = stroke.points[i - 1];

      const midX = (prevPoint.x + point.x) / 2;
      const midY = (prevPoint.y + point.y) / 2;
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
    }

    ctx.stroke();
  };

  const getPointFromEvent = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || readOnly) return;
    e.preventDefault();
    setIsDrawing(true);
    const point = getPointFromEvent(e);
    setCurrentStroke([point]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || readOnly) return;
    e.preventDefault();

    const point = getPointFromEvent(e);
    setCurrentStroke((prev) => [...prev, point]);
  };

  const handleEnd = () => {
    if (!isDrawing || disabled || readOnly) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const newStrokes = [
        ...strokes,
        { points: currentStroke, color: strokeColor, width: strokeWidth },
      ];
      setStrokes(newStrokes);
      setCurrentStroke([]);

      // Export to data URL
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png');
          onChange?.(dataUrl);
        }
      }, 0);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    onChange?.(null);
  };

  const handleUndo = () => {
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);

    if (newStrokes.length === 0) {
      onChange?.(null);
    } else {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png');
          onChange?.(dataUrl);
        }
      }, 0);
    }
  };

  const isEmpty = strokes.length === 0 && currentStroke.length === 0 && !value;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-lg overflow-hidden border dark:border-neutral-700',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{ width }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={cn(
          'touch-none',
          !disabled && !readOnly && 'cursor-crosshair'
        )}
        style={{ backgroundColor }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {/* Placeholder */}
      {isEmpty && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-neutral-400 text-sm">{placeholder}</span>
        </div>
      )}

      {/* Controls */}
      {showControls && !disabled && !readOnly && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-1.5 rounded bg-white dark:bg-neutral-800 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            disabled={isEmpty}
            className="p-1.5 rounded bg-white dark:bg-neutral-800 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Clear"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Initials Component
// ============================================================================

export interface InitialsProps {
  value?: string;
  onChange?: (dataUrl: string | null) => void;
  size?: number;
  strokeColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  className?: string;
}

export function Initials({
  value,
  onChange,
  size = 100,
  strokeColor = '#000000',
  backgroundColor = '#ffffff',
  disabled = false,
  className,
}: InitialsProps) {
  return (
    <Signature
      value={value}
      onChange={onChange}
      width={size}
      height={size}
      strokeColor={strokeColor}
      backgroundColor={backgroundColor}
      disabled={disabled}
      showControls={false}
      showGuide={false}
      placeholder="Initials"
      className={cn('rounded-full', className)}
    />
  );
}

// ============================================================================
// Signature Modal Component
// ============================================================================

export interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  title?: string;
  strokeColor?: string;
  backgroundColor?: string;
}

export function SignatureModal({
  isOpen,
  onClose,
  onSave,
  title = 'Add Your Signature',
  strokeColor,
  backgroundColor,
}: SignatureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-neutral-700">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <SignaturePad
            onSave={(dataUrl) => {
              onSave(dataUrl);
              onClose();
            }}
            onCancel={onClose}
            strokeColor={strokeColor}
            backgroundColor={backgroundColor}
            height={250}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default Signature;
