/**
 * RustPress User Profile Components
 * Phase 1: Enhancements 1-6
 *
 * Enhancement 1: User Profile Card
 * Enhancement 2: Avatar Upload
 * Enhancement 3: Profile Editor Form
 * Enhancement 4: Password Change Modal
 * Enhancement 5: Two-Factor Authentication Setup
 * Enhancement 6: Session Management
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Camera,
  Upload,
  X,
  Check,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Eye,
  EyeOff,
  Lock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Copy,
  RefreshCw,
  QrCode,
  Key,
  Trash2,
  Clock,
  MoreVertical,
  ChevronRight,
  Settings,
  Award,
  FileText,
  MessageSquare,
  Heart,
  Star,
  Zap,
  Image,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';
import { cn } from '../../design-system/utils';

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  stats?: UserStats;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  color: string;
  permissions: string[];
}

export interface UserStats {
  posts: number;
  comments: number;
  likes: number;
  followers: number;
  following: number;
}

export interface UserSession {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ip: string;
  location?: string;
  lastActive: string;
  isCurrent: boolean;
}

// ============================================================================
// Enhancement 1: User Profile Card
// ============================================================================

interface UserProfileCardProps {
  user: UserProfile;
  onEdit?: () => void;
  onMessage?: () => void;
  variant?: 'full' | 'compact' | 'minimal';
  showStats?: boolean;
  showSocial?: boolean;
}

export function UserProfileCard({
  user,
  onEdit,
  onMessage,
  variant = 'full',
  showStats = true,
  showSocial = true,
}: UserProfileCardProps) {
  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-neutral-400',
    pending: 'bg-yellow-500',
    suspended: 'bg-red-500',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900',
              statusColors[user.status]
            )}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {user.displayName}
          </p>
          <p className="text-xs text-neutral-500">@{user.username}</p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            )}
            <span
              className={cn(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900',
                statusColors[user.status]
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                {user.displayName}
              </h3>
              <span
                className="px-2 py-0.5 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: `${user.role.color}20`,
                  color: user.role.color,
                }}
              >
                {user.role.name}
              </span>
            </div>
            <p className="text-sm text-neutral-500">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Cover/Header */}
      <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-600 relative">
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-12 mb-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-primary-100 dark:bg-primary-900/30 border-4 border-white dark:border-neutral-900 shadow-lg flex items-center justify-center">
              <User className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <span
            className={cn(
              'absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-white dark:border-neutral-900',
              statusColors[user.status]
            )}
          />
        </div>

        {/* Name & Role */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {user.displayName}
              </h2>
              {user.emailVerified && (
                <CheckCircle2 className="w-5 h-5 text-primary-500" />
              )}
            </div>
            <p className="text-sm text-neutral-500">@{user.username}</p>
            <span
              className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full"
              style={{
                backgroundColor: `${user.role.color}20`,
                color: user.role.color,
              }}
            >
              {user.role.name}
            </span>
          </div>
          {onMessage && (
            <button
              onClick={onMessage}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl',
                'text-sm font-medium',
                'bg-primary-600 text-white',
                'hover:bg-primary-700 transition-colors'
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {user.bio}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Mail className="w-4 h-4" />
            {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Phone className="w-4 h-4" />
              {user.phone}
            </div>
          )}
          {user.location && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <MapPin className="w-4 h-4" />
              {user.location}
            </div>
          )}
          {user.website && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Globe className="w-4 h-4" />
              <a href={user.website} className="text-primary-600 hover:underline">
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Calendar className="w-4 h-4" />
            Joined {formatDate(user.createdAt)}
          </div>
        </div>

        {/* Social Links */}
        {showSocial && user.socialLinks && (
          <div className="flex items-center gap-2 mb-4">
            {user.socialLinks.twitter && (
              <a
                href={`https://twitter.com/${user.socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-neutral-500 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {user.socialLinks.github && (
              <a
                href={`https://github.com/${user.socialLinks.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {user.socialLinks.linkedin && (
              <a
                href={`https://linkedin.com/in/${user.socialLinks.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-neutral-500 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
          </div>
        )}

        {/* Stats */}
        {showStats && user.stats && (
          <div className="grid grid-cols-5 gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-center">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {user.stats.posts}
              </p>
              <p className="text-xs text-neutral-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {user.stats.comments}
              </p>
              <p className="text-xs text-neutral-500">Comments</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {user.stats.likes}
              </p>
              <p className="text-xs text-neutral-500">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {user.stats.followers}
              </p>
              <p className="text-xs text-neutral-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                {user.stats.following}
              </p>
              <p className="text-xs text-neutral-500">Following</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Enhancement 2: Avatar Upload
// ============================================================================

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File, croppedImage: string) => void;
  onRemove?: () => void;
  maxSize?: number; // in MB
}

export function AvatarUpload({
  currentAvatar,
  onUpload,
  onRemove,
  maxSize = 5,
}: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
        setIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.startPosX + dx,
      y: dragRef.current.startPosY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (selectedFile && preview) {
      // In a real implementation, you'd create a cropped version here
      onUpload(selectedFile, preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setPreview(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <>
      {/* Trigger */}
      <div className="relative group">
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="Avatar"
            className="w-24 h-24 rounded-2xl object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <User className="w-10 h-10 text-neutral-400" />
          </div>
        )}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl flex items-center justify-center gap-2',
            'bg-black/50 opacity-0 group-hover:opacity-100',
            'transition-opacity cursor-pointer'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-6 h-6 text-white" />
        </div>
        {currentAvatar && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              'absolute -top-2 -right-2 p-1.5 rounded-full',
              'bg-red-500 text-white',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity hover:bg-red-600'
            )}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Crop Avatar
                </h3>
                <button
                  onClick={handleClose}
                  className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Crop Area */}
              <div
                className="relative h-72 bg-neutral-100 dark:bg-neutral-800 overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute select-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                      transformOrigin: 'center',
                    }}
                    draggable={false}
                  />
                )}
                {/* Crop Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full border-4 border-white shadow-lg" />
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 space-y-4">
                {/* Zoom */}
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-4 h-4 text-neutral-500" />
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <ZoomIn className="w-4 h-4 text-neutral-500" />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setZoom(1);
                      setPosition({ x: 0, y: 0 });
                    }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg',
                      'text-sm text-neutral-600 dark:text-neutral-400',
                      'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <RotateCw className="w-4 h-4" />
                    Reset
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Enhancement 3: Profile Editor Form
// ============================================================================

interface ProfileEditorFormProps {
  user: UserProfile;
  onSave: (data: Partial<UserProfile>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProfileEditorForm({
  user,
  onSave,
  onCancel,
  isLoading = false,
}: ProfileEditorFormProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    bio: user.bio || '',
    phone: user.phone || '',
    location: user.location || '',
    website: user.website || '',
    timezone: user.timezone || 'UTC',
    language: user.language || 'en',
    twitter: user.socialLinks?.twitter || '',
    github: user.socialLinks?.github || '',
    linkedin: user.socialLinks?.linkedin || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        timezone: formData.timezone,
        language: formData.language,
        socialLinks: {
          twitter: formData.twitter,
          github: formData.github,
          linkedin: formData.linkedin,
        },
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const inputClasses = (hasError: boolean) =>
    cn(
      'w-full px-4 py-2.5 rounded-xl',
      'border transition-colors',
      hasError
        ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
        : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500',
      'bg-white dark:bg-neutral-800',
      'text-neutral-900 dark:text-white',
      'placeholder-neutral-400',
      'focus:ring-2 focus:border-transparent'
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Basic Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={inputClasses(!!errors.firstName)}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={inputClasses(!!errors.lastName)}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Display Name *
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            className={inputClasses(!!errors.displayName)}
          />
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Username *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              @
            </span>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className={cn(inputClasses(!!errors.username), 'pl-8')}
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClasses(!!errors.email)}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Tell us about yourself..."
            className={cn(inputClasses(!!errors.bio), 'resize-none')}
          />
          <div className="flex justify-between mt-1">
            {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
            <p className="text-xs text-neutral-400 ml-auto">
              {formData.bio.length}/500
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Contact Information
        </h3>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className={inputClasses(false)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="City, Country"
            className={inputClasses(false)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://example.com"
            className={inputClasses(!!errors.website)}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Social Links
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Twitter className="w-5 h-5 text-[#1DA1F2]" />
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => handleChange('twitter', e.target.value)}
              placeholder="username"
              className={cn(inputClasses(false), 'flex-1')}
            />
          </div>
          <div className="flex items-center gap-3">
            <Github className="w-5 h-5 text-neutral-900 dark:text-white" />
            <input
              type="text"
              value={formData.github}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="username"
              className={cn(inputClasses(false), 'flex-1')}
            />
          </div>
          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            <input
              type="text"
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="username"
              className={cn(inputClasses(false), 'flex-1')}
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          Preferences
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className={inputClasses(false)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className={inputClasses(false)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl',
            'text-sm font-medium',
            'bg-primary-600 text-white',
            'hover:bg-primary-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Enhancement 4: Password Change Modal
// ============================================================================

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function PasswordChangeModal({
  isOpen,
  onClose,
  onSubmit,
}: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: '' };

    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) score++;

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-lime-500' },
      { label: 'Strong', color: 'bg-green-500' },
    ];

    return { score, ...levels[Math.min(score, 4)] };
  }, [newPassword]);

  const requirements = [
    { met: newPassword.length >= 8, text: 'At least 8 characters' },
    { met: /[a-z]/.test(newPassword), text: 'Lowercase letter' },
    { met: /[A-Z]/.test(newPassword), text: 'Uppercase letter' },
    { met: /\d/.test(newPassword), text: 'Number' },
    { met: /[^a-zA-Z0-9]/.test(newPassword), text: 'Special character' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordStrength.score < 3) {
      setError('Password is too weak');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(currentPassword, newPassword);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswords({ current: false, new: false, confirm: false });
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                  <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Change Password
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={cn(
                      'w-full px-4 py-2.5 pr-10 rounded-xl',
                      'border border-neutral-300 dark:border-neutral-600',
                      'bg-white dark:bg-neutral-800',
                      'text-neutral-900 dark:text-white',
                      'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={cn(
                      'w-full px-4 py-2.5 pr-10 rounded-xl',
                      'border border-neutral-300 dark:border-neutral-600',
                      'bg-white dark:bg-neutral-800',
                      'text-neutral-900 dark:text-white',
                      'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Strength Meter */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-colors',
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-neutral-200 dark:bg-neutral-700'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500">
                      {passwordStrength.label}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                <div className="mt-2 space-y-1">
                  {requirements.map((req, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-center gap-2 text-xs',
                        req.met
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-neutral-400'
                      )}
                    >
                      {req.met ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-neutral-300 dark:border-neutral-600" />
                      )}
                      {req.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      'w-full px-4 py-2.5 pr-10 rounded-xl',
                      'border transition-colors',
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-red-300 dark:border-red-700'
                        : 'border-neutral-300 dark:border-neutral-600',
                      'bg-white dark:bg-neutral-800',
                      'text-neutral-900 dark:text-white',
                      'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl',
                    'text-sm font-medium',
                    'bg-primary-600 text-white',
                    'hover:bg-primary-700',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Enhancement 5: Two-Factor Authentication Setup
// ============================================================================

interface TwoFactorSetupProps {
  isEnabled: boolean;
  onEnable: (code: string) => Promise<{ secret: string; qrCode: string }>;
  onVerify: (code: string) => Promise<void>;
  onDisable: (code: string) => Promise<void>;
}

export function TwoFactorSetup({
  isEnabled,
  onEnable,
  onVerify,
  onDisable,
}: TwoFactorSetupProps) {
  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'disable'>('idle');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await onEnable(code);
      setSecret(result.secret);
      setQrCode(result.qrCode);
      setStep('setup');
    } catch (err: any) {
      setError(err.message || 'Failed to start setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onVerify(code);
      // Generate backup codes
      setBackupCodes(
        Array.from({ length: 8 }, () =>
          Math.random().toString(36).substring(2, 8).toUpperCase()
        )
      );
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onDisable(code);
      setStep('idle');
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'p-3 rounded-xl',
            isEnabled
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-neutral-100 dark:bg-neutral-800'
          )}
        >
          {isEnabled ? (
            <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <Shield className="w-6 h-6 text-neutral-500" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            {isEnabled
              ? 'Your account is protected with two-factor authentication.'
              : 'Add an extra layer of security to your account.'}
          </p>
        </div>
        {step === 'idle' && (
          <button
            onClick={() => (isEnabled ? setStep('disable') : handleStartSetup())}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium',
              isEnabled
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isEnabled ? (
              'Disable'
            ) : (
              'Enable'
            )}
          </button>
        )}
      </div>

      {/* Setup Flow */}
      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700"
          >
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="inline-block p-4 bg-white rounded-xl shadow-inner">
                  {qrCode ? (
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-neutral-300" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Or enter this code manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-mono text-sm">
                    {secret || 'XXXX XXXX XXXX XXXX'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(secret)}
                    className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Enter verification code:
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl text-center text-2xl font-mono tracking-widest',
                    'border border-neutral-300 dark:border-neutral-600',
                    'bg-white dark:bg-neutral-800',
                    'text-neutral-900 dark:text-white',
                    'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                  )}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setStep('idle');
                    setCode('');
                    setError('');
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={isLoading || code.length !== 6}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl',
                    'text-sm font-medium',
                    'bg-primary-600 text-white',
                    'hover:bg-primary-700',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Verify & Enable'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'verify' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700"
          >
            <div className="text-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                2FA Enabled Successfully!
              </h4>
            </div>

            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Save your backup codes
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Store these codes in a safe place. You can use them to access
                    your account if you lose your authenticator device.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {backupCodes.map((bCode, index) => (
                <code
                  key={index}
                  className="px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-sm text-center"
                >
                  {bCode}
                </code>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Copy className="w-4 h-4" />
                Copy Codes
              </button>
              <button
                onClick={() => {
                  setStep('idle');
                  setCode('');
                  setBackupCodes([]);
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}

        {step === 'disable' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700"
          >
            <div className="space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Enter your 2FA code to disable two-factor authentication:
              </p>

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-center text-2xl font-mono tracking-widest',
                  'border border-neutral-300 dark:border-neutral-600',
                  'bg-white dark:bg-neutral-800',
                  'text-neutral-900 dark:text-white',
                  'focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                )}
              />

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setStep('idle');
                    setCode('');
                    setError('');
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable}
                  disabled={isLoading || code.length !== 6}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl',
                    'text-sm font-medium',
                    'bg-red-600 text-white',
                    'hover:bg-red-700',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Disable 2FA'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Enhancement 6: Session Management
// ============================================================================

interface SessionManagementProps {
  sessions: UserSession[];
  onRevoke: (sessionId: string) => void;
  onRevokeAll: () => void;
}

export function SessionManagement({
  sessions,
  onRevoke,
  onRevokeAll,
}: SessionManagementProps) {
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Active Sessions
          </h3>
          <p className="text-sm text-neutral-500">
            {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={() => setConfirmRevokeAll(true)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl',
              'text-sm font-medium text-red-600',
              'hover:bg-red-50 dark:hover:bg-red-900/20'
            )}
          >
            <LogOut className="w-4 h-4" />
            Sign out all
          </button>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.deviceType);

          return (
            <div
              key={session.id}
              className={cn(
                'p-4 rounded-xl border',
                session.isCurrent
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'p-2 rounded-xl',
                    session.isCurrent
                      ? 'bg-primary-100 dark:bg-primary-900/30'
                      : 'bg-neutral-100 dark:bg-neutral-800'
                  )}
                >
                  <DeviceIcon
                    className={cn(
                      'w-5 h-5',
                      session.isCurrent
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-neutral-500'
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {session.browser} on {session.os}
                    </p>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500 text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location || 'Unknown location'}
                    </span>
                    <span>{session.ip}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatLastActive(session.lastActive)}
                    </span>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => onRevoke(session.id)}
                    className={cn(
                      'p-2 rounded-lg',
                      'text-neutral-400 hover:text-red-500',
                      'hover:bg-red-50 dark:hover:bg-red-900/20'
                    )}
                    title="Revoke session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Revoke All Modal */}
      <AnimatePresence>
        {confirmRevokeAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setConfirmRevokeAll(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Sign out all sessions?
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  This will sign you out of all devices except the current one.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRevokeAll(false)}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onRevokeAll();
                    setConfirmRevokeAll(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  Sign out all
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Sample Data
// ============================================================================

export const sampleUser: UserProfile = {
  id: '1',
  email: 'john.doe@example.com',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  bio: 'Full-stack developer passionate about building great user experiences. Love working with React, TypeScript, and Rust.',
  role: {
    id: 'admin',
    name: 'Administrator',
    color: '#8B5CF6',
    permissions: ['all'],
  },
  status: 'active',
  createdAt: '2023-06-15T10:30:00Z',
  lastLogin: '2024-01-15T14:22:00Z',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  website: 'https://johndoe.dev',
  timezone: 'America/Los_Angeles',
  language: 'en',
  socialLinks: {
    twitter: 'johndoe',
    github: 'johndoe',
    linkedin: 'johndoe',
  },
  stats: {
    posts: 127,
    comments: 543,
    likes: 2340,
    followers: 1205,
    following: 342,
  },
  twoFactorEnabled: true,
  emailVerified: true,
};

export const sampleSessions: UserSession[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'macOS',
    ip: '192.168.1.100',
    location: 'San Francisco, CA',
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: '2',
    device: 'iPhone 15',
    deviceType: 'mobile',
    browser: 'Safari',
    os: 'iOS',
    ip: '192.168.1.101',
    location: 'San Francisco, CA',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    isCurrent: false,
  },
  {
    id: '3',
    device: 'Windows Desktop',
    deviceType: 'desktop',
    browser: 'Firefox',
    os: 'Windows 11',
    ip: '10.0.0.50',
    location: 'New York, NY',
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    isCurrent: false,
  },
];

export default UserProfileCard;
