import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { AxiosError } from "axios";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import PageTitle from "../../../components/common/PageTitle";
import AuthPageLayout, { AuthFormCard } from "../../../components/common/AuthPageLayout";
import PasswordStrengthChecklist from "../../../components/PasswordStrengthChecklist";
import Agents from "../../../services/agentServices";

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

      <AuthPageLayout>
          <AuthFormCard
            title="Forgot Password?"
            description="Enter your company code and email address to receive reset instructions."
            icon={
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-cyan-700 text-white">
                <Mail className="h-4.5 w-4.5" />
              </div>
            }
            footer={
              <>
                Already remember your password?{" "}
                <Link to="/login" className="font-semibold text-cyan-800 hover:text-cyan-900">
                  Back to login
                </Link>
              </>
            }
          >
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

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <PasswordStrengthChecklist
                  password=""
                  showMeter={false}
                  title="Your new password (on the next step) must have:"
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
          </AuthFormCard>
      </AuthPageLayout>
    </React.Fragment>
  );
};

export default ForgotPasswordPage;
