import { createContext, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers, Eye, Users, Workflow, Sparkles, ArrowRight, Menu, X, Sun, Moon,
  Zap, Play,
  Search, Plus, Bell, Settings,
  Layout, Calendar, Table, BarChart3,
  Flag, Paperclip, MessageCircle, CheckCircle2, Circle, Clock,
  ListChecks, ShieldCheck, MessageSquare, Command,
  MoreHorizontal, ChevronRight, TrendingUp,
  Atom, Wind, Boxes, Database, Cpu, GitBranch,
   Heart,
   LogIn,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

/* ============================================================ Theme Context */
const ThemeContext = createContext({ theme: 'dark', toggle: () => {} })

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])
  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  )
}
const useTheme = () => useContext(ThemeContext)

/* ============================================================ SectionHeading */
function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full glass text-purple-300">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-slate-400 sm:text-lg text-balance">{subtitle}</p>
      )}
    </div>
  )
}

/* ============================================================ Navbar */
const navLinks = [
  { label: 'Features', href: '#features', icon: Layers },
  { label: 'Views', href: '#views', icon: Eye },
  { label: 'Collaboration', href: '#collaboration', icon: Users },
  { label: 'Workflow', href: '#workflow', icon: Workflow },
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggle } = useTheme()
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-strong shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <Workflow className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 blur-md opacity-50 -z-10" />
            </div>
            <span className="text-lg font-bold gradient-text-animated">WorkFlow Pro</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="px-3 py-2 text-sm font-medium text-slate-300 rounded-lg transition-all hover:text-white hover:bg-white/5">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggle} aria-label="Toggle theme" className="p-2 rounded-lg glass text-slate-300 hover:text-white transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/auth/login" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all hover:scale-105">
              <Sparkles className="w-4 h-4" />
              Login
            </Link>
            <button onClick={() => setMobileOpen((o) => !o)} className="md:hidden p-2 rounded-lg glass text-slate-300" aria-label="Menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass-strong border-t border-white/10"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 rounded-lg hover:bg-white/5 hover:text-white">
                  <l.icon className="w-4 h-4 text-purple-400" />
                  {l.label}
                </a>
              ))}
              <a href="#views" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-1.5 px-4 py-2.5 mt-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                <LogIn className="w-4 h-4" />
                Live Demo
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ============================================================ AppPreview */
const previewColumns = [
  { title: 'Backlog', accent: 'bg-slate-500', cards: [
    { title: 'Design system audit', priority: 'Low', tag: 'Design' },
    { title: 'Research competitor onboarding', priority: 'Med', tag: 'Research' },
  ]},
  { title: 'In Progress', accent: 'bg-indigo-500', cards: [
    { title: 'Build Kanban drag-drop', priority: 'High', tag: 'Frontend' },
    { title: 'Set up Redux store', priority: 'High', tag: 'Engineering' },
    { title: 'Auth flow with roles', priority: 'Med', tag: 'Backend' },
  ]},
  { title: 'Review', accent: 'bg-amber-500', cards: [
    { title: 'Calendar view layout', priority: 'Med', tag: 'Frontend' },
  ]},
  { title: 'Done', accent: 'bg-emerald-500', cards: [
    { title: 'Landing page hero', priority: 'High', tag: 'Marketing' },
    { title: 'Project scaffold', priority: 'Low', tag: 'DevOps' },
  ]},
]

const previewTagColors = {
  Design: 'bg-purple-500/15 text-purple-300',
  Research: 'bg-blue-500/15 text-blue-300',
  Frontend: 'bg-indigo-500/15 text-indigo-300',
  Engineering: 'bg-cyan-500/15 text-cyan-300',
  Backend: 'bg-emerald-500/15 text-emerald-300',
  Marketing: 'bg-pink-500/15 text-pink-300',
  DevOps: 'bg-orange-500/15 text-orange-300',
}

function PriorityIcon({ priority }) {
  if (priority === 'High') return <Flag className="w-3 h-3 text-pink-400 fill-pink-400/30" />
  if (priority === 'Med') return <Flag className="w-3 h-3 text-amber-400 fill-amber-400/30" />
  return <Flag className="w-3 h-3 text-slate-400" />
}

function AppPreview() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-strong shadow-2xl shadow-purple-900/20">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-400 rounded-md bg-white/5">
            <Search className="w-3 h-3" />
            workflow.pro/dashboard
          </div>
        </div>
      </div>

      <div className="flex h-[420px] sm:h-[460px]">
        <div className="hidden sm:flex flex-col w-14 lg:w-48 border-r border-white/10 bg-white/[0.02] p-2 gap-1">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-indigo-500/15 text-indigo-300">
            <Layout className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline text-sm font-medium">Board</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:bg-white/5">
            <Table className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline text-sm">Table</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:bg-white/5">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline text-sm">Calendar</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:bg-white/5">
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline text-sm">Analytics</span>
          </div>
          <div className="mt-auto flex items-center gap-2 px-2 py-2 rounded-lg text-slate-400 hover:bg-white/5">
            <Settings className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline text-sm">Settings</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-semibold text-white">Sprint 24 — Q3 Launch</h3>
              <p className="text-xs text-slate-500">8 tasks · 3 in progress</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['from-indigo-500 to-purple-500', 'from-pink-500 to-rose-500', 'from-emerald-500 to-cyan-500'].map((g, i) => (
                  <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 border-ink-900`} />
                ))}
              </div>
              <button className="p-1.5 rounded-md text-slate-400 hover:bg-white/5">
                <Bell className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white rounded-md bg-gradient-to-r from-indigo-500 to-purple-500">
                <Plus className="w-3 h-3" />
                New
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto p-3">
            <div className="flex gap-3 min-w-max h-full">
              {previewColumns.map((col, ci) => (
                <div key={col.title} className="w-48 lg:w-52 flex flex-col">
                  <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                    <div className={`w-2 h-2 rounded-full ${col.accent}`} />
                    <span className="text-xs font-semibold text-slate-300">{col.title}</span>
                    <span className="text-xs text-slate-600">{col.cards.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {col.cards.map((card, i) => (
                      <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + ci * 0.1 + i * 0.05 }}
                        className="p-2.5 rounded-lg glass hover:border-purple-500/30 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${previewTagColors[card.tag]}`}>
                            {card.tag}
                          </span>
                          <PriorityIcon priority={card.priority} />
                        </div>
                        <p className="text-xs font-medium text-slate-200 leading-snug mb-2">{card.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> 2/4</span>
                          <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> 3</span>
                          <span className="flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> 1</span>
                          <span className="flex items-center gap-0.5 ml-auto"><Clock className="w-3 h-3" /> Sep 12</span>
                        </div>
                      </motion.div>
                    ))}
                    <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 rounded-md hover:bg-white/5 transition-colors">
                      <Plus className="w-3 h-3" /> Add task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 px-4 py-2.5 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Circle className="w-3 h-3 text-emerald-400 fill-emerald-400/30 animate-pulse" />
              <span className="text-emerald-400 font-medium">Live</span>
              <span className="text-slate-500">·</span>
              <span>Sarah moved "Auth flow" to In Progress</span>
              <span className="text-slate-600 ml-auto hidden sm:inline">just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================ Hero */
function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] bg-pink-600/15 rounded-full blur-[100px]" />
      </div>
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium text-purple-200 hover:border-purple-500/30 transition-colors group">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>The All-in-One Local-First Workspace Tool</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-indigo-500 to-pink-500 text-white">NEW</span>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-center text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl text-balance">
          Manage Projects at the
          <br />
          <span className="gradient-text-animated">Speed of Thought</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-2xl mx-auto mt-6 text-center text-base text-slate-400 sm:text-lg md:text-xl text-balance">
          Combine Kanban boards, task lists, calendar views, subtasks, and real-time collaboration — all in one lightning-fast, local-first workspace that works the way your team thinks.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a href="#views" className="group relative inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all hover:scale-105 animate-pulse-glow">
            <Zap className="w-5 h-5" />
            Launch Workspace
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a href="#features" className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-2xl glass hover:bg-white/10 transition-all hover:scale-105">
            <Play className="w-4 h-4 text-purple-400" />
            Explore Features
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="relative mt-16 sm:mt-20">
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl" />
          <div className="animate-float">
            <AppPreview />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12 text-sm text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 100% Local-First</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Offline Ready</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Zero Setup</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pink-400" /> Open Source</span>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================ Features */
const featuresData = [
  { icon: Layout, title: 'Multiple Views', desc: 'Switch between Kanban Board, List/Table, and Calendar views instantly. See your work the way that makes sense.', gradient: 'from-indigo-500 to-blue-500', points: ['Kanban Board', 'List / Table', 'Calendar View'] },
  { icon: ListChecks, title: 'Rich Task Management', desc: 'Nested subtasks, priority tags, due dates, and file attachments — everything you need to track work in detail.', gradient: 'from-purple-500 to-pink-500', points: ['Nested Subtasks', 'Priority Tags', 'File Attachments'] },
  { icon: Zap, title: 'Client-Side Speed', desc: 'Fast offline-first performance powered by local storage and state persistence. No server round-trips required.', gradient: 'from-amber-500 to-orange-500', points: ['Offline-First', 'State Persistence', 'Instant Load'] },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Owner, Admin, Member, and Viewer roles with granular permissions simulated for realistic team workflows.', gradient: 'from-emerald-500 to-cyan-500', points: ['Owner', 'Admin', 'Member', 'Viewer'] },
  { icon: MessageSquare, title: 'Activity Feed & Comments', desc: 'Track every change with task history and simulated live updates. Keep everyone in the loop automatically.', gradient: 'from-pink-500 to-rose-500', points: ['Task History', 'Live Updates', 'Threaded Comments'] },
  { icon: Command, title: 'Command Palette (Cmd+K)', desc: 'Lightning-fast navigation and keyboard shortcuts. Jump to any task, view, or action without leaving the keyboard.', gradient: 'from-cyan-500 to-indigo-500', points: ['Quick Navigation', 'Keyboard Shortcuts', 'Global Search'] },
]

function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title={<>Everything you need, <span className="gradient-text">nothing you don't</span></>}
          subtitle="A complete project management toolkit designed for speed, clarity, and focus. Built to feel native from day one."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {featuresData.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative p-6 rounded-2xl glass hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`} />
              <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 -z-10`} />
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} mb-4 shadow-lg`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{f.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {f.points.map((p) => (
                  <span key={p} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white/5 text-slate-300 border border-white/10">{p}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================ FeatureTabs */
const tabDefs = [
  { id: 'kanban', label: 'Kanban Board', icon: Layout },
  { id: 'table', label: 'Task Table', icon: Table },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

function KanbanView() {
  const cols = [
    { title: 'To Do', accent: 'bg-slate-500', cards: [
      { t: 'Wireframe onboarding flow', p: 'Med', tag: 'Design' },
      { t: 'API rate limiting', p: 'High', tag: 'Backend' },
    ]},
    { title: 'In Progress', accent: 'bg-indigo-500', cards: [
      { t: 'Drag-drop Kanban columns', p: 'High', tag: 'Frontend' },
      { t: 'Dark mode tokens', p: 'Low', tag: 'Design' },
    ]},
    { title: 'Done', accent: 'bg-emerald-500', cards: [
      { t: 'Set up Vite + React', p: 'Low', tag: 'DevOps' },
    ]},
  ]
  const pc = { Low: 'text-slate-400', Med: 'text-amber-400', High: 'text-pink-400' }
  const tc = { Design: 'bg-purple-500/15 text-purple-300', Frontend: 'bg-indigo-500/15 text-indigo-300', Backend: 'bg-emerald-500/15 text-emerald-300', DevOps: 'bg-orange-500/15 text-orange-300' }
  return (
    <div className="flex gap-3 overflow-x-auto p-4 h-full">
      {cols.map((c, ci) => (
        <div key={c.title} className="w-44 sm:w-52 shrink-0">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className={`w-2 h-2 rounded-full ${c.accent}`} />
            <span className="text-xs font-semibold text-slate-300">{c.title}</span>
            <span className="text-xs text-slate-600">{c.cards.length}</span>
          </div>
          <div className="space-y-2">
            {c.cards.map((card, i) => (
              <motion.div key={card.t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 + i * 0.05 }} className="p-2.5 rounded-lg glass hover:border-purple-500/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${tc[card.tag]}`}>{card.tag}</span>
                  <Flag className={`w-3 h-3 ${pc[card.p]} fill-current/20`} />
                </div>
                <p className="text-xs font-medium text-slate-200 mb-2">{card.t}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <CheckCircle2 className="w-3 h-3" /> 1/3
                  <Clock className="w-3 h-3 ml-auto" /> Sep 15
                </div>
              </motion.div>
            ))}
            <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 rounded-md hover:bg-white/5 w-full">
              <Plus className="w-3 h-3" /> Add task
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function TableView() {
  const rows = [
    { id: 'WF-12', title: 'Drag-drop Kanban columns', status: 'In Progress', priority: 'High', assignee: 'from-indigo-500 to-purple-500', due: 'Sep 15' },
    { id: 'WF-11', title: 'Wireframe onboarding flow', status: 'To Do', priority: 'Med', assignee: 'from-pink-500 to-rose-500', due: 'Sep 18' },
    { id: 'WF-10', title: 'API rate limiting', status: 'To Do', priority: 'High', assignee: 'from-emerald-500 to-cyan-500', due: 'Sep 20' },
    { id: 'WF-09', title: 'Dark mode tokens', status: 'In Progress', priority: 'Low', assignee: 'from-amber-500 to-orange-500', due: 'Sep 14' },
    { id: 'WF-08', title: 'Set up Vite + React', status: 'Done', priority: 'Low', assignee: 'from-indigo-500 to-blue-500', due: 'Sep 10' },
  ]
  const sc = { 'To Do': 'text-slate-400 bg-slate-500/10', 'In Progress': 'text-indigo-400 bg-indigo-500/10', 'Done': 'text-emerald-400 bg-emerald-500/10' }
  const pc = { Low: 'text-slate-400', Med: 'text-amber-400', High: 'text-pink-400' }
  return (
    <div className="overflow-x-auto p-4 h-full">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-white/10">
            <th className="pb-2 font-medium">ID</th><th className="pb-2 font-medium">Title</th>
            <th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Priority</th>
            <th className="pb-2 font-medium">Assignee</th><th className="pb-2 font-medium">Due</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-2.5 text-xs text-slate-500 font-mono">{r.id}</td>
              <td className="py-2.5 text-xs font-medium text-slate-200">{r.title}</td>
              <td className="py-2.5"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc[r.status]}`}>{r.status}</span></td>
              <td className="py-2.5"><span className={`flex items-center gap-1 text-xs ${pc[r.priority]}`}><Flag className="w-3 h-3" />{r.priority}</span></td>
              <td className="py-2.5"><div className={`w-6 h-6 rounded-full bg-gradient-to-br ${r.assignee}`} /></td>
              <td className="py-2.5 text-xs text-slate-400">{r.due}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CalendarView() {
  const days = Array.from({ length: 35 }, (_, i) => i - 2)
  const events = {
    3: { title: 'Sprint kickoff', color: 'bg-indigo-500' },
    7: { title: 'Design review', color: 'bg-purple-500' },
    12: { title: 'Kanban demo', color: 'bg-pink-500' },
    15: { title: 'API freeze', color: 'bg-amber-500' },
    18: { title: 'QA session', color: 'bg-emerald-500' },
    22: { title: 'Release', color: 'bg-pink-500' },
  }
  const monthDays = days.map((d) => (d < 1 ? null : d > 30 ? null : d))
  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">September 2026</h4>
        <div className="flex gap-1">
          <button className="p-1 rounded glass text-slate-400 text-xs">‹</button>
          <button className="p-1 rounded glass text-slate-400 text-xs">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((d, i) => (
          <div key={i} className={`min-h-[3rem] sm:min-h-[3.5rem] rounded-lg border p-1 text-[10px] ${d ? 'border-white/10 bg-white/[0.02]' : 'border-transparent'} ${d === 5 ? 'ring-1 ring-purple-500/50 bg-purple-500/5' : ''}`}>
            {d && <span className="text-slate-400">{d}</span>}
            {d && events[d] && (
              <div className={`mt-1 px-1 py-0.5 rounded text-[9px] text-white truncate ${events[d].color}`}>{events[d].title}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsView() {
  const stats = [
    { label: 'Completed', value: '24', change: '+12%', color: 'text-emerald-400' },
    { label: 'In Progress', value: '8', change: '+3', color: 'text-indigo-400' },
    { label: 'Overdue', value: '2', change: '-1', color: 'text-amber-400' },
    { label: 'Blocked', value: '1', change: '0', color: 'text-pink-400' },
  ]
  const bars = [40, 65, 50, 80, 70, 90, 60, 75, 85, 55, 70, 95]
  return (
    <div className="p-4 h-full space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="p-3 rounded-xl glass">
            <p className="text-xs text-slate-500">{s.label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{s.value}</span>
              <span className={`text-xs font-medium ${s.color}`}>{s.change}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="p-4 rounded-xl glass">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white">Velocity (last 12 weeks)</h4>
          <span className="flex items-center gap-1 text-xs text-emerald-400"><TrendingUp className="w-3 h-3" /> +18%</span>
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {bars.map((h, i) => (
            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05, duration: 0.4 }} className={`flex-1 rounded-t bg-gradient-to-t ${i === bars.length - 1 ? 'from-pink-500 to-purple-400' : 'from-indigo-600 to-indigo-400'} opacity-80 hover:opacity-100 transition-opacity`} />
          ))}
        </div>
      </div>
    </div>
  )
}

const tabViews = { kanban: KanbanView, table: TableView, calendar: CalendarView, analytics: AnalyticsView }

function FeatureTabs() {
  const [active, setActive] = useState('kanban')
  const ActiveView = tabViews[active]
  return (
    <section id="views" className="relative py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Live Demo"
          title={<>See it in <span className="gradient-text">action</span></>}
          subtitle="Switch between views in real time. Every tab is a fully interactive preview of the actual app experience."
        />
        <div className="flex justify-center mt-10">
          <div className="inline-flex flex-wrap justify-center gap-1 p-1.5 rounded-2xl glass-strong">
            {tabDefs.map((t) => (
              <button key={t.id} onClick={() => setActive(t.id)} className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${active === t.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
                {active === t.id && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
                <t.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10 hidden sm:inline">{t.label}</span>
                <span className="relative z-10 sm:hidden">{t.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative mt-8">
          <div className="absolute -inset-3 -z-10 bg-gradient-to-r from-indigo-600/15 via-purple-600/15 to-pink-600/15 rounded-3xl blur-2xl" />
          <div className="rounded-2xl overflow-hidden glass-strong shadow-2xl shadow-purple-900/20">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 text-center text-xs text-slate-500">{tabDefs.find((t) => t.id === active)?.label}</div>
              <MoreHorizontal className="w-4 h-4 text-slate-500" />
            </div>
            <div className="h-[360px] sm:h-[420px] bg-white/[0.01]">
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="h-full">
                  <ActiveView />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        <p className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500">
          <ChevronRight className="w-4 h-4 text-purple-400" />
          Click any tab above to switch views instantly
        </p>
      </div>
    </section>
  )
}

/* ============================================================ TechStack */
const stackData = [
  { name: 'React', desc: 'Functional components & hooks', icon: Atom, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20', border: 'hover:border-cyan-500/30' },
  { name: 'Tailwind CSS', desc: 'Utility-first responsive styling', icon: Wind, color: 'text-teal-400', bg: 'from-teal-500/20 to-emerald-500/20', border: 'hover:border-teal-500/30' },
  { name: 'Redux Toolkit', desc: 'Predictable state management', icon: Boxes, color: 'text-purple-400', bg: 'from-purple-500/20 to-indigo-500/20', border: 'hover:border-purple-500/30' },
  { name: 'LocalStorage', desc: 'Offline-first data persistence', icon: Database, color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/20', border: 'hover:border-amber-500/30' },
  { name: 'Framer Motion', desc: 'Buttery-smooth animations', icon: Cpu, color: 'text-pink-400', bg: 'from-pink-500/20 to-rose-500/20', border: 'hover:border-pink-500/30' },
  { name: 'Lucide Icons', desc: 'Clean, consistent icon system', icon: GitBranch, color: 'text-indigo-400', bg: 'from-indigo-500/20 to-blue-500/20', border: 'hover:border-indigo-500/30' },
]

function TechStack() {
  return (
    <section id="workflow" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Built With"
          title={<>A modern stack, <span className="gradient-text">built to last</span></>}
          subtitle="Crafted with industry-leading tools for performance, maintainability, and developer experience."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-14">
          {stackData.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }} className={`group p-4 rounded-2xl glass hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1 border border-white/10 ${s.border}`}>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${s.bg} mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{s.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================ CTA */
function CTA() {
  return (
    <section id="collaboration" className="relative py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12 md:p-16 text-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -z-10" />
          <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl text-balance">
            Ready to supercharge your <span className="gradient-text-animated">workspace?</span>
          </motion.h2>
          <p className="max-w-xl mx-auto mt-4 text-base text-slate-400 sm:text-lg text-balance">
            Join the movement of teams building faster, smarter, and fully offline. Launch your first workspace in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a href="#views" className="group inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all hover:scale-105 animate-pulse-glow">
              <Zap className="w-5 h-5" />
              Launch Workspace
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#features" className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-2xl glass hover:bg-white/10 transition-all hover:scale-105">
              View Features
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================ Footer */
const footerNav = {
  Product: ['Features', 'Views', 'Collaboration', 'Workflow'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Community', 'Status'],
}

const footerSocials = [
//   { icon: Github, href: '#' },
//   { icon: Twitter, href: '#' },
//   { icon: Linkedin, href: '#' },
]

function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">WorkFlow Pro</span>
            </a>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              The all-in-one local-first workspace tool. Manage projects at the speed of thought.
            </p>
            <div className="flex gap-3 mt-5">
              {footerSocials.map((s, i) => (
                <a key={i} href={s.href} className="p-2 rounded-lg glass text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerNav).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().split(' ')[0]}`} className="text-sm text-slate-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-slate-500">© 2026 WorkFlow Pro. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            Built with <Heart className="w-3 h-3 text-pink-500 fill-pink-500/30" /> for modern teams
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ============================================================ App */
function LandingPag() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-ink-950 text-white overflow-x-hidden">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <FeatureTabs />
          <TechStack />
          <CTA />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
};

export default LandingPag;
