import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  Settings as SettingsIcon,
  Workflow,
  X,
  Sparkles,
  Bell,
  Check,
  AtSign,
  CalendarClock,
  UserPlus,
  Search,
  Menu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ChevronRight,
  ListTodo,
  CalendarDays,
  List,
  Filter,
  Circle,
  Trash2,
  Send,
  Paperclip,
  MessageSquare,
  ListChecks,
  FileText,
  Calendar,
  ChevronDown,
  ArrowRight,
  User,
  Download,
  Wifi,
  WifiOff,
  Save,
  AlertCircle,
  Info,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

const priorityStyles = {
  low: { label: 'Low', badge: 'bg-slate-700/60 text-slate-300 border-slate-600/50', dot: 'bg-slate-400' },
  medium: { label: 'Medium', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30', dot: 'bg-sky-400' },
  high: { label: 'High', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  urgent: { label: 'Urgent', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' },
};

const statusConfig = {
  todo: { label: 'To Do', color: 'text-slate-400', border: 'border-slate-600/50' },
  'in-progress': { label: 'In Progress', color: 'text-sky-400', border: 'border-sky-500/40' },
  review: { label: 'In Review', color: 'text-amber-400', border: 'border-amber-500/40' },
  done: { label: 'Done', color: 'text-emerald-400', border: 'border-emerald-500/40' },
};

const statusOrder = ['todo', 'in-progress', 'review', 'done'];

function formatDate(dateStr) {
  if (!dateStr) return 'No due date';
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 0 && diff <= 7) return `In ${diff} days`;
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'done') return false;
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

function initialsToColor(avatar) {
  const colors = [
    'from-indigo-500 to-violet-500',
    'from-sky-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
  ];
  const hash = avatar.charCodeAt(0) + (avatar.charCodeAt(1) || 0);
  return colors[hash % colors.length];
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════ */

const CURRENT_USER_ID = 'u1';

const initialUsers = [
  { id: 'u1', name: 'Alex Morgan', email: 'alex.morgan@workflow.pro', avatar: 'AM', role: 'Member' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah.chen@workflow.pro', avatar: 'SC', role: 'Member' },
  { id: 'u3', name: 'Marcus Reed', email: 'marcus.reed@workflow.pro', avatar: 'MR', role: 'Member' },
  { id: 'u4', name: 'Priya Patel', email: 'priya.patel@workflow.pro', avatar: 'PP', role: 'Viewer' },
];

const initialProjects = [
  { id: 'p1', name: 'Atlas Mobile App', color: 'indigo', description: 'Cross-platform mobile redesign' },
  { id: 'p2', name: 'Nimbus Cloud Platform', color: 'sky', description: 'Backend infrastructure overhaul' },
  { id: 'p3', name: 'Orbit Marketing Site', color: 'emerald', description: 'Public website refresh' },
];

const _today = new Date();
const dayOffset = (n) => {
  const d = new Date(_today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const initialTasks = [
  {
    id: 't101', title: 'Implement onboarding flow',
    description: 'Build the 4-step onboarding wizard with progress indicators and skip option.',
    status: 'in-progress', priority: 'high', labels: ['frontend', 'mobile'],
    assigneeId: 'u1', projectId: 'p1', dueDate: dayOffset(2),
    subtasks: [
      { id: 's1', title: 'Design wireframes', completed: true },
      { id: 's2', title: 'Build step 1 UI', completed: true },
      { id: 's3', title: 'Wire up navigation', completed: false },
      { id: 's4', title: 'Add analytics events', completed: false },
    ],
    comments: [
      { id: 'c1', authorId: 'u2', authorName: 'Sarah Chen', authorAvatar: 'SC', text: 'Can you add a progress bar to the top? @Alex', createdAt: dayOffset(-1) },
      { id: 'c2', authorId: 'u3', authorName: 'Marcus Reed', authorAvatar: 'MR', text: 'The skip button should confirm before exiting.', createdAt: dayOffset(0) },
    ],
    attachments: [], createdAt: dayOffset(-5),
  },
  {
    id: 't102', title: 'Fix login redirect bug',
    description: 'Users are being redirected to the wrong page after OAuth login on mobile.',
    status: 'todo', priority: 'urgent', labels: ['bug', 'auth'],
    assigneeId: 'u1', projectId: 'p1', dueDate: dayOffset(1),
    subtasks: [
      { id: 's5', title: 'Reproduce on iOS Safari', completed: false },
      { id: 's6', title: 'Fix redirect logic', completed: false },
    ],
    comments: [], attachments: [], createdAt: dayOffset(-2),
  },
  {
    id: 't103', title: 'Design dashboard analytics cards',
    description: 'Create mockups for the new analytics dashboard showing weekly metrics.',
    status: 'review', priority: 'medium', labels: ['design', 'frontend'],
    assigneeId: 'u1', projectId: 'p1', dueDate: dayOffset(4),
    subtasks: [
      { id: 's7', title: 'Research card patterns', completed: true },
      { id: 's8', title: 'Create 3 variants', completed: true },
    ],
    comments: [
      { id: 'c3', authorId: 'u2', authorName: 'Sarah Chen', authorAvatar: 'SC', text: 'Love the second variant! Let\'s go with that one.', createdAt: dayOffset(0) },
    ],
    attachments: [], createdAt: dayOffset(-7),
  },
  {
    id: 't104', title: 'Write API documentation',
    description: 'Document all public REST endpoints for the Nimbus platform v2.',
    status: 'in-progress', priority: 'low', labels: ['docs', 'backend'],
    assigneeId: 'u1', projectId: 'p2', dueDate: dayOffset(6),
    subtasks: [
      { id: 's9', title: 'Outline endpoints', completed: true },
      { id: 's10', title: 'Write auth section', completed: false },
      { id: 's11', title: 'Write webhooks section', completed: false },
    ],
    comments: [], attachments: [], createdAt: dayOffset(-3),
  },
  {
    id: 't105', title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    status: 'done', priority: 'high', labels: ['devops', 'backend'],
    assigneeId: 'u1', projectId: 'p2', dueDate: dayOffset(-1),
    subtasks: [
      { id: 's12', title: 'Add test job', completed: true },
      { id: 's13', title: 'Add deploy job', completed: true },
    ],
    comments: [], attachments: [], createdAt: dayOffset(-10),
  },
  {
    id: 't106', title: 'Refresh hero section copy',
    description: 'Update the marketing site hero with new messaging from the brand team.',
    status: 'todo', priority: 'medium', labels: ['content', 'frontend'],
    assigneeId: 'u1', projectId: 'p3', dueDate: dayOffset(3),
    subtasks: [], comments: [], attachments: [], createdAt: dayOffset(-1),
  },
  {
    id: 't107', title: 'Optimize images for web',
    description: 'Compress and convert all marketing site images to WebP format.',
    status: 'in-progress', priority: 'low', labels: ['performance', 'frontend'],
    assigneeId: 'u1', projectId: 'p3', dueDate: dayOffset(5),
    subtasks: [
      { id: 's14', title: 'Audit current images', completed: true },
      { id: 's15', title: 'Run compression script', completed: false },
    ],
    comments: [], attachments: [], createdAt: dayOffset(-4),
  },
  {
    id: 't108', title: 'User testing session notes',
    description: 'Compile findings from last week\'s usability testing into a summary report.',
    status: 'review', priority: 'medium', labels: ['research'],
    assigneeId: 'u2', projectId: 'p1', dueDate: dayOffset(2),
    subtasks: [],
    comments: [
      { id: 'c4', authorId: 'u2', authorName: 'Sarah Chen', authorAvatar: 'SC', text: '@Alex can you review these before the meeting?', createdAt: dayOffset(0) },
    ],
    attachments: [], createdAt: dayOffset(-2),
  },
  {
    id: 't109', title: 'Database migration plan',
    description: 'Plan the zero-downtime migration from v1 to v2 schema.',
    status: 'todo', priority: 'urgent', labels: ['backend', 'devops'],
    assigneeId: 'u3', projectId: 'p2', dueDate: dayOffset(0),
    subtasks: [], comments: [], attachments: [], createdAt: dayOffset(-1),
  },
];

const initialNotifications = [
  { id: 'n1', type: 'mention', text: 'Sarah Chen mentioned you in "User testing session notes"', taskId: 't108', read: false, createdAt: dayOffset(0) },
  { id: 'n2', type: 'assignment', text: 'You were assigned to "Refresh hero section copy"', taskId: 't106', read: false, createdAt: dayOffset(-1) },
  { id: 'n3', type: 'due-date', text: '"Fix login redirect bug" is due tomorrow', taskId: 't102', read: true, createdAt: dayOffset(-1) },
];

const initialProfile = {
  name: 'Alex Morgan', email: 'alex.morgan@workflow.pro', avatar: 'AM', defaultView: 'kanban',
};

const simulatedNotificationPool = [
  { type: 'mention', text: 'Sarah Chen mentioned you in Task #104', taskId: 't104' },
  { type: 'mention', text: 'Marcus Reed mentioned you in "Onboarding flow"', taskId: 't101' },
  { type: 'assignment', text: 'Priya Patel assigned you to a new task', taskId: 't107' },
  { type: 'due-date', text: '"Write API documentation" is due in 6 days', taskId: 't104' },
  { type: 'mention', text: 'Sarah Chen commented on "Analytics cards"', taskId: 't103' },
];

/* ═══════════════════════════════════════════════════════════════
   useLocalStorage HOOK
   ═══════════════════════════════════════════════════════════════ */

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* noop */ }
  }, [key, state]);
  const set = useCallback((value) => {
    setState((prev) => (typeof value === 'function' ? value(prev) : value));
  }, []);
  return [state, set];
}

/* ═══════════════════════════════════════════════════════════════
   APP CONTEXT
   ═══════════════════════════════════════════════════════════════ */

const AppContext = createContext(null);

let idCounter = 1000;
const genId = (prefix) => `${prefix}${Date.now()}_${idCounter++}`;

function AppProvider({ children }) {
  const [users] = useState(initialUsers);
  const [role, setRole] = useLocalStorage('wfp_role', initialUsers[0].role);
  const [tasks, setTasks] = useLocalStorage('wfp_tasks', initialTasks);
  const [projects] = useLocalStorage('wfp_projects', initialProjects);
  const [notifications, setNotifications] = useLocalStorage('wfp_notifications', initialNotifications);
  const [profile, setProfile] = useLocalStorage('wfp_profile', initialProfile);
  const [toasts, setToasts] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const currentUser = { ...users[0], role, name: profile.name, email: profile.email, avatar: profile.avatar };

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const pool = simulatedNotificationPool;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const newNotif = { ...pick, id: genId('n'), read: false, createdAt: new Date().toISOString() };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 30));
      setToasts((prev) => [...prev, { id: genId('toast'), message: newNotif.text, type: 'info' }]);
    }, 45000);
    return () => clearInterval(interval);
  }, [setNotifications]);

  const pushToast = useCallback((message, type = 'info') => {
    setToasts((prev) => [...prev, { id: genId('toast'), message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const isReadOnly = role === 'Viewer';

  const guard = useCallback((action, successMsg) => {
    if (isReadOnly) {
      pushToast('Access Denied — Read-Only Mode. Switch to Member role to make changes.', 'error');
      return false;
    }
    action();
    if (successMsg) pushToast(successMsg, 'success');
    return true;
  }, [isReadOnly, pushToast]);

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    pushToast('Profile updated successfully.', 'success');
  }, [setProfile, pushToast]);

  const addTask = useCallback((task) => {
    guard(() => {
      const newTask = {
        id: genId('t'), title: task.title || 'Untitled task', description: task.description || '',
        status: task.status || 'todo', priority: task.priority || 'medium', labels: task.labels || [],
        assigneeId: task.assigneeId || CURRENT_USER_ID, projectId: task.projectId || projects[0]?.id || 'p1',
        dueDate: task.dueDate || null, subtasks: [], comments: [], attachments: [],
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }, 'Task created.');
  }, [guard, projects, setTasks]);

  const updateTask = useCallback((id, updates) => {
    guard(() => { setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t))); });
  }, [guard, setTasks]);

  const deleteTask = useCallback((id) => {
    guard(() => { setTasks((prev) => prev.filter((t) => t.id !== id)); }, 'Task deleted.');
  }, [guard, setTasks]);

  const toggleSubtask = useCallback((taskId, subtaskId) => {
    guard(() => {
      setTasks((prev) => prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)) } : t
      ));
    });
  }, [guard, setTasks]);

  const addSubtask = useCallback((taskId, title) => {
    guard(() => {
      const newSubtask = { id: genId('s'), title, completed: false };
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSubtask] } : t)));
    });
  }, [guard, setTasks]);

  const addComment = useCallback((taskId, text) => {
    guard(() => {
      const newComment = {
        id: genId('c'), authorId: CURRENT_USER_ID, authorName: currentUser.name,
        authorAvatar: currentUser.avatar, text, createdAt: new Date().toISOString(),
      };
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t)));
    });
  }, [guard, setTasks, currentUser]);

  const addAttachment = useCallback((taskId, attachment) => {
    guard(() => { setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, attachments: [...t.attachments, attachment] } : t))); });
  }, [guard, setTasks]);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [setNotifications]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setNotifications]);

  const exportData = useCallback(() => {
    const data = { tasks, projects, notifications, profile, role };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'workflow-pro-my-data.json'; a.click();
    URL.revokeObjectURL(url);
    pushToast('Your data has been exported.', 'success');
  }, [tasks, projects, notifications, profile, role, pushToast]);

  const value = {
    users, currentUser, role, tasks, projects, notifications, profile, toasts, isOnline,
    setRole, updateProfile, addTask, updateTask, deleteTask, toggleSubtask, addSubtask,
    addComment, addAttachment, markNotificationRead, markAllNotificationsRead,
    pushToast, dismissToast, exportData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/* ═══════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Avatar({ initials, size = 'md', className = '' }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };
  const gradient = initialsToColor(initials);
  return (
    <div className={`${sizes[size]} ${className} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-semibold text-white shrink-0 ring-2 ring-white/10`}>
      {initials}
    </div>
  );
}

function Modal({ isOpen, onClose, children, title, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-black/50 animate-scale-in`}>
        {title && (
          <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4 sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X className="h-5 w-5" /></button>
          </div>
        )}
        {!title && (
          <button onClick={onClose} className="absolute top-4 right-4 z-20 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X className="h-5 w-5" /></button>
        )}
        {children}
      </div>
    </div>
  );
}

function DropdownSelect({ value, options, onChange, className = '', renderLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 rounded-lg hover:bg-slate-800/60 px-2 py-1 transition-colors">
        {renderLabel(value)}
        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 min-w-[140px] rounded-lg border border-slate-700/60 bg-slate-900 shadow-xl py-1 animate-fade-in">
          {options.map((opt) => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-800 transition-colors ${opt.value === value ? 'text-white bg-slate-800/50' : 'text-slate-400'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PrioritySelect({ value, onChange }) {
  const opts = [
    { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' },
  ];
  return (
    <DropdownSelect value={value} options={opts} onChange={onChange}
      renderLabel={(v) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${priorityStyles[v].badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${priorityStyles[v].dot}`} />{priorityStyles[v].label}
        </span>
      )}
    />
  );
}

function StatusSelect({ value, onChange }) {
  const opts = statusOrder.map((s) => ({ value: s, label: statusConfig[s].label }));
  return (
    <DropdownSelect value={value} options={opts} onChange={onChange}
      renderLabel={(v) => <span className={`text-sm font-medium ${statusConfig[v].color}`}>{statusConfig[v].label}</span>}
    />
  );
}

function ToastContainer() {
  const { toasts, dismissToast } = useApp();
  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => dismissToast(t.id), 5000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
        const accent = toast.type === 'success' ? 'border-emerald-500/40 text-emerald-400' : toast.type === 'error' ? 'border-rose-500/40 text-rose-400' : 'border-indigo-500/40 text-indigo-400';
        return (
          <div key={toast.id} className={`flex items-start gap-3 rounded-xl border ${accent} bg-slate-900/95 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/50 animate-slide-in-right`}>
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-200 flex-1 leading-relaxed">{toast.message}</p>
            <button onClick={() => dismissToast(toast.id)} className="text-slate-500 hover:text-slate-300 transition-colors"><X className="h-4 w-4" /></button>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════ */

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workspace', label: 'Workspace', icon: KanbanSquare },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function Sidebar({ activeTab, onTabChange, isMobileOpen, onMobileClose, unreadCount }) {
  const { currentUser, role, setRole, tasks } = useApp();
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);
  const pendingCount = myTasks.filter((t) => t.status !== 'done').length;

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 border-r border-slate-800/60 bg-slate-900/60 backdrop-blur-2xl transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                <Workflow className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">WorkFlow Pro</h1>
                <p className="text-xs text-slate-500">Member Workspace</p>
              </div>
            </div>
            <button onClick={onMobileClose} className="lg:hidden text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => { onTabChange(item.id); onMobileClose(); }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'}`}>
                  <Icon className={`h-5 w-5 transition-colors ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.label}
                  {item.id === 'workspace' && pendingCount > 0 && <span className="ml-auto rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">{pendingCount}</span>}
                  {item.id === 'dashboard' && unreadCount > 0 && <span className="ml-auto flex h-2 w-2 rounded-full bg-rose-400" />}
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-slate-800/60">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">Active Role</p>
            <div className="flex gap-1.5 rounded-xl bg-slate-800/50 p-1">
              {['Member', 'Viewer'].map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${role === r ? (r === 'Member' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-700/60 text-slate-300 border border-slate-600/40') : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}>
                  {r === 'Member' && <Sparkles className="inline h-3 w-3 mr-1" />}{r}
                </button>
              ))}
            </div>
            {role === 'Viewer' && <p className="mt-2 text-xs text-amber-400/80 px-1">Read-Only mode active</p>}
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-800/30 p-3">
              <Avatar initials={currentUser.avatar} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════════ */

const notifIcons = { assignment: UserPlus, mention: AtSign, 'due-date': CalendarClock };
const notifColors = { assignment: 'text-sky-400 bg-sky-500/10', mention: 'text-indigo-400 bg-indigo-500/10', 'due-date': 'text-amber-400 bg-amber-500/10' };

function Header({ onOpenCommand, onOpenMobileSidebar, onTaskClick }) {
  const { notifications, markNotificationRead, markAllNotificationsRead, isOnline } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const handleClick = (n) => {
    if (!n.read) markNotificationRead(n.id);
    if (n.taskId) { onTaskClick(n.taskId); setNotifOpen(false); }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 py-3.5">
      <button onClick={onOpenMobileSidebar} className="lg:hidden text-slate-400 hover:text-white"><Menu className="h-5 w-5" /></button>
      <button onClick={onOpenCommand} className="group flex flex-1 max-w-md items-center gap-2.5 rounded-xl border border-slate-700/50 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-500 hover:border-slate-600/60 hover:bg-slate-800/60 transition-all">
        <Search className="h-4 w-4 text-slate-500 group-hover:text-slate-400" />
        <span className="flex-1 text-left">Search tasks, projects…</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-700/50 bg-slate-800/60 px-1.5 py-0.5 text-xs text-slate-500 font-mono">⌘K</kbd>
      </button>
      <div className="flex items-center gap-2 ml-auto">
        <div className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${isOnline ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </div>
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen((o) => !o)} className="relative rounded-lg border border-slate-700/50 bg-slate-900/60 p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
            <Bell className="h-4 w-4" />
            {unread > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-950">{unread}</span>}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-black/50 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {unread > 0 && <button onClick={markAllNotificationsRead} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"><Check className="h-3.5 w-3.5" />Mark all read</button>}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet</div>
                ) : (
                  notifications.map((n) => {
                    const Icon = notifIcons[n.type];
                    return (
                      <button key={n.id} onClick={() => handleClick(n)} className={`flex w-full items-start gap-3 border-b border-slate-800/40 px-4 py-3 text-left hover:bg-slate-800/40 transition-colors ${!n.read ? 'bg-indigo-500/5' : ''}`}>
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notifColors[n.type]}`}><Icon className="h-4 w-4" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-200 leading-snug">{n.text}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD VIEW
   ═══════════════════════════════════════════════════════════════ */

function Dashboard({ onTaskClick, onQuickAdd, onGoToWorkspace }) {
  const { currentUser, tasks, projects, role } = useApp();
  const myTasks = useMemo(() => tasks.filter((t) => t.assigneeId === currentUser.id), [tasks, currentUser.id]);
  const pending = myTasks.filter((t) => t.status !== 'done');
  const completedToday = myTasks.filter((t) => {
    if (t.status !== 'done') return false;
    return daysUntil(t.dueDate) !== null ? Math.abs(daysUntil(t.dueDate)) <= 1 : false;
  });
  const dueSoon = pending.filter((t) => { const d = daysUntil(t.dueDate); return d !== null && d >= 0 && d <= 7; }).sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));

  const stats = [
    { label: 'Pending Tasks', value: pending.length, icon: ListTodo, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { label: 'Completed Today', value: completedToday.length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Due Soon', value: dueSoon.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  ];

  const greeting = (() => { const h = new Date().getHours(); if (h < 12) return 'Good morning'; if (h < 18) return 'Good afternoon'; return 'Good evening'; })();

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar initials={currentUser.avatar} size="lg" className="h-16 w-16 text-xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-white tracking-tight">{greeting}, {currentUser.name.split(' ')[0]}</h1>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${role === 'Member' ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300' : 'border-slate-600/40 bg-slate-700/40 text-slate-300'}`}>{role}</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">You have <span className="text-indigo-300 font-medium">{pending.length} tasks</span> in progress across <span className="text-indigo-300 font-medium">{new Set(myTasks.map((t) => t.projectId)).size} projects</span>.</p>
          </div>
          <button onClick={onQuickAdd} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all">
            <Plus className="h-4 w-4" />Quick Add Task
          </button>
        </div>
        <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.map((stat) => { const Icon = stat.icon; return (
            <div key={stat.label} className={`flex items-center gap-3 rounded-xl border ${stat.border} ${stat.bg} px-4 py-3`}>
              <Icon className={`h-5 w-5 ${stat.color}`} />
              <div><p className="text-xl font-bold text-white">{stat.value}</p><p className="text-xs text-slate-400">{stat.label}</p></div>
            </div>
          ); })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
            <h2 className="text-base font-semibold text-white">Assigned to Me</h2>
            <button onClick={onGoToWorkspace} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all <ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
          <div className="divide-y divide-slate-800/40">
            {pending.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">All caught up! No pending tasks.</div>
            ) : (
              pending.slice(0, 6).map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const overdue = isOverdue(task.dueDate, task.status);
                const completedSubs = task.subtasks.filter((s) => s.completed).length;
                const p = priorityStyles[task.priority];
                return (
                  <button key={task.id} onClick={() => onTaskClick(task.id)} className="group flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-800/30 transition-colors">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${p.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {project && <span className="text-xs text-slate-500">{project.name}</span>}
                        {task.subtasks.length > 0 && <span className="text-xs text-slate-600">· {completedSubs}/{task.subtasks.length} subtasks</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {task.labels.slice(0, 1).map((label) => <span key={label} className="hidden sm:inline rounded-md bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400">{label}</span>)}
                      <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-rose-400' : 'text-slate-500'}`}>{overdue && <AlertTriangle className="h-3 w-3" />}{formatDate(task.dueDate)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800/60">
            <CalendarDays className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Due This Week</h2>
          </div>
          <div className="p-4">
            {dueSoon.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">Nothing due this week.</div>
            ) : (
              <div className="relative space-y-0">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-800" />
                {dueSoon.map((task) => {
                  const d = daysUntil(task.dueDate);
                  const overdue = isOverdue(task.dueDate, task.status);
                  return (
                    <button key={task.id} onClick={() => onTaskClick(task.id)} className="group relative flex w-full items-start gap-3 py-2.5 text-left hover:bg-slate-800/30 rounded-lg px-1 -mx-1 transition-colors">
                      <div className={`relative z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${overdue ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/20' : 'bg-slate-800 text-slate-400 ring-2 ring-slate-900'}`}>{d === 0 ? '!' : d}</div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">{task.title}</p>
                        <p className={`text-xs ${overdue ? 'text-rose-400' : 'text-slate-500'}`}>{formatDate(task.dueDate)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WORKSPACE VIEW
   ═══════════════════════════════════════════════════════════════ */

function FilterChip({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-slate-700/50 bg-slate-800/60 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500/50 focus:outline-none cursor-pointer">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function StatusSelectInline({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className={`flex items-center gap-1 text-sm font-medium ${statusConfig[value].color} hover:opacity-80`}>{statusConfig[value].label}</button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-30 min-w-[130px] rounded-lg border border-slate-700/60 bg-slate-900 shadow-xl py-1 animate-fade-in">
            {statusOrder.map((s) => (
              <button key={s} onClick={() => { onChange(s); setOpen(false); }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-800 transition-colors ${s === value ? statusConfig[s].color + ' bg-slate-800/50' : 'text-slate-400'}`}>{statusConfig[s].label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function KanbanView({ tasks, onTaskClick }) {
  const { projects } = useApp();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {statusOrder.map((status) => {
        const colTasks = tasks.filter((t) => t.status === status);
        const cfg = statusConfig[status];
        return (
          <div key={status} className={`flex flex-col rounded-xl border ${cfg.border} bg-slate-900/40 min-h-[200px]`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
                <h3 className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</h3>
              </div>
              <span className="text-xs text-slate-500">{colTasks.length}</span>
            </div>
            <div className="flex flex-col gap-2.5 p-3 flex-1">
              {colTasks.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-8 text-xs text-slate-600">No tasks</div>
              ) : (
                colTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  const p = priorityStyles[task.priority];
                  const completedSubs = task.subtasks.filter((s) => s.completed).length;
                  const overdue = isOverdue(task.dueDate, task.status);
                  return (
                    <button key={task.id} onClick={() => onTaskClick(task.id)} className="group rounded-lg border border-slate-700/40 bg-slate-800/40 p-3.5 text-left hover:border-indigo-500/30 hover:bg-slate-800/70 transition-all hover:shadow-lg hover:shadow-indigo-500/5">
                      <div className="flex items-start gap-2">
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${p.dot}`} />
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors flex-1">{task.title}</p>
                      </div>
                      {task.description && <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 ml-4">{task.description}</p>}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 ml-4">
                        {task.labels.slice(0, 2).map((l) => <span key={l} className="rounded-md bg-slate-700/40 px-1.5 py-0.5 text-[10px] text-slate-400">{l}</span>)}
                        {project && <span className="text-[10px] text-slate-500">· {project.name}</span>}
                      </div>
                      <div className="mt-2.5 flex items-center justify-between ml-4">
                        <span className={`text-xs ${overdue ? 'text-rose-400' : 'text-slate-500'}`}>{formatDate(task.dueDate)}</span>
                        {task.subtasks.length > 0 && <span className="text-xs text-slate-500">{completedSubs}/{task.subtasks.length}</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ tasks, onTaskClick }) {
  const { projects, updateTask, role } = useApp();
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/40">
      <div className="hidden md:grid grid-cols-[1fr_120px_100px_120px_120px] gap-3 px-4 py-2.5 border-b border-slate-800/60 text-xs font-medium text-slate-500 uppercase tracking-wider">
        <span>Task</span><span>Project</span><span>Priority</span><span>Status</span><span>Due Date</span>
      </div>
      <div className="divide-y divide-slate-800/40">
        {tasks.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-500">No tasks match your filters.</div>
        ) : (
          tasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const p = priorityStyles[task.priority];
            const overdue = isOverdue(task.dueDate, task.status);
            const cfg = statusConfig[task.status];
            return (
              <div key={task.id} className="group grid grid-cols-1 md:grid-cols-[1fr_120px_100px_120px_120px] gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors items-center">
                <button onClick={() => onTaskClick(task.id)} className="flex items-center gap-2.5 text-left min-w-0">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${p.dot}`} />
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white truncate transition-colors">{task.title}</span>
                  {task.subtasks.length > 0 && <span className="hidden sm:inline text-xs text-slate-600">({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})</span>}
                </button>
                <span className="text-xs text-slate-500 truncate">{project?.name || '—'}</span>
                <div className="md:py-0.5">
                  {role !== 'Viewer' ? <PrioritySelect value={task.priority} onChange={(v) => updateTask(task.id, { priority: v })} /> : (
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${p.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />{p.label}</span>
                  )}
                </div>
                <div className="md:py-0.5">
                  {role !== 'Viewer' ? <StatusSelectInline value={task.status} onChange={(v) => updateTask(task.id, { status: v })} /> : <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>}
                </div>
                <span className={`text-xs ${overdue ? 'text-rose-400 font-medium' : 'text-slate-500'}`}>{formatDate(task.dueDate)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function CalendarView({ tasks, onTaskClick }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const tasksByDay = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate + 'T00:00:00');
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day).push(t);
      }
    });
    return map;
  }, [tasks, month, year]);

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/60">
        <h3 className="text-base font-semibold text-white">{monthName}</h3>
        <span className="text-xs text-slate-500">Tasks with due dates shown</span>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-800/40">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="px-2 py-2 text-center text-xs font-medium text-slate-500 uppercase">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const dayTasks = day ? tasksByDay.get(day) || [] : [];
          const isToday = day === today.getDate();
          return (
            <div key={i} className={`min-h-[80px] sm:min-h-[110px] border-b border-r border-slate-800/30 p-1.5 ${day ? 'bg-slate-900/20' : 'bg-slate-950/30'}`}>
              {day && (
                <>
                  <div className={`mb-1 text-xs font-medium ${isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white' : 'text-slate-500'}`}>{day}</div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((t) => {
                      const p = priorityStyles[t.priority];
                      return (
                        <button key={t.id} onClick={() => onTaskClick(t.id)} className="block w-full truncate rounded-md border border-slate-700/40 bg-slate-800/50 px-1.5 py-1 text-left text-xs text-slate-300 hover:border-indigo-500/30 hover:bg-slate-800 transition-colors">
                          <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${p.dot}`} />{t.title}
                        </button>
                      );
                    })}
                    {dayTasks.length > 3 && <span className="text-[10px] text-slate-500 px-1.5">+{dayTasks.length - 3} more</span>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Workspace({ onTaskClick, onQuickAdd }) {
  const { tasks, projects, profile, role } = useApp();
  const [view, setView] = useState(profile.defaultView);
  const [selectedProject, setSelectedProject] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [labelFilter, setLabelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const allLabels = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => t.labels.forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedProject !== 'all' && t.projectId !== selectedProject) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (labelFilter !== 'all' && !t.labels.includes(labelFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const inSubtasks = t.subtasks.some((s) => s.title.toLowerCase().includes(q));
        if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q) && !inSubtasks) return false;
      }
      return true;
    });
  }, [tasks, selectedProject, priorityFilter, statusFilter, labelFilter, search]);

  const activeFilters = (priorityFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (labelFilter !== 'all' ? 1 : 0);
  const clearFilters = () => { setPriorityFilter('all'); setStatusFilter('all'); setLabelFilter('all'); setSearch(''); };
  const views = [
    { id: 'kanban', label: 'Board', icon: KanbanSquare }, { id: 'list', label: 'List', icon: List }, { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500/50 focus:outline-none cursor-pointer">
            <option value="all">All Projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex gap-1 rounded-lg border border-slate-700/50 bg-slate-900/60 p-1">
            {views.map((v) => { const Icon = v.icon; const active = view === v.id; return (
              <button key={v.id} onClick={() => setView(v.id)} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${active ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-200'}`}>
                <Icon className="h-4 w-4" /><span className="hidden sm:inline">{v.label}</span>
              </button>
            ); })}
          </div>
          <div className="flex flex-1 min-w-[180px] items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by name…" className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none" />
            {search && <button onClick={() => setSearch('')} className="text-slate-500 hover:text-slate-300"><X className="h-3.5 w-3.5" /></button>}
          </div>
          <button onClick={() => setShowFilters((s) => !s)} className={`relative flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${showFilters || activeFilters > 0 ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' : 'border-slate-700/50 bg-slate-900/60 text-slate-400 hover:text-slate-200'}`}>
            <Filter className="h-4 w-4" /><span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">{activeFilters}</span>}
          </button>
          <button onClick={onQuickAdd} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all">
            <Plus className="h-4 w-4" /><span className="hidden sm:inline">New Task</span>
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 animate-fade-in">
            <FilterChip label="Priority" value={priorityFilter} onChange={(v) => setPriorityFilter(v)} options={[['all', 'All'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['urgent', 'Urgent']]} />
            <FilterChip label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v)} options={[['all', 'All'], ...statusOrder.map((s) => [s, statusConfig[s].label])]} />
            <FilterChip label="Label" value={labelFilter} onChange={setLabelFilter} options={[['all', 'All'], ...allLabels.map((l) => [l, l])]} />
            {activeFilters > 0 && <button onClick={clearFilters} className="text-xs text-rose-400 hover:text-rose-300 transition-colors ml-auto">Clear all</button>}
          </div>
        )}
      </div>

      {role === 'Viewer' && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
          <span className="flex h-2 w-2 rounded-full bg-amber-400" />Read-Only Mode — You can browse all tasks but cannot create, edit, or delete.
        </div>
      )}

      {view === 'kanban' && <KanbanView tasks={filtered} onTaskClick={onTaskClick} />}
      {view === 'list' && <ListView tasks={filtered} onTaskClick={onTaskClick} />}
      {view === 'calendar' && <CalendarView tasks={filtered} onTaskClick={onTaskClick} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TASK MODAL
   ═══════════════════════════════════════════════════════════════ */

function renderMentions(text) {
  const parts = text.split(/(@\w+\s\w+)/g);
  return parts.map((part, i) => part.startsWith('@') ? <span key={i} className="text-indigo-400 font-medium">{part}</span> : <span key={i}>{part}</span>);
}

function TaskModal({ taskId, onClose }) {
  const { tasks, projects, users, currentUser, role, updateTask, deleteTask, toggleSubtask, addSubtask, addComment, addAttachment } = useApp();
  const task = tasks.find((t) => t.id === taskId) || null;
  const isReadOnly = role === 'Viewer';

  const [newSubtask, setNewSubtask] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [activeMentionIdx, setActiveMentionIdx] = useState(0);
  const commentRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { setNewSubtask(''); setCommentText(''); setShowMentions(false); }, [taskId]);

  const handleAddSubtask = () => { if (!newSubtask.trim() || !task) return; addSubtask(task.id, newSubtask.trim()); setNewSubtask(''); };

  const handleCommentChange = (e) => {
    const val = e.target.value;
    setCommentText(val);
    const cursor = e.target.selectionStart;
    const before = val.slice(0, cursor);
    const atMatch = before.lastIndexOf('@');
    if (atMatch !== -1 && (atMatch === 0 || before[atMatch - 1] === ' ')) {
      const query = before.slice(atMatch + 1);
      if (!query.includes(' ')) { setShowMentions(true); setMentionQuery(query); setMentionStart(atMatch); setActiveMentionIdx(0); return; }
    }
    setShowMentions(false);
  };

  const filteredUsers = users.filter((u) => u.id !== currentUser.id && u.name.toLowerCase().includes(mentionQuery.toLowerCase()));

  const insertMention = (name) => {
    const before = commentText.slice(0, mentionStart);
    const after = commentText.slice(commentRef.current?.selectionStart || commentText.length);
    const newText = `${before}@${name} ${after}`;
    setCommentText(newText);
    setShowMentions(false);
    requestAnimationFrame(() => { commentRef.current?.focus(); const pos = mentionStart + name.length + 2; commentRef.current?.setSelectionRange(pos, pos); });
  };

  const handleCommentKey = (e) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveMentionIdx((i) => (i + 1) % filteredUsers.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveMentionIdx((i) => (i - 1 + filteredUsers.length) % filteredUsers.length); return; }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); insertMention(filteredUsers[activeMentionIdx].name); return; }
      if (e.key === 'Escape') { setShowMentions(false); return; }
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleAddComment(); }
  };

  const handleAddComment = () => { if (!commentText.trim() || !task) return; addComment(task.id, commentText.trim()); setCommentText(''); setShowMentions(false); };

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;
    if (file.size > 2_000_000) return;
    const reader = new FileReader();
    reader.onload = () => {
      const attachment = { id: `att${Date.now()}`, name: file.name, data: reader.result, type: file.type };
      addAttachment(task.id, attachment);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [task, addAttachment]);

  if (!task) return null;
  const project = projects.find((p) => p.id === task.projectId);
  const p = priorityStyles[task.priority];
  const completedSubs = task.subtasks.filter((s) => s.completed).length;
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Modal isOpen={!!taskId} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-start gap-3">
            <input value={task.title} onChange={(e) => updateTask(task.id, { title: e.target.value })} readOnly={isReadOnly}
              className="flex-1 bg-transparent text-xl font-bold text-white focus:outline-none focus:bg-slate-800/40 rounded-lg px-2 py-1 -ml-2 transition-colors" />
            {!isReadOnly && <button onClick={() => { deleteTask(task.id); onClose(); }} className="rounded-lg p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"><Trash2 className="h-4 w-4" /></button>}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 px-0">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${p.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />{p.label}</span>
            {project && <span className="text-xs text-slate-500">· {project.name}</span>}
            <span className="text-xs text-slate-600">· Created {formatDate(task.createdAt)}</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
          <textarea value={task.description} onChange={(e) => updateTask(task.id, { description: e.target.value })} readOnly={isReadOnly} rows={2} placeholder="Add a description…"
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/40 focus:outline-none transition-colors" />
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-700/40 bg-slate-800/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Priority</span>
            {isReadOnly ? <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${p.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />{p.label}</span>
              : <PrioritySelect value={task.priority} onChange={(v) => updateTask(task.id, { priority: v })} />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status</span>
            {isReadOnly ? <span className="text-sm font-medium text-slate-300">{task.status.replace('-', ' ')}</span>
              : <StatusSelect value={task.status} onChange={(v) => updateTask(task.id, { status: v })} />}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <input type="date" value={task.dueDate || ''} onChange={(e) => updateTask(task.id, { dueDate: e.target.value || null })} disabled={isReadOnly}
              className="rounded-lg border border-slate-700/40 bg-slate-800/30 px-2 py-1 text-xs text-slate-200 focus:border-indigo-500/40 focus:outline-none disabled:opacity-50" />
            {overdue && <span className="text-xs text-rose-400 font-medium">Overdue</span>}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Labels</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {task.labels.map((l) => <span key={l} className="rounded-md bg-slate-800/60 border border-slate-700/40 px-2 py-1 text-xs text-slate-300">{l}</span>)}
            {task.labels.length === 0 && <span className="text-xs text-slate-600">No labels</span>}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Subtasks</h3>
            {task.subtasks.length > 0 && <span className="text-xs text-slate-500">{completedSubs}/{task.subtasks.length} done</span>}
          </div>
          <div className="space-y-1.5">
            {task.subtasks.map((sub) => (
              <div key={sub.id} className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-800/30 transition-colors">
                <button onClick={() => toggleSubtask(task.id, sub.id)} disabled={isReadOnly} className="text-slate-500 hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {sub.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4" />}
                </button>
                <span className={`text-sm flex-1 ${sub.completed ? 'text-slate-600 line-through' : 'text-slate-200'}`}>{sub.title}</span>
              </div>
            ))}
          </div>
          {!isReadOnly && (
            <div className="mt-2 flex items-center gap-2">
              <input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()} placeholder="Add a subtask…"
                className="flex-1 rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/40 focus:outline-none transition-colors" />
              <button onClick={handleAddSubtask} disabled={!newSubtask.trim()} className="rounded-lg bg-slate-800/60 p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 disabled:opacity-30 transition-colors"><Plus className="h-4 w-4" /></button>
            </div>
          )}
        </div>

        {task.attachments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2"><Paperclip className="h-4 w-4 text-indigo-400" /><h3 className="text-sm font-semibold text-white">Attachments</h3></div>
            <div className="flex flex-wrap gap-2">
              {task.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2 rounded-lg border border-slate-700/40 bg-slate-800/40 px-3 py-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <a href={att.data} download={att.name} className="text-xs text-indigo-400 hover:text-indigo-300">{att.name}</a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3"><MessageSquare className="h-4 w-4 text-indigo-400" /><h3 className="text-sm font-semibold text-white">Comments & Activity</h3><span className="text-xs text-slate-500">{task.comments.length}</span></div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {task.comments.length === 0 && <p className="text-sm text-slate-600 py-2">No comments yet.</p>}
            {task.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar initials={c.authorAvatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium text-slate-200">{c.authorName}</span><span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span></div>
                  <p className="text-sm text-slate-400 mt-0.5">{renderMentions(c.text)}</p>
                </div>
              </div>
            ))}
          </div>
          {!isReadOnly && (
            <div className="relative mt-3">
              {showMentions && filteredUsers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 z-20 w-56 rounded-lg border border-slate-700/60 bg-slate-900 shadow-xl py-1 animate-fade-in">
                  {filteredUsers.map((u, i) => (
                    <button key={u.id} onClick={() => insertMention(u.name)} onMouseEnter={() => setActiveMentionIdx(i)} className={`flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors ${i === activeMentionIdx ? 'bg-slate-800' : ''}`}>
                      <Avatar initials={u.avatar} size="sm" /><span className="text-sm text-slate-200">{u.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2 rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 focus-within:border-indigo-500/40 transition-colors">
                <textarea ref={commentRef} value={commentText} onChange={handleCommentChange} onKeyDown={handleCommentKey} placeholder="Write a comment… Use @ to mention someone" rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none max-h-24" />
                <button onClick={() => fileInputRef.current?.click()} className="rounded-md p-1.5 text-slate-500 hover:text-indigo-400 transition-colors" title="Attach file"><Paperclip className="h-4 w-4" /></button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                <button onClick={handleAddComment} disabled={!commentText.trim()} className="rounded-md p-1.5 text-slate-500 hover:text-indigo-400 disabled:opacity-30 transition-colors"><Send className="h-4 w-4" /></button>
              </div>
              <p className="mt-1 text-xs text-slate-600">⌘+Enter to send · @ to mention</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMMAND PALETTE
   ═══════════════════════════════════════════════════════════════ */

function CommandPalette({ isOpen, onClose, onTaskClick, onTabChange, onSetWorkspaceView }) {
  const { tasks, projects } = useApp();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { if (isOpen) { setQuery(''); setActiveIdx(0); requestAnimationFrame(() => inputRef.current?.focus()); } }, [isOpen]);

  const navCommands = useMemo(() => [
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => onTabChange('dashboard') },
    { id: 'nav-workspace', label: 'Go to Workspace', icon: KanbanSquare, action: () => onTabChange('workspace') },
    { id: 'nav-settings', label: 'Go to Settings', icon: SettingsIcon, action: () => onTabChange('settings') },
    { id: 'view-kanban', label: 'Switch to Board view', icon: KanbanSquare, action: () => { onTabChange('workspace'); onSetWorkspaceView('kanban'); } },
    { id: 'view-list', label: 'Switch to List view', icon: List, action: () => { onTabChange('workspace'); onSetWorkspaceView('list'); } },
    { id: 'view-calendar', label: 'Switch to Calendar view', icon: CalendarDays, action: () => { onTabChange('workspace'); onSetWorkspaceView('calendar'); } },
  ], [onTabChange, onSetWorkspaceView]);

  const taskResults = useMemo(() => {
    if (!query) return tasks.slice(0, 5);
    const q = query.toLowerCase();
    return tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.subtasks.some((s) => s.title.toLowerCase().includes(q))).slice(0, 8);
  }, [tasks, query]);

  const projectResults = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return projects.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [projects, query]);

  const filteredNav = useMemo(() => {
    if (!query) return navCommands;
    const q = query.toLowerCase();
    return navCommands.filter((c) => c.label.toLowerCase().includes(q));
  }, [navCommands, query]);

  const allItems = [
    ...filteredNav.map((c) => ({ type: 'nav', ...c })),
    ...taskResults.map((t) => ({ type: 'task', id: t.id, label: t.title, task: t })),
    ...projectResults.map((p) => ({ type: 'project', id: p.id, label: p.name, project: p })),
  ];

  useEffect(() => { setActiveIdx(0); }, [query]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, allItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const item = allItems[activeIdx];
      if (!item) return;
      if (item.type === 'nav') item.action();
      else if (item.type === 'task') onTaskClick(item.id);
      else onTabChange('workspace');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3">
          <Search className="h-5 w-5 text-slate-500" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKey} placeholder="Search tasks, projects, or navigate…"
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none" />
          <kbd className="rounded-md border border-slate-700/50 bg-slate-800 px-1.5 py-0.5 text-xs text-slate-500 font-mono">ESC</kbd>
        </div>
        <div className="mt-3 max-h-80 overflow-y-auto space-y-4">
          {filteredNav.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-1.5">{query ? 'Commands' : 'Quick Actions'}</p>
              {filteredNav.map((cmd) => {
                const Icon = cmd.icon;
                const idx = allItems.findIndex((a) => a.type === 'nav' && a.id === cmd.id);
                return (
                  <button key={cmd.id} onClick={() => { cmd.action(); onClose(); }} onMouseEnter={() => setActiveIdx(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${idx === activeIdx ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'}`}>
                    <Icon className="h-4 w-4 text-indigo-400" /><span className="text-sm text-slate-200 flex-1">{cmd.label}</span><ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                );
              })}
            </div>
          )}
          {taskResults.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-1.5">Tasks</p>
              {taskResults.map((t) => {
                const idx = allItems.findIndex((a) => a.type === 'task' && a.id === t.id);
                const project = projects.find((p) => p.id === t.projectId);
                const p = priorityStyles[t.priority];
                return (
                  <button key={t.id} onClick={() => { onTaskClick(t.id); onClose(); }} onMouseEnter={() => setActiveIdx(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${idx === activeIdx ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'}`}>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${p.dot}`} />
                    <div className="flex-1 min-w-0"><p className="text-sm text-slate-200 truncate">{t.title}</p><p className="text-xs text-slate-500">{project?.name} · {statusConfig[t.status].label}</p></div>
                  </button>
                );
              })}
            </div>
          )}
          {projectResults.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-1.5">Projects</p>
              {projectResults.map((p) => {
                const idx = allItems.findIndex((a) => a.type === 'project' && a.id === p.id);
                return (
                  <button key={p.id} onClick={() => { onTabChange('workspace'); onClose(); }} onMouseEnter={() => setActiveIdx(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${idx === activeIdx ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'}`}>
                    <KanbanSquare className="h-4 w-4 text-sky-400" />
                    <div className="flex-1 min-w-0"><p className="text-sm text-slate-200 truncate">{p.name}</p><p className="text-xs text-slate-500">{p.description}</p></div>
                  </button>
                );
              })}
            </div>
          )}
          {allItems.length === 0 && <div className="py-8 text-center text-sm text-slate-500">No results for "{query}"</div>}
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUICK ADD MODAL
   ═══════════════════════════════════════════════════════════════ */

function QuickAddModal({ isOpen, onClose }) {
  const { projects, addTask } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [projectId, setProjectId] = useState(projects[0]?.id || 'p1');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(''); setDescription(''); setPriority('medium'); setStatus('todo');
      setProjectId(projects[0]?.id || 'p1'); setDueDate(''); setLabels('');
      requestAnimationFrame(() => titleRef.current?.focus());
    }
  }, [isOpen, projects]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), description: description.trim(), priority, status, projectId, dueDate: dueDate || null, labels: labels.split(',').map((l) => l.trim()).filter(Boolean) });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" title="Quick Add Task">
      <div className="p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Title</label>
          <input ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} placeholder="What needs to be done?"
            className="mt-1.5 w-full rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/40 focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Add details…"
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/40 focus:outline-none transition-colors" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Project</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500/40 focus:outline-none cursor-pointer">
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500/40 focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500/40 focus:outline-none cursor-pointer">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500/40 focus:outline-none cursor-pointer">
              <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="review">In Review</option><option value="done">Done</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Labels (comma-separated)</label>
          <input value={labels} onChange={(e) => setLabels(e.target.value)} placeholder="e.g. frontend, bug"
            className="mt-1.5 w-full rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/40 focus:outline-none transition-colors" />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim()} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 transition-all">
            <Plus className="h-4 w-4" />Create Task
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS VIEW
   ═══════════════════════════════════════════════════════════════ */

const avatarChoices = ['AM', 'SC', 'MR', 'PP', 'JD', 'KL', 'TN', 'RB', 'AS', 'ME'];
const viewOptions = [
  { id: 'kanban', label: 'Kanban Board', icon: KanbanSquare },
  { id: 'list', label: 'Task List', icon: List },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

function SettingsView() {
  const { profile, updateProfile, exportData, isOnline, role } = useApp();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [defaultView, setDefaultView] = useState(profile.defaultView);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { updateProfile({ name, email, avatar, defaultView }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20"><User className="h-7 w-7 text-indigo-400" /></div>
        <div><h2 className="text-xl font-bold text-white">Profile Settings</h2><p className="text-sm text-slate-400">Manage your account and workspace preferences.</p></div>
      </div>

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Account</h3>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Display Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500/40 focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1.5 w-full rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500/40 focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avatar Initials</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {avatarChoices.map((a) => (
              <button key={a} onClick={() => setAvatar(a)} className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${avatar === a ? 'bg-indigo-500 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Preferences</h3>
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Default Workspace View</label>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {viewOptions.map((v) => {
              const Icon = v.icon;
              return (
                <button key={v.id} onClick={() => setDefaultView(v.id)} className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all ${defaultView === v.id ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' : 'border-slate-800 bg-slate-800/30 text-slate-400 hover:text-slate-200'}`}>
                  <Icon className="h-5 w-5" /><span className="text-xs font-medium">{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Data & Backup</h3>
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-200">Export Workspace Data</p><p className="text-xs text-slate-500">Download a JSON backup of your tasks and settings.</p></div>
          <button onClick={exportData} className="flex items-center gap-1.5 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Download className="h-4 w-4" />Export JSON
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button onClick={handleSave} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all">
          <Save className="h-4 w-4" />{saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN USER DASHBOARD APP COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function UserDashboardContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandOpen((open) => !open); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} unreadCount={0} />

      <div className="flex flex-1 flex-col min-w-0">
        <Header onOpenCommand={() => setIsCommandOpen(true)} onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} onTaskClick={setSelectedTaskId} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <Dashboard onTaskClick={setSelectedTaskId} onQuickAdd={() => setIsQuickAddOpen(true)} onGoToWorkspace={() => setActiveTab('workspace')} />}
          {activeTab === 'workspace' && <Workspace onTaskClick={setSelectedTaskId} onQuickAdd={() => setIsQuickAddOpen(true)} />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      <TaskModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onTaskClick={setSelectedTaskId} onTabChange={setActiveTab} onSetWorkspaceView={() => {}} />
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
      <ToastContainer />
    </div>
  );
}

export default function UserDashboard() {
  return (
    <AppProvider>
      <UserDashboardContent />
    </AppProvider>
  );
}