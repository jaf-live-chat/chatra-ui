import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LiveChatWidget } from "./components/LiveChatWidget";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate login delay
    setTimeout(() => {
      setIsSubmitting(false);
      if (email === "admin@jaflivechat.com") {
        navigate("/dashboard");
      } else if (email === "agent@jaflivechat.com") {
        navigate("/agent");
      } else {
        navigate("/setup");
      }
    }, 1500);
  };

  const fillDemoCredentials = () => {
    setCompanyCode("JAF-DEMO");
    setEmail("admin@jaflivechat.com");
    setPassword("demo123");
  };

  const fillAgentCredentials = () => {
    setCompanyCode("JAF-DEMO");
    setEmail("agent@jaflivechat.com");
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar />
      
      <main className="flex-1 flex flex-col pt-32 md:pt-40 pb-12 bg-gray-50 items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-500 text-sm">Sign in to your JAF Digital account</p>
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={() => setDemoOpen(!demoOpen)}
                className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors"
              >
                <span>Demo Accounts</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${demoOpen ? "rotate-180" : ""}`}
                />
              </button>
              {demoOpen && (
                <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 text-left">Admin</div>
                      <div className="font-mono text-xs text-slate-500 mt-0.5">admin@jaflivechat.com</div>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium">
                      Auto-fill
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={fillAgentCredentials}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-cyan-50/50 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 text-left">Agent</div>
                      <div className="font-mono text-xs text-slate-500 mt-0.5">agent@jaflivechat.com</div>
                    </div>
                    <span className="text-xs bg-cyan-100 text-cyan-700 px-3 py-1 rounded-lg font-medium">
                      Auto-fill
                    </span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="companyCode">
                  Company Code
                </label>
                <input
                  id="companyCode"
                  type="text"
                  required
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 outline-none transition-all"
                  placeholder="ABC123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 outline-none transition-all"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-sm text-cyan-700 hover:text-cyan-800 font-medium">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cyan-700 hover:bg-cyan-800 text-white py-3 rounded-xl transition-all shadow-lg shadow-cyan-700/20 font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/checkout/starter" className="text-cyan-700 hover:text-cyan-800 font-medium">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <LiveChatWidget />
    </div>
  );
}