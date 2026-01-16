/**
 * RustPress Video Player Component
 * Custom video player with controls, fullscreen, and playback features
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  RotateCcw,
  Loader2,
  AlertCircle,
  PictureInPicture2,
  Subtitles,
  Download,
  Share2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface VideoSource {
  src: string;
  type: string;
  quality?: string;
}

export interface VideoCaption {
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
}

export interface VideoPlayerProps {
  src: string | VideoSource[];
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  showPlaybackSpeed?: boolean;
  showQuality?: boolean;
  showPiP?: boolean;
  showCaptions?: boolean;
  showDownload?: boolean;
  showShare?: boolean;
  captions?: VideoCaption[];
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: Error) => void;
  onDownload?: () => void;
  onShare?: () => void;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Volume Slider Component
// ============================================================================

interface VolumeSliderProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

function VolumeSlider({ volume, muted, onVolumeChange, onMuteToggle }: VolumeSliderProps) {
  const [showSlider, setShowSlider] = useState(false);

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        onClick={onMuteToggle}
        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
      >
        <VolumeIcon className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 80 }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={muted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 appearance-none bg-white/30 rounded-full cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Settings Menu Component
// ============================================================================

interface SettingsMenuProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  quality?: string;
  qualities?: string[];
  onQualityChange?: (quality: string) => void;
  showPlaybackSpeed: boolean;
  showQuality: boolean;
}

function SettingsMenu({
  playbackSpeed,
  onSpeedChange,
  quality,
  qualities,
  onQualityChange,
  showPlaybackSpeed,
  showQuality,
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'speed' | 'quality'>('main');

  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
      >
        <Settings className={cn('w-5 h-5 transition-transform', isOpen && 'rotate-90')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 min-w-48 bg-neutral-900/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden"
          >
            {activeTab === 'main' && (
              <div className="py-1">
                {showPlaybackSpeed && (
                  <button
                    onClick={() => setActiveTab('speed')}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/10"
                  >
                    <span>Playback Speed</span>
                    <span className="text-sm text-neutral-400">{playbackSpeed}x</span>
                  </button>
                )}
                {showQuality && qualities && qualities.length > 0 && (
                  <button
                    onClick={() => setActiveTab('quality')}
                    className="w-full px-4 py-2 flex items-center justify-between hover:bg-white/10"
                  >
                    <span>Quality</span>
                    <span className="text-sm text-neutral-400">{quality || 'Auto'}</span>
                  </button>
                )}
              </div>
            )}

            {activeTab === 'speed' && (
              <div className="py-1">
                <button
                  onClick={() => setActiveTab('main')}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 border-b border-white/10"
                >
                  <SkipBack className="w-4 h-4" />
                  <span>Playback Speed</span>
                </button>
                {speeds.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      onSpeedChange(speed);
                      setIsOpen(false);
                      setActiveTab('main');
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left hover:bg-white/10',
                      speed === playbackSpeed && 'bg-white/10 text-primary-400'
                    )}
                  >
                    {speed === 1 ? 'Normal' : `${speed}x`}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'quality' && qualities && (
              <div className="py-1">
                <button
                  onClick={() => setActiveTab('main')}
                  className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 border-b border-white/10"
                >
                  <SkipBack className="w-4 h-4" />
                  <span>Quality</span>
                </button>
                {qualities.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      onQualityChange?.(q);
                      setIsOpen(false);
                      setActiveTab('main');
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left hover:bg-white/10',
                      q === quality && 'bg-white/10 text-primary-400'
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Progress Bar Component
// ============================================================================

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (time: number) => void;
}

function ProgressBar({ currentTime, duration, buffered, onSeek }: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(percent * duration);
    setHoverPosition(e.clientX - rect.left);
  };

  return (
    <div
      ref={progressRef}
      className="relative h-1 bg-white/30 rounded-full cursor-pointer group"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverTime(null)}
    >
      {/* Buffered */}
      <div
        className="absolute h-full bg-white/40 rounded-full"
        style={{ width: `${bufferedProgress}%` }}
      />

      {/* Progress */}
      <div
        className="absolute h-full bg-primary-500 rounded-full"
        style={{ width: `${progress}%` }}
      />

      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md
          opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `calc(${progress}% - 6px)` }}
      />

      {/* Hover Time Tooltip */}
      {hoverTime !== null && (
        <div
          className="absolute bottom-full mb-2 -translate-x-1/2 px-2 py-1 bg-black/80
            text-white text-xs rounded pointer-events-none"
          style={{ left: hoverPosition }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Video Player Component
// ============================================================================

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  muted: initialMuted = false,
  loop = false,
  controls = true,
  showPlaybackSpeed = true,
  showQuality = true,
  showPiP = true,
  showCaptions = true,
  showDownload = false,
  showShare = false,
  captions = [],
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
  onDownload,
  onShare,
  aspectRatio = '16:9',
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  // Auto-hide controls
  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);

      // Update buffered
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsPaused(false);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsPaused(true);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsPaused(true);
      onEnded?.();
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      onError?.(new Error('Video playback error'));
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onPlay, onPause, onEnded, onTimeUpdate, onError]);

  // Fullscreen handlers
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // PiP handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    video.currentTime = newTime;
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  };

  const toggleCaptions = () => {
    const video = videoRef.current;
    if (!video || video.textTracks.length === 0) return;

    const track = video.textTracks[0];
    track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
    setCaptionsEnabled(track.mode === 'showing');
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play();
  };

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '21:9': 'aspect-[21/9]',
  };

  const sources = Array.isArray(src) ? src : [{ src, type: 'video/mp4' }];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden group',
        aspectRatioClasses[aspectRatio],
        className
      )}
      onMouseMove={resetHideControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline
        onClick={togglePlay}
      >
        {sources.map((source, index) => (
          <source key={index} src={source.src} type={source.type} />
        ))}
        {captions.map((caption, index) => (
          <track
            key={index}
            kind="captions"
            src={caption.src}
            srcLang={caption.srclang}
            label={caption.label}
            default={caption.default}
          />
        ))}
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">Failed to load video</p>
          <p className="text-sm text-neutral-400 mt-1">Please try again later</p>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {isPaused && !isLoading && !hasError && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center
            hover:bg-white/30 transition-colors">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      {/* Controls */}
      {controls && !hasError && (
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-4"
            >
              {/* Progress Bar */}
              <div className="mb-3">
                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  buffered={buffered}
                  onSeek={handleSeek}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center gap-2 text-white">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                {/* Skip Buttons */}
                <button
                  onClick={() => skip(-10)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Skip back 10s"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={() => skip(10)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Skip forward 10s"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Restart */}
                <button
                  onClick={restart}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Restart"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Volume */}
                <VolumeSlider
                  volume={volume}
                  muted={isMuted}
                  onVolumeChange={handleVolumeChange}
                  onMuteToggle={toggleMute}
                />

                {/* Time Display */}
                <div className="text-sm tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Right Side Controls */}
                {showCaptions && captions.length > 0 && (
                  <button
                    onClick={toggleCaptions}
                    className={cn(
                      'p-2 hover:bg-white/20 rounded-lg transition-colors',
                      captionsEnabled && 'bg-white/20'
                    )}
                    title="Captions"
                  >
                    <Subtitles className="w-5 h-5" />
                  </button>
                )}

                {showDownload && (
                  <button
                    onClick={onDownload}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}

                {showShare && (
                  <button
                    onClick={onShare}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                )}

                {(showPlaybackSpeed || showQuality) && (
                  <SettingsMenu
                    playbackSpeed={playbackSpeed}
                    onSpeedChange={handleSpeedChange}
                    showPlaybackSpeed={showPlaybackSpeed}
                    showQuality={showQuality}
                  />
                )}

                {showPiP && document.pictureInPictureEnabled && (
                  <button
                    onClick={togglePiP}
                    className={cn(
                      'p-2 hover:bg-white/20 rounded-lg transition-colors',
                      isPiP && 'bg-white/20'
                    )}
                    title="Picture in Picture"
                  >
                    <PictureInPicture2 className="w-5 h-5" />
                  </button>
                )}

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Title Overlay */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <h3 className="text-white font-medium truncate">{title}</h3>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Video Thumbnail Component
// ============================================================================

export interface VideoThumbnailProps {
  src: string;
  poster?: string;
  duration?: number;
  title?: string;
  onClick?: () => void;
  className?: string;
}

export function VideoThumbnail({
  src,
  poster,
  duration,
  title,
  onClick,
  className,
}: VideoThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative group aspect-video rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800',
        className
      )}
    >
      {poster ? (
        <img
          src={poster}
          alt={title || 'Video thumbnail'}
          className="w-full h-full object-cover"
        />
      ) : (
        <video
          src={src}
          className="w-full h-full object-cover"
          preload="metadata"
        />
      )}

      {/* Play Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30
        opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
          <Play className="w-6 h-6 text-neutral-900 ml-0.5" fill="currentColor" />
        </div>
      </div>

      {/* Duration Badge */}
      {duration !== undefined && (
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs rounded">
          {formatTime(duration)}
        </div>
      )}

      {/* Title */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-sm truncate">{title}</p>
        </div>
      )}
    </button>
  );
}

// ============================================================================
// Video Embed Component (for YouTube, Vimeo, etc.)
// ============================================================================

export interface VideoEmbedProps {
  url: string;
  title?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
  allowFullscreen?: boolean;
  className?: string;
}

export function VideoEmbed({
  url,
  title = 'Video',
  aspectRatio = '16:9',
  allowFullscreen = true,
  className,
}: VideoEmbedProps) {
  const getEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(url);

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '21:9': 'aspect-[21/9]',
  };

  if (!embedUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg',
          aspectRatioClasses[aspectRatio],
          className
        )}
      >
        <p className="text-neutral-500">Unsupported video URL</p>
      </div>
    );
  }

  return (
    <div className={cn(aspectRatioClasses[aspectRatio], 'rounded-lg overflow-hidden', className)}>
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={allowFullscreen}
      />
    </div>
  );
}

export default VideoPlayer;
