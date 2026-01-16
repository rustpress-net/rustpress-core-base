import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Eye,
  Settings,
  Save,
  Send,
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelRightClose,
  Undo,
  Redo,
  Copy,
  FileText,
  Sparkles,
  Palette,
  Image,
  Link,
  Table,
  Video,
  Music,
  Quote,
  List,
  Heading,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';

// Import all enhancement components
import EditorBlockToolbar from './toolbars/EditorBlockToolbar';
import FloatingFormatToolbar from './toolbars/FloatingFormatToolbar';
import QuickInsertToolbar from './toolbars/QuickInsertToolbar';
import WordCountTracker from './toolbars/WordCountTracker';
import ContentOutline from './toolbars/ContentOutline';
import LivePreview from './preview/LivePreview';
import DevicePreview from './preview/DevicePreview';
import SocialPreview from './preview/SocialPreview';
import SEOAnalyzer from './seo/SEOAnalyzer';
import ReadabilityScore from './seo/ReadabilityScore';
import SchemaMarkup from './seo/SchemaMarkup';
import HeadingStructure from './seo/HeadingStructure';
import KeywordDensity from './seo/KeywordDensity';
import InternalLinking from './seo/InternalLinking';
import VersionTimeline from './versioning/VersionTimeline';
import VersionCompare from './versioning/VersionCompare';
import AutosaveIndicator from './versioning/AutosaveIndicator';
import AnimationsLibrary from './blocks/AnimationsLibrary';
import ContentCarousel from './blocks/ContentCarousel';
import BeforeAfterSlider from './blocks/BeforeAfterSlider';
import GalleryGrid from './blocks/GalleryGrid';
import TableEditor from './blocks/TableEditor';
import ImageOptimizer from './blocks/ImageOptimizer';
import EmbedPreview from './blocks/EmbedPreview';
import MediaLibraryPanel from './blocks/MediaLibraryPanel';
import CollaborativeEditing from './advanced/CollaborativeEditing';
import ContentTemplates from './advanced/ContentTemplates';
import PluginIntegration from './integrations/PluginIntegration';
import ContentAnalytics from './analytics/ContentAnalytics';
import LinkChecker from './tools/LinkChecker';

type EditorTab = 'html' | 'preview';
type SidebarPanel =
  | 'blocks'
  | 'animations'
  | 'media'
  | 'templates'
  | 'carousel'
  | 'gallery'
  | 'table'
  | 'embed'
  | 'slider'
  | 'seo'
  | 'readability'
  | 'schema'
  | 'headings'
  | 'keywords'
  | 'links'
  | 'linkchecker'
  | 'versions'
  | 'compare'
  | 'analytics'
  | 'collaboration'
  | 'plugins'
  | 'images'
  | 'devices'
  | 'social'
  | 'outline'
  | null;

interface PostEditorProps {
  initialContent?: string;
  postId?: string;
  onSave?: (content: string) => void;
  onPublish?: (content: string) => void;
}

const toolbarGroups = [
  {
    id: 'content',
    label: 'Content Blocks',
    tools: [
      { id: 'blocks', icon: Sparkles, label: 'Block Library', color: 'blue' },
      { id: 'animations', icon: Palette, label: 'Animations (55+)', color: 'purple' },
      { id: 'templates', icon: FileText, label: 'Templates', color: 'green' },
      { id: 'media', icon: Image, label: 'Media Library', color: 'pink' },
    ]
  },
  {
    id: 'visual',
    label: 'Visual Elements',
    tools: [
      { id: 'carousel', icon: Image, label: 'Carousel', color: 'indigo' },
      { id: 'gallery', icon: Image, label: 'Gallery Grid', color: 'cyan' },
      { id: 'slider', icon: Image, label: 'Before/After', color: 'teal' },
      { id: 'table', icon: Table, label: 'Table Editor', color: 'emerald' },
      { id: 'embed', icon: Video, label: 'Embeds', color: 'violet' },
    ]
  },
  {
    id: 'seo',
    label: 'SEO & Analysis',
    tools: [
      { id: 'seo', icon: FileText, label: 'SEO Analyzer', color: 'orange' },
      { id: 'readability', icon: FileText, label: 'Readability', color: 'amber' },
      { id: 'keywords', icon: FileText, label: 'Keywords', color: 'lime' },
      { id: 'headings', icon: Heading, label: 'Headings', color: 'sky' },
      { id: 'schema', icon: Code, label: 'Schema Markup', color: 'rose' },
      { id: 'links', icon: Link, label: 'Internal Links', color: 'fuchsia' },
      { id: 'linkchecker', icon: Link, label: 'Link Checker', color: 'red' },
    ]
  },
  {
    id: 'preview',
    label: 'Preview Options',
    tools: [
      { id: 'devices', icon: Eye, label: 'Device Preview', color: 'blue' },
      { id: 'social', icon: Eye, label: 'Social Preview', color: 'sky' },
      { id: 'outline', icon: List, label: 'Content Outline', color: 'slate' },
    ]
  },
  {
    id: 'advanced',
    label: 'Advanced',
    tools: [
      { id: 'versions', icon: Clock, label: 'Version History', color: 'gray' },
      { id: 'compare', icon: FileText, label: 'Compare Versions', color: 'zinc' },
      { id: 'analytics', icon: FileText, label: 'Analytics', color: 'blue' },
      { id: 'collaboration', icon: FileText, label: 'Collaboration', color: 'green' },
      { id: 'images', icon: Image, label: 'Image Optimizer', color: 'amber' },
      { id: 'plugins', icon: Sparkles, label: 'Plugins', color: 'purple' },
    ]
  }
];

export const PostEditor: React.FC<PostEditorProps> = ({
  initialContent = '',
  postId,
  onSave,
  onPublish
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [activePanel, setActivePanel] = useState<SidebarPanel>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
  }, []);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = htmlContent.slice(0, start) + text + htmlContent.slice(end);
      setHtmlContent(newContent);
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  }, [htmlContent]);

  const handleToolClick = (toolId: SidebarPanel) => {
    if (activePanel === toolId) {
      setActivePanel(null);
      setRightSidebarOpen(false);
    } else {
      setActivePanel(toolId);
      setRightSidebarOpen(true);
    }
  };

  const renderPanel = () => {
    const panelProps = {
      className: 'h-full',
      content: htmlContent
    };

    switch (activePanel) {
      case 'blocks':
        return <EditorBlockToolbar onInsertBlock={(block: string) => insertAtCursor(block)} {...panelProps} />;
      case 'animations':
        return <AnimationsLibrary {...panelProps} />;
      case 'media':
        return <MediaLibraryPanel onInsert={(item: { url: string; alt?: string }) => insertAtCursor(`<img src="${item.url}" alt="${item.alt || ''}" />`)} {...panelProps} />;
      case 'templates':
        return <ContentTemplates {...panelProps} />;
      case 'carousel':
        return <ContentCarousel {...panelProps} />;
      case 'gallery':
        return <GalleryGrid {...panelProps} />;
      case 'slider':
        return <BeforeAfterSlider {...panelProps} />;
      case 'table':
        return <TableEditor onChange={(data: unknown) => console.log('Table updated:', data)} {...panelProps} />;
      case 'embed':
        return <EmbedPreview {...panelProps} />;
      case 'seo':
        return <SEOAnalyzer title="Post Title" {...panelProps} />;
      case 'readability':
        return <ReadabilityScore {...panelProps} />;
      case 'keywords':
        return <KeywordDensity {...panelProps} />;
      case 'headings':
        return <HeadingStructure {...panelProps} />;
      case 'schema':
        return <SchemaMarkup postTitle="Post Title" postContent={htmlContent} {...panelProps} />;
      case 'links':
        return <InternalLinking {...panelProps} />;
      case 'linkchecker':
        return <LinkChecker {...panelProps} />;
      case 'devices':
        return <DevicePreview title="Post Title" {...panelProps} />;
      case 'social':
        return <SocialPreview title="Post Title" description="Post description" {...panelProps} />;
      case 'outline':
        return <ContentOutline {...panelProps} />;
      case 'versions':
        return <VersionTimeline {...panelProps} />;
      case 'compare':
        return <VersionCompare {...panelProps} />;
      case 'analytics':
        return <ContentAnalytics {...panelProps} />;
      case 'collaboration':
        return <CollaborativeEditing {...panelProps} />;
      case 'images':
        return <ImageOptimizer {...panelProps} />;
      case 'plugins':
        return <PluginIntegration {...panelProps} />;
      default:
        return null;
    }
  };

  return (
    <div className={clsx(
      'flex flex-col bg-gray-100 dark:bg-gray-950',
      isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'
    )}>
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <div>
            <input
              type="text"
              placeholder="Post Title..."
              className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-96"
              defaultValue="Untitled Post"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Autosave Indicator */}
          <AutosaveIndicator isDirty={false} isSaving={false} isOnline={true} />

          {/* Word Count */}
          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
            {htmlContent.split(/\s+/).filter(Boolean).length} words
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={() => onSave?.(htmlContent)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <Save size={16} />
            Save Draft
          </button>

          <button
            onClick={() => onPublish?.(htmlContent)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send size={16} />
            Publish
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <AnimatePresence>
          {leftSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border-r overflow-y-auto flex-shrink-0"
            >
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Enhancement Tools
                </h3>

                {toolbarGroups.map((group) => (
                  <div key={group.id} className="mb-4">
                    <h4 className="text-xs font-medium text-gray-400 mb-2 px-2">
                      {group.label}
                    </h4>
                    <div className="space-y-1">
                      {group.tools.map((tool) => {
                        const Icon = tool.icon;
                        const isActive = activePanel === tool.id;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => handleToolClick(tool.id as SidebarPanel)}
                            className={clsx(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                              isActive
                                ? `bg-${tool.color}-100 text-${tool.color}-700 dark:bg-${tool.color}-900/30 dark:text-${tool.color}-400`
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                            )}
                          >
                            <Icon size={18} className={isActive ? `text-${tool.color}-600` : ''} />
                            <span className="flex-1 text-left">{tool.label}</span>
                            {isActive && (
                              <div className={`w-2 h-2 rounded-full bg-${tool.color}-500`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Toggle Left Sidebar Button */}
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white dark:bg-gray-800 border rounded-r-lg shadow-md"
          style={{ left: leftSidebarOpen ? 280 : 0 }}
        >
          {leftSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Center - Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Tabs */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 border-b px-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab('html')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'html'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                <Code size={16} />
                HTML Editor
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'preview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                <Eye size={16} />
                Preview
              </button>
            </div>

            {/* Quick Format Toolbar */}
            {activeTab === 'html' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => insertAtCursor('<strong></strong>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<em></em>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<u></u>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Underline"
                >
                  <Underline size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
                <button
                  onClick={() => insertAtCursor('<h2></h2>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Heading"
                >
                  <Heading size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<a href=""></a>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Link"
                >
                  <Link size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<img src="" alt="" />')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Image"
                >
                  <Image size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<blockquote></blockquote>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Quote"
                >
                  <Quote size={16} />
                </button>
                <button
                  onClick={() => insertAtCursor('<ul>\n  <li></li>\n</ul>')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="List"
                >
                  <List size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'html' ? (
              <div className="h-full p-4">
                <textarea
                  id="html-editor"
                  value={htmlContent}
                  onChange={handleContentChange}
                  placeholder="Start writing your HTML content here...

Example:
<article>
  <h1>Your Title</h1>
  <p>Your content goes here...</p>
</article>"
                  className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="h-full p-4 overflow-auto bg-white dark:bg-gray-800">
                <div className="max-w-4xl mx-auto">
                  <div className="prose dark:prose-invert max-w-none">
                    {htmlContent ? (
                      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    ) : (
                      <div className="text-center text-gray-400 py-20">
                        <Eye size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No content to preview yet.</p>
                        <p className="text-sm">Switch to HTML Editor tab to add content.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-t text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>Line 1, Column 1</span>
              <span>|</span>
              <span>{htmlContent.length} characters</span>
              <span>|</span>
              <span>{htmlContent.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>|</span>
              <span>HTML</span>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Panel Content */}
        <AnimatePresence>
          {rightSidebarOpen && activePanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 480, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border-l overflow-hidden flex-shrink-0 flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-semibold capitalize">
                  {activePanel?.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <button
                  onClick={() => {
                    setActivePanel(null);
                    setRightSidebarOpen(false);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <PanelRightClose size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {renderPanel()}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Word Count Tracker (floating) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <WordCountTracker content={htmlContent} />
      </div>
    </div>
  );
};

export default PostEditor;
