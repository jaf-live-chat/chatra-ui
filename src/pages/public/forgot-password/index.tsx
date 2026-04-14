import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { AxiosError } from "axios";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import Agents from "../../../services/agentServices";
import { APP_LOGO } from "../../../constants/constants";

const RESET_REQUEST_COOLDOWN_SECONDS = 30;

const ForgotPasswordPage = () => {
  const [companyCode, setCompanyCode] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!cooldownEndsAt) {
      setCooldownSecondsLeft(0);
      return;
    }

    const updateCountdown = () => {
      const seconds = Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000));
      setCooldownSecondsLeft(seconds);

      if (seconds <= 0) {
        setCooldownEndsAt(null);
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cooldownEndsAt]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting || cooldownSecondsLeft > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      const response = await Agents.requestPasswordReset({
        companyCode: companyCode.trim(),
        emailAddress: emailAddress.trim().toLowerCase(),
      });

      setSubmitMessage(
        response.message ||
          "If the account exists, we sent a password reset email with a reset button and OTP."
      );
      setCooldownEndsAt(Date.now() + RESET_REQUEST_COOLDOWN_SECONDS * 1000);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setSubmitError(axiosError.response?.data?.message || "Unable to send reset email. Please try again.");
      setCooldownEndsAt(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCooldownActive = cooldownSecondsLeft > 0;

  return (
    <React.Fragment>
      <PageTitle
        title="Forgot Password"
        description="Request a password reset email for your JAF Chatra account."
        canonical="/forgot-password"
      />

      <div className="min-h-screen bg-slate-100" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="px-6 pt-6 md:px-10 md:pt-8">
          <Link to="/" className="inline-flex">
            <img src={APP_LOGO.logoDark} alt="JAF Chatra" className="h-10 w-auto md:h-12" />
          </Link>
        </div>

        <main className="mx-auto flex min-h-[calc(100vh-110px)] w-full max-w-6xl items-center justify-center px-6 pb-12 pt-6">
          <div className="w-full max-w-[620px] rounded-[32px] border border-slate-200 bg-white px-8 py-10 shadow-xl shadow-slate-300/50 md:px-12 md:py-12">
            <div className="mb-7 text-center">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-cyan-700 text-white">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <h1 className="mb-2 text-[30px] font-bold tracking-tight text-slate-900">Forgot Password?</h1>
              <p className="mx-auto max-w-md text-[15px] leading-relaxed text-slate-500">
                Enter your company code and email address to receive reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              {submitMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{submitMessage}</p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="companyCode">
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20"
                  placeholder="ABC12"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="emailAddress">
                  Email address
                </label>
                <input
                  id="emailAddress"
                  type="email"
                  required
                  autoComplete="email"
                  value={emailAddress}
                  onChange={(event) => setEmailAddress(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/20"
                  placeholder="you@company.com"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isCooldownActive}
                className="w-full rounded-xl bg-cyan-800 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? "Sending email..."
                  : isCooldownActive
                    ? `Try again in ${cooldownSecondsLeft}s`
                    : "Send reset link"}
              </button>
            </form>

            <div className="pt-4 text-center text-sm text-slate-500">
              Already remember your password?{" "}
              <Link to="/login" className="font-semibold text-cyan-800 hover:text-cyan-900">
                Back to login
              </Link>
            </div>
          </div>
        </main>
      </div>
    </React.Fragment>
  );
};

export default ForgotPasswordPage;
