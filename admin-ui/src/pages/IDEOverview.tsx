/**
 * IDE Overview Page
 * Landing page showcasing RustPress IDE capabilities and top 9 functionalities
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Code2,
  Terminal,
  Database,
  Palette,
  GitBranch,
  Zap,
  FileCode,
  Eye,
  Bot,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const functionalities = [
  {
    icon: Code2,
    title: 'Advanced Code Editor',
    description: 'Full-featured Monaco editor with syntax highlighting, IntelliSense, and multi-language support for PHP, JavaScript, TypeScript, CSS, and more.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Terminal,
    title: 'Integrated Terminal',
    description: 'Built-in terminal with full shell access. Run commands, manage packages, and execute scripts without leaving the IDE.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Database,
    title: 'Database Explorer',
    description: 'Browse, query, and manage your database directly. View tables, run SQL queries, and export data with visual tools.',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: Palette,
    title: 'Theme Customization',
    description: 'Edit and customize your site themes in real-time. Modify colors, typography, layouts, and components visually.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Integrated Git support with visual diff viewer, branch management, commit history, and merge conflict resolution.',
    color: 'from-orange-500 to-amber-500'
  },
  {
    icon: Eye,
    title: 'Live Preview',
    description: 'See your changes instantly with hot reload. Preview your site across different devices and screen sizes.',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    icon: Bot,
    title: 'AI Code Assistant',
    description: 'AI-powered code suggestions, auto-completion, and intelligent refactoring. Generate code, fix bugs, and optimize performance.',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: FileCode,
    title: 'Plugin & Function Editor',
    description: 'Create and edit plugins, custom functions, and hooks. Full debugging support with breakpoints and step-through execution.',
    color: 'from-red-500 to-orange-500'
  },
  {
    icon: Layers,
    title: 'Multi-Tab Workspace',
    description: 'Organize your workflow with detachable tabs, split views, and customizable panel layouts. Work on multiple files simultaneously.',
    color: 'from-violet-500 to-purple-500'
  }
];

export default function IDEOverview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-6 py-16"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Professional Development Environment
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            RustPress <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">IDE</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            A powerful, integrated development environment built for RustPress.
            Edit themes, create plugins, manage databases, and deploy changes - all from one interface.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/ide/editor">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 flex items-center gap-2 hover:shadow-xl hover:shadow-primary-500/30 transition-shadow"
              >
                <Zap className="w-5 h-5" />
                Launch IDE
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-800 text-gray-300 font-semibold rounded-xl border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition-colors"
              >
                Back to Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={fadeInUp} className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Top 9 Functionalities</h2>
          <p className="text-gray-500 text-center mb-10">Everything you need to build and customize your RustPress site</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {functionalities.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              custom={index}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              <div className="relative">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Number badge */}
                <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-gray-700/80 flex items-center justify-center text-sm font-bold text-gray-400">
                  {index + 1}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={fadeInUp}
          className="mt-16 text-center"
        >
          <div className="inline-block p-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-3">Ready to start building?</h3>
            <p className="text-gray-400 mb-6 max-w-lg">
              The RustPress IDE combines powerful development tools with an intuitive interface.
              Start customizing your site today.
            </p>
            <Link to="/ide/editor">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 flex items-center gap-2 mx-auto hover:shadow-xl hover:shadow-primary-500/30 transition-shadow"
              >
                <Code2 className="w-5 h-5" />
                Open RustPress IDE
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          variants={fadeInUp}
          className="text-center text-gray-600 text-sm mt-12"
        >
          RustPress IDE will be available on Pro and Business plans. Launching soon - join the waitlist to get early access!
        </motion.p>
      </motion.div>
    </div>
  );
}
