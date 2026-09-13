import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserCircle2,
  X,
  XCircle,
} from "lucide-react";
import {
  getAdminUsers,
  runAdminUserAction,
  updateAdminUser,
  type AdminUser,
  type AdminUserAction,
  type AdminUserPagination,
} from "../services/userService";

const emptyPagination: AdminUserPagination = {
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  limit: 20,
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(value || 0);
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === "active") {
    return (
      <span className="flex items-center gap-1 text-green-400 whitespace-nowrap">
        <CheckCircle2 size={16} /> Active
      </span>
    );
  }

  if (normalized === "banned" || normalized === "blocked") {
    return (
      <span className="flex items-center gap-1 text-red-400 whitespace-nowrap">
        <XCircle size={16} /> Blocked
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-yellow-400 whitespace-nowrap">
      <Clock size={16} /> {formatStatus(normalized)}
    </span>
  );
}

function getErrorMessage(err: unknown, fallback: string) {
  const apiError = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return apiError.response?.data?.message || apiError.message || fallback;
}

const editableUserFields = [
  { key: "telegramId", label: "Telegram ID", type: "number" },
  { key: "Name", label: "Name", type: "text" },
  { key: "username", label: "Username", type: "text" },
  { key: "photoUrl", label: "Photo URL", type: "text" },
  { key: "balance", label: "Balance", type: "number", step: "0.000001" },
  { key: "total_refer", label: "Referrals", type: "number" },
  { key: "total_refer_earn", label: "Referral Income", type: "number", step: "0.000001" },
  { key: "referredBy", label: "Referred By", type: "text" },
  { key: "refer_code", label: "Refer Code", type: "text" },
  { key: "totalpaid", label: "Total Paid", type: "number", step: "0.000001" },
] as const;

type EditableUserKey = (typeof editableUserFields)[number]["key"] | "accountStatus" | "Comment";
type EditForm = Record<EditableUserKey, string>;

function createEditForm(user: AdminUser): EditForm {
  return {
    telegramId: String(user.telegramId || ""),
    Name: user.Name || "",
    username: user.username || "",
    photoUrl: user.photoUrl || "",
    balance: String(user.balance ?? 0),
    total_refer: String(user.total_refer ?? 0),
    total_refer_earn: String(user.total_refer_earn ?? 0),
    referredBy: user.referredBy || "",
    refer_code: user.refer_code || "",
    accountStatus: user.accountStatus || "active",
    totalpaid: String(user.totalpaid ?? 0),
    Comment: user.Comment || "",
  };
}

function toNumber(value: string, fallback = 0) {
  if (value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export default function AdminUserPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminUserPagination>(emptyPagination);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All Status");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<AdminUserAction | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const data = await getAdminUsers(page, 20, submittedSearch);

        if (!data.success) {
          throw new Error(data.message || "Failed to load admin users.");
        }

        setUsers(data.users);
        setPagination({
          ...data.pagination,
          totalRecords: data.totalUsers,
        });
        setSelectedUserId((current) =>
          current && data.users.some((user) => user._id === current) ? current : null
        );
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load admin users."));
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [page, reloadKey, submittedSearch]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesStatus =
        filter === "All Status" || user.accountStatus.toLowerCase() === filter.toLowerCase();
      const matchesSearch =
        !query ||
        user.Name.toLowerCase().includes(query) ||
        (user.username || "").toLowerCase().includes(query) ||
        String(user.telegramId).includes(query) ||
        user._id.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [filter, search, users]);

  const stats = useMemo(() => {
    const activeUsers = users.filter((user) => user.accountStatus === "active").length;
    const blockedUsers = users.filter((user) =>
      ["banned", "blocked"].includes(user.accountStatus)
    ).length;
    const totalBalance = users.reduce((total, user) => total + (user.balance || 0), 0);

    return {
      totalUsers: pagination.totalRecords || users.length,
      activeUsers,
      blockedUsers,
      totalBalance,
    };
  }, [pagination.totalRecords, users]);

  const selected = users.find((user) => user._id === selectedUserId);

  const openUserDetails = (user: AdminUser) => {
    setSelectedUserId(user._id);
    setEditForm(createEditForm(user));
  };

  const closeUserDetails = () => {
    setSelectedUserId(null);
    setEditForm(null);
  };

  const handleUserAction = async (userId: string, action: AdminUserAction) => {
    setActionLoading(action);
    setActionMessage("");
    setError("");

    try {
      const data = await runAdminUserAction(userId, action);

      if (!data.success) {
        throw new Error(data.message || `Failed to ${action} user.`);
      }

      setActionMessage(data.message || `User ${action} completed.`);
      closeUserDetails();
      setReloadKey((value) => value + 1);
    } catch (err) {
      setError(getErrorMessage(err, `Failed to ${action} user.`));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = () => {
    setSubmittedSearch(search.trim());
    setPage(1);
    setReloadKey((value) => value + 1);
  };

  const updateFormField = (field: EditableUserKey, value: string) => {
    setEditForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSaveUser = async () => {
    if (!selected || !editForm) return;

    setSaving(true);
    setActionMessage("");
    setError("");

    const payload: any = {
      telegramId: toNumber(editForm.telegramId),
      Name: editForm.Name.trim(),
      username: editForm.username.trim() || null,
      photoUrl: editForm.photoUrl.trim(),
      balance: toNumber(editForm.balance),
      total_refer: toNumber(editForm.total_refer),
      total_refer_earn: toNumber(editForm.total_refer_earn),
      referredBy: editForm.referredBy.trim() || null,
      refer_code: editForm.refer_code.trim() || null,
      accountStatus: editForm.accountStatus,
      totalpaid: toNumber(editForm.totalpaid),
      Comment: editForm.Comment.trim() || null,
    };

    try {
      const data = await updateAdminUser(selected._id, payload);

      if (!data.success || !data.user) {
        throw new Error(data.message || "Failed to update user.");
      }

      setUsers((current) =>
        current.map((user) => (user._id === data.user?._id ? data.user : user))
      );
      setEditForm(createEditForm(data.user));
      setActionMessage(data.message || "User updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update user."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-white flex flex-col xl:flex-row gap-6 relative w-full overflow-hidden">
      <div className="flex-1 min-w-0 w-full">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Manage Users</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Manage user accounts here</p>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800/50 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-200 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 border border-slate-700/30 shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Update data
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {[
            { title: "Total Users", value: stats.totalUsers, color: "bg-cyan-600/20 border-cyan-500/50 text-cyan-400" },
            { title: "Active", value: stats.activeUsers, color: "bg-green-600/20 border-green-500/50 text-green-400" },
            { title: "Blocked", value: stats.blockedUsers, color: "bg-red-600/20 border-red-500/50 text-red-400" },
            { title: "Total Pool", value: formatNumber(stats.totalBalance), color: "bg-blue-600/20 border-blue-500/50 text-blue-400" },
          ].map((card) => (
            <div
              key={card.title}
              className={`${card.color} rounded-2xl p-3 lg:p-4 flex flex-col items-start border shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.02]`}
            >
              <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest opacity-80">{card.title}</p>
              <h3 className="text-lg lg:text-2xl font-black mt-1 truncate w-full">{card.value}</h3>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:items-center lg:justify-between bg-[#131D2D]/50 p-3 lg:p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-cyan-600 transition-all"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Banned</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-72">
               <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                }}
                placeholder="UID, Name, Username..."
                className="bg-slate-900/80 border border-slate-700 text-white px-4 py-3 rounded-xl w-full text-sm outline-none focus:ring-2 focus:ring-cyan-600 transition-all placeholder:text-slate-600 font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-xl bg-cyan-600 px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-cyan-500 shadow-lg shadow-cyan-900/30 active:scale-95"
            >
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-900 bg-red-950/20 px-4 py-3 text-sm text-red-200 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {actionMessage && (
          <div className="mb-4 rounded-xl border border-green-900 bg-green-950/20 px-4 py-3 text-sm text-green-200 animate-in fade-in slide-in-from-top-2">
            {actionMessage}
          </div>
        )}

        <div className="bg-[#131D2D] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {/* Main User Table (Now with Horizontal Scroll on Mobile) */}
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <table className="w-full text-sm text-left text-slate-300 min-w-[1000px]">
              <thead className="text-slate-400 bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="py-4 px-6 uppercase text-[10px] font-black tracking-widest">User Profile</th>
                  <th className="py-4 px-6 uppercase text-[10px] font-black tracking-widest">Telegram ID</th>
                  <th className="py-4 px-6 uppercase text-[10px] font-black tracking-widest text-cyan-400/80">Balance</th>
                  <th className="py-4 px-6 uppercase text-[10px] font-black tracking-widest">Friends invited</th>
                  <th className="py-4 px-6 uppercase text-[10px] font-black tracking-widest">Joined On</th>
                  <th className="py-4 px-6 uppercase text-[10px] font-black tracking-widest text-right">Status</th>
                  <th className="py-4 px-6 uppercase text-[10px] font-black tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading && (
                  <tr>
                    <td className="py-20 px-6 text-center" colSpan={7}>
                      <div className="flex justify-center"><div className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredUsers.map((row) => (
                    <tr key={row._id} className="hover:bg-slate-900/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {row.photoUrl ? (
                            <img
                              src={row.photoUrl}
                              alt={row.Name}
                              className="h-10 w-10 rounded-xl object-cover border border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-sm">
                                <UserCircle2 size={24} className="text-slate-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors whitespace-nowrap">{row.Name}</div>
                            <div className="text-xs text-slate-500">@{row.username || "unknown"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                         <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400 tracking-tight">{row.telegramId}</span>
                      </td>
                      <td className="py-4 px-6 font-black text-cyan-400 text-base">{formatNumber(row.balance)}</td>
                      <td className="py-4 px-6 font-bold text-slate-300">{row.total_refer} <span className="text-[10px] font-black text-slate-500 ml-1 whitespace-nowrap">REFS</span></td>
                      <td className="py-4 px-6 text-[11px] text-slate-500 font-bold uppercase tracking-tighter whitespace-nowrap">{formatDate(row.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <StatusBadge status={row.accountStatus} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openUserDetails(row)}
                          className="bg-slate-800/80 hover:bg-cyan-600 border border-slate-700/50 hover:border-cyan-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}

                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td className="py-20 px-6 text-center text-slate-500 italic" colSpan={7}>
                      No users identified in current dataset.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between pb-10">
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Page <span className="text-white bg-slate-800 px-2 py-0.5 rounded ml-1">{pagination.currentPage}</span> / <span className="text-white">{pagination.totalPages}</span> — <span className="text-cyan-400">{pagination.totalRecords || 0}</span> items
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setPage((current) => Math.max(current - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={loading || pagination.currentPage <= 1}
              className="flex-1 sm:flex-none rounded-xl bg-slate-800 px-6 py-2.5 font-black text-[10px] uppercase tracking-widest text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-30 border border-slate-700/50 shadow-lg active:scale-95"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => {
                setPage((current) => Math.min(current + 1, pagination.totalPages));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={loading || pagination.currentPage >= pagination.totalPages}
              className="flex-1 sm:flex-none rounded-xl bg-slate-800 px-6 py-2.5 font-black text-[10px] uppercase tracking-widest text-white transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-30 border border-slate-700/50 shadow-lg active:scale-95"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selected && editForm && (
        <>
          {/* Mobile Overlay Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] xl:hidden transition-opacity"
            onClick={closeUserDetails}
          />

          <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#131D2D] z-[70] xl:relative xl:z-0 xl:inset-auto xl:w-1/3 border-l xl:border border-slate-800 overflow-y-auto shadow-2xl xl:shadow-none animate-in slide-in-from-right duration-300 xl:animate-none xl:rounded-2xl">
            <div className="sticky top-0 z-10 bg-[#131D2D]/95 backdrop-blur-md px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <UserCircle2 size={20} className="text-cyan-400" />
                 User Details
              </h3>
              <button
                type="button"
                onClick={closeUserDetails}
                className="rounded-xl p-2 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white border border-slate-700"
                aria-label="Close user details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-6 flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                {selected.photoUrl ? (
                  <img
                    src={selected.photoUrl}
                    alt={selected.Name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-cyan-500/30"
                  />
                ) : (
                  <UserCircle2 size={64} className="text-slate-600" />
                )}
                <div className="min-w-0">
                  <h4 className="text-lg font-bold text-white truncate">{selected.Name}</h4>
                  <p className="text-sm text-slate-400 truncate">@{selected.username || "unknown"}</p>
                  <div className="mt-1">
                     <StatusBadge status={selected.accountStatus} />
                  </div>
                </div>
              </div>

              <div className="space-y-5 text-sm">
                <div className="grid grid-cols-1 gap-4">
                  <label>
                    <span className="mb-1.5 block text-slate-400 font-bold uppercase text-[10px] tracking-widest">Internal DB ID</span>
                    <input
                      value={selected._id}
                      readOnly
                      className="w-full rounded-xl bg-slate-900/50 border border-slate-800 px-3 py-2.5 text-slate-500 font-mono text-xs cursor-default outline-none"
                    />
                  </label>

                  {editableUserFields.map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-1.5 block text-slate-400 font-bold uppercase text-[10px] tracking-widest">{field.label}</span>
                      <input
                        type={field.type}
                        step={"step" in field ? field.step : undefined}
                        value={editForm[field.key]}
                        onChange={(event) => updateFormField(field.key, event.target.value)}
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-white outline-none transition focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
                      />
                    </label>
                  ))}

                  <label>
                    <span className="mb-1.5 block text-slate-400 font-bold uppercase text-[10px] tracking-widest">Account Status</span>
                    <select
                      value={editForm.accountStatus}
                      onChange={(event) => updateFormField("accountStatus", event.target.value)}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-white outline-none transition focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-1.5 block text-slate-400 font-bold uppercase text-[10px] tracking-widest">Internal Comment</span>
                    <textarea
                      value={editForm.Comment}
                      onChange={(event) => updateFormField("Comment", event.target.value)}
                      rows={4}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-white outline-none transition focus:ring-2 focus:ring-cyan-600 focus:border-transparent resize-none"
                      placeholder="Add a private note for this user..."
                    />
                  </label>
                </div>
              </div>

              <div className="mt-8 space-y-3 pb-10">
                <button
                  type="button"
                  onClick={handleSaveUser}
                  disabled={saving || actionLoading !== null}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-cyan-900/20"
                >
                  {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? "Saving..." : "Save changes"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                   <button
                    type="button"
                    onClick={() => handleUserAction(selected._id, "approve")}
                    disabled={actionLoading !== null}
                    className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/50 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <ShieldCheck size={16} /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserAction(selected._id, "block")}
                    disabled={actionLoading !== null}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <Ban size={16} /> Block
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleUserAction(selected._id, "trash")}
                  disabled={actionLoading !== null}
                  className="w-full bg-red-950/20 hover:bg-red-950/40 text-red-500 border border-red-900/50 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Trash2 size={16} /> Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
