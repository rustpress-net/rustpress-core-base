/**
 * RustPress Audio Player Component
 * Custom audio player with waveform visualization and playlist support
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  List,
  Download,
  Share2,
  Heart,
  MoreHorizontal,
  Music,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface AudioTrack {
  id: string;
  src: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  cover?: string;
  favorite?: boolean;
}

export interface AudioPlayerProps {
  src?: string;
  track?: AudioTrack;
  autoPlay?: boolean;
  showWaveform?: boolean;
  showCover?: boolean;
  showDownload?: boolean;
  showShare?: boolean;
  showFavorite?: boolean;
  variant?: 'default' | 'compact' | 'minimal' | 'card';
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onDownload?: (track?: AudioTrack) => void;
  onShare?: (track?: AudioTrack) => void;
  onFavorite?: (track?: AudioTrack) => void;
  className?: string;
}

export interface PlaylistPlayerProps {
  tracks: AudioTrack[];
  initialTrackIndex?: number;
  autoPlay?: boolean;
  showPlaylist?: boolean;
  showShuffle?: boolean;
  showRepeat?: boolean;
  onTrackChange?: (track: AudioTrack, index: number) => void;
  onPlay?: (track: AudioTrack) => void;
  onPause?: (track: AudioTrack) => void;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Waveform Component
// ============================================================================

interface WaveformProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

function Waveform({ currentTime, duration, onSeek, className }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bars] = useState(() =>
    Array.from({ length: 50 }, () => Math.random() * 0.7 + 0.3)
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const barWidth = rect.width / bars.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    ctx.clearRect(0, 0, rect.width, rect.height);

    bars.forEach((height, i) => {
      const x = i * barWidth;
      const barHeight = height * rect.height * 0.8;
      const y = (rect.height - barHeight) / 2;
      const isPlayed = i / bars.length < progress;

      ctx.fillStyle = isPlayed
        ? 'rgb(59, 130, 246)' // primary-500
        : 'rgb(156, 163, 175)'; // neutral-400
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
    });
  }, [bars, currentTime, duration]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || duration <= 0) return;

    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative h-12 cursor-pointer', className)}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

// ============================================================================
// Progress Bar Component
// ============================================================================

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  size?: 'sm' | 'md';
}

function ProgressBar({ currentTime, duration, onSeek, size = 'md' }: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleClick = (e: React.MouseEvent) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div
      ref={progressRef}
      className={cn(
        'relative bg-neutral-200 dark:bg-neutral-700 rounded-full cursor-pointer group',
        size === 'sm' ? 'h-1' : 'h-2'
      )}
      onClick={handleClick}
    >
      <div
        className="absolute h-full bg-primary-500 rounded-full"
        style={{ width: `${progress}%` }}
      />
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 bg-primary-500 rounded-full shadow',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'
        )}
        style={{ left: `calc(${progress}% - ${size === 'sm' ? 5 : 6}px)` }}
      />
    </div>
  );
}

// ============================================================================
// Volume Control Component
// ============================================================================

interface VolumeControlProps {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  size?: 'sm' | 'md';
}

function VolumeControl({ volume, muted, onVolumeChange, onMuteToggle, size = 'md' }: VolumeControlProps) {
  const [showSlider, setShowSlider] = useState(false);

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        onClick={onMuteToggle}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'text-neutral-600 dark:text-neutral-400'
        )}
      >
        <VolumeIcon className={iconSize} />
      </button>

      <AnimatePresence>
        {showSlider && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 80 }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden ml-1"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={muted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 appearance-none bg-neutral-200 dark:bg-neutral-700 rounded-full cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Main Audio Player Component
// ============================================================================

export function AudioPlayer({
  src,
  track,
  autoPlay = false,
  showWaveform = false,
  showCover = true,
  showDownload = false,
  showShare = false,
  showFavorite = false,
  variant = 'default',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onDownload,
  onShare,
  onFavorite,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioSrc = track?.src || src;
  const title = track?.title || 'Unknown Track';
  const artist = track?.artist;
  const cover = track?.cover;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime, audio.duration);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onPlay, onPause, onEnded, onTimeUpdate]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
  };

  const handleVolumeChange = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <audio ref={audioRef} src={audioSrc} autoPlay={autoPlay} />

        <button
          onClick={togglePlay}
          className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex-1">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            size="sm"
          />
        </div>

        <span className="text-xs text-neutral-500 tabular-nums w-10">
          {formatTime(currentTime)}
        </span>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 bg-white dark:bg-neutral-900',
          'border border-neutral-200 dark:border-neutral-700 rounded-lg',
          className
        )}
      >
        <audio ref={audioRef} src={audioSrc} autoPlay={autoPlay} />

        {showCover && cover && (
          <img src={cover} alt={title} className="w-10 h-10 rounded object-cover" />
        )}

        {showCover && !cover && (
          <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
            <Music className="w-5 h-5 text-neutral-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
            {title}
          </p>
          {artist && (
            <p className="text-xs text-neutral-500 truncate">{artist}</p>
          )}
        </div>

        <button
          onClick={togglePlay}
          className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden',
          'border border-neutral-200 dark:border-neutral-700',
          className
        )}
      >
        <audio ref={audioRef} src={audioSrc} autoPlay={autoPlay} />

        {/* Cover Image */}
        <div className="aspect-square relative">
          {cover ? (
            <img src={cover} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Music className="w-20 h-20 text-white/50" />
            </div>
          )}

          {/* Overlay Play Button */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              {isPlaying ? (
                <Pause className="w-8 h-8 text-neutral-900" />
              ) : (
                <Play className="w-8 h-8 text-neutral-900 ml-1" />
              )}
            </div>
          </button>
        </div>

        {/* Info & Controls */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
              {title}
            </h3>
            {artist && (
              <p className="text-sm text-neutral-500 truncate">{artist}</p>
            )}
          </div>

          {/* Progress */}
          <div className="mb-3">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />
            <div className="flex justify-between mt-1 text-xs text-neutral-500 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => skip(-10)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={() => skip(10)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl p-4',
        'border border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      <audio ref={audioRef} src={audioSrc} autoPlay={autoPlay} />

      <div className="flex items-start gap-4">
        {/* Cover */}
        {showCover && (
          <div className="flex-shrink-0">
            {cover ? (
              <img src={cover} alt={title} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                <Music className="w-8 h-8 text-neutral-400" />
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title & Artist */}
          <div className="mb-3">
            <h3 className="font-medium text-neutral-900 dark:text-white truncate">
              {title}
            </h3>
            {artist && (
              <p className="text-sm text-neutral-500 truncate">{artist}</p>
            )}
          </div>

          {/* Waveform or Progress */}
          {showWaveform ? (
            <Waveform
              audioRef={audioRef}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              className="mb-2"
            />
          ) : (
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />
          )}

          {/* Time Display */}
          <div className="flex justify-between mt-1 text-xs text-neutral-500 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-1">
          <button
            onClick={() => skip(-10)}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors mx-2"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={() => skip(10)}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <VolumeControl
            volume={volume}
            muted={isMuted}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={toggleMute}
          />

          {showFavorite && (
            <button
              onClick={() => onFavorite?.(track)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                track?.favorite
                  ? 'text-red-500'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-red-500'
              )}
            >
              <Heart className={cn('w-5 h-5', track?.favorite && 'fill-current')} />
            </button>
          )}

          {showDownload && (
            <button
              onClick={() => onDownload?.(track)}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          {showShare && (
            <button
              onClick={() => onShare?.(track)}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Playlist Player Component
// ============================================================================

export function PlaylistPlayer({
  tracks,
  initialTrackIndex = 0,
  autoPlay = false,
  showPlaylist = true,
  showShuffle = true,
  showRepeat = true,
  onTrackChange,
  onPlay,
  onPause,
  className,
}: PlaylistPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.(currentTrack);
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.(currentTrack);
    };
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (currentTrackIndex < tracks.length - 1 || repeatMode === 'all') {
        playNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, repeatMode, tracks.length, currentTrack, onPlay, onPause]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    onTrackChange?.(tracks[index], index);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const playNext = () => {
    let nextIndex: number;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = currentTrackIndex < tracks.length - 1 ? currentTrackIndex + 1 : 0;
    }
    playTrack(nextIndex);
  };

  const playPrevious = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      const prevIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
      playTrack(prevIndex);
    }
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
  };

  const handleVolumeChange = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  return (
    <div className={cn('bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden', className)}>
      <audio ref={audioRef} src={currentTrack?.src} autoPlay={autoPlay} />

      {/* Now Playing */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Cover */}
          {currentTrack?.cover ? (
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
              <Music className="w-8 h-8 text-neutral-400" />
            </div>
          )}

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-neutral-900 dark:text-white truncate">
              {currentTrack?.title || 'No track selected'}
            </h3>
            {currentTrack?.artist && (
              <p className="text-sm text-neutral-500 truncate">{currentTrack.artist}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />
          <div className="flex justify-between mt-1 text-xs text-neutral-500 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {showShuffle && (
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isShuffled
                  ? 'text-primary-500'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <Shuffle className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={playPrevious}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={playNext}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          {showRepeat && (
            <button
              onClick={cycleRepeatMode}
              className={cn(
                'p-2 rounded-lg transition-colors',
                repeatMode !== 'none'
                  ? 'text-primary-500'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-5 h-5" />
              ) : (
                <Repeat className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <VolumeControl
            volume={volume}
            muted={isMuted}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={toggleMute}
          />

          {showPlaylist && (
            <button
              onClick={() => setPlaylistOpen(!playlistOpen)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                playlistOpen
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <List className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Playlist */}
      <AnimatePresence>
        {showPlaylist && playlistOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => playTrack(index)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    index === currentTrackIndex
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  )}
                >
                  <div className="w-8 h-8 flex-shrink-0">
                    {track.cover ? (
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-full h-full rounded object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center">
                        <Music className="w-4 h-4 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm truncate',
                        index === currentTrackIndex
                          ? 'font-medium text-primary-600 dark:text-primary-400'
                          : 'text-neutral-900 dark:text-white'
                      )}
                    >
                      {track.title}
                    </p>
                    {track.artist && (
                      <p className="text-xs text-neutral-500 truncate">{track.artist}</p>
                    )}
                  </div>

                  {track.duration && (
                    <span className="text-xs text-neutral-500 tabular-nums">
                      {formatTime(track.duration)}
                    </span>
                  )}

                  {index === currentTrackIndex && isPlaying && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 bg-primary-500 rounded-full"
                          animate={{
                            height: [4, 12, 4],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Mini Player Component (for persistent bottom bar)
// ============================================================================

export interface MiniPlayerProps {
  track: AudioTrack;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onClose?: () => void;
  onExpand?: () => void;
  className?: string;
}

export function MiniPlayer({
  track,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onClose,
  onExpand,
  className,
}: MiniPlayerProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900',
        'border-t border-neutral-200 dark:border-neutral-700',
        'shadow-lg z-50',
        className
      )}
    >
      {/* Progress Bar */}
      <div className="h-1 bg-neutral-200 dark:bg-neutral-700">
        <div
          className="h-full bg-primary-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-2">
        {/* Cover */}
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title}
            className="w-12 h-12 rounded object-cover cursor-pointer"
            onClick={onExpand}
          />
        ) : (
          <div
            className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center cursor-pointer"
            onClick={onExpand}
          >
            <Music className="w-6 h-6 text-neutral-400" />
          </div>
        )}

        {/* Track Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
            {track.title}
          </p>
          {track.artist && (
            <p className="text-xs text-neutral-500 truncate">{track.artist}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
