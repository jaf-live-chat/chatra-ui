import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AxiosError } from "axios";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import Agents from "../../../services/agentServices";
import { APP_LOGO } from "../../../constants/constants";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCompanyCode = useMemo(() => searchParams.get("companyCode") || "", [searchParams]);
  const initialEmailAddress = useMemo(() => searchParams.get("emailAddress") || "", [searchParams]);

  const [companyCode, setCompanyCode] = useState(initialCompanyCode);
  const [emailAddress, setEmailAddress] = useState(initialEmailAddress);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    if (newPassword.length < 8) {
      setSubmitError("Password must be at least 8 characters long.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError("New password and confirmation password do not match.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      companyCode: companyCode.trim(),
      emailAddress: emailAddress.trim().toLowerCase(),
    };

    try {
      await Agents.verifyPasswordResetOtp({
        ...payload,
        otp: otp.trim(),
      });

      const response = await Agents.resetPassword({
        ...payload,
        newPassword,
      });

      setSubmitMessage(response.message || "Password reset successful. You can now sign in.");

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setSubmitError(axiosError.response?.data?.message || "Unable to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <PageTitle
        title="Reset Password"
        description="Verify your OTP and set a new password for your JAF Chatra account."
        canonical="/reset-password"
      />

      <div className="min-h-screen bg-slate-100" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="px-6 pt-6 md:px-10 md:pt-8">
          <Link to="/" className="inline-flex">
            <img
              src={APP_LOGO.logoLight}
              alt="JAF Chatra"
              className="h-10 w-auto md:h-12"
            />
          </Link>
        </div>

        <main className="mx-auto flex min-h-[calc(100vh-110px)] w-full max-w-6xl items-center justify-center px-6 pb-12 pt-6">
          <div className="w-full max-w-[620px] rounded-[32px] border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-slate-300/50 md:px-12 md:py-12">
            <div className="text-center mb-7">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-cyan-700 text-white">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <h1 className="mb-2 text-[30px] font-bold tracking-tight text-slate-900">Reset Password</h1>
              <p className="mx-auto max-w-md text-[15px] leading-relaxed text-slate-500">
                Enter the OTP from your email, then choose a new password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              {submitMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{submitMessage}</p>
                </div>
              )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="companyCode">
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
                    onChange={(event) => setCompanyCode(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 outline-none transition-all"
                    placeholder="ABC12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="emailAddress">
                    Email address
                  </label>
                  <input
                    id="emailAddress"
                    type="email"
                    required
                    autoComplete="email"
                    value={emailAddress}
                    onChange={(event) => setEmailAddress(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 outline-none transition-all"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="otp">
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    minLength={6}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 outline-none transition-all tracking-[0.3em]"
                    placeholder="123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 outline-none transition-all"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20 outline-none transition-all"
                    placeholder="Re-enter new password"
                  />
                </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-cyan-800 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Resetting password..." : "Reset password"}
              </button>
            </form>

            <div className="pt-4 text-center text-sm text-slate-500">
              Need a new OTP?{" "}
              <Link to="/forgot-password" className="font-semibold text-cyan-800 hover:text-cyan-900">
                Go to forgot password
              </Link>
            </div>
          </div>
        </main>
      </div>
    </React.Fragment>
  );
};

export default ResetPasswordPage;
