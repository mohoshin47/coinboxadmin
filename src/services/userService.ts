import axios from 'axios';
import type { GlobalConfig } from '../types/globalConfig';

const API =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : 'https://krybonapi.onrender.com');

export type AdminTaskAction = 'approve' | 'reject' | 'cancel' | 'delete' | 'trash';
export type AdminUserAction = 'approve' | 'block' | 'trash';
export type AdminWithdrawalAction = 'approve' | 'reject' | 'paid';

export type AdminTaskType =
  | 'telegram_channel'
  | 'telegram_bot'
  | 'youtube_video'
  | 'facebook_video'
  | 'website_visitor'
  | 'custom_url'
  | 'watch_ads';

export type AdminTask = {
  _id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  reward: number;
  cooldownHours: number;
  oneTime: boolean;
  totalCompleted: number;
  maxComplete: number;
  createdBy: number;
  status: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminTaskStats = {
  totalTasks: number;
  pendingTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
};

export type AdminTaskPagination = {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
};

export type AdminTasksResponse = {
  success: boolean;
  message?: string;
  stats: AdminTaskStats;
  pagination: AdminTaskPagination;
  tasks: AdminTask[];
};

export type AdminTaskActionResponse = {
  success: boolean;
  message?: string;
  task?: AdminTask;
};

export type CreateAdminTaskPayload = {
  type: AdminTaskType;
  url: string;
  reward: number;
  cooldownHours: number;
  maxComplete: number;
  createdBy: number;
};

export type CreateAdminTaskResponse = {
  success: boolean;
  message?: string;
  task?: AdminTask;
};

export type AdminProxy = {
  _id: string;
  ip: string;
  username?: string | null;
  password?: string | null;
  author?: string | null;
  country?: string | null;
  servertime?: string | null;
  status: string;
  totalConnect: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminProxyPagination = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
};

export type AdminProxyListResponse = {
  success: boolean;
  message?: string;
  data: AdminProxy[];
  page: number;
  totalPages: number;
  total: number;
  limit: number;
};

export type ProxyActionResponse = {
  success: boolean;
  message?: string;
};

export type AdminPasswordResponse = {
  success: boolean;
  message?: string;
};

export type AdminUser = {
  _id: string;
  telegramId: number;
  username?: string | null;
  Name: string;
  photoUrl?: string;
  balance: number;
  total_refer: number;
  total_refer_earn: number;
  referredBy: string | null;
  totaltaskscompleted: number;
  refer_code?: string;
  accountStatus: 'active' | 'blocked' | string;
  Comment?: string | null;
  totalpaid: number;
  lastDailyClaimAt: string | null;
  verificationCode?: string | null;
  isVerified: boolean;
  isTasksCompleted: boolean;
  completed_channels: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminUserPagination = {
  currentPage: number;
  totalPages: number;
  totalRecords?: number;
  limit: number;
};

export type AdminUsersResponse = {
  success: boolean;
  message?: string;
  totalUsers: number;
  pagination: AdminUserPagination;
  users: AdminUser[];
};

export type AdminUserActionResponse = {
  success: boolean;
  message?: string;
  user?: AdminUser;
};

export type AdminWithdrawalUser = {
  telegramId: number;
  username?: string | null;
  Name?: string;
  photoUrl?: string;
  balance?: number;
  accountStatus?: string;
  referrals?: number;
  totalreferralsincome?: number;
  referredBy?: number | null;
  totaltaskscompleted?: number;
  totalAdsShow?: number;
  totalAdsClicked?: number;
  Comment?: string | null;
};

export type AdminReferralActivity = {
  activeReferrals: number;
  totalReferrals: number;
  activeReferralPercentage: number;
};

export type AdminWithdrawal = {
  _id: string;
  telegramId: number;
  amount: number;
  walletAddress: string;
  network: string;
  fee: number;
  receiveAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | string;
  txHash: string;
  createdAt: string;
  updatedAt: string;
  country?: string | null;
  ip?: string | null;
  referralActivity?: AdminReferralActivity | null;
  user?: AdminWithdrawalUser | null;
};

export type AdminWithdrawalStats = {
  totalWithdrawals: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  paidWithdrawals: number;
  rejectedWithdrawals: number;
};

export type AdminWithdrawalPagination = {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
};

export type AdminWithdrawalsResponse = {
  success: boolean;
  message?: string;
  stats: AdminWithdrawalStats;
  pagination: AdminWithdrawalPagination;
  withdrawals: AdminWithdrawal[];
};

export type AdminWithdrawalActionResponse = {
  success: boolean;
  message?: string;
  withdrawal?: AdminWithdrawal;
};

export type DashboardWithdrawalMetric = {
  count: number;
  amount: number;
  receiveAmount: number;
};

export type AdminDashboardStats = {
  success: boolean;
  message?: string;
  cards: {
    totalUsers: number;
    todayUsers: number;
    last7DaysUsers: number;
    thisMonthUsers: number;
  };
  users: {
    today: number;
    last7Days: number;
    thisMonth: number;
    allTime: number;
  };
  paid: {
    today: DashboardWithdrawalMetric;
    last7Days: DashboardWithdrawalMetric;
    thisMonth: DashboardWithdrawalMetric;
    allTime: DashboardWithdrawalMetric;
  };
  topUsers: AdminUser[];
};

export type AdminTaskStatsResponse = {
  success: boolean;
  data: {
    today: number;
    last7Days: number;
    last30Days: number;
    allTime: number;
  };
};

export type GlobalConfigResponse = {
  status: boolean;
  message?: string;
  data: GlobalConfig;
};

export type UpdateGlobalConfigPayload = Omit<GlobalConfig, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateAdminUserPayload = Partial<
  Pick<
    AdminUser,
    | 'telegramId'
    | 'username'
    | 'Name'
    | 'photoUrl'
    | 'balance'
    | 'total_refer'
    | 'total_refer_earn'
    | 'referredBy'
    | 'totaltaskscompleted'
    | 'refer_code'
    | 'accountStatus'
    | 'Comment'
    | 'totalpaid'
    | 'verificationCode'
    | 'isVerified'
    | 'isTasksCompleted'
  >
>;

export type AdminUserReferralSummary = {
  telegramId: number;
  username?: string | null;
  Name: string;
  photoUrl?: string;
  balance?: number;
  referrals?: number;
  totalreferralsincome?: number;
  totaltaskscompleted?: number;
  totalAdsShow?: number;
  totalAdsClicked?: number;
  userip?: string | null;
  deviceFingerprint?: string | null;
  accountStatus?: string;
  createdAt: string;
};

export type AdminUserCompletedTask = {
  _id: string;
  taskId: string;
  title: string | null;
  description: string | null;
  type: string | null;
  url: string | null;
  reward: number;
  lastCompletedAt?: string | null;
  nextAvailableAt?: string | null;
};

export type AdminUserWithdrawalStats = {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  rejected: number;
  totalAmount: number;
  totalPaidAmount: number;
};

export type AdminUserHistoryItem = {
  _id: string;
  userId: string;
  type: string;
  point?: number;
  status?: string;
  createdAt: string;
};

export type AdminUserFullDetailsResponse = {
  success: boolean;
  message?: string;
  user: AdminUser;
  referrer: AdminUserReferralSummary | null;
  referralActivity: {
    activeReferrals: number;
    totalReferrals: number;
    activeReferralPercentage: number;
  };
  referrals: {
    count: number;
    list: AdminUserReferralSummary[];
  };
  taskHistory: {
    completed: {
      count: number;
      list: AdminUserCompletedTask[];
    };
    created: {
      count: number;
      list: AdminTask[];
    };
  };
  withdrawals: {
    stats: AdminUserWithdrawalStats;
    list: AdminWithdrawal[];
  };
  history: {
    count: number;
    list: AdminUserHistoryItem[];
  };
  summary: {
    referralsCount: number;
    completedTasksCount: number;
    createdTasksCount: number;
    withdrawalsCount: number;
    historyCount: number;
  };
};

export async function getTasks(botId: string, telegramId: number) {
  const { data } = await axios.get(`${API}/api/task/available/${botId}/${telegramId}`);
  return data;
}

export async function getGlobalConfig() {
  const { data } = await axios.get<GlobalConfigResponse>(`${API}/api/globalconfig`);
  return data.data;
}

export async function updateGlobalConfig(payload: UpdateGlobalConfigPayload) {
  const { data } = await axios.put<GlobalConfigResponse>(`${API}/api/globalconfig/update`, payload);
  return data;
}

export const completeTask = async (telegramId: number, taskId: string) => {
  const { data } = await axios.post(`${API}/api/task/complete`, {
    telegramId,
    taskId,
  });
  return data;
};

export async function verifyAdClick(telegramId: number) {
  const { data } = await axios.get(`${API}/api/task/verify-ad-click/${telegramId}`);
  return data;
}

export async function getAdminTasks(page = 1, limit = 10) {
  const { data } = await axios.get<AdminTasksResponse>(`${API}/api/task/admin/all-tasks`, {
    params: { page, limit },
  });
  return data;
}

export async function getAdminUsers(page = 1, limit = 20, search = '') {
  const { data } = await axios.get<AdminUsersResponse>(`${API}/api/admin/getAllUsers`, {
    params: { page, limit, search },
  });
  return data;
}

export async function getAdminUserFullDetails(telegramId: number) {
  const { data } = await axios.get<AdminUserFullDetailsResponse>(`${API}/api/admin/user-details/${telegramId}`);
  return data;
}

export async function getAdminUserProfile(telegramId: number) {
  const { data } = await axios.get<any>(`${API}/api/admin/user/${telegramId}/profile`);
  return data;
}

export async function getAdminUserTaskSummary(telegramId: number) {
  const { data } = await axios.get<{ success: boolean; today: number; last7Days: number; last30Days: number; allTime: number }>(
    `${API}/api/admin/user/${telegramId}/task-summary`,
  );
  return data;
}

export async function getAdminUserTasks(telegramId: number, page = 1, limit = 20) {
  const { data } = await axios.get(`${API}/api/admin/user/${telegramId}/tasks`, { params: { page, limit } });
  return data;
}

export async function getAdminUserWithdrawals(telegramId: number, page = 1, limit = 20) {
  const { data } = await axios.get(`${API}/api/admin/user/${telegramId}/withdraws`, { params: { page, limit } });
  return data;
}

export async function getAdminUserActivity(telegramId: number, page = 1, limit = 20) {
  const { data } = await axios.get(`${API}/api/admin/user/${telegramId}/activity`, { params: { page, limit } });
  return data;
}

export type ReferralsPageResponse = {
  success: boolean;
  data: AdminUserReferralSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export async function getAdminUserReferrals(telegramId: number, page = 1, limit = 20, search = '') {
  const { data } = await axios.get<ReferralsPageResponse>(`${API}/api/admin/user-details/${telegramId}/referrals`, {
    params: { page, limit, search },
  });
  return data;
}

export async function getAdminDashboardStats() {
  const { data } = await axios.get<AdminDashboardStats>(`${API}/api/admin/dashboard-stats`);
  return data;
}

export async function getAdminTaskStats() {
  const { data } = await axios.get<AdminTaskStatsResponse>(`${API}/api/admin/dashboard/task-stats`);
  return data;
}

export async function runAdminUserAction(userId: string, action: AdminUserAction) {
  const { data } = await axios.patch<AdminUserActionResponse>(`${API}/api/admin/users/${userId}/action`, {
    action,
  });
  return data;
}

export async function updateAdminUser(userId: string, payload: UpdateAdminUserPayload) {
  const { data } = await axios.patch<AdminUserActionResponse>(`${API}/api/admin/users/${userId}`, payload);
  return data;
}

export async function updateAdminUserVip(userId: string, vipuser: boolean) {
  const { data } = await axios.patch<AdminUserActionResponse>(`${API}/api/admin/users/${userId}`, {
    vipuser,
  });
  return data;
}

export async function getAdminWithdrawals(page = 1, limit = 20, status = 'All', search = '') {
  const { data } = await axios.get<AdminWithdrawalsResponse>(`${API}/api/withdrawal/admin/all`, {
    params: { page, limit, status, search },
  });
  return data;
}

export async function runAdminWithdrawalAction(
  withdrawalId: string,
  action: AdminWithdrawalAction,
  txHash = ''
) {
  const { data } = await axios.patch<AdminWithdrawalActionResponse>(
    `${API}/api/withdrawal/admin/${withdrawalId}/action`,
    { action, txHash }
  );
  return data;
}

export async function runAdminTaskAction(taskId: string, action: AdminTaskAction) {
  const { data } = await axios.patch<AdminTaskActionResponse>(`${API}/api/task/admin/tasks/${taskId}/action`, {
    action,
  });
  return data;
}

export async function createAdminTask(payload: CreateAdminTaskPayload) {
  const { data } = await axios.post<CreateAdminTaskResponse>(`${API}/api/task/create`, payload);
  return data;
}

export async function createAdminProxy(payload: {
  ip: string;
  username?: string;
  password?: string;
  author?: string;
  country?: string;
  serverTime?: string;
}) {
  const { data } = await axios.post<ProxyActionResponse>(`${API}/api/proxy/create`, payload);
  return data;
}

export async function updateAdminProxy(payload: {
  ip: string;
  username?: string;
  password?: string;
  author?: string;
  country?: string;
  serverTime?: string;
}) {
  const { data } = await axios.post<ProxyActionResponse>(`${API}/api/proxy/update`, payload);
  return data;
}

export async function getAdminProxies(
  page = 1,
  limit = 20,
  status = "All",
  search = ""
) {
  const params: Record<string, string | number> = { page, limit };

  if (status && status !== "All") {
    params.status = status.toLowerCase();
  }

  if (search.trim()) {
    params.search = search.trim();
  }

  const { data } = await axios.get<AdminProxyListResponse>(`${API}/api/proxy/all`, {
    params,
  });
  return data;
}

export async function proxyAdminAction(ip: string, action: "active" | "inactive" | "delete") {
  const { data } = await axios.post<ProxyActionResponse>(`${API}/api/proxy/action`, {
    action,
    ip,
  });
  return data;
}

export async function verifyAdminPassword(password: string) {
  const { data } = await axios.post<AdminPasswordResponse>(`${API}/api/admin/verify-password`, { password });
  return data;
}
