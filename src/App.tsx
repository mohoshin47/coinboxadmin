import AdminDashboard from "./pages/AdminDashboard"; // ফাইলের সঠিক path অনুযায়ী পরিবর্তন করো
import { useState, type FormEvent } from "react";
import { verifyAdminPassword } from "./services/userService";
import { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const ADMIN_VERIFIED_KEY = "admin_password_verified";

function getErrorMessage(err: unknown, fallback: string) {
  const apiError = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return apiError.response?.data?.message || apiError.message || fallback;
}

function App() {
  const [verified, setVerified] = useState(
    () => sessionStorage.getItem(ADMIN_VERIFIED_KEY) === "true"
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await verifyAdminPassword(password);

      if (!data.success) {
        throw new Error(data.message || "Incorrect password.");
      }

      sessionStorage.setItem(ADMIN_VERIFIED_KEY, "true");
      setVerified(true);
      setPassword("");
    } catch (err) {
      sessionStorage.removeItem(ADMIN_VERIFIED_KEY);
      setError(getErrorMessage(err, "Incorrect password."));
    } finally {
      setLoading(false);
    }
  };

  if (!verified) {
    return (
      <div className="min-h-screen bg-[#0B1320] text-white flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-xl border border-slate-800 bg-[#131D2D] p-6 shadow-xl"
        >
          <div className="mb-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-bold text-[#0B1320]">
              A
            </div>
            <h1 className="text-xl font-bold">Admin Login</h1>
            <p className="mt-1 text-sm text-slate-400">
              Enter your password to access the dashboard.
            </p>
          </div>

          <label className="text-sm text-slate-300">
            <span className="mb-1 block">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoFocus
                className="w-full rounded-lg bg-slate-900 pl-3 pr-10 py-2 text-white outline-none ring-1 ring-slate-700 transition focus:ring-cyan-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  const hash = window.location.hash || "";
  const initialSection = hash.startsWith("#users") ? "Users" : undefined;

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_VERIFIED_KEY);
    setVerified(false);
  };

  return (
    <div className="App">
      <Toaster position="top-center" />
      <AdminDashboard
        initialSection={initialSection as any}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
