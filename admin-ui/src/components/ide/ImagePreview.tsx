/**
 * ImagePreview - View images in editor area
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ZoomIn, ZoomOut, RotateCw, Download, Copy, Image as ImageIcon,
  Maximize2, Minimize2, Grid, CheckSquare, Info
} from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  fileName: string;
  onClose?: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  fileName,
  onClose
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size?: string;
  } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageInfo({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName;
    link.click();
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(src);
  };

  const fileExtension = useMemo(() => {
    return fileName.split('.').pop()?.toUpperCase() || 'IMAGE';
  }, [fileName]);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-white">{fileName}</span>
          <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-400">
            {fileExtension}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-lg mr-2">
            <button
              onClick={handleZoomOut}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-300 min-w-[48px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleRotate}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded transition-colors ${
              showGrid ? 'text-blue-400 bg-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded transition-colors ${
              showInfo ? 'text-blue-400 bg-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Image Info"
          >
            <Info className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-700 mx-1" />

          <button
            onClick={handleCopyPath}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Copy Path"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 relative overflow-auto">
        {/* Checkered Background for transparency */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(45deg, #374151 25%, transparent 25%),
              linear-gradient(-45deg, #374151 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #374151 75%),
              linear-gradient(-45deg, transparent 75%, #374151 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        />

        {/* Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        )}

        {/* Image */}
        <div className="flex items-center justify-center min-h-full p-8">
          <motion.img
            src={src}
            alt={fileName}
            onLoad={handleImageLoad}
            className="max-w-full h-auto shadow-2xl"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-out'
            }}
            draggable={false}
          />
        </div>

        {/* Image Info Panel */}
        {showInfo && imageInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl"
          >
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Image Details
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Dimensions:</span>
                <span className="text-white">{imageInfo.width} × {imageInfo.height}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Format:</span>
                <span className="text-white">{fileExtension}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">Zoom:</span>
                <span className="text-white">{Math.round(zoom * 100)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-gray-700 bg-gray-800/50 text-xs text-gray-500">
        <span>Scroll to zoom</span>
        <span>•</span>
        <button onClick={handleReset} className="text-blue-400 hover:underline">
          Reset View
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
