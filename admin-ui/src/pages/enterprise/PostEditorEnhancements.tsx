import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Post Editor Enhancement Components (1-10)
import {
  // 1. AutoSave Editor
  AutoSaveProvider,
  AutoSaveEditor,
  VersionHistory,
  // 2. Distraction Free Mode
  DistractionFreeProvider,
  DistractionFreeMode,
  DistractionFreeToggle,
  // 3. Content Stats
  ContentStatsDisplay,
  ReadingTime,
  WritingGoal,
  calculateStats,
  // 4. AI Writing Assistant
  AIWritingProvider,
  WritingAssistantPanel,
  AIActionsToolbar,
  WritingScore,
  // 5. Markdown Shortcuts
  MarkdownShortcutsProvider,
  FormattingToolbar,
  ShortcutHintsPanel,
  MarkdownCheatSheet,
  // 6. Slash Commands
  SlashCommandsProvider,
  CommandBrowser,
  SlashCommandInput,
  AddBlockButton,
  // 7. Block Editor
  BlockEditorProvider,
  BlockEditor,
  BlockCount,
  // 8. Split Screen Preview
  SplitScreenProvider,
  SplitScreenLayout,
  PreviewToolbar,
  LivePreview,
  // 9. Content Templates
  ContentTemplatesProvider,
  TemplatePicker,
  StartFromTemplateButton,
  // 10. Inline Commenting
  InlineCommentingProvider,
  CommentableText,
  CommentsSidebar,
  CommentIndicator,
} from '../../design-system/components';

// Demo page for Post Editor Enhancements
const PostEditorEnhancements: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [editorContent, setEditorContent] = useState('# Welcome to RustPress\n\nStart writing your amazing content here. This editor supports **bold**, *italic*, and `code` formatting.\n\n## Features\n\n- Auto-save with version history\n- Distraction-free writing mode\n- AI-powered writing assistance\n- Markdown shortcuts\n- And much more!');
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);

  const demos = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'autosave', name: '1. Auto-Save', icon: '💾' },
    { id: 'distraction-free', name: '2. Distraction-Free', icon: '🧘' },
    { id: 'content-stats', name: '3. Content Stats', icon: '📊' },
    { id: 'ai-assistant', name: '4. AI Assistant', icon: '🤖' },
    { id: 'markdown', name: '5. Markdown', icon: '📝' },
    { id: 'slash-commands', name: '6. Slash Commands', icon: '/' },
    { id: 'block-editor', name: '7. Block Editor', icon: '🧱' },
    { id: 'split-preview', name: '8. Split Preview', icon: '◧' },
    { id: 'templates', name: '9. Templates', icon: '📑' },
    { id: 'commenting', name: '10. Commenting', icon: '💬' },
  ];

  const stats = calculateStats(editorContent);

  const renderDemo = () => {
    switch (activeDemo) {
      case 'overview':
        return (
          <div style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
              Post Editor Enhancements
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '32px', maxWidth: '700px', lineHeight: 1.6 }}>
              A comprehensive suite of 10 editor enhancements designed to make content creation
              more efficient, enjoyable, and powerful. Each component integrates seamlessly
              with the RustPress design system.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {[
                { num: 1, name: 'Auto-Save Editor', desc: 'Never lose work with automatic saving and version history', icon: '💾' },
                { num: 2, name: 'Distraction-Free Mode', desc: 'Focus on writing with a minimal, full-screen interface', icon: '🧘' },
                { num: 3, name: 'Content Stats', desc: 'Word count, reading time, and readability scores', icon: '📊' },
                { num: 4, name: 'AI Writing Assistant', desc: 'Grammar checking, tone adjustment, and suggestions', icon: '🤖' },
                { num: 5, name: 'Markdown Shortcuts', desc: 'Keyboard shortcuts for fast formatting', icon: '📝' },
                { num: 6, name: 'Slash Commands', desc: 'Quick actions and block insertion via "/" trigger', icon: '/' },
                { num: 7, name: 'Block Editor', desc: 'Notion-like block-based content editing', icon: '🧱' },
                { num: 8, name: 'Split Screen Preview', desc: 'Side-by-side editing with live preview', icon: '◧' },
                { num: 9, name: 'Content Templates', desc: 'Pre-defined structures for common post types', icon: '📑' },
                { num: 10, name: 'Inline Commenting', desc: 'Collaborative reviewing with threaded comments', icon: '💬' },
              ].map(feature => (
                <motion.div
                  key={feature.num}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveDemo(demos[feature.num].id)}
                  style={{
                    padding: '24px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{feature.icon}</span>
                    <div>
                      <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>
                        Enhancement #{feature.num}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                        {feature.name}
                      </h3>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'autosave':
        return (
          <AutoSaveProvider
            onSave={async (content) => {
              console.log('Saving...', content.slice(0, 50));
            }}
          >
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>1. Auto-Save Editor</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                <div>
                  <AutoSaveEditor
                    content={editorContent}
                    onChange={setEditorContent}
                    placeholder="Start typing... your content is automatically saved"
                    style={{ minHeight: '400px' }}
                  />
                </div>
                <div>
                  <h4 style={{ marginBottom: '16px' }}>Version History</h4>
                  <VersionHistory />
                </div>
              </div>
            </div>
          </AutoSaveProvider>
        );

      case 'distraction-free':
        return (
          <DistractionFreeProvider>
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>2. Distraction-Free Mode</h2>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Click the toggle to enter full-screen distraction-free writing mode.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <DistractionFreeToggle />
              </div>
              <DistractionFreeMode>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    lineHeight: 1.8,
                    resize: 'vertical',
                  }}
                />
              </DistractionFreeMode>
            </div>
          </DistractionFreeProvider>
        );

      case 'content-stats':
        return (
          <div style={{ padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>3. Content Stats</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
              <div>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: 1.6,
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ContentStatsDisplay content={editorContent} />
                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Reading Time</h4>
                  <ReadingTime content={editorContent} showIcon />
                </div>
                <WritingGoal
                  content={editorContent}
                  targetWords={500}
                  targetTime={5}
                  showMotivation
                />
              </div>
            </div>
          </div>
        );

      case 'ai-assistant':
        return (
          <AIWritingProvider>
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>4. AI Writing Assistant</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
                <div>
                  <AIActionsToolbar
                    text={editorContent}
                    onTextChange={setEditorContent}
                    style={{ marginBottom: '16px' }}
                  />
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '400px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}
                  />
                  <div style={{ marginTop: '16px' }}>
                    <WritingScore text={editorContent} showDetails />
                  </div>
                </div>
                <WritingAssistantPanel />
              </div>
            </div>
          </AIWritingProvider>
        );

      case 'markdown':
        return (
          <MarkdownShortcutsProvider>
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>5. Markdown Shortcuts</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                <div>
                  <FormattingToolbar onFormat={() => {}} />
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Use keyboard shortcuts like Ctrl+B for bold..."
                    style={{
                      width: '100%',
                      minHeight: '400px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0 0 8px 8px',
                      fontSize: '14px',
                      fontFamily: 'ui-monospace, monospace',
                      lineHeight: 1.6,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <ShortcutHintsPanel />
                  <MarkdownCheatSheet />
                </div>
              </div>
            </div>
          </MarkdownShortcutsProvider>
        );

      case 'slash-commands':
        return (
          <SlashCommandsProvider onInsertBlock={(type, data) => console.log('Insert:', type, data)}>
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>6. Slash Commands</h2>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                Type "/" in the editor to see available commands, or browse them below.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h4 style={{ marginBottom: '12px' }}>Editor with Slash Commands</h4>
                  <SlashCommandInput
                    value={editorContent}
                    onChange={setEditorContent}
                    onInsert={(type, data) => console.log('Insert:', type, data)}
                  />
                  <div style={{ marginTop: '16px' }}>
                    <AddBlockButton onInsert={(type, data) => console.log('Add block:', type, data)} />
                  </div>
                </div>
                <div>
                  <h4 style={{ marginBottom: '12px' }}>Command Browser</h4>
                  <CommandBrowser />
                </div>
              </div>
            </div>
          </SlashCommandsProvider>
        );

      case 'block-editor':
        return (
          <BlockEditorProvider
            onChange={(blocks) => console.log('Blocks updated:', blocks)}
          >
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '8px' }}>7. Block Editor</h2>
              <div style={{ marginBottom: '24px' }}>
                <BlockCount />
              </div>
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                minHeight: '500px',
                padding: '16px 64px',
              }}>
                <BlockEditor />
              </div>
            </div>
          </BlockEditorProvider>
        );

      case 'split-preview':
        return (
          <SplitScreenProvider>
            <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
              <PreviewToolbar style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <SplitScreenLayout
                  editor={
                    <div style={{ padding: '16px' }}>
                      <textarea
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        style={{
                          width: '100%',
                          height: '100%',
                          minHeight: '400px',
                          padding: '16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontFamily: 'ui-monospace, monospace',
                          lineHeight: 1.6,
                          resize: 'none',
                        }}
                      />
                    </div>
                  }
                  preview={
                    <LivePreview
                      content={editorContent}
                      renderContent={(content) => (
                        <div
                          style={{ padding: '16px' }}
                          dangerouslySetInnerHTML={{
                            __html: content
                              .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                              .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>')
                              .replace(/`(.*?)`/g, '<code>$1</code>')
                              .replace(/\n/g, '<br />')
                          }}
                        />
                      )}
                    />
                  }
                />
              </div>
            </div>
          </SplitScreenProvider>
        );

      case 'templates':
        return (
          <ContentTemplatesProvider>
            <div style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>9. Content Templates</h2>
              <div style={{ marginBottom: '24px' }}>
                <StartFromTemplateButton
                  onSelect={(blocks) => {
                    console.log('Selected template blocks:', blocks);
                    const content = blocks.map(b => {
                      if (b.type === 'heading') return `# ${b.placeholder || b.content}`;
                      if (b.type === 'paragraph') return b.placeholder || b.content;
                      return b.content;
                    }).join('\n\n');
                    setEditorContent(content);
                  }}
                />
              </div>
              <TemplatePicker
                onSelect={(blocks) => {
                  console.log('Selected template:', blocks);
                  const content = blocks.map(b => {
                    if (b.type === 'heading') return `# ${b.placeholder || b.content}`;
                    return b.placeholder || b.content;
                  }).join('\n\n');
                  setEditorContent(content);
                }}
              />
            </div>
          </ContentTemplatesProvider>
        );

      case 'commenting':
        return (
          <InlineCommentingProvider>
            <div style={{ display: 'flex', height: 'calc(100vh - 200px)' }}>
              <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0 }}>10. Inline Commenting</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CommentIndicator count={3} onClick={() => setShowCommentsSidebar(!showCommentsSidebar)} />
                    <button
                      onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: showCommentsSidebar ? '#3b82f6' : 'white',
                        color: showCommentsSidebar ? 'white' : '#374151',
                        cursor: 'pointer',
                      }}
                    >
                      {showCommentsSidebar ? 'Hide' : 'Show'} Comments
                    </button>
                  </div>
                </div>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  Select any text below to add a comment. Comments appear highlighted and can be resolved.
                </p>
                <div style={{
                  padding: '24px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  lineHeight: 1.8,
                  fontSize: '16px',
                }}>
                  <CommentableText blockId="intro">
                    {`RustPress is a modern, high-performance content management system built with Rust. It combines the speed and safety of Rust with an intuitive, user-friendly interface that makes content creation a joy.

Our platform offers a comprehensive suite of tools for bloggers, marketers, and enterprises alike. From simple blog posts to complex multi-author workflows, RustPress scales to meet your needs.

The editor you're using right now showcases just a fraction of what's possible. With features like real-time collaboration, AI-powered writing assistance, and seamless media management, RustPress empowers you to create your best content yet.`}
                  </CommentableText>
                </div>
              </div>
              {showCommentsSidebar && (
                <CommentsSidebar onClose={() => setShowCommentsSidebar(false)} />
              )}
            </div>
          </InlineCommentingProvider>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        padding: '20px 0',
        flexShrink: 0,
        overflow: 'auto',
      }}>
        <div style={{ padding: '0 20px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Post Editor
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
            Enhancements Demo
          </p>
        </div>

        <nav>
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                backgroundColor: activeDemo === demo.id ? '#EFF6FF' : 'transparent',
                color: activeDemo === demo.id ? '#3b82f6' : '#374151',
                fontSize: '14px',
                fontWeight: activeDemo === demo.id ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: activeDemo === demo.id ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{demo.icon}</span>
              <span>{demo.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderDemo()}
      </div>
    </div>
  );
};

export default PostEditorEnhancements;
