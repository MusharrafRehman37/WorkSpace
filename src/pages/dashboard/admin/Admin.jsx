import React, {
  useState,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useCallback,
} from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar as CalendarIcon,
  KanbanSquare,
  Table as TableIcon,
  Activity,
  Bell,
  Users,
  Settings as SettingsIcon,
  Plus,
  Search,
  Command,
  Download,
  Upload,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  AlertTriangle,
  Clock,
  Trash2,
  Edit3,
  MessageSquare,
  Paperclip,
  Crown,
  Shield,
  User as UserIcon,
  Eye,
  Filter,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Undo2,
  Redo2,
  RefreshCw,
  Wifi,
  WifiOff,
  HardDrive,
  CircleCheck,
  Circle,
  CircleDot,
  TriangleAlert,
  Menu,
  PanelLeftClose,
  PanelLeft,
  GripVertical,
  Send,
  AtSign,
  Flame,
  ListChecks,
  TrendingUp,
  Loader2,
  RotateCcw,
  Lock,
  UserPlus,
  Save,
  CalendarDays,
  ArrowRight,
  Sparkles,
  Cpu,
  Megaphone,
} from 'lucide-react';

// ============================================================
// UTILITIES
// ============================================================

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const nowISO = () => new Date().toISOString();

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const relativeTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDate(iso);
};

const isOverdue = (iso) => new Date(iso).getTime() < Date.now();

const daysUntil = (iso) => {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const STORAGE_KEY = 'workflow_pro_state_v1';

const saveState = (state) => {
  try {
    const { ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch (e) { /* quota */ }
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// ============================================================
// MOCK DATA
// ============================================================

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#10b981'];

const mockUsers = [
  { id: 'u1', name: 'Alex Chen', email: 'alex@workflow.pro', role: 'Owner', avatarColor: '#6366f1' },
  { id: 'u2', name: 'Sarah Johnson', email: 'sarah@workflow.pro', role: 'Admin', avatarColor: '#ec4899' },
  { id: 'u3', name: 'Mike Rodriguez', email: 'mike@workflow.pro', role: 'Member', avatarColor: '#14b8a6' },
  { id: 'u4', name: 'Emily Davis', email: 'emily@workflow.pro', role: 'Member', avatarColor: '#f59e0b' },
  { id: 'u5', name: 'Jordan Lee', email: 'jordan@workflow.pro', role: 'Viewer', avatarColor: '#8b5cf6' },
];

const mockWorkspaces = [
  { id: 'w1', name: 'Product Engineering', icon: <Cpu /> },
  { id: 'w2', name: 'Marketing Hub', icon: <Megaphone /> },
  { id: 'w3', name: 'Client Portal', icon: '💼' },
];

const mockProjects = [
  { id: 'p1', name: 'Mobile App Redesign', description: 'Complete overhaul of the mobile experience', color: '#6366f1', workspaceId: 'w1' },
  { id: 'p2', name: 'API Platform v2', description: 'Next-gen REST and GraphQL APIs', color: '#14b8a6', workspaceId: 'w1' },
  { id: 'p3', name: 'Q4 Campaign Launch', description: 'Holiday marketing push', color: '#f59e0b', workspaceId: 'w2' },
  { id: 'p4', name: 'Brand Guidelines', description: 'Refresh visual identity', color: '#ec4899', workspaceId: 'w2' },
  { id: 'p5', name: 'Client Onboarding', description: 'Streamline new client setup', color: '#8b5cf6', workspaceId: 'w3' },
];

const taskTitles = [
  'Design new auth flow wireframes',
  'Set up CI/CD pipeline',
  'Write API documentation',
  'Create component library',
  'Implement dark mode toggle',
  'Optimize database queries',
  'Build notification system',
  'Code review: payment module',
  'Fix mobile responsiveness bugs',
  'Create landing page hero',
  'Set up analytics tracking',
  'Design email templates',
  'Configure Stripe webhooks',
  'User testing session prep',
  'Update privacy policy',
  'Migrate legacy endpoints',
  'Create social media assets',
  'SEO audit and fixes',
  'Build search functionality',
  'Deploy staging environment',
];

const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const statuses = ['To Do', 'In Progress', 'Review', 'Done'];

const generateMockTasks = () => {
  const tasks = [];
  const baseDate = new Date();
  for (let i = 0; i < taskTitles.length; i++) {
    const status = statuses[i % statuses.length];
    const daysOffset = Math.floor(Math.random() * 30) - 10;
    const due = new Date(baseDate);
    due.setDate(due.getDate() + daysOffset);
    const created = new Date(baseDate);
    created.setDate(created.getDate() - Math.floor(Math.random() * 20));
    const project = mockProjects[i % mockProjects.length];
    tasks.push({
      id: 't' + (i + 1),
      title: taskTitles[i],
      description: `This task involves ${taskTitles[i].toLowerCase()} for the ${project.name} project. Key deliverables and acceptance criteria should be defined before starting.`,
      status,
      priority: priorities[i % priorities.length],
      dueDate: due.toISOString(),
      assigneeId: mockUsers[i % mockUsers.length].id,
      projectId: project.id,
      subtasks: [
        { id: uid(), title: 'Research and gather requirements', done: Math.random() > 0.5 },
        { id: uid(), title: 'Implement core functionality', done: status === 'Done' },
        { id: uid(), title: 'Write tests', done: status === 'Done' },
      ],
      comments: i % 3 === 0 ? [
        { id: uid(), userId: mockUsers[(i + 1) % mockUsers.length].id, text: 'Can we discuss the approach in standup?', createdAt: created.toISOString() },
      ] : [],
      attachments: [],
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
      tags: i % 2 === 0 ? ['frontend', 'design'] : ['backend', 'infra'],
    });
  }
  return tasks;
};

const mockNotifications = [
  { id: 'n1', type: 'mention', text: 'Sarah Johnson mentioned you in "Design new auth flow"', read: false, createdAt: nowISO() },
  { id: 'n2', type: 'assignment', text: 'You were assigned to "Fix mobile responsiveness bugs"', read: false, createdAt: nowISO() },
  { id: 'n3', type: 'due', text: '"Set up CI/CD pipeline" is due in 2 days', read: false, createdAt: nowISO() },
  { id: 'n4', type: 'system', text: 'Workspace "Product Engineering" was updated', read: true, createdAt: nowISO() },
];

const generateMockActivity = (tasks) => {
  const logs = [];
  for (let i = 0; i < 12; i++) {
    const task = tasks[i % tasks.length];
    const user = mockUsers[i % mockUsers.length];
    const actions = ['created', 'updated', 'commented', 'moved', 'status'];
    const action = actions[i % actions.length];
    const created = new Date();
    created.setHours(created.getHours() - i * 3);
    logs.push({
      id: uid(),
      userId: user.id,
      action,
      entityType: 'task',
      entityId: task.id,
      entityName: task.title,
      detail: action === 'created' ? `Created task "${task.title}"` :
              action === 'updated' ? `Updated task details` :
              action === 'commented' ? `Added a comment` :
              action === 'moved' ? `Moved to ${task.status}` :
              `Changed status to ${task.status}`,
      createdAt: created.toISOString(),
    });
  }
  return logs;
};

const initialState = (() => {
  const saved = loadState();
  if (saved) return saved;
  const tasks = generateMockTasks();
  return {
    workspaces: mockWorkspaces,
    projects: mockProjects,
    tasks,
    users: mockUsers,
    notifications: mockNotifications,
    activityLogs: generateMockActivity(tasks),
    currentUserId: 'u1',
    selectedWorkspaceId: 'w1',
    selectedProjectId: 'p1',
    theme: 'dark',
    defaultView: 'kanban',
    notificationsEnabled: true,
    realTimeEnabled: false,
  };
})();

// ============================================================
// REDUCER + UNDO/REDO
// ============================================================

const addLog = (logs, log) => {
  if (!log) return logs;
  return [log, ...logs].slice(0, 100);
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return action.state;
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.task, ...state.tasks],
        activityLogs: addLog(state.activityLogs, action.log),
      };
    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t),
        activityLogs: addLog(state.activityLogs, action.log),
      };
    }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.id),
        activityLogs: addLog(state.activityLogs, action.log),
      };
    case 'DELETE_TASKS':
      return { ...state, tasks: state.tasks.filter(t => !action.ids.includes(t.id)) };
    case 'BULK_UPDATE_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          action.ids.includes(t.id) ? { ...t, status: action.status, updatedAt: nowISO() } : t
        ),
      };
    case 'MOVE_TASK': {
      const task = state.tasks.find(t => t.id === action.id);
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id ? { ...t, status: action.status, updatedAt: nowISO() } : t
        ),
        activityLogs: task ? addLog(state.activityLogs, {
          id: uid(), userId: state.currentUserId, action: 'status', entityType: 'task',
          entityId: task.id, entityName: task.title,
          detail: `Moved to ${action.status}`, createdAt: nowISO(),
        }) : state.activityLogs,
      };
    }
    case 'ADD_COMMENT':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.taskId ? { ...t, comments: [...t.comments, action.comment] } : t
        ),
      };
    case 'ADD_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.taskId ? { ...t, subtasks: [...t.subtasks, action.subtask] } : t
        ),
      };
    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.taskId ? {
            ...t, subtasks: t.subtasks.map(s => s.id === action.subtaskId ? { ...s, done: !s.done } : s)
          } : t
        ),
      };
    case 'DELETE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== action.subtaskId) } : t
        ),
      };
    case 'CONVERT_SUBTASK': {
      const task = state.tasks.find(t => t.id === action.taskId);
      if (!task) return state;
      const subtask = task.subtasks.find(s => s.id === action.subtaskId);
      if (!subtask) return state;
      const newTask = {
        id: uid(), title: subtask.title, description: 'Converted from subtask',
        status: 'To Do', priority: 'Medium', dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        assigneeId: task.assigneeId, projectId: task.projectId,
        subtasks: [], comments: [], attachments: [], createdAt: nowISO(), updatedAt: nowISO(), tags: task.tags,
      };
      return {
        ...state,
        tasks: [newTask, ...state.tasks],
      };
    }
    case 'ADD_ATTACHMENT':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.taskId ? { ...t, attachments: [...t.attachments, action.attachment] } : t
        ),
      };
    case 'DELETE_ATTACHMENT':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.taskId ? { ...t, attachments: t.attachments.filter(a => a.id !== action.attachmentId) } : t
        ),
      };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.project], selectedProjectId: action.project.id };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.id),
        tasks: state.tasks.filter(t => t.projectId !== action.id),
        selectedProjectId: state.selectedProjectId === action.id ? null : state.selectedProjectId,
      };
    case 'ADD_WORKSPACE':
      return { ...state, workspaces: [...state.workspaces, action.workspace], selectedWorkspaceId: action.workspace.id };
    case 'SET_WORKSPACE':
      return { ...state, selectedWorkspaceId: action.id, selectedProjectId: null };
    case 'SET_PROJECT':
      return { ...state, selectedProjectId: action.id };
    case 'SET_CURRENT_USER':
      return { ...state, currentUserId: action.id };
    case 'SET_USER_ROLE':
      return { ...state, users: state.users.map(u => u.id === action.userId ? { ...u, role: action.role } : u) };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.user] };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n) };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications].slice(0, 50) };
    case 'ADD_ACTIVITY':
      return { ...state, activityLogs: [action.log, ...state.activityLogs].slice(0, 100) };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_DEFAULT_VIEW':
      return { ...state, defaultView: action.view };
    case 'SET_NOTIFICATIONS_ENABLED':
      return { ...state, notificationsEnabled: action.enabled };
    case 'SET_REALTIME':
      return { ...state, realTimeEnabled: action.enabled };
    case 'IMPORT_STATE':
      return action.state;
    case 'RESET': {
      const tasks = generateMockTasks();
      return {
        workspaces: mockWorkspaces,
        projects: mockProjects,
        tasks,
        users: mockUsers,
        notifications: mockNotifications,
        activityLogs: generateMockActivity(tasks),
        currentUserId: 'u1',
        selectedWorkspaceId: 'w1',
        selectedProjectId: 'p1',
        theme: 'dark',
        defaultView: 'kanban',
        notificationsEnabled: true,
        realTimeEnabled: false,
      };
    }
    default:
      return state;
  }
}

// ============================================================
// ROLE PERMISSIONS
// ============================================================

const canEdit = (role) => role === 'Owner' || role === 'Admin' || role === 'Member';
const canDelete = (role) => role === 'Owner' || role === 'Admin';
const canManageTeam = (role) => role === 'Owner' || role === 'Admin';

// ============================================================
// PRIORITY HELPERS
// ============================================================

const priorityConfig = {
  Low: { color: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: CircleDot },
  Medium: { color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400', icon: Circle },
  High: { color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-400', icon: TriangleAlert },
  Urgent: { color: '#dc2626', bg: 'bg-red-600/15', text: 'text-red-500', icon: Flame },
};

const statusConfig = {
  'To Do': { color: '#64748b', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-600' },
  'In Progress': { color: '#6366f1', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-600' },
  'Review': { color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-600' },
  'Done': { color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-600' },
};

// ============================================================
// SMALL UI COMPONENTS
// ============================================================

const Avatar = ({ user, size = 32, showName = false }) => {
  if (!user) {
    return (
      <div className="rounded-full bg-slate-700 flex items-center justify-center text-slate-400" style={{ width: size, height: size }}>
        <UserIcon size={size * 0.55} />
      </div>
    );
  }
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
        style={{ width: size, height: size, backgroundColor: user.avatarColor, fontSize: size * 0.38 }}
      >
        {initials}
      </div>
      {showName && <span className="text-sm text-slate-200">{user.name}</span>}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const config = {
    Owner: { icon: Crown, cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    Admin: { icon: Shield, cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    Member: { icon: UserIcon, cls: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
    Viewer: { icon: Eye, cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  };
  const { icon: Icon, cls } = config[role];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>
      <Icon size={12} /> {role}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const c = priorityConfig[priority];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon size={12} /> {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
      {status}
    </span>
  );
};

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-600'}`}
  >
    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

// ============================================================
// TOAST SYSTEM
// ============================================================

let toastIdCounter = 0;

// ============================================================
// MAIN APP
// ============================================================

const AdminDashboard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [taskView, setTaskView] = useState('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [sortField, setSortField] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');
  const [activityFilterUser, setActivityFilterUser] = useState('all');
  const [activityFilterAction, setActivityFilterAction] = useState('all');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [editingTaskField, setEditingTaskField] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const currentUser = state.users.find(u => u.id === state.currentUserId) || state.users[0];
  const currentWorkspace = state.workspaces.find(w => w.id === state.selectedWorkspaceId) || state.workspaces[0];
  const workspaceProjects = state.projects.filter(p => p.workspaceId === state.selectedWorkspaceId);
  const currentProject = state.projects.find(p => p.id === state.selectedProjectId) || null;
  const selectedTask = state.tasks.find(t => t.id === selectedTaskId) || null;
  const unreadCount = state.notifications.filter(n => !n.read).length;

  // Persist to localStorage
  useEffect(() => { saveState(state); }, [state]);

  // Theme class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.body.className = state.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100';
  }, [state.theme]);

  // Online/offline
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowNotifications(false);
        setShowWorkspaceSwitcher(false);
        setShowRoleSwitcher(false);
        setShowExportMenu(false);
        setMentionQuery(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undoStack, redoStack]);

  // Real-time events
  useEffect(() => {
    if (!state.realTimeEnabled) return;
    const interval = setInterval(() => {
      const randomUser = state.users[Math.floor(Math.random() * state.users.length)];
      const randomTask = state.tasks[Math.floor(Math.random() * state.tasks.length)];
      if (!randomTask) return;
      const events = [
        `${randomUser.name} updated task status`,
        `${randomUser.name} commented on "${randomTask.title}"`,
        `${randomUser.name} moved "${randomTask.title}" to Review`,
      ];
      const text = events[Math.floor(Math.random() * events.length)];
      pushToast({ type: 'info', text, duration: 4000 });
      dispatch({ type: 'ADD_NOTIFICATION', notification: {
        id: uid(), type: 'system', text, read: false, createdAt: nowISO(),
      }});
    }, 15000);
    return () => clearInterval(interval);
  }, [state.realTimeEnabled, state.users, state.tasks]);

  // ---- Toast helpers ----
  const pushToast = useCallback((toast) => {
    const id = 'toast_' + (++toastIdCounter);
    const duration = toast.duration ?? 4000;
    setToasts(prev => [...prev, { ...toast, id }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // ---- Undo/Redo ----
  const pushUndo = (snapshot) => {
    setUndoStack(prev => [...prev, snapshot].slice(-50));
    setRedoStack([]);
  };

  const handleUndo = () => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const snapshot = prev[prev.length - 1];
      setRedoStack(r => [...r, { tasks: state.tasks, projects: state.projects }].slice(-50));
      dispatch({ type: 'SET_STATE', state: { ...state, tasks: snapshot.tasks, projects: snapshot.projects || state.projects } });
      pushToast({ type: 'info', text: 'Action undone', duration: 2000 });
      return prev.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const snapshot = prev[prev.length - 1];
      setUndoStack(u => [...u, { tasks: state.tasks, projects: state.projects }].slice(-50));
      dispatch({ type: 'SET_STATE', state: { ...state, tasks: snapshot.tasks, projects: snapshot.projects || state.projects } });
      pushToast({ type: 'info', text: 'Action redone', duration: 2000 });
      return prev.slice(0, -1);
    });
  };

  // ---- Task operations ----
  const logActivity = (action, task, detail) => ({
    id: uid(), userId: state.currentUserId, action, entityType: 'task',
    entityId: task.id, entityName: task.title, detail, createdAt: nowISO(),
  });

  const handleDeleteTask = (id) => {
    if (!canEdit(currentUser.role)) {
      pushToast({ type: 'error', text: 'Access Denied: Read-only role cannot delete tasks', duration: 3000 });
      return;
    }
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    pushUndo({ tasks: state.tasks, projects: state.projects });
    dispatch({ type: 'DELETE_TASK', id, log: logActivity('deleted', task, `Deleted task "${task.title}"`) });
    pushToast({
      type: 'success',
      text: `Task "${task.title}" deleted`,
      undoAction: { type: 'restore_task', payload: task },
      duration: 5000,
    });
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const handleUpdateTask = (updated, actionLabel) => {
    if (!canEdit(currentUser.role)) {
      pushToast({ type: 'error', text: 'Access Denied: Read-only role cannot edit tasks', duration: 3000 });
      return;
    }
    pushUndo({ tasks: state.tasks, projects: state.projects });
    const log = logActivity('updated', updated, actionLabel || `Updated task "${updated.title}"`);
    dispatch({ type: 'UPDATE_TASK', task: { ...updated, updatedAt: nowISO() }, log });
  };

  const handleCreateTask = (task) => {
    if (!canEdit(currentUser.role)) {
      pushToast({ type: 'error', text: 'Access Denied: Read-only role cannot create tasks', duration: 3000 });
      return;
    }
    pushUndo({ tasks: state.tasks, projects: state.projects });
    dispatch({ type: 'ADD_TASK', task, log: logActivity('created', task, `Created task "${task.title}"`) });
    pushToast({ type: 'success', text: `Task "${task.title}" created`, duration: 3000 });
  };

  const handleBulkDelete = () => {
    if (!canEdit(currentUser.role)) return;
    pushUndo({ tasks: state.tasks, projects: state.projects });
    dispatch({ type: 'DELETE_TASKS', ids: selectedTaskIds });
    pushToast({ type: 'success', text: `${selectedTaskIds.length} tasks deleted`, duration: 3000 });
    setSelectedTaskIds([]);
  };

  const handleBulkStatus = (status) => {
    if (!canEdit(currentUser.role)) return;
    pushUndo({ tasks: state.tasks, projects: state.projects });
    dispatch({ type: 'BULK_UPDATE_STATUS', ids: selectedTaskIds, status });
    pushToast({ type: 'success', text: `${selectedTaskIds.length} tasks moved to ${status}`, duration: 3000 });
    setSelectedTaskIds([]);
  };

  // ---- Export/Import ----
  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-pro-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast({ type: 'success', text: 'Data exported as JSON', duration: 2000 });
    setShowExportMenu(false);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result);
        dispatch({ type: 'IMPORT_STATE', state: imported });
        pushToast({ type: 'success', text: 'Data imported successfully', duration: 3000 });
      } catch {
        pushToast({ type: 'error', text: 'Invalid JSON file', duration: 3000 });
      }
    };
    reader.readAsText(file);
    setShowExportMenu(false);
  };

  // ---- Manual Sync ----
  const handleManualSync = () => {
    setSyncing(true);
    pushToast({ type: 'info', text: 'Syncing changes...', duration: 1500 });
    setTimeout(() => {
      saveState(state);
      setSyncing(false);
      pushToast({ type: 'success', text: 'All changes synced successfully', duration: 2500 });
    }, 2000);
  };

  // ---- Computed values ----
  const filteredTasks = useMemo(() => {
    let tasks = state.tasks;
    if (state.selectedProjectId) {
      tasks = tasks.filter(t => t.projectId === state.selectedProjectId);
    } else if (currentWorkspace) {
      const wsProjectIds = workspaceProjects.map(p => p.id);
      tasks = tasks.filter(t => wsProjectIds.includes(t.projectId));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return tasks;
  }, [state.tasks, state.selectedProjectId, currentWorkspace, workspaceProjects, searchQuery]);

  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];
    const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    const statusOrder = { 'To Do': 0, 'In Progress': 1, 'Review': 2, 'Done': 3 };
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'dueDate': cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); break;
        case 'priority': cmp = priorityOrder[a.priority] - priorityOrder[b.priority]; break;
        case 'status': cmp = statusOrder[a.status] - statusOrder[b.status]; break;
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'assignee': {
          const an = state.users.find(u => u.id === a.assigneeId)?.name || 'zzz';
          const bn = state.users.find(u => u.id === b.assigneeId)?.name || 'zzz';
          cmp = an.localeCompare(bn);
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredTasks, sortField, sortDir, state.users]);

  const dashboardStats = useMemo(() => {
    const tasks = filteredTasks;
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Done').length,
      pending: tasks.filter(t => t.status !== 'Done').length,
      overdue: tasks.filter(t => t.status !== 'Done' && isOverdue(t.dueDate)).length,
      highPriority: tasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length,
    };
  }, [filteredTasks]);

  // ---- Search results for command palette / global search ----
  const searchResults = useMemo(() => {
    if (!searchQuery) return { tasks: [], projects: [], workspaces: [] };
    const q = searchQuery.toLowerCase();
    return {
      tasks: state.tasks.filter(t => t.title.toLowerCase().includes(q)).slice(0, 5),
      projects: state.projects.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3),
      workspaces: state.workspaces.filter(w => w.name.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [searchQuery, state.tasks, state.projects, state.workspaces]);

  // ---- Navigation items ----
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const isDark = state.theme === 'dark';
  const cardClass = isDark ? 'bg-slate-900/80 border border-slate-800 backdrop-blur-md' : 'bg-white/80 border border-slate-200 backdrop-blur-md';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const inputClass = isDark
    ? 'bg-slate-800/60 border-slate-700 text-slate-100 placeholder-slate-500'
    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400';
  const hoverBg = isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100';

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-100'} ${textPrimary} transition-colors`}>
      {/* Sidebar */}
      <Sidebar
        isDark={isDark}
        cardClass={cardClass}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textMuted={textMuted}
        hoverBg={hoverBg}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setMobileSidebarOpen(false); }}
        navItems={navItems}
        currentUser={currentUser}
        currentWorkspace={currentWorkspace}
        workspaces={state.workspaces}
        onSwitchWorkspace={(id) => { dispatch({ type: 'SET_WORKSPACE', id }); setShowWorkspaceSwitcher(false); }}
        showWorkspaceSwitcher={showWorkspaceSwitcher}
        setShowWorkspaceSwitcher={setShowWorkspaceSwitcher}
        onNewTask={() => setIsCreatingTask(true)}
        onNewWorkspace={() => setShowCreateWorkspace(true)}
        isOnline={isOnline}
        unreadCount={unreadCount}
        showRoleSwitcher={showRoleSwitcher}
        setShowRoleSwitcher={setShowRoleSwitcher}
        onSwitchUser={(id) => { dispatch({ type: 'SET_CURRENT_USER', id }); setShowRoleSwitcher(false); }}
        users={state.users}
      />

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} ${mobileSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <Header
          isDark={isDark}
          cardClass={cardClass}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          inputClass={inputClass}
          hoverBg={hoverBg}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          onOpenTask={(id) => { setSelectedTaskId(id); setActiveTab('tasks'); }}
          onOpenProject={(id) => { dispatch({ type: 'SET_PROJECT', id }); setActiveTab('tasks'); }}
          onOpenWorkspace={(id) => { dispatch({ type: 'SET_WORKSPACE', id }); setActiveTab('dashboard'); }}
          unreadCount={unreadCount}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notifications={state.notifications}
          onMarkAllRead={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
          onMarkRead={(id) => dispatch({ type: 'MARK_NOTIFICATION_READ', id })}
          theme={state.theme}
          onToggleTheme={() => dispatch({ type: 'SET_THEME', theme: state.theme === 'dark' ? 'light' : 'dark' })}
          onExport={handleExport}
          onImport={handleImport}
          showExportMenu={showExportMenu}
          setShowExportMenu={setShowExportMenu}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onMobileMenu={() => setMobileSidebarOpen(true)}
          currentUser={currentUser}
        />

        {/* Page content */}
        <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
              textMuted={textMuted} hoverBg={hoverBg} inputClass={inputClass}
              stats={dashboardStats}
              tasks={filteredTasks}
              projects={workspaceProjects}
              activityLogs={state.activityLogs}
              users={state.users}
              onOpenTask={(id) => { setSelectedTaskId(id); setActiveTab('tasks'); }}
              onGoToTasks={() => setActiveTab('tasks')}
              onGoToProject={(id) => { dispatch({ type: 'SET_PROJECT', id }); setActiveTab('tasks'); }}
              currentWorkspace={currentWorkspace}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
              textMuted={textMuted} hoverBg={hoverBg} inputClass={inputClass}
              projects={workspaceProjects}
              tasks={state.tasks}
              onOpenProject={(id) => { dispatch({ type: 'SET_PROJECT', id }); setActiveTab('tasks'); }}
              onNewProject={() => setShowCreateProject(true)}
              canDelete={canDelete(currentUser.role)}
              onDeleteProject={(id) => { dispatch({ type: 'DELETE_PROJECT', id }); pushToast({ type: 'success', text: 'Project deleted', duration: 2000 }); }}
              selectedProjectId={state.selectedProjectId}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
              textMuted={textMuted} hoverBg={hoverBg} inputClass={inputClass}
              tasks={sortedTasks}
              allTasks={filteredTasks}
              viewMode={taskView}
              setViewMode={setTaskView}
              defaultView={state.defaultView}
              onOpenTask={(id) => setSelectedTaskId(id)}
              onNewTask={() => setIsCreatingTask(true)}
              onMoveTask={(id, status) => dispatch({ type: 'MOVE_TASK', id, status })}
              onSort={(field) => {
                if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                else { setSortField(field); setSortDir('asc'); }
              }}
              sortField={sortField}
              sortDir={sortDir}
              selectedTaskIds={selectedTaskIds}
              setSelectedTaskIds={setSelectedTaskIds}
              onBulkDelete={handleBulkDelete}
              onBulkStatus={handleBulkStatus}
              canEdit={canEdit(currentUser.role)}
              users={state.users}
              calendarMonth={calendarMonth}
              setCalendarMonth={setCalendarMonth}
              draggedTaskId={draggedTaskId}
              setDraggedTaskId={setDraggedTaskId}
              dragOverColumn={dragOverColumn}
              setDragOverColumn={setDragOverColumn}
              currentProject={currentProject}
              projects={workspaceProjects}
              onClearProject={() => dispatch({ type: 'SET_PROJECT', id: null })}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityView
              isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
              textMuted={textMuted} hoverBg={hoverBg} inputClass={inputClass}
              logs={state.activityLogs}
              users={state.users}
              filterUser={activityFilterUser}
              setFilterUser={setActivityFilterUser}
              filterAction={activityFilterAction}
              setFilterAction={setActivityFilterAction}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
              textMuted={textMuted} hoverBg={hoverBg}
              notifications={state.notifications}
              onMarkAllRead={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
              onMarkRead={(id) => dispatch({ type: 'MARK_NOTIFICATION_READ', id })}
            />
          )}

          {activeTab === 'team' && (
            <TeamView
              isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
              textMuted={textMuted} hoverBg={hoverBg} inputClass={inputClass}
              users={state.users}
              currentUser={currentUser}
              onInviteMember={() => setShowInviteMember(true)}
              canManageTeam={canManageTeam(currentUser.role)}
              onRoleChange={(userId, role) => { dispatch({ type: 'SET_USER_ROLE', userId, role }); pushToast({ type: 'success', text: 'Role updated', duration: 2000 }); }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
              textMuted={textMuted} hoverBg={hoverBg} inputClass={inputClass}
              state={state}
              onToggleTheme={(theme) => dispatch({ type: 'SET_THEME', theme })}
              onSetDefaultView={(view) => dispatch({ type: 'SET_DEFAULT_VIEW', view })}
              onSetNotificationsEnabled={(enabled) => dispatch({ type: 'SET_NOTIFICATIONS_ENABLED', enabled })}
              onSetRealtime={(enabled) => dispatch({ type: 'SET_REALTIME', enabled })}
              onManualSync={handleManualSync}
              syncing={syncing}
              onExport={handleExport}
              onImport={handleImport}
              onReset={() => setShowResetConfirm(true)}
            />
          )}
        </main>
      </div>

      {/* Task Detail Modal */}
      {(selectedTask || isCreatingTask) && (
        <TaskDetailModal
          isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
          textMuted={textMuted} hoverBg={hoverBg} inputClass={inputClass}
          task={selectedTask}
          isCreating={isCreatingTask}
          users={state.users}
          projects={workspaceProjects}
          currentProjectId={state.selectedProjectId}
          onClose={() => { setSelectedTaskId(null); setIsCreatingTask(false); }}
          onSave={(task) => { handleCreateTask(task); setIsCreatingTask(false); }}
          onUpdate={(task, label) => handleUpdateTask(task, label)}
          onDelete={(id) => { handleDeleteTask(id); setSelectedTaskId(null); }}
          canEdit={canEdit(currentUser.role)}
          onAddComment={(taskId, text) => {
            dispatch({ type: 'ADD_COMMENT', taskId, comment: { id: uid(), userId: state.currentUserId, text, createdAt: nowISO() } });
          }}
          onAddSubtask={(taskId, title) => dispatch({ type: 'ADD_SUBTASK', taskId, subtask: { id: uid(), title, done: false } })}
          onToggleSubtask={(taskId, sid) => dispatch({ type: 'TOGGLE_SUBTASK', taskId, subtaskId: sid })}
          onDeleteSubtask={(taskId, sid) => dispatch({ type: 'DELETE_SUBTASK', taskId, subtaskId: sid })}
          onConvertSubtask={(taskId, sid) => {
            dispatch({ type: 'CONVERT_SUBTASK', taskId, subtaskId: sid });
            dispatch({ type: 'DELETE_SUBTASK', taskId, subtaskId: sid });
            pushToast({ type: 'success', text: 'Subtask converted to main task', duration: 2500 });
          }}
          onAddAttachment={(taskId, name, data, type) => dispatch({ type: 'ADD_ATTACHMENT', taskId, attachment: { id: uid(), name, data, type } })}
          onDeleteAttachment={(taskId, aid) => dispatch({ type: 'DELETE_ATTACHMENT', taskId, attachmentId: aid })}
          currentUserId={state.currentUserId}
          mentionUsers={state.users}
        />
      )}

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette
          isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
          textMuted={textMuted} hoverBg={hoverBg} inputClass={inputClass}
          onClose={() => setShowCommandPalette(false)}
          onNavigate={(tab) => { setActiveTab(tab); setShowCommandPalette(false); }}
          tasks={state.tasks}
          projects={state.projects}
          workspaces={state.workspaces}
          onOpenTask={(id) => { setSelectedTaskId(id); setActiveTab('tasks'); setShowCommandPalette(false); }}
          onOpenProject={(id) => { dispatch({ type: 'SET_PROJECT', id }); setActiveTab('tasks'); setShowCommandPalette(false); }}
          onOpenWorkspace={(id) => { dispatch({ type: 'SET_WORKSPACE', id }); setActiveTab('dashboard'); setShowCommandPalette(false); }}
          onNewTask={() => { setIsCreatingTask(true); setShowCommandPalette(false); }}
          navItems={navItems}
        />
      )}

      {/* Create Workspace Modal */}
      {showCreateWorkspace && (
        <CreateWorkspaceModal
          isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
          inputClass={inputClass}
          onClose={() => setShowCreateWorkspace(false)}
          onCreate={(name, icon) => {
            dispatch({ type: 'ADD_WORKSPACE', workspace: { id: uid(), name, icon } });
            pushToast({ type: 'success', text: 'Workspace created', duration: 2000 });
            setShowCreateWorkspace(false);
          }}
        />
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal
          isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
          inputClass={inputClass}
          workspaceId={state.selectedWorkspaceId}
          onClose={() => setShowCreateProject(false)}
          onCreate={(name, description, color) => {
            dispatch({ type: 'ADD_PROJECT', project: { id: uid(), name, description, color, workspaceId: state.selectedWorkspaceId } });
            pushToast({ type: 'success', text: 'Project created', duration: 2000 });
            setShowCreateProject(false);
          }}
        />
      )}

      {/* Invite Member Modal */}
      {showInviteMember && (
        <InviteMemberModal
          isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
          inputClass={inputClass}
          onClose={() => setShowInviteMember(false)}
          onInvite={(name, email, role) => {
            const newUser = { id: uid(), name, email, role, avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] };
            dispatch({ type: 'ADD_USER', user: newUser });
            pushToast({ type: 'success', text: `${name} invited to workspace`, duration: 3000 });
            setShowInviteMember(false);
          }}
        />
      )}

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <ConfirmModal
          isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
          hoverBg={hoverBg}
          title="Reset All App Data"
          message="This will permanently delete all workspaces, projects, tasks, and settings, and restore the default mock data. This cannot be undone."
          confirmLabel="Reset Everything"
          danger
          onClose={() => setShowResetConfirm(false)}
          onConfirm={() => { dispatch({ type: 'RESET' }); pushToast({ type: 'success', text: 'All data reset to defaults', duration: 3000 }); setShowResetConfirm(false); }}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} onUndo={(toast) => {
        if (toast.undoAction?.type === 'restore_task' && toast.undoAction.payload) {
          dispatch({ type: 'ADD_TASK', task: toast.undoAction.payload });
          pushToast({ type: 'info', text: 'Task restored', duration: 2000 });
        }
        removeToast(toast.id);
      }} />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;

// ============================================================
// SIDEBAR
// ============================================================

const Sidebar = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg,
  collapsed, mobileOpen, onClose, onToggleCollapse, activeTab, onTabChange,
  navItems, currentUser, currentWorkspace, workspaces, onSwitchWorkspace,
  showWorkspaceSwitcher, setShowWorkspaceSwitcher, onNewTask, onNewWorkspace,
  isOnline, unreadCount, showRoleSwitcher, setShowRoleSwitcher, onSwitchUser, users,
}) => {
  return (
    <>
      <aside className={`fixed top-0 left-0 h-full z-40 ${cardClass} border-r ${isDark ? 'border-slate-800' : 'border-slate-200'} transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#1e293b' : '#e2e8f0' }}>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className={`font-bold text-lg ${textPrimary}`}>WorkFlow Pro</span>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center mx-auto">
                <Sparkles size={18} className="text-white" />
              </div>
            )}
            <button onClick={onClose} className="lg:hidden p-1 rounded-md ${hoverBg}">
              <X size={18} className={textSecondary} />
            </button>
          </div>

          {/* Workspace Switcher */}
          {!collapsed && (
            <div className="px-3 py-3 relative">
              <button
                onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${hoverBg} ${textPrimary} text-sm font-medium border ${isDark ? 'border-slate-700' : 'border-slate-300'}`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="text-lg">{currentWorkspace?.icon || '📊'}</span>
                  <span className="truncate">{currentWorkspace?.name || 'Select Workspace'}</span>
                </span>
                <ChevronDown size={16} className={textMuted} />
              </button>
              {showWorkspaceSwitcher && (
                <div className={`absolute top-full left-3 right-3 mt-1 ${cardClass} rounded-lg shadow-xl z-50 overflow-hidden`}>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => onSwitchWorkspace(ws.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} ${textPrimary} text-left`}
                    >
                      <span className="text-lg">{ws.icon}</span>
                      <span className="truncate">{ws.name}</span>
                      {ws.id === currentWorkspace?.id && <Check size={14} className="ml-auto text-indigo-400" />}
                    </button>
                  ))}
                  <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <button
                      onClick={() => { onNewWorkspace(); setShowWorkspaceSwitcher(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} text-indigo-400`}
                    >
                      <Plus size={16} /> Create Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nav links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : `${textSecondary} ${hoverBg}`
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.id === 'notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="px-3 py-3 space-y-2 border-t" style={{ borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }}>
            <button
              onClick={onNewTask}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors ${collapsed ? 'justify-center' : ''}`}
            >
              <Plus size={16} />
              {!collapsed && 'New Task'}
            </button>

            {!collapsed && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs">
                  {isOnline ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-red-400" />}
                  <span className={isOnline ? 'text-emerald-400' : 'text-red-400'}>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <HardDrive size={14} className={textMuted} />
                  <span className={textMuted}>Local</span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="px-3 py-3 border-t relative" style={{ borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }}>
            {!collapsed ? (
              <>
                <button
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg ${hoverBg}`}
                >
                  <Avatar user={currentUser} size={36} />
                  <div className="flex-1 text-left min-w-0">
                    <div className={`text-sm font-medium truncate ${textPrimary}`}>{currentUser.name}</div>
                    <div className="mt-0.5"><RoleBadge role={currentUser.role} /></div>
                  </div>
                  <ChevronDown size={16} className={textMuted} />
                </button>
                {showRoleSwitcher && (
                  <div className={`absolute bottom-full left-3 right-3 mb-1 ${cardClass} rounded-lg shadow-xl z-50 overflow-hidden`}>
                    <div className={`px-3 py-2 text-xs font-semibold ${textMuted} uppercase`}>Switch User (Demo)</div>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => onSwitchUser(u.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} ${textPrimary} text-left`}
                      >
                        <Avatar user={u} size={24} />
                        <span className="truncate flex-1">{u.name}</span>
                        <RoleBadge role={u.role} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center">
                <Avatar user={currentUser} size={32} />
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center justify-center py-2 border-t ${hoverBg} ${textSecondary}`}
            style={{ borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
};

// ============================================================
// HEADER
// ============================================================

const Header = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, inputClass, hoverBg,
  searchQuery, setSearchQuery, searchResults, onOpenCommandPalette, onOpenTask,
  onOpenProject, onOpenWorkspace, unreadCount, showNotifications, setShowNotifications,
  notifications, onMarkAllRead, onMarkRead, theme, onToggleTheme,
  onExport, onImport, showExportMenu, setShowExportMenu, onUndo, onRedo, canUndo, canRedo,
  onMobileMenu, currentUser,
}) => {
  return (
    <header className={`sticky top-0 z-20 h-16 ${cardClass} border-b flex items-center gap-3 px-4`} style={{ borderBottomColor: isDark ? '#1e293b' : '#e2e8f0' }}>
      <button onClick={onMobileMenu} className={`lg:hidden p-2 rounded-lg ${hoverBg}`}>
        <Menu size={20} className={textSecondary} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <div className="relative">
          <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, projects, workspaces..."
            className={`w-full pl-10 pr-16 py-2 rounded-lg border text-sm ${inputClass} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
          />
          <button
            onClick={onOpenCommandPalette}
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-md text-xs ${isDark ? 'bg-slate-700' : 'bg-slate-200'} ${textMuted}`}
          >
            <Command size={12} /> K
          </button>
        </div>

        {/* Live search results */}
        {searchQuery && (
          <div className={`absolute top-full left-0 right-0 mt-2 ${cardClass} rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto`}>
            {searchResults.tasks.length === 0 && searchResults.projects.length === 0 && searchResults.workspaces.length === 0 ? (
              <div className={`px-4 py-6 text-center text-sm ${textMuted}`}>No results found</div>
            ) : (
              <div className="py-2">
                {searchResults.tasks.length > 0 && (
                  <div>
                    <div className={`px-3 py-1 text-xs font-semibold uppercase ${textMuted}`}>Tasks</div>
                    {searchResults.tasks.map((t) => (
                      <button key={t.id} onClick={() => { onOpenTask(t.id); setSearchQuery(''); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} ${textPrimary} text-left`}>
                        <ListTodo size={14} className={textMuted} />
                        <span className="truncate flex-1">{t.title}</span>
                        <PriorityBadge priority={t.priority} />
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.projects.length > 0 && (
                  <div>
                    <div className={`px-3 py-1 text-xs font-semibold uppercase ${textMuted}`}>Projects</div>
                    {searchResults.projects.map((p) => (
                      <button key={p.id} onClick={() => { onOpenProject(p.id); setSearchQuery(''); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} ${textPrimary} text-left`}>
                        <FolderKanban size={14} className={textMuted} />
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.workspaces.length > 0 && (
                  <div>
                    <div className={`px-3 py-1 text-xs font-semibold uppercase ${textMuted}`}>Workspaces</div>
                    {searchResults.workspaces.map((w) => (
                      <button key={w.id} onClick={() => { onOpenWorkspace(w.id); setSearchQuery(''); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} ${textPrimary} text-left`}>
                        <span>{w.icon}</span>
                        <span className="truncate">{w.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Undo/Redo */}
      <div className="hidden md:flex items-center gap-1">
        <button onClick={onUndo} disabled={!canUndo} className={`p-2 rounded-lg ${hoverBg} ${canUndo ? textSecondary : textMuted} disabled:opacity-40`} title="Undo (Cmd+Z)">
          <Undo2 size={18} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={`p-2 rounded-lg ${hoverBg} ${canRedo ? textSecondary : textMuted} disabled:opacity-40`} title="Redo (Cmd+Y)">
          <Redo2 size={18} />
        </button>
      </div>

      {/* Export/Import */}
      <div className="relative hidden md:block">
        <button onClick={() => setShowExportMenu(!showExportMenu)} className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`} title="Export / Import">
          <Download size={18} />
        </button>
        {showExportMenu && (
          <div className={`absolute top-full right-0 mt-1 ${cardClass} rounded-lg shadow-xl z-50 w-48 py-1`}>
            <button onClick={onExport} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} ${textPrimary} text-left`}>
              <Download size={14} /> Export JSON
            </button>
            <label className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${hoverBg} ${textPrimary} text-left cursor-pointer`}>
              <Upload size={14} /> Import JSON
              <input type="file" accept=".json" className="hidden" onChange={onImport} />
            </label>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button onClick={onToggleTheme} className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`} title="Toggle theme">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-lg ${hoverBg} ${textSecondary}`}>
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">{unreadCount}</span>
          )}
        </button>
        {showNotifications && (
          <div className={`absolute top-full right-0 mt-2 ${cardClass} rounded-lg shadow-xl z-50 w-80 max-h-96 overflow-y-auto`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <span className={`font-semibold ${textPrimary}`}>Notifications</span>
              <button onClick={onMarkAllRead} className="text-xs text-indigo-400 hover:underline">Mark all read</button>
            </div>
            <div className="py-1">
              {notifications.length === 0 ? (
                <div className={`px-4 py-6 text-center text-sm ${textMuted}`}>No notifications</div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left ${hoverBg} ${n.read ? 'opacity-60' : ''}`}
                  >
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-slate-600' : 'bg-indigo-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${textPrimary}`}>{n.text}</div>
                      <div className={`text-xs ${textMuted} mt-0.5`}>{relativeTime(n.createdAt)}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// ============================================================
// DASHBOARD VIEW
// ============================================================

const DashboardView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg, inputClass,
  stats, tasks, projects, activityLogs, users, onOpenTask, onGoToTasks, onGoToProject,
  currentWorkspace,
}) => {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: ListChecks, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Completed', value: stats.completed, icon: CircleCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'High Priority', value: stats.highPriority, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>{currentWorkspace?.name} Dashboard</h1>
        <p className={`text-sm ${textSecondary} mt-1`}>Overview of your workspace activity and progress</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${cardClass} rounded-xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon size={20} className={card.color} />
                </div>
              </div>
              <div className={`text-3xl font-bold ${textPrimary}`}>{card.value}</div>
              <div className={`text-sm ${textSecondary} mt-1`}>{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project progress */}
        <div className={`${cardClass} rounded-xl p-5 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold ${textPrimary}`}>Project Progress</h2>
            <button onClick={onGoToTasks} className="text-xs text-indigo-400 hover:underline">View all tasks</button>
          </div>
          <div className="space-y-4">
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const completed = projectTasks.filter((t) => t.status === 'Done').length;
              const pct = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
              return (
                <button
                  key={project.id}
                  onClick={() => onGoToProject(project.id)}
                  className={`w-full text-left p-3 rounded-lg ${hoverBg} transition-colors`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <span className={`text-sm font-medium ${textPrimary}`}>{project.name}</span>
                    </div>
                    <span className={`text-xs ${textSecondary}`}>{completed}/{projectTasks.length} done · {pct}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: project.color }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${cardClass} rounded-xl p-5`}>
          <h2 className={`font-semibold ${textPrimary} mb-4`}>Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activityLogs.slice(0, 8).map((log) => {
              const user = users.find((u) => u.id === log.userId);
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <Avatar user={user} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${textPrimary}`}>
                      <span className="font-medium">{user?.name || 'Unknown'}</span>
                      <span className={textSecondary}> {log.detail.toLowerCase().includes('created') ? 'created' : log.detail.toLowerCase().includes('deleted') ? 'deleted' : 'updated'}</span>
                    </div>
                    <div className={`text-xs ${textMuted} truncate`}>{log.entityName}</div>
                    <div className={`text-xs ${textMuted} mt-0.5`}>{relativeTime(log.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion overview */}
      <div className={`${cardClass} rounded-xl p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold ${textPrimary}`}>Overall Completion</h2>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className={`text-2xl font-bold ${textPrimary}`}>{completionRate}%</span>
          </div>
        </div>
        <div className={`h-4 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PROJECTS VIEW
// ============================================================

const ProjectsView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg, inputClass,
  projects, tasks, onOpenProject, onNewProject, canDelete, onDeleteProject, selectedProjectId,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Projects</h1>
          <p className={`text-sm ${textSecondary} mt-1`}>Manage and track all projects in this workspace</p>
        </div>
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const completed = projectTasks.filter((t) => t.status === 'Done').length;
          const pct = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
          return (
            <div key={project.id} className={`${cardClass} rounded-xl p-5 group`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
                    <FolderKanban size={20} style={{ color: project.color }} />
                  </div>
                  <div>
                    <div className={`font-semibold ${textPrimary}`}>{project.name}</div>
                    <div className={`text-xs ${textMuted}`}>{projectTasks.length} tasks</div>
                  </div>
                </div>
                {canDelete && (
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className={`p-1.5 rounded-lg ${hoverBg} text-red-400 opacity-0 group-hover:opacity-100 transition-opacity`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className={`text-sm ${textSecondary} mb-4 line-clamp-2`}>{project.description}</p>
              <div className={`h-2 rounded-full overflow-hidden mb-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: project.color }} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${textMuted}`}>{completed}/{projectTasks.length} completed</span>
                <button
                  onClick={() => onOpenProject(project.id)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:gap-2 transition-all"
                >
                  Open <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// TASKS VIEW (Kanban / List / Calendar)
// ============================================================

const TasksView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg, inputClass,
  tasks, allTasks, viewMode, setViewMode, defaultView, onOpenTask, onNewTask,
  onMoveTask, onSort, sortField, sortDir, selectedTaskIds, setSelectedTaskIds,
  onBulkDelete, onBulkStatus, canEdit, users, calendarMonth, setCalendarMonth,
  draggedTaskId, setDraggedTaskId, dragOverColumn, setDragOverColumn,
  currentProject, projects, onClearProject,
}) => {
  const viewTabs = [
    { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
    { id: 'list', label: 'List', icon: TableIcon },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>
            {currentProject ? currentProject.name : 'All Tasks'}
          </h1>
          <p className={`text-sm ${textSecondary} mt-1`}>
            {currentProject ? currentProject.description : `${tasks.length} tasks across all projects`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentProject && (
            <button onClick={onClearProject} className={`px-3 py-2 rounded-lg text-sm ${hoverBg} ${textSecondary} flex items-center gap-1`}>
              <X size={14} /> Clear filter
            </button>
          )}
          <button
            onClick={onNewTask}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* View switcher */}
      <div className={`inline-flex p-1 rounded-lg ${isDark ? 'bg-slate-800/60' : 'bg-slate-200'} gap-1`}>
        {viewTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-500 text-white' : `${textSecondary} ${hoverBg}`
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Bulk actions bar */}
      {selectedTaskIds.length > 0 && viewMode === 'list' && (
        <div className={`${cardClass} rounded-lg p-3 flex items-center gap-3`}>
          <span className={`text-sm ${textPrimary}`}>{selectedTaskIds.length} selected</span>
          <div className="flex-1" />
          {['To Do', 'In Progress', 'Review', 'Done'].map(s => (
            <button key={s} onClick={() => onBulkStatus(s)} className={`px-3 py-1 rounded-md text-xs ${hoverBg} ${textSecondary}`}>
              {s}
            </button>
          ))}
          <button onClick={onBulkDelete} className="px-3 py-1 rounded-md text-xs bg-red-500/15 text-red-400 hover:bg-red-500/25">
            Delete
          </button>
          <button onClick={() => setSelectedTaskIds([])} className={`px-2 py-1 rounded-md ${hoverBg} ${textMuted}`}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Views */}
      {viewMode === 'kanban' && (
        <KanbanView
          isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
          textMuted={textMuted} hoverBg={hoverBg}
          tasks={tasks}
          onOpenTask={onOpenTask}
          onMoveTask={onMoveTask}
          canEdit={canEdit}
          users={users}
          draggedTaskId={draggedTaskId}
          setDraggedTaskId={setDraggedTaskId}
          dragOverColumn={dragOverColumn}
          setDragOverColumn={setDragOverColumn}
        />
      )}

      {viewMode === 'list' && (
        <ListView
          isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
          textMuted={textMuted} hoverBg={hoverBg}
          tasks={tasks}
          onOpenTask={onOpenTask}
          onSort={onSort}
          sortField={sortField}
          sortDir={sortDir}
          selectedTaskIds={selectedTaskIds}
          setSelectedTaskIds={setSelectedTaskIds}
          canEdit={canEdit}
          users={users}
          projects={projects}
        />
      )}

      {viewMode === 'calendar' && (
        <CalendarView
          isDark={isDark} cardClass={cardClass} textPrimary={textPrimary} textSecondary={textSecondary}
          textMuted={textMuted} hoverBg={hoverBg}
          tasks={tasks}
          calendarMonth={calendarMonth}
          setCalendarMonth={setCalendarMonth}
          onOpenTask={onOpenTask}
          users={users}
        />
      )}
    </div>
  );
};

// ---- Kanban ----
const KanbanView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg,
  tasks, onOpenTask, onMoveTask, canEdit, users, draggedTaskId, setDraggedTaskId,
  dragOverColumn, setDragOverColumn,
}) => {
  const columns = [
    { status: 'To Do', color: '#64748b' },
    { status: 'In Progress', color: '#6366f1' },
    { status: 'Review', color: '#f59e0b' },
    { status: 'Done', color: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        const isDragOver = dragOverColumn === col.status;
        return (
          <div
            key={col.status}
            className={`rounded-xl ${cardClass} min-h-[200px] transition-colors ${isDragOver ? 'ring-2 ring-indigo-500/50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); if (canEdit) setDragOverColumn(col.status); }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (canEdit && draggedTaskId) {
                onMoveTask(draggedTaskId, col.status);
                setDraggedTaskId(null);
                setDragOverColumn(null);
              }
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: isDark ? '#1e293b' : '#e2e8f0' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <span className={`text-sm font-semibold ${textPrimary}`}>{col.status}</span>
              </div>
              <span className={`text-xs ${textMuted}`}>{colTasks.length}</span>
            </div>
            <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
              {colTasks.map((task) => {
                const assignee = users.find((u) => u.id === task.assigneeId);
                const overdue = task.status !== 'Done' && isOverdue(task.dueDate);
                const subtaskDone = task.subtasks.filter(s => s.done).length;
                return (
                  <div
                    key={task.id}
                    draggable={canEdit}
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragEnd={() => { setDraggedTaskId(null); setDragOverColumn(null); }}
                    onClick={() => onOpenTask(task.id)}
                    className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'} border ${isDark ? 'border-slate-700' : 'border-slate-200'} cursor-pointer ${hoverBg} transition-all ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-sm font-medium ${textPrimary} line-clamp-2`}>{task.title}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    {task.subtasks.length > 0 && (
                      <div className={`text-xs ${textMuted} mb-2 flex items-center gap-1`}>
                        <ListChecks size={12} /> {subtaskDone}/{task.subtasks.length} subtasks
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-400' : textMuted}`}>
                        <Clock size={12} /> {formatDate(task.dueDate)}
                      </div>
                      {assignee && <Avatar user={assignee} size={22} />}
                    </div>
                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {task.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'} ${textMuted}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {colTasks.length === 0 && (
                <div className={`text-center py-8 text-sm ${textMuted}`}>No tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- List View ----
const ListView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg,
  tasks, onOpenTask, onSort, sortField, sortDir, selectedTaskIds, setSelectedTaskIds,
  canEdit, users, projects,
}) => {
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowDown size={12} className="opacity-30" />;
    return sortDir === 'asc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />;
  };

  const toggleSelect = (id) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedTaskIds.length === tasks.length) setSelectedTaskIds([]);
    else setSelectedTaskIds(tasks.map((t) => t.id));
  };

  return (
    <div className={`${cardClass} rounded-xl overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} text-xs font-semibold uppercase ${textMuted}`}>
              <th className="p-3 text-left w-8">
                <input type="checkbox" checked={selectedTaskIds.length === tasks.length && tasks.length > 0} onChange={toggleAll} className="rounded" />
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => onSort('title')}>
                <div className="flex items-center gap-1">Task <SortIcon field="title" /></div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => onSort('status')}>
                <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => onSort('priority')}>
                <div className="flex items-center gap-1">Priority <SortIcon field="priority" /></div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => onSort('assignee')}>
                <div className="flex items-center gap-1">Assignee <SortIcon field="assignee" /></div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => onSort('dueDate')}>
                <div className="flex items-center gap-1">Due Date <SortIcon field="dueDate" /></div>
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
            {tasks.map((task) => {
              const assignee = users.find((u) => u.id === task.assigneeId);
              const overdue = task.status !== 'Done' && isOverdue(task.dueDate);
              const isSelected = selectedTaskIds.includes(task.id);
              return (
                <tr key={task.id} className={`${hoverBg} transition-colors ${isSelected ? (isDark ? 'bg-indigo-500/10' : 'bg-indigo-50') : ''}`}>
                  <td className="p-3">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(task.id)} className="rounded" />
                  </td>
                  <td className="p-3 cursor-pointer" onClick={() => onOpenTask(task.id)}>
                    <div className={`font-medium text-sm ${textPrimary}`}>{task.title}</div>
                  </td>
                  <td className="p-3 cursor-pointer" onClick={() => onOpenTask(task.id)}>
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="p-3 cursor-pointer" onClick={() => onOpenTask(task.id)}>
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="p-3 cursor-pointer" onClick={() => onOpenTask(task.id)}>
                    {assignee ? <Avatar user={assignee} size={24} showName /> : <span className={`text-xs ${textMuted}`}>Unassigned</span>}
                  </td>
                  <td className="p-3 cursor-pointer" onClick={() => onOpenTask(task.id)}>
                    <span className={`text-xs ${overdue ? 'text-red-400 font-medium' : textSecondary}`}>{formatDate(task.dueDate)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---- Calendar View ----
const CalendarView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg,
  tasks, calendarMonth, setCalendarMonth, onOpenTask, users,
}) => {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));

  const monthName = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  return (
    <div className={`${cardClass} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-semibold ${textPrimary}`}>{monthName}</h2>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className={`p-1.5 rounded-lg ${hoverBg} ${textSecondary}`}><ChevronLeft size={18} /></button>
          <button onClick={nextMonth} className={`p-1.5 rounded-lg ${hoverBg} ${textSecondary}`}><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase mb-2 ${textMuted}">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) return <div key={idx} className="h-24" />;
          const dayStr = date.toISOString().split('T')[0];
          const dayTasks = tasks.filter((t) => t.dueDate.startsWith(dayStr));
          const isToday = new Date().toISOString().split('T')[0] === dayStr;

          return (
            <div
              key={idx}
              className={`h-24 p-1 rounded-lg border ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'} overflow-y-auto ${isToday ? 'ring-1 ring-indigo-500' : ''}`}
            >
              <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-indigo-400' : textMuted}`}>{date.getDate()}</div>
              <div className="space-y-1">
                {dayTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onOpenTask(t.id)}
                    className="w-full text-left text-[10px] px-1 py-0.5 rounded truncate bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 block"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// ACTIVITY LOG VIEW
// ============================================================

const ActivityView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg, inputClass,
  logs, users, filterUser, setFilterUser, filterAction, setFilterAction,
}) => {
  const filteredLogs = logs.filter((log) => {
    if (filterUser !== 'all' && log.userId !== filterUser) return false;
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Activity Audit Log</h1>
          <p className={`text-sm ${textSecondary} mt-1`}>Detailed audit trail of all actions in the workspace</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${inputClass}`}
          >
            <option value="all">All Users</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${inputClass}`}
          >
            <option value="all">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
            <option value="moved">Moved</option>
            <option value="status">Status Change</option>
            <option value="commented">Commented</option>
          </select>
        </div>
      </div>

      <div className={`${cardClass} rounded-xl p-5`}>
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            const user = users.find((u) => u.id === log.userId);
            return (
              <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0" style={{ borderBottomColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                <Avatar user={user} size={32} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${textPrimary}`}>
                    <span className="font-semibold">{user?.name || 'Unknown User'}</span>
                    <span className={`mx-1 text-xs px-2 py-0.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'} ${textSecondary}`}>{log.action}</span>
                    <span className="font-medium">{log.entityName}</span>
                  </div>
                  <div className={`text-xs ${textSecondary} mt-0.5`}>{log.detail}</div>
                  <div className={`text-xs ${textMuted} mt-1`}>{formatDateTime(log.createdAt)}</div>
                </div>
              </div>
            );
          })}
          {filteredLogs.length === 0 && (
            <div className={`text-center py-8 text-sm ${textMuted}`}>No activity matching filters</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// NOTIFICATIONS VIEW
// ============================================================

const NotificationsView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg,
  notifications, onMarkAllRead, onMarkRead,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Notifications</h1>
          <p className={`text-sm ${textSecondary} mt-1`}>Updates, mentions, and due date alerts</p>
        </div>
        <button onClick={onMarkAllRead} className="text-sm text-indigo-400 hover:underline">Mark all as read</button>
      </div>

      <div className={`${cardClass} rounded-xl divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
        {notifications.map((n) => (
          <div key={n.id} onClick={() => onMarkRead(n.id)} className={`p-4 flex items-start gap-3 ${hoverBg} cursor-pointer ${n.read ? 'opacity-60' : ''}`}>
            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-slate-600' : 'bg-indigo-500'}`} />
            <div className="flex-1">
              <div className={`text-sm ${textPrimary}`}>{n.text}</div>
              <div className={`text-xs ${textMuted} mt-1`}>{relativeTime(n.createdAt)}</div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className={`p-8 text-center text-sm ${textMuted}`}>No notifications</div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// TEAM VIEW
// ============================================================

const TeamView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg, inputClass,
  users, currentUser, onInviteMember, canManageTeam, onRoleChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Team & Roles</h1>
          <p className={`text-sm ${textSecondary} mt-1`}>Manage workspace members and permission levels</p>
        </div>
        {canManageTeam && (
          <button onClick={onInviteMember} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
            <UserPlus size={16} /> Invite Member
          </button>
        )}
      </div>

      <div className={`${cardClass} rounded-xl overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} text-xs font-semibold uppercase ${textMuted}`}>
              <th className="p-4 text-left">Member</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              {canManageTeam && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
            {users.map((u) => (
              <tr key={u.id} className={hoverBg}>
                <td className="p-4">
                  <Avatar user={u} size={32} showName />
                </td>
                <td className={`p-4 text-sm ${textSecondary}`}>{u.email}</td>
                <td className="p-4">
                  <RoleBadge role={u.role} />
                </td>
                {canManageTeam && (
                  <td className="p-4 text-right">
                    {u.id !== currentUser.id && (
                      <select
                        value={u.role}
                        onChange={(e) => onRoleChange(u.id, e.target.value)}
                        className={`px-2 py-1 rounded border text-xs ${inputClass}`}
                      >
                        <option value="Owner">Owner</option>
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================
// SETTINGS VIEW
// ============================================================

const SettingsView = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg, inputClass,
  state, onToggleTheme, onSetDefaultView, onSetNotificationsEnabled, onSetRealtime,
  onManualSync, syncing, onExport, onImport, onReset,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Settings</h1>
        <p className={`text-sm ${textSecondary} mt-1`}>Manage preferences and data synchronization</p>
      </div>

      <div className={`${cardClass} rounded-xl p-6 space-y-6`}>
        <h2 className={`text-lg font-semibold ${textPrimary} border-b pb-3`} style={{ borderBottomColor: isDark ? '#1e293b' : '#e2e8f0' }}>Appearance & Behavior</h2>

        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${textPrimary}`}>Dark Theme</div>
            <div className={`text-xs ${textMuted}`}>Toggle between dark and light themes</div>
          </div>
          <Toggle checked={state.theme === 'dark'} onChange={(v) => onToggleTheme(v ? 'dark' : 'light')} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${textPrimary}`}>Default Task View</div>
            <div className={`text-xs ${textMuted}`}>Preferred initial layout for tasks</div>
          </div>
          <select
            value={state.defaultView}
            onChange={(e) => onSetDefaultView(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${inputClass}`}
          >
            <option value="kanban">Kanban</option>
            <option value="list">List</option>
            <option value="calendar">Calendar</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${textPrimary}`}>Notifications</div>
            <div className={`text-xs ${textMuted}`}>Enable system and mention alerts</div>
          </div>
          <Toggle checked={state.notificationsEnabled} onChange={onSetNotificationsEnabled} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${textPrimary}`}>Simulated Real-time Sync</div>
            <div className={`text-xs ${textMuted}`}>Receive periodic mock updates from team</div>
          </div>
          <Toggle checked={state.realTimeEnabled} onChange={onSetRealtime} />
        </div>
      </div>

      <div className={`${cardClass} rounded-xl p-6 space-y-6`}>
        <h2 className={`text-lg font-semibold ${textPrimary} border-b pb-3`} style={{ borderBottomColor: isDark ? '#1e293b' : '#e2e8f0' }}>Data Management</h2>

        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${textPrimary}`}>Manual Sync</div>
            <div className={`text-xs ${textMuted}`}>Force sync all data to localStorage</div>
          </div>
          <button
            onClick={onManualSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Sync Now
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className={`font-medium ${textPrimary}`}>Export / Import</div>
            <div className={`text-xs ${textMuted}`}>Backup or restore your full app state</div>
          </div>
          <div className="flex gap-2">
            <button onClick={onExport} className={`px-3 py-1.5 rounded-lg border text-sm ${hoverBg} ${textPrimary}`}>Export JSON</button>
            <label className={`px-3 py-1.5 rounded-lg border text-sm ${hoverBg} ${textPrimary} cursor-pointer`}>
              Import JSON
              <input type="file" accept=".json" className="hidden" onChange={onImport} />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t" style={{ borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }}>
          <div>
            <div className="font-medium text-red-400">Reset Application Data</div>
            <div className={`text-xs ${textMuted}`}>Wipe all current state and restore defaults</div>
          </div>
          <button onClick={onReset} className="px-4 py-2 rounded-lg bg-red-500/15 text-red-400 text-sm font-medium hover:bg-red-500/25 transition-colors">
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// TASK DETAIL MODAL
// ============================================================

const TaskDetailModal = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg, inputClass,
  task, isCreating, users, projects, currentProjectId, onClose, onSave, onUpdate, onDelete,
  canEdit, onAddComment, onAddSubtask, onToggleSubtask, onDeleteSubtask, onConvertSubtask,
  onAddAttachment, onDeleteAttachment, currentUserId, mentionUsers,
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'To Do');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || users[0]?.id || null);
  const [projectId, setProjectId] = useState(task?.projectId || currentProjectId || projects[0]?.id || '');
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = {
      id: uid(),
      title,
      description,
      status,
      priority,
      dueDate: new Date(dueDate).toISOString(),
      assigneeId,
      projectId,
      subtasks: [],
      comments: [],
      attachments: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
    };
    onSave(newTask);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-3xl ${cardClass} rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between`}>
          <span className={`text-xs font-semibold uppercase ${textMuted}`}>
            {isCreating ? 'Create New Task' : 'Task Details'}
          </span>
          <button onClick={onClose} className={`p-1 rounded-lg ${hoverBg} ${textMuted}`}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design landing page wireframes"
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task details and acceptance criteria..."
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={`w-full px-2 py-1.5 rounded-lg border text-sm ${inputClass}`}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`w-full px-2 py-1.5 rounded-lg border text-sm ${inputClass}`}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`w-full px-2 py-1.5 rounded-lg border text-sm ${inputClass}`} />
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Project</label>
                  <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={`w-full px-2 py-1.5 rounded-lg border text-sm ${inputClass}`}>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className={`px-4 py-2 rounded-lg border text-sm ${hoverBg} ${textPrimary}`}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">Create Task</button>
              </div>
            </form>
          ) : (
            <>
              {/* Edit Mode / Existing task */}
              <div className="space-y-4">
                <input
                  type="text"
                  defaultValue={task.title}
                  onBlur={(e) => onUpdate({ ...task, title: e.target.value })}
                  className={`w-full text-xl font-bold bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none ${textPrimary}`}
                />

                <textarea
                  defaultValue={task.description}
                  onBlur={(e) => onUpdate({ ...task, description: e.target.value })}
                  className={`w-full text-sm bg-transparent border rounded-lg p-2 ${inputClass}`}
                  rows={3}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Status</label>
                    <select
                      value={task.status}
                      onChange={(e) => onUpdate({ ...task, status: e.target.value })}
                      className={`w-full px-2 py-1.5 rounded-lg border text-sm ${inputClass}`}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Priority</label>
                    <select
                      value={task.priority}
                      onChange={(e) => onUpdate({ ...task, priority: e.target.value })}
                      className={`w-full px-2 py-1.5 rounded-lg border text-sm ${inputClass}`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Assignee</label>
                    <select
                      value={task.assigneeId || ''}
                      onChange={(e) => onUpdate({ ...task, assigneeId: e.target.value })}
                      className={`w-full px-2 py-1.5 rounded-lg border text-sm ${inputClass}`}
                    >
                      {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase ${textMuted} mb-1`}>Due Date</label>
                    <input
                      type="date"
                      value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                      onChange={(e) => onUpdate({ ...task, dueDate: new Date(e.target.value).toISOString() })}
                      className={`w-full px-2 py-1.5 rounded-lg border text-sm ${inputClass}`}
                    />
                  </div>
                </div>

                {/* Subtasks */}
                <div className="pt-4 border-t" style={{ borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                  <h3 className={`text-sm font-semibold ${textPrimary} mb-2`}>Subtasks</h3>
                  <div className="space-y-2 mb-3">
                    {task.subtasks.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={s.done}
                          onChange={() => onToggleSubtask(task.id, s.id)}
                          className="rounded"
                        />
                        <span className={`flex-1 ${s.done ? 'line-through opacity-50' : textPrimary}`}>{s.title}</span>
                        <button onClick={() => onConvertSubtask(task.id, s.id)} className={`text-xs ${textMuted} hover:text-indigo-400`}>Convert to task</button>
                        <button onClick={() => onDeleteSubtask(task.id, s.id)} className={`text-xs ${textMuted} hover:text-red-400`}><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add a subtask..."
                      className={`flex-1 px-3 py-1.5 rounded-lg border text-sm ${inputClass}`}
                    />
                    <button
                      onClick={() => { if (newSubtask.trim()) { onAddSubtask(task.id, newSubtask); setNewSubtask(''); } }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div className="pt-4 border-t" style={{ borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                  <h3 className={`text-sm font-semibold ${textPrimary} mb-2`}>Comments</h3>
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {task.comments.map((c) => {
                      const user = users.find((u) => u.id === c.userId);
                      return (
                        <div key={c.id} className="flex items-start gap-2 text-sm">
                          <Avatar user={user} size={24} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${textPrimary}`}>{user?.name}</span>
                              <span className={`text-[10px] ${textMuted}`}>{relativeTime(c.createdAt)}</span>
                            </div>
                            <p className={textSecondary}>{c.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className={`flex-1 px-3 py-1.5 rounded-lg border text-sm ${inputClass}`}
                    />
                    <button
                      onClick={() => { if (newComment.trim()) { onAddComment(task.id, newComment); setNewComment(''); } }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete button */}
              <div className="pt-4 border-t flex justify-between items-center" style={{ borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                <button onClick={() => onDelete(task.id)} className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-medium hover:bg-red-500/25">
                  Delete Task
                </button>
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium">
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMMAND PALETTE
// ============================================================

const CommandPalette = ({
  isDark, cardClass, textPrimary, textSecondary, textMuted, hoverBg, inputClass,
  onClose, onNavigate, tasks, projects, workspaces, onOpenTask, onOpenProject,
  onOpenWorkspace, onNewTask, navItems,
}) => {
  const [query, setQuery] = useState('');

  const filteredNav = navItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className={`w-full max-w-xl ${cardClass} rounded-xl shadow-2xl overflow-hidden`}>
        <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center gap-2`}>
          <Search size={18} className={textMuted} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className={`w-full bg-transparent text-sm ${textPrimary} focus:outline-none`}
            autoFocus
          />
        </div>

        <div className="p-2 max-h-80 overflow-y-auto space-y-2">
          {filteredNav.length > 0 && (
            <div>
              <div className={`px-2 py-1 text-[10px] font-semibold uppercase ${textMuted}`}>Navigation</div>
              {filteredNav.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${hoverBg} ${textPrimary} text-left`}
                  >
                    <Icon size={16} className={textMuted} />
                    <span>Go to {item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div>
              <div className={`px-2 py-1 text-[10px] font-semibold uppercase ${textMuted}`}>Tasks</div>
              {filteredTasks.map(t => (
                <button
                  key={t.id}
                  onClick={() => onOpenTask(t.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${hoverBg} ${textPrimary} text-left`}
                >
                  <ListTodo size={16} className={textMuted} />
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// OTHER MODALS
// ============================================================

const CreateWorkspaceModal = ({ isDark, cardClass, textPrimary, textSecondary, inputClass, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🚀');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md ${cardClass} rounded-xl p-6 space-y-4`}>
        <h2 className={`text-lg font-bold ${textPrimary}`}>Create Workspace</h2>
        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>Workspace Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`} placeholder="e.g. Design Team" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
          <button onClick={() => { if (name.trim()) onCreate(name, icon); }} className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium">Create</button>
        </div>
      </div>
    </div>
  );
};

const CreateProjectModal = ({ isDark, cardClass, textPrimary, textSecondary, inputClass, workspaceId, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md ${cardClass} rounded-xl p-6 space-y-4`}>
        <h2 className={`text-lg font-bold ${textPrimary}`}>Create Project</h2>
        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>Project Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`} placeholder="e.g. Website Overhaul" />
        </div>
        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`} rows={2} />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
          <button onClick={() => { if (name.trim()) onCreate(name, description, color); }} className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium">Create</button>
        </div>
      </div>
    </div>
  );
};

const InviteMemberModal = ({ isDark, cardClass, textPrimary, textSecondary, inputClass, onClose, onInvite }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md ${cardClass} rounded-xl p-6 space-y-4`}>
        <h2 className={`text-lg font-bold ${textPrimary}`}>Invite Team Member</h2>
        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`} />
        </div>
        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`} />
        </div>
        <div>
          <label className={`block text-xs font-semibold ${textSecondary} mb-1`}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}>
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
          <button onClick={() => { if (name.trim() && email.trim()) onInvite(name, email, role); }} className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium">Invite</button>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isDark, cardClass, textPrimary, textSecondary, hoverBg, title, message, confirmLabel, danger, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md ${cardClass} rounded-xl p-6 space-y-4`}>
        <h2 className={`text-lg font-bold ${textPrimary}`}>{title}</h2>
        <p className={`text-sm ${textSecondary}`}>{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove, onUndo }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((t) => (
        <div key={t.id} className="bg-slate-900 border border-slate-700 text-white p-3 rounded-lg shadow-lg flex items-center justify-between gap-3 text-sm animate-slide-up">
          <span>{t.text}</span>
          <div className="flex items-center gap-2">
            {t.undoAction && (
              <button onClick={() => onUndo(t)} className="text-xs text-indigo-400 font-semibold hover:underline">Undo</button>
            )}
            <button onClick={() => onRemove(t.id)} className="text-slate-400 hover:text-white"><X size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};