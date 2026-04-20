import { ArrowRight, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import React, { useEffect, useState } from "react";
import { AxiosError } from "axios";
import useAuth from "../../../hooks/useAuth";
import PageTitle from "../../../components/common/PageTitle";
import AuthPageLayout, { AuthFormCard } from "../../../components/common/AuthPageLayout";

const LoginPage = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const { login, isLoggedIn, user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      return;
    }

    navigate("/portal/dashboard", {
      replace: true,
    });
  }, [isLoggedIn, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await login({
        companyCode: companyCode.trim(),
        emailAddress: emailAddress.trim(),
        password,
      });

      navigate("/portal/dashboard", {
        replace: true,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage = axiosError.response?.data?.message;

      setSubmitError(apiMessage || "Unable to sign in. Please check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <PageTitle
        title="Login"
        description="Access your JAF Chatra dashboard to manage your customer interactions, view analytics, and configure your settings."
        canonical="/portal/login"

      />
      <AuthPageLayout>
        <AuthFormCard
          title="Welcome back"
          description="Sign in to your JAF Digital account"
          footerVariant="panel"
          footer={
            <>
              Don't have an account?{" "}
              <Link to="/checkout/free" className="font-medium text-cyan-700 hover:text-cyan-800">
                Sign up for free
              </Link>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{submitError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="companyCode">
                Company Code
              </label>
              <input
                id="companyCode"
                type="text"
                required
                minLength={3}
                maxLength={5}
                pattern="[A-Za-z0-9]+"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 outline-none transition-all"
                placeholder="ABC12"
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
                autoComplete="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-cyan-700 hover:text-cyan-800 font-medium">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
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
        </AuthFormCard>
      </AuthPageLayout>
    </React.Fragment>
  );
};

export default LoginPage;




