import { useEffect, useState } from "react";
import {
  Home,
  Users,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
  Menu,
  ChevronLeft,
  X,
} from "lucide-react";
import AdminUserPage from "./AdminUserPage";
import AdminSettingsPage from "./AdminSettingsPage";
import {
  getAdminDashboardStats,
  type AdminDashboardStats,
} from "../services/userService";

type AdminSection =
  | "Dashboard"
  | "Users"
  | "Settings";

const navItems: { icon: typeof Home; label: AdminSection }[] = [
  { icon: Home, label: "Dashboard" },
  { icon: Users, label: "Users" },
  { icon: Settings, label: "Settings" },
];

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(value || 0);
}

function getErrorMessage(err: unknown, fallback: string) {
  const apiError = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return apiError.response?.data?.message || apiError.message || fallback;
}

function DashboardHome() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError("");

      try {
        const data = await getAdminDashboardStats();

        if (!data.success) {
          throw new Error(data.message || "Failed to load dashboard stats.");
        }

        setStats(data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load dashboard stats."));
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {[
          { color: "bg-cyan-600/20 border-cyan-500/50 text-cyan-400", icon: Users, title: "New users today", value: formatNumber(stats?.cards.todayUsers) },
          { color: "bg-purple-600/20 border-purple-500/50 text-purple-400", icon: Users, title: "Users last 7 days", value: formatNumber(stats?.cards.last7DaysUsers) },
          { color: "bg-green-600/20 border-green-500/50 text-green-400", icon: Users, title: "Users this month", value: formatNumber(stats?.cards.thisMonthUsers) },
          { color: "bg-orange-600/20 border-orange-500/50 text-orange-400", icon: Users, title: "All users", value: formatNumber(stats?.cards.totalUsers) },
        ].map((card, i) => (
          <div
            key={i}
            className={`${card.color} rounded-2xl p-3 sm:p-4 flex flex-col items-start border shadow-sm backdrop-blur-sm transition-all active:scale-95`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <card.icon size={18} className="opacity-80" />
            </div>
            <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest opacity-60">{card.title}</p>
            <h3 className="text-sm sm:text-lg lg:text-2xl font-black mt-0.5 truncate w-full">{card.value}</h3>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-900 bg-red-950/20 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-6 flex justify-center py-10">
           <div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="bg-[#131D2D] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold">Top 20 Users</h3>
        </div>

        {/* Desktop View: Table (Now with Horizontal Scroll on Mobile) */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full text-sm text-left text-slate-300 min-w-[800px]">
            <thead className="text-slate-400 bg-slate-900/50 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4 uppercase text-[10px] font-black tracking-widest">#</th>
                <th className="py-3 px-4 uppercase text-[10px] font-black tracking-widest">User Profile</th>
                <th className="py-3 px-4 uppercase text-[10px] font-black tracking-widest">Telegram ID</th>
                <th className="py-3 px-4 uppercase text-[10px] font-black tracking-widest">Balance</th>
                <th className="py-3 px-4 uppercase text-[10px] font-black tracking-widest">Invited</th>
                <th className="py-3 px-4 uppercase text-[10px] font-black tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stats?.topUsers.map((user, index) => (
                <tr key={user._id} className="hover:bg-slate-900/50 transition-colors group">
                  <td className="py-3 px-4 font-bold text-slate-500">#{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap">{user.Name}</div>
                    <div className="text-xs text-slate-400">@{user.username || "unknown"}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-300">
                    <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">{user.telegramId}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-cyan-400 text-base">{formatNumber(user.balance)}</td>
                  <td className="py-3 px-4 font-medium">{user.total_refer}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                       <div className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                       {user.accountStatus}
                    </span>
                  </td>
                </tr>
              ))}

              {!loading && (!stats || stats.topUsers.length === 0) && (
                <tr>
                  <td className="py-20 px-4 text-center text-slate-500 italic" colSpan={6}>
                    No top users identified.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function EmptySection({ title }: { title: AdminSection }) {
  return (
    <div className="bg-[#131D2D] rounded-2xl border border-slate-800 p-8 shadow-xl">
      <h3 className="text-lg font-black uppercase tracking-widest">{title}</h3>
      <p className="mt-4 text-sm text-slate-500 font-medium italic">
        Module interface for {title} will be rendered here.
      </p>
    </div>
  );
}

export default function AdminDashboard({
  initialSection,
  onLogout,
}: {
  initialSection?: AdminSection;
  onLogout?: () => void;
}) {
  const [activeSection, setActiveSection] = useState<AdminSection>(initialSection ?? "Dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    if (activeSection === "Dashboard") return <DashboardHome />;
    if (activeSection === "Users") return <AdminUserPage />;
    if (activeSection === "Settings") return <AdminSettingsPage />;

    return <EmptySection title={activeSection} />;
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className={`p-6 flex items-center ${isCollapsed && !mobile ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2 overflow-hidden transition-all">
            <div className="h-8 w-8 bg-cyan-500 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-[#0B1320]">
              A
            </div>
            {(!isCollapsed || mobile) && (
              <h1 className="text-xl font-bold whitespace-nowrap tracking-tight">Dashboard</h1>
            )}
          </div>

          {!mobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700/50 shadow-sm"
            >
              {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}

          {mobile && (
             <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700/50"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="mt-6 space-y-1.5 px-3">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveSection(item.label);
                if (mobile) setIsMobileMenuOpen(false);
              }}
              title={isCollapsed && !mobile ? item.label : ""}
              className={`flex items-center ${
                isCollapsed && !mobile ? "justify-center" : "gap-3 px-4"
              } w-full py-3 rounded-xl transition-all duration-200 ${
                activeSection === item.label
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon size={20} className={activeSection === item.label ? "scale-110" : ""} />
              {(!isCollapsed || mobile) && <span className="font-semibold text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <button
          onClick={onLogout}
          className={`flex items-center ${
            isCollapsed && !mobile ? "justify-center" : "gap-3 px-4"
          } py-3 w-full rounded-xl text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-all group`}
          title={isCollapsed && !mobile ? "Logout" : ""}
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          {(!isCollapsed || mobile) && <span className="font-semibold text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0B1320] text-white selection:bg-cyan-500/30">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-screen z-40 ${
          isCollapsed ? "w-20" : "w-64"
        } bg-[#131D2D] border-r border-slate-800 transition-all duration-300 ease-in-out shadow-2xl`}
      >
        <Sidebar />
      </aside>

      {/* Desktop Sidebar Spacer to prevent content overlap */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`} />

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 bg-[#131D2D] border-r border-slate-800 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar mobile />
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 min-w-0 pb-20 lg:pb-0 overflow-x-hidden">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#0B1320]/80 backdrop-blur-xl px-4 py-3 lg:px-6 lg:py-4 border-b border-slate-800/50 shadow-sm">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-800/50 text-slate-300 border border-slate-700/30"
              >
                <Menu size={20} />
              </button>
              <div>
                 <h2 className="text-lg lg:text-2xl font-black truncate tracking-tight">{activeSection}</h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest lg:hidden">Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-5">
              <div className="hidden sm:flex items-center gap-4">
                <div className="relative cursor-pointer group">
                    <Bell size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-cyan-500 rounded-full border-2 border-[#0B1320]"></div>
                </div>
                <MessageSquare size={20} className="text-slate-400 hover:text-white cursor-pointer transition-colors" />
              </div>
              <div className="flex items-center gap-2.5 bg-slate-800/50 border border-slate-700/30 px-2 lg:px-4 py-1.5 rounded-2xl group cursor-pointer hover:bg-slate-800 transition-all">
                <div className="h-7 w-7 bg-cyan-500 rounded-full shadow-lg shadow-cyan-900/40 flex items-center justify-center font-bold text-[#0B1320] text-xs">
                    AD
                </div>
                <div className="hidden lg:block text-left">
                    <span className="block text-xs font-black uppercase tracking-wider">Super Admin</span>
                    <span className="block text-[10px] text-green-400 font-bold uppercase leading-none">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8 w-full">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#131D2D]/95 backdrop-blur-xl border-t border-slate-800/50 px-6 py-2 pb-8 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
         {navItems.map((item) => (
           <button
             key={item.label}
             onClick={() => setActiveSection(item.label)}
             className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${
               activeSection === item.label ? "text-cyan-400" : "text-slate-500"
             }`}
           >
             <div className={`p-2.5 rounded-2xl transition-all duration-300 ${activeSection === item.label ? "bg-cyan-500/10 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]" : ""}`}>
                <item.icon size={22} className={activeSection === item.label ? "scale-110" : ""} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
             {activeSection === item.label && (
                <div className="absolute -bottom-2 h-1 w-10 bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-in fade-in zoom-in duration-300"></div>
             )}
           </button>
         ))}
      </nav>
    </div>
  );
}
