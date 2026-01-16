import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update main layout background
content = content.replace(
    '<div className="min-h-screen bg-gray-100">',
    '<div className="min-h-screen bg-slate-900">'
)

# Update Dashboard background
content = content.replace(
    'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    'bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900'
)
content = content.replace(
    'bg-gradient-to-br from-slate-900 via-orange-900/50 to-slate-900',
    'bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900'
)

# Update sidebar navigation
content = content.replace(
    "'bg-blue-600 text-white'",
    "'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'"
)
content = content.replace(
    "'text-gray-300 hover:bg-gray-800 hover:text-white'",
    "'text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-300'"
)

# Update sidebar header
content = content.replace(
    '<div className="p-4 border-b border-gray-700">',
    '<div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-indigo-500/10 to-transparent">'
)
content = content.replace(
    '<h1 className="text-xl font-bold">RustPress Admin</h1>',
    '<h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">RustPress Admin</h1>'
)

# Update sidebar background
content = content.replace(
    'bg-gray-900 text-white overflow-y-auto',
    'bg-slate-900/95 backdrop-blur-xl text-white overflow-y-auto border-r border-gray-800/50'
)

# Update page loader
content = content.replace(
    'border-b-2 border-blue-600',
    'border-b-2 border-indigo-500'
)

# Update orange references to indigo
content = content.replace('text-orange-400', 'text-indigo-400')
content = content.replace('text-orange-300', 'text-indigo-300')
content = content.replace('bg-orange-500/20', 'bg-indigo-500/20')
content = content.replace('border-orange-500/30', 'border-indigo-500/30')
content = content.replace('hover:bg-orange-500/30', 'hover:bg-indigo-500/30')
content = content.replace('hover:text-orange-300', 'hover:text-indigo-300')
content = content.replace('hover:border-orange-500/50', 'hover:border-indigo-500/50')
content = content.replace('hover:bg-orange-500/10', 'hover:bg-indigo-500/10')
content = content.replace('ring-orange-500/50', 'ring-indigo-500/50')
content = content.replace('from-orange-900/20', 'from-indigo-900/30')
content = content.replace('via-orange-900/20', 'via-indigo-900/30')

# Change blue references in action links to indigo
content = content.replace('text-blue-600 hover:underline', 'text-indigo-400 hover:text-indigo-300 transition-colors')
content = content.replace('text-blue-400"', 'text-indigo-400"')

# Enhanced PostsList Page
posts_list_old = '''// Posts List Page
const PostsList = () => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
      <Link to="/posts/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        New Post
      </Link>
    </div>
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center gap-4">
        <input type="text" placeholder="Search posts..." className="flex-1 px-4 py-2 border rounded-lg" />
        <select className="px-4 py-2 border rounded-lg">
          <option>All Status</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Scheduled</option>
        </select>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4">Title</th>
            <th className="text-left p-4">Author</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Date</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[
            { title: 'Getting Started with RustPress', author: 'Admin', status: 'published', date: '2024-12-20' },
            { title: 'Building Your First Theme', author: 'Admin', status: 'draft', date: '2024-12-19' },
            { title: 'Plugin Development Guide', author: 'Admin', status: 'published', date: '2024-12-18' },
          ].map((post, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="p-4 font-medium">{post.title}</td>
              <td className="p-4 text-gray-600">{post.author}</td>
              <td className="p-4">
                <span className={clsx(
                  'px-2 py-1 rounded-full text-xs',
                  post.status === 'published' && 'bg-green-500/20 text-green-400 border border-green-500/30',
                  post.status === 'draft' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                )}>{post.status}</span>
              </td>
              <td className="p-4 text-gray-600">{post.date}</td>
              <td className="p-4">
                <Link to={`/posts/${i}/edit`} className="text-indigo-400 hover:text-indigo-300 transition-colors">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)'''

posts_list_new = '''// Posts List Page - Enhanced Enterprise UI
const PostsList = () => (
  <motion.div
    className="relative min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900"
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    <AnimatedBackground />
    <PageHeader
      title="Posts"
      subtitle="Manage your blog posts and articles"
      icon={<FileText className="w-6 h-6" />}
      gradient
      actions={
        <Link to="/posts/new">
          <EnhancedButton glow icon={<FileText className="w-4 h-4" />}>
            New Post
          </EnhancedButton>
        </Link>
      }
    />

    <GlassCard className="mb-6">
      <div className="flex items-center gap-4 p-4 border-b border-gray-700/50">
        <input
          type="text"
          placeholder="Search posts..."
          className="flex-1 px-4 py-2 bg-slate-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
        <select className="px-4 py-2 bg-slate-800/50 border border-gray-700/50 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
          <option>All Status</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Scheduled</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left p-4 text-gray-300 font-medium">Title</th>
              <th className="text-left p-4 text-gray-300 font-medium">Author</th>
              <th className="text-left p-4 text-gray-300 font-medium">Status</th>
              <th className="text-left p-4 text-gray-300 font-medium">Date</th>
              <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { title: 'Getting Started with RustPress', author: 'Admin', status: 'published', date: '2024-12-20' },
              { title: 'Building Your First Theme', author: 'Admin', status: 'draft', date: '2024-12-19' },
              { title: 'Plugin Development Guide', author: 'Admin', status: 'published', date: '2024-12-18' },
            ].map((post, i) => (
              <motion.tr
                key={i}
                className="border-t border-gray-700/50 hover:bg-white/5 transition-colors"
                variants={staggerItem}
              >
                <td className="p-4 font-medium text-gray-100">{post.title}</td>
                <td className="p-4 text-gray-400">{post.author}</td>
                <td className="p-4">
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    post.status === 'published' && 'bg-green-500/20 text-green-400 border border-green-500/30',
                    post.status === 'draft' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  )}>{post.status}</span>
                </td>
                <td className="p-4 text-gray-400">{post.date}</td>
                <td className="p-4">
                  <Link to={`/posts/${i}/edit`} className="text-indigo-400 hover:text-indigo-300 transition-colors">Edit</Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  </motion.div>
)'''

content = content.replace(posts_list_old, posts_list_new)

# Enhanced PagesList
pages_list_old = '''// Pages List Page
const PagesList = () => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
      <Link to="/pages/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
        <FileCode className="w-4 h-4" />
        New Page
      </Link>
    </div>
    <div className="bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4">Title</th>
            <th className="text-left p-4">Template</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[
            { title: 'Home', template: 'Homepage', status: 'published' },
            { title: 'About Us', template: 'Default', status: 'published' },
            { title: 'Contact', template: 'Contact', status: 'published' },
            { title: 'Privacy Policy', template: 'Legal', status: 'draft' },
          ].map((page, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="p-4 font-medium">{page.title}</td>
              <td className="p-4 text-gray-600">{page.template}</td>
              <td className="p-4">
                <span className={clsx(
                  'px-2 py-1 rounded-full text-xs',
                  page.status === 'published' && 'bg-green-500/20 text-green-400 border border-green-500/30',
                  page.status === 'draft' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                )}>{page.status}</span>
              </td>
              <td className="p-4">
                <Link to={`/pages/${i}/edit`} className="text-indigo-400 hover:text-indigo-300 transition-colors">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)'''

pages_list_new = '''// Pages List Page - Enhanced Enterprise UI
const PagesList = () => (
  <motion.div
    className="relative min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900"
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    <AnimatedBackground />
    <PageHeader
      title="Pages"
      subtitle="Manage your static pages"
      icon={<FileCode className="w-6 h-6" />}
      gradient
      actions={
        <Link to="/pages/new">
          <EnhancedButton glow icon={<FileCode className="w-4 h-4" />}>
            New Page
          </EnhancedButton>
        </Link>
      }
    />

    <GlassCard>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left p-4 text-gray-300 font-medium">Title</th>
              <th className="text-left p-4 text-gray-300 font-medium">Template</th>
              <th className="text-left p-4 text-gray-300 font-medium">Status</th>
              <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { title: 'Home', template: 'Homepage', status: 'published' },
              { title: 'About Us', template: 'Default', status: 'published' },
              { title: 'Contact', template: 'Contact', status: 'published' },
              { title: 'Privacy Policy', template: 'Legal', status: 'draft' },
            ].map((page, i) => (
              <motion.tr
                key={i}
                className="border-t border-gray-700/50 hover:bg-white/5 transition-colors"
                variants={staggerItem}
              >
                <td className="p-4 font-medium text-gray-100">{page.title}</td>
                <td className="p-4 text-gray-400">{page.template}</td>
                <td className="p-4">
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    page.status === 'published' && 'bg-green-500/20 text-green-400 border border-green-500/30',
                    page.status === 'draft' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  )}>{page.status}</span>
                </td>
                <td className="p-4">
                  <Link to={`/pages/${i}/edit`} className="text-indigo-400 hover:text-indigo-300 transition-colors">Edit</Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  </motion.div>
)'''

content = content.replace(pages_list_old, pages_list_new)

# Enhanced MediaLibrary
media_old = '''// Media Library Page
const MediaLibrary = () => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
        <Image className="w-4 h-4" />
        Upload Files
      </button>
    </div>
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center hover:ring-2 hover:ring-blue-500 cursor-pointer">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  </div>
)'''

media_new = '''// Media Library Page - Enhanced Enterprise UI
const MediaLibrary = () => (
  <motion.div
    className="relative min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900"
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    <AnimatedBackground />
    <PageHeader
      title="Media Library"
      subtitle="Manage your images, videos, and documents"
      icon={<Image className="w-6 h-6" />}
      gradient
      actions={
        <EnhancedButton glow icon={<Image className="w-4 h-4" />}>
          Upload Files
        </EnhancedButton>
      }
    />

    <GlassCard className="p-6">
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        variants={staggerContainer}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="aspect-square bg-slate-800/50 border border-gray-700/50 rounded-xl flex items-center justify-center hover:border-indigo-500/50 hover:bg-indigo-500/10 cursor-pointer transition-all duration-300 group"
            variants={staggerItem}
            whileHover={{ scale: 1.02 }}
          >
            <Image className="w-8 h-8 text-gray-500 group-hover:text-indigo-400 transition-colors" />
          </motion.div>
        ))}
      </motion.div>
    </GlassCard>
  </motion.div>
)'''

content = content.replace(media_old, media_new)

# Enhanced CommentsPage
comments_old = '''// Comments Page
const CommentsPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Comments</h1>
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">All (24)</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg">Pending (5)</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg">Approved (19)</button>
          <button className="px-4 py-2 hover:bg-gray-100 rounded-lg">Spam (0)</button>
        </div>
      </div>
      <div className="divide-y">
        {[
          { author: 'John Doe', email: 'john@example.com', comment: 'Great article! Very helpful.', post: 'Getting Started', status: 'approved' },
          { author: 'Jane Smith', email: 'jane@example.com', comment: 'Could you explain more about plugins?', post: 'Plugin Guide', status: 'pending' },
        ].map((comment, i) => (
          <div key={i} className="p-4 hover:bg-gray-50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {comment.author[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.author}</span>
                  <span className="text-sm text-gray-500">on {comment.post}</span>
                </div>
                <p className="text-gray-700">{comment.comment}</p>
                <div className="mt-2 flex gap-2">
                  <button className="text-sm text-green-600 hover:underline">Approve</button>
                  <button className="text-sm text-red-600 hover:underline">Spam</button>
                  <button className="text-sm text-gray-600 hover:underline">Reply</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)'''

comments_new = '''// Comments Page - Enhanced Enterprise UI
const CommentsPage = () => (
  <motion.div
    className="relative min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900"
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    <AnimatedBackground />
    <PageHeader
      title="Comments"
      subtitle="Manage user comments and discussions"
      icon={<MessageSquare className="w-6 h-6" />}
      gradient
    />

    <GlassCard>
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex gap-4 flex-wrap">
          <button className="px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl transition-all hover:bg-indigo-500/30">All (24)</button>
          <button className="px-4 py-2 text-gray-400 hover:bg-white/5 rounded-xl transition-colors">Pending (5)</button>
          <button className="px-4 py-2 text-gray-400 hover:bg-white/5 rounded-xl transition-colors">Approved (19)</button>
          <button className="px-4 py-2 text-gray-400 hover:bg-white/5 rounded-xl transition-colors">Spam (0)</button>
        </div>
      </div>
      <div className="divide-y divide-gray-700/50">
        {[
          { author: 'John Doe', email: 'john@example.com', comment: 'Great article! Very helpful.', post: 'Getting Started', status: 'approved' },
          { author: 'Jane Smith', email: 'jane@example.com', comment: 'Could you explain more about plugins?', post: 'Plugin Guide', status: 'pending' },
        ].map((comment, i) => (
          <motion.div key={i} className="p-4 hover:bg-white/5 transition-colors" variants={staggerItem}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 font-medium">
                {comment.author[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-100">{comment.author}</span>
                  <span className="text-sm text-gray-500">on {comment.post}</span>
                </div>
                <p className="text-gray-300">{comment.comment}</p>
                <div className="mt-2 flex gap-4">
                  <button className="text-sm text-green-400 hover:text-green-300 transition-colors">Approve</button>
                  <button className="text-sm text-red-400 hover:text-red-300 transition-colors">Spam</button>
                  <button className="text-sm text-gray-400 hover:text-gray-300 transition-colors">Reply</button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  </motion.div>
)'''

content = content.replace(comments_old, comments_new)

# Enhanced ThemesPage
themes_old = '''// Themes Page
const ThemesPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Themes</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { name: 'RustPress Enterprise', active: true, version: '2.0.0' },
        { name: 'Developer Developer', active: false, version: '1.5.0' },
        { name: 'Business Elite', active: false, version: '1.2.0' },
        { name: 'Portfolio Creative', active: false, version: '1.0.0' },
      ].map((theme, i) => (
        <div key={i} className={clsx(
          'bg-white rounded-lg shadow overflow-hidden',
          theme.active && 'ring-2 ring-blue-500'
        )}>
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <Palette className="w-12 h-12 text-gray-400" />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{theme.name}</h3>
              {theme.active && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Active</span>}
            </div>
            <p className="text-sm text-gray-500 mb-4">Version {theme.version}</p>
            <div className="flex gap-2">
              {theme.active ? (
                <Link to="/appearance" className="flex-1 text-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Customize</Link>
              ) : (
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Activate</button>
              )}
              <Link to="/theme-preview" className="px-4 py-2 border rounded-lg hover:bg-gray-50">Preview</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)'''

themes_new = '''// Themes Page - Enhanced Enterprise UI
const ThemesPage = () => (
  <motion.div
    className="relative min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900"
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    <AnimatedBackground />
    <PageHeader
      title="Themes"
      subtitle="Customize your site appearance"
      icon={<Palette className="w-6 h-6" />}
      gradient
    />

    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer}>
      {[
        { name: 'RustPress Enterprise', active: true, version: '2.0.0' },
        { name: 'Developer Developer', active: false, version: '1.5.0' },
        { name: 'Business Elite', active: false, version: '1.2.0' },
        { name: 'Portfolio Creative', active: false, version: '1.0.0' },
      ].map((theme, i) => (
        <motion.div
          key={i}
          variants={staggerItem}
          whileHover={{ scale: 1.02 }}
        >
          <GlassCard
            className={clsx(
              'overflow-hidden',
              theme.active && 'ring-2 ring-indigo-500'
            )}
            padding="none"
          >
            <div className="aspect-video bg-slate-800/50 flex items-center justify-center">
              <Palette className="w-12 h-12 text-gray-500" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-100">{theme.name}</h3>
                {theme.active && <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded-full">Active</span>}
              </div>
              <p className="text-sm text-gray-400 mb-4">Version {theme.version}</p>
              <div className="flex gap-2">
                {theme.active ? (
                  <Link to="/appearance" className="flex-1 text-center px-4 py-2 bg-slate-800/50 text-gray-300 rounded-xl hover:bg-slate-700/50 transition-colors">Customize</Link>
                ) : (
                  <EnhancedButton className="flex-1">Activate</EnhancedButton>
                )}
                <Link to="/theme-preview" className="px-4 py-2 border border-gray-700/50 text-gray-300 rounded-xl hover:bg-white/5 transition-colors">Preview</Link>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
)'''

content = content.replace(themes_old, themes_new)

# Enhanced PluginsPage
plugins_old = '''// Plugins Page
const PluginsPage = () => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Plugins</h1>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
        <Puzzle className="w-4 h-4" />
        Add New Plugin
      </button>
    </div>
    <div className="bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4">Plugin</th>
            <th className="text-left p-4">Description</th>
            <th className="text-left p-4">Version</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: 'SEO Optimizer', desc: 'Advanced SEO tools', version: '2.1.0', active: true },
            { name: 'Cache Manager', desc: 'Performance caching', version: '1.5.0', active: true },
            { name: 'Analytics Pro', desc: 'Google Analytics integration', version: '3.0.0', active: false },
            { name: 'Contact Forms', desc: 'Form builder', version: '1.2.0', active: true },
          ].map((plugin, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="p-4 font-medium">{plugin.name}</td>
              <td className="p-4 text-gray-600">{plugin.desc}</td>
              <td className="p-4 text-gray-600">{plugin.version}</td>
              <td className="p-4">
                <span className={clsx(
                  'px-2 py-1 rounded-full text-xs',
                  plugin.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-100 text-gray-600'
                )}>{plugin.active ? 'Active' : 'Inactive'}</span>
              </td>
              <td className="p-4">
                <button className={clsx(
                  'text-sm',
                  plugin.active ? 'text-red-600 hover:underline' : 'text-indigo-400 hover:text-indigo-300 transition-colors'
                )}>{plugin.active ? 'Deactivate' : 'Activate'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)'''

plugins_new = '''// Plugins Page - Enhanced Enterprise UI
const PluginsPage = () => (
  <motion.div
    className="relative min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900"
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    <AnimatedBackground />
    <PageHeader
      title="Plugins"
      subtitle="Extend your site functionality"
      icon={<Puzzle className="w-6 h-6" />}
      gradient
      actions={
        <EnhancedButton glow icon={<Puzzle className="w-4 h-4" />}>
          Add New Plugin
        </EnhancedButton>
      }
    />

    <GlassCard>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left p-4 text-gray-300 font-medium">Plugin</th>
              <th className="text-left p-4 text-gray-300 font-medium">Description</th>
              <th className="text-left p-4 text-gray-300 font-medium">Version</th>
              <th className="text-left p-4 text-gray-300 font-medium">Status</th>
              <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'SEO Optimizer', desc: 'Advanced SEO tools', version: '2.1.0', active: true },
              { name: 'Cache Manager', desc: 'Performance caching', version: '1.5.0', active: true },
              { name: 'Analytics Pro', desc: 'Google Analytics integration', version: '3.0.0', active: false },
              { name: 'Contact Forms', desc: 'Form builder', version: '1.2.0', active: true },
            ].map((plugin, i) => (
              <motion.tr
                key={i}
                className="border-t border-gray-700/50 hover:bg-white/5 transition-colors"
                variants={staggerItem}
              >
                <td className="p-4 font-medium text-gray-100">{plugin.name}</td>
                <td className="p-4 text-gray-400">{plugin.desc}</td>
                <td className="p-4 text-gray-400">{plugin.version}</td>
                <td className="p-4">
                  <span className={clsx(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    plugin.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700/50 text-gray-400'
                  )}>{plugin.active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="p-4">
                  <button className={clsx(
                    'text-sm transition-colors',
                    plugin.active ? 'text-red-400 hover:text-red-300' : 'text-indigo-400 hover:text-indigo-300'
                  )}>{plugin.active ? 'Deactivate' : 'Activate'}</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  </motion.div>
)'''

content = content.replace(plugins_old, plugins_new)

# Enhanced UsersListPage
users_old = '''// Users Page
const UsersListPage = () => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Add New User
      </button>
    </div>
    <div className="bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-4">User</th>
            <th className="text-left p-4">Email</th>
            <th className="text-left p-4">Role</th>
            <th className="text-left p-4">Posts</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: 'Admin', email: 'admin@rustpress.com', role: 'Administrator', posts: 24 },
            { name: 'Editor', email: 'editor@rustpress.com', role: 'Editor', posts: 12 },
            { name: 'Author', email: 'author@rustpress.com', role: 'Author', posts: 5 },
          ].map((user, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-full border border-indigo-500/30 flex items-center justify-center text-blue-600 font-medium">
                    {user.name[0]}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
              </td>
              <td className="p-4 text-gray-600">{user.email}</td>
              <td className="p-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{user.role}</span>
              </td>
              <td className="p-4 text-gray-600">{user.posts}</td>
              <td className="p-4">
                <button className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)'''

users_new = '''// Users Page - Enhanced Enterprise UI
const UsersListPage = () => (
  <motion.div
    className="relative min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900"
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    <AnimatedBackground />
    <PageHeader
      title="Users"
      subtitle="Manage user accounts and permissions"
      icon={<Users className="w-6 h-6" />}
      gradient
      actions={
        <EnhancedButton glow icon={<Users className="w-4 h-4" />}>
          Add New User
        </EnhancedButton>
      }
    />

    <GlassCard>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left p-4 text-gray-300 font-medium">User</th>
              <th className="text-left p-4 text-gray-300 font-medium">Email</th>
              <th className="text-left p-4 text-gray-300 font-medium">Role</th>
              <th className="text-left p-4 text-gray-300 font-medium">Posts</th>
              <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Admin', email: 'admin@rustpress.com', role: 'Administrator', posts: 24 },
              { name: 'Editor', email: 'editor@rustpress.com', role: 'Editor', posts: 12 },
              { name: 'Author', email: 'author@rustpress.com', role: 'Author', posts: 5 },
            ].map((user, i) => (
              <motion.tr
                key={i}
                className="border-t border-gray-700/50 hover:bg-white/5 transition-colors"
                variants={staggerItem}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-medium">
                      {user.name[0]}
                    </div>
                    <span className="font-medium text-gray-100">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400">{user.email}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs">{user.role}</span>
                </td>
                <td className="p-4 text-gray-400">{user.posts}</td>
                <td className="p-4">
                  <button className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm">Edit</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  </motion.div>
)'''

content = content.replace(users_old, users_new)

# Enhanced SettingsListPage
settings_old = '''// Settings Page
const SettingsListPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <nav className="bg-white rounded-lg shadow p-4 space-y-1">
          {['General', 'Writing', 'Reading', 'Discussion', 'Media', 'Permalinks', 'Privacy'].map((item) => (
            <button key={item} className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100">
              {item}
            </button>
          ))}
        </nav>
      </div>
      <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-6">General Settings</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
            <input type="text" defaultValue="RustPress" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
            <input type="text" defaultValue="Just another RustPress site" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
            <input type="text" defaultValue="https://example.com" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
            <input type="email" defaultValue="admin@rustpress.com" className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
)'''

settings_new = '''// Settings Page - Enhanced Enterprise UI
const SettingsListPage = () => (
  <motion.div
    className="relative min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-900"
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    <AnimatedBackground />
    <PageHeader
      title="Settings"
      subtitle="Configure your site preferences"
      icon={<Settings className="w-6 h-6" />}
      gradient
    />

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <motion.div className="lg:col-span-1" variants={staggerItem}>
        <GlassCard className="p-4 space-y-1">
          {['General', 'Writing', 'Reading', 'Discussion', 'Media', 'Permalinks', 'Privacy'].map((item, i) => (
            <button
              key={item}
              className={clsx(
                'w-full text-left px-4 py-2 rounded-xl transition-all',
                i === 0 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              )}
            >
              {item}
            </button>
          ))}
        </GlassCard>
      </motion.div>
      <motion.div className="lg:col-span-3" variants={staggerItem}>
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-6">General Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site Title</label>
              <input
                type="text"
                defaultValue="RustPress"
                className="w-full px-4 py-2 bg-slate-800/50 border border-gray-700/50 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
              <input
                type="text"
                defaultValue="Just another RustPress site"
                className="w-full px-4 py-2 bg-slate-800/50 border border-gray-700/50 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site URL</label>
              <input
                type="text"
                defaultValue="https://example.com"
                className="w-full px-4 py-2 bg-slate-800/50 border border-gray-700/50 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Email</label>
              <input
                type="email"
                defaultValue="admin@rustpress.com"
                className="w-full px-4 py-2 bg-slate-800/50 border border-gray-700/50 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <EnhancedButton glow>
              Save Changes
            </EnhancedButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  </motion.div>
)'''

content = content.replace(settings_old, settings_new)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('All pages enhanced with enterprise UI!')
