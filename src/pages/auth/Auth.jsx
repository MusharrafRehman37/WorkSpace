import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import {
  Workflow,
  Zap,
  KanbanSquare,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";


const ROLES = ["Owner", "Admin", "Member", "Viewer"];

const MOCK_USERS = [
  {
    name: "Alex Carter",
    email: "alex@workflow.pro",
    role: "Workspace Owner",
    initials: "AC",
    gradient: "from-indigo-500 to-purple-500",
    badge: "Owner",
  },
  {
    name: "Sarah Kim",
    email: "sarah@workflow.pro",
    role: "Project Admin",
    initials: "SK",
    gradient: "from-fuchsia-500 to-pink-500",
    badge: "Admin",
  },
  {
    name: "John Doe",
    email: "john@workflow.pro",
    role: "Viewer",
    initials: "JD",
    gradient: "from-cyan-500 to-blue-500",
    badge: "Viewer",
  },
  {
    name: "Maya Patel",
    email: "maya@workflow.pro",
    role: "Member",
    initials: "MP",
    gradient: "from-emerald-500 to-teal-500",
    badge: "Member",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Offline-first speed",
    text: "Client-side persistence & instant load times, even on flaky networks.",
  },
  {
    icon: KanbanSquare,
    title: "Any view your team loves",
    text: "Dynamic Kanban, Table, and Calendar views — switch with one click.",
  },
  {
    icon: Users,
    title: "Real-time teamwork",
    text: "Simulated live activity feed and granular role management built in.",
  },
];

function AuthPage() {
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Owner");
  const [workspace, setWorkspace] = useState("My Workspace");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wf-remember");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setEmail(data.email);
        setRememberMe(true);
      } catch {
        localStorage.removeItem("wf-remember");
      }
    }
  }, []);

  const validate = () => {
    const next = {};
    if (mode === "signup" && !name.trim()) next["name"] = "Full name is required";
    if (!email.trim()) next["email"] = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next["email"] = "Enter a valid email address";
    if (!password) next["password"] = "Password is required";
    else if (password.length < 6) next["password"] = "Password must be at least 6 characters";
    if (mode === "signup" && !workspace.trim()) next["workspace"] = "Workspace name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const simulateLogin = (displayName) => {
    setLoading(true);
    if (rememberMe) {
      localStorage.setItem("wf-remember", JSON.stringify({ email }));
    } else {
      localStorage.removeItem("wf-remember");
    }
    setTimeout(() => {
      setLoading(false);
      toast.success(`Logged in as ${displayName}`, {
        description: "Logged in successfully! Redirecting to Workspace...",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      });
    }, 1400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    simulateLogin(mode === "signup" ? name : email.split("@").at(0) ?? "Demo User");
  };

  const handleDemoLogin = (user) => {
    setLoading(true);
    setEmail(user.email);
    setName(user.name);
    setErrors({});

    // Demo user ke liye direct local session bana kar dashboard par bhej dein
    setTimeout(() => {
      localStorage.setItem("token", "mock-demo-token-12345");
      localStorage.setItem("user", JSON.stringify({ 
        name: user.name, 
        email: user.email, 
        role: user.badge 
      }));

      setLoading(false);
      toast.success(`Logged in as ${user.name}`, {
        description: "Demo login successful! Redirecting to Workspace...",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      });

      setTimeout(() => {
        window.location.href = "/dashboard/";
      }, 1000);
    }, 800);
  };
  const switchMode = (m) => {
    setMode(m);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgb(30 41 59)",
            color: "#e2e8f0",
            backdropFilter: "blur(12px)",
          },
        }}
      />
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/40">
              <Workflow className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">WorkFlow Pro</span>
          </div>

          <h1 className="text-center text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            Supercharge your team's workspace with{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              offline-first speed.
            </span>
          </h1>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 px-2 py-3 text-center backdrop-blur transition-all duration-300 hover:border-indigo-500/40"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.2)] transition-transform duration-300 group-hover:scale-110">
                  <f.icon className="h-4 w-4" />
                </div>
                <p className="text-[11px] font-medium leading-tight text-slate-300">{f.title}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl sm:p-8">
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-800 bg-slate-950/70 p-1">
              {[
                { id: "signup", label: "Sign Up" },
                { id: "login", label: "Log In" },
                { id: "demo", label: "Demo" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchMode(tab.id)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    mode === tab.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <h2 className="mt-6 text-2xl font-bold tracking-tight">
              {mode === "signup" && "Create your workspace"}
              {mode === "login" && "Welcome back"}
              {mode === "demo" && "Fast Hackathon Demo Login"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {mode === "signup" && "Set up your account and launch in seconds."}
              {mode === "login" && "Log in to continue to your workspace."}
              {mode === "demo" && "One click — pick a mock user and jump right in."}
            </p>

            {mode === "demo" ? (
              <div className="mt-6 space-y-3">
                {MOCK_USERS.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin(u)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-600/20 disabled:opacity-60"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${u.gradient} text-xs font-bold text-white transition-transform duration-300 group-hover:scale-110`}
                    >
                      {u.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{u.name}</p>
                      <p className="truncate text-xs text-slate-400">{u.role}</p>
                    </div>
                    <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                      {u.badge}
                    </span>
                    <Sparkles className="h-4 w-4 shrink-0 text-indigo-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </button>
                ))}
                <p className="pt-2 text-center text-xs text-slate-500">
                  Clicking a card auto-fills credentials and logs in instantly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                {mode === "signup" && (
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-slate-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ada Lovelace"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    {errors["name"] && <p className="mt-1 text-xs text-red-400">{errors["name"]}</p>}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  {errors["email"] && <p className="mt-1 text-xs text-red-400">{errors["email"]}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors["password"] && <p className="mt-1 text-xs text-red-400">{errors["password"]}</p>}
                </div>

                {mode === "signup" && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-300">
                        Initial Role
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {ROLES.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all duration-200 ${
                              role === r
                                ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.25)]"
                                : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="workspace" className="mb-1.5 block text-xs font-medium text-slate-300">
                        Workspace Name
                      </label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          id="workspace"
                          type="text"
                          value={workspace}
                          onChange={(e) => setWorkspace(e.target.value)}
                          placeholder="My Workspace"
                          className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>
                      {errors["workspace"] && (
                        <p className="mt-1 text-xs text-red-400">{errors["workspace"]}</p>
                      )}
                    </div>
                  </>
                )}

                {mode === "login" && (
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-indigo-500"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/40 hover:brightness-110 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : mode === "signup" ? (
                    `Create Account & Launch Workspace`
                  ) : (
                    "Log In"
                  )}
                </button>

                {mode === "signup" && (
                  <p className="text-center text-xs text-slate-500">
                    You'll join as <span className="font-medium text-indigo-300">{role}</span> of{" "}
                    <span className="font-medium text-slate-300">{workspace || "My Workspace"}</span>.
                  </p>
                )}
              </form>
            )}

            {mode !== "demo" && (
              <div className="mt-5 border-t border-slate-800 pt-4 text-center">
                <button
                  type="button"
                  onClick={() => switchMode("demo")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-indigo-300"
                >
                  <Zap className="h-3.5 w-3.5 text-indigo-400" />
                  Just browsing? Try the Fast Demo Login
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Simulated authentication — no data leaves your browser.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;