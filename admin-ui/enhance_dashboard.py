import re

# Read the file
with open('C:/Users/Software Engineering/Desktop/RustPress/admin-ui/src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace bg-white sections with GlassCard
replacements = [
    # Quick Actions header
    ('    {/* Quick Actions */}\n    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">\n      <div className="bg-white rounded-lg shadow p-6">\n        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>',
     '    {/* Quick Actions */}\n    <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" variants={staggerContainer}>\n      <GlassCard className="p-6">\n        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>'),

    # Quick Action links
    ('bg-blue-50 rounded-lg hover:bg-blue-100', 'bg-blue-500/20 rounded-lg hover:bg-blue-500/30 border border-blue-500/30'),
    ('text-blue-600"', 'text-blue-400"'),
    ('text-blue-700 font-medium', 'text-blue-300 font-medium'),

    ('bg-purple-50 rounded-lg hover:bg-purple-100', 'bg-purple-500/20 rounded-lg hover:bg-purple-500/30 border border-purple-500/30'),
    ('text-purple-600"', 'text-purple-400"'),
    ('text-purple-700 font-medium', 'text-purple-300 font-medium'),

    ('bg-green-50 rounded-lg hover:bg-green-100', 'bg-green-500/20 rounded-lg hover:bg-green-500/30 border border-green-500/30'),
    ('text-green-600"', 'text-green-400"'),
    ('text-green-700 font-medium', 'text-green-300 font-medium'),

    ('bg-orange-50 rounded-lg hover:bg-orange-100', 'bg-orange-500/20 rounded-lg hover:bg-orange-500/30 border border-orange-500/30'),
    ('text-orange-600"', 'text-orange-400"'),
    ('text-orange-700 font-medium', 'text-orange-300 font-medium'),

    # Close Quick Actions GlassCard
    ('        </div>\n      </div>\n\n      <div className="bg-white rounded-lg shadow p-6">\n        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>',
     '        </div>\n      </GlassCard>\n\n      <GlassCard className="p-6">\n        <h3 className="text-lg font-semibold text-white mb-4">Recent Posts</h3>'),

    # Recent Posts items
    ('hover:bg-gray-50 rounded', 'hover:bg-white/10 rounded'),
    ('text-gray-700 truncate', 'text-gray-200 truncate'),

    # Status badges
    ("'bg-green-100 text-green-700'", "'bg-green-500/20 text-green-400 border border-green-500/30'"),
    ("'bg-yellow-100 text-yellow-700'", "'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'"),
    ("'bg-blue-100 text-blue-700'", "'bg-blue-500/20 text-blue-400 border border-blue-500/30'"),

    # Close Recent Posts and open System Status
    ('        </div>\n      </div>\n\n      <div className="bg-white rounded-lg shadow p-6">\n        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>',
     '        </div>\n      </GlassCard>\n\n      <GlassCard className="p-6">\n        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>'),

    # System status items
    ('text-gray-600">Database', 'text-gray-300">Database'),
    ('text-gray-600">Cache', 'text-gray-300">Cache'),
    ('text-gray-600">CDN', 'text-gray-300">CDN'),
    ('text-gray-600">Search Index', 'text-gray-300">Search Index'),
    ('text-green-600">', 'text-green-400">'),
    ('bg-green-500 rounded-full', 'bg-green-400 rounded-full animate-pulse'),
    ('text-yellow-600">', 'text-yellow-400">'),
    ('bg-yellow-500 rounded-full', 'bg-yellow-400 rounded-full animate-pulse'),

    # Close System Status and grid
    ('        </div>\n      </div>\n    </div>\n\n    {/* Activity Feed */}\n    <div className="bg-white rounded-lg shadow p-6">\n      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>',
     '        </div>\n      </GlassCard>\n    </motion.div>\n\n    {/* Activity Feed */}\n    <GlassCard className="p-6">\n      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>'),

    # Activity feed items
    ('hover:bg-gray-50 rounded-lg', 'hover:bg-white/10 rounded-lg'),
    ('bg-blue-100 rounded-full', 'bg-blue-500/20 rounded-full border border-blue-500/30'),
    ('text-gray-900"><span', 'text-gray-100"><span'),
    ('text-sm text-gray-500">{activity', 'text-sm text-gray-400">{activity'),

    # Close Activity Feed
    ('      </div>\n    </div>\n  </motion.div>\n)',
     '      </div>\n    </GlassCard>\n  </motion.div>\n)'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write the file
with open('C:/Users/Software Engineering/Desktop/RustPress/admin-ui/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Dashboard enhanced successfully!')
