import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { AlertBanner } from "../components/AlertBanner.jsx";
import { LogIn, Key, Mail, ShieldAlert } from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-lg font-black text-xl mb-3">
          TW
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">TeamWork</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to your account to manage tasks & projects
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@teamwork.local"
                  className="pl-9 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick Login helpers */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-semibold mb-2 text-center">
              Quick Demo Accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@teamwork.local")}
                className="px-2 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("pm@teamwork.local")}
                className="px-2 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold hover:bg-purple-100 transition"
              >
                Project Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("dev@teamwork.local")}
                className="px-2 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
              >
                Developer
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
