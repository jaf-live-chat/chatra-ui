import { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckCircle2,
  Loader2,
  KeyRound,
  Server,
  UserPlus,
  Check,
  Copy,
  AlertCircle,
  Sparkles,
  Rocket,
  PlugZap,
} from "lucide-react";
import { Link } from "react-router";
import { useSearchParams } from "react-router";
import { motion } from "motion/react";
import Payments from "../services/paymentServices";
import IntegrationGuideSwitcher from "../components/IntegrationGuideSwitcher";

const steps = [
  { id: "account", label: "Creating your account...", icon: UserPlus },
  { id: "workspace", label: "Provisioning chat workspace...", icon: Server },
  { id: "apikey", label: "Generating secure API keys...", icon: KeyRound },
];

const MAX_POLL_ATTEMPTS = 50;
const POLL_INTERVAL_MS = 2500;
const CHECKOUT_SETUP_CONTEXT_KEY = "checkoutSetupContext";

type CheckoutSetupContext = {
  reference?: string;
  paymentRequestId?: string;
  tenantId?: string;
  subscriptionId?: string;
  apiKey?: string;
  tenantEmail?: string;
  companyName?: string;
  welcomeName?: string;
  planName?: string;
  planPrice?: string;
  billingPeriod?: string;
  integrationName?: string;
};

const integrationChecklist = [
  "Paste your API key into your app environment",
  "Embed the chat widget script on your website",
  "Start receiving and managing conversations in real time",
];

type CheckoutWorkflowStage =
  | "INITIATED"
  | "PAYMENT_PENDING"
  | "PROVISIONING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

const WORKFLOW_STAGE_TO_STEP: Record<CheckoutWorkflowStage, number> = {
  INITIATED: 0,
  PAYMENT_PENDING: 0,
  PROVISIONING: 1,
  COMPLETED: 2,
  FAILED: 1,
  CANCELLED: 1,
};

const WORKFLOW_STAGE_TO_PROGRESS: Record<CheckoutWorkflowStage, number> = {
  INITIATED: 12,
  PAYMENT_PENDING: 34,
  PROVISIONING: 68,
  COMPLETED: 100,
  FAILED: 68,
  CANCELLED: 68,
};

const resolveWorkflowStage = (status: {
  workflowStage?: CheckoutWorkflowStage;
  status?: string;
  isProvisioned?: boolean;
}): CheckoutWorkflowStage => {
  if (status.workflowStage) {
    return status.workflowStage;
  }

  if (status.isProvisioned) {
    return "COMPLETED";
  }

  if (status.status === "FAILED") {
    return "FAILED";
  }

  if (status.status === "CANCELLED") {
    return "CANCELLED";
  }

  if (status.status === "COMPLETED") {
    return "PROVISIONING";
  }

  if (status.status === "PENDING") {
    return "PAYMENT_PENDING";
  }

  return "INITIATED";
};

const DashboardSetup = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [workflowStage, setWorkflowStage] = useState<CheckoutWorkflowStage>("INITIATED");
  const [tenantEmail, setTenantEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("");
  const [integrationName, setIntegrationName] = useState("Web Chat Widget + REST API");
  const [welcomeName, setWelcomeName] = useState("");
  const hasTerminalRedirectRef = useRef(false);

  const savedSetupContext = useMemo<CheckoutSetupContext>(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_SETUP_CONTEXT_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw) as CheckoutSetupContext;
      return parsed || {};
    } catch (_error) {
      return {};
    }
  }, []);

  const reference = useMemo(
    () =>
      searchParams.get("reference") ||
      searchParams.get("reference_number") ||
      searchParams.get("referenceNumber") ||
      savedSetupContext.reference ||
      "",
    [savedSetupContext.reference, searchParams]
  );

  const paymentRequestId = useMemo(
    () =>
      searchParams.get("paymentRequestId") ||
      searchParams.get("payment_request_id") ||
      searchParams.get("payment_id") ||
      savedSetupContext.paymentRequestId ||
      "",
    [savedSetupContext.paymentRequestId, searchParams]
  );

  const tenantId = useMemo(
    () => searchParams.get("tenantId") || searchParams.get("tenant_id") || savedSetupContext.tenantId || "",
    [savedSetupContext.tenantId, searchParams]
  );

  const subscriptionId = useMemo(
    () => searchParams.get("subscriptionId") || searchParams.get("subscription_id") || savedSetupContext.subscriptionId || "",
    [savedSetupContext.subscriptionId, searchParams]
  );

  const apiKeyFromQuery = useMemo(
    () =>
      searchParams.get("apiKey") ||
      searchParams.get("api_key") ||
      savedSetupContext.apiKey ||
      "",
    [savedSetupContext.apiKey, searchParams]
  );

  const tenantEmailFromQuery = useMemo(
    () => searchParams.get("tenantEmail") || searchParams.get("email") || savedSetupContext.tenantEmail || "",
    [savedSetupContext.tenantEmail, searchParams]
  );

  const companyNameFromQuery = useMemo(
    () => searchParams.get("companyName") || savedSetupContext.companyName || "",
    [savedSetupContext.companyName, searchParams]
  );

  const welcomeNameFromQuery = useMemo(
    () => searchParams.get("welcomeName") || searchParams.get("fullName") || savedSetupContext.welcomeName || "",
    [savedSetupContext.welcomeName, searchParams]
  );

  const planNameFromQuery = useMemo(
    () => searchParams.get("planName") || searchParams.get("plan") || savedSetupContext.planName || "",
    [savedSetupContext.planName, searchParams]
  );

  const planPriceFromQuery = useMemo(
    () => searchParams.get("planPrice") || savedSetupContext.planPrice || "",
    [savedSetupContext.planPrice, searchParams]
  );

  const billingPeriodFromQuery = useMemo(
    () => searchParams.get("billingPeriod") || savedSetupContext.billingPeriod || "",
    [savedSetupContext.billingPeriod, searchParams]
  );

  const integrationNameFromQuery = useMemo(
    () => searchParams.get("integrationName") || savedSetupContext.integrationName || "",
    [savedSetupContext.integrationName, searchParams]
  );

  const redirectStatus = useMemo(
    () => String(searchParams.get("status") || searchParams.get("payment_status") || "").trim().toLowerCase(),
    [searchParams]
  );

  const isCancelledRedirect =
    redirectStatus === "canceled" ||
    redirectStatus === "cancelled" ||
    redirectStatus === "expired" ||
    redirectStatus === "failed";

  const progressPercentage = WORKFLOW_STAGE_TO_PROGRESS[workflowStage];

  const redirectToCancelled = (terminalStatus: "cancelled" | "failed", reason?: string, message?: string) => {
    if (hasTerminalRedirectRef.current) {
      return;
    }

    hasTerminalRedirectRef.current = true;

    const params = new URLSearchParams(window.location.search);
    params.set("status", terminalStatus);
    if (reason) {
      params.set("reason", reason);
    }
    if (message) {
      params.set("message", message);
    }
    window.location.assign(`/setup/cancelled?${params.toString()}`);
  };

  useEffect(() => {
    if (isCancelledRedirect) {
      window.location.replace(`/setup/cancelled${window.location.search}`);
      return;
    }

    if (!reference && !paymentRequestId && !(tenantId && subscriptionId)) {
      setErrorMessage("No active provisioning session found. Please start checkout first.");
      return;
    }

    let isCancelled = false;

    const pollStatus = async () => {
      try {
        const status = await Payments.getCheckoutStatus({
          reference: reference || undefined,
          paymentRequestId: paymentRequestId || undefined,
          tenantId: tenantId || undefined,
          subscriptionId: subscriptionId || undefined,
        });

        if (isCancelled) {
          return;
        }

        const nextWorkflowStage = resolveWorkflowStage(status);
        setWorkflowStage(nextWorkflowStage);
        setCurrentStep(WORKFLOW_STAGE_TO_STEP[nextWorkflowStage]);

        if (status.status === "FAILED" || nextWorkflowStage === "FAILED") {
          redirectToCancelled("failed", status.failureReason, status.failureMessage);
          return;
        }

        if (status.checkoutState === "CANCELLED" || status.status === "CANCELLED") {
          redirectToCancelled("cancelled", status.failureReason, status.failureMessage);
          return;
        }

        if (status.isProvisioned) {
          setCurrentStep(WORKFLOW_STAGE_TO_STEP.COMPLETED);
          setWorkflowStage("COMPLETED");
          setApiKey(status.apiKey || apiKeyFromQuery || "");
          setTenantEmail(status.tenantEmail || tenantEmailFromQuery || "");
          setCompanyName(status.companyName || companyNameFromQuery || "");
          setWelcomeName(status.welcomeName || welcomeNameFromQuery || "");
          setPlanName(status.planName || planNameFromQuery || "");
          setPlanPrice(status.planPrice || planPriceFromQuery || "");
          setBillingPeriod(status.billingPeriod || billingPeriodFromQuery || "");
          setIntegrationName(status.integrationName || integrationNameFromQuery || "Web Chat Widget + REST API");
          sessionStorage.removeItem(CHECKOUT_SETUP_CONTEXT_KEY);
          setTimeout(() => {
            if (!isCancelled) {
              setIsComplete(true);
            }
          }, 700);
          return;
        }

        setAttempts((prev) => prev + 1);
      } catch (_error) {
        if (!isCancelled) {
          setErrorMessage("We are still checking your checkout status. Please wait...");
          setAttempts((prev) => prev + 1);
        }
      }
    };

    const timer = window.setInterval(() => {
      void pollStatus();
    }, POLL_INTERVAL_MS);

    void pollStatus();

    return () => {
      isCancelled = true;
      window.clearInterval(timer);
    };
  }, [
    billingPeriodFromQuery,
    companyNameFromQuery,
    apiKeyFromQuery,
    integrationNameFromQuery,
    paymentRequestId,
    planNameFromQuery,
    planPriceFromQuery,
    reference,
    subscriptionId,
    tenantEmailFromQuery,
    tenantId,
    welcomeNameFromQuery,
    isCancelledRedirect,
  ]);

  useEffect(() => {
    if (apiKeyFromQuery) {
      setApiKey(apiKeyFromQuery);
    }
    if (tenantEmailFromQuery) {
      setTenantEmail(tenantEmailFromQuery);
    }
  }, [apiKeyFromQuery, tenantEmailFromQuery]);

  useEffect(() => {
    if (companyNameFromQuery) {
      setCompanyName(companyNameFromQuery);
    }
    if (welcomeNameFromQuery) {
      setWelcomeName(welcomeNameFromQuery);
    }
    if (planNameFromQuery) {
      setPlanName(planNameFromQuery);
    }
    if (planPriceFromQuery) {
      setPlanPrice(planPriceFromQuery);
    }
    if (billingPeriodFromQuery) {
      setBillingPeriod(billingPeriodFromQuery);
    }
    if (integrationNameFromQuery) {
      setIntegrationName(integrationNameFromQuery);
    }
  }, [
    billingPeriodFromQuery,
    companyNameFromQuery,
    integrationNameFromQuery,
    planNameFromQuery,
    planPriceFromQuery,
    welcomeNameFromQuery,
  ]);

  useEffect(() => {
    if (attempts >= MAX_POLL_ATTEMPTS && !isComplete) {
      redirectToCancelled(
        "failed",
        "PROVISIONING_TIMEOUT",
        "Provisioning is taking longer than expected. Please retry checkout."
      );
    }
  }, [attempts, isComplete]);

  const copyTextWithFallback = async (text: string) => {
    if (!text) {
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (_err) {
      // Fallback for environments with restrictive permissions policies (like iframes)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (error) {
        console.error("Fallback clipboard copy failed", error);
      } finally {
        textArea.remove();
      }
    }
  };

  const copyToClipboard = async () => {
    if (!apiKey) {
      return;
    }

    await copyTextWithFallback(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,#ccfbf1_0,#ecfeff_28%,#f8fafc_58%,#f1f5f9_100%)] flex flex-col font-sans items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full bg-white/90 backdrop-blur p-5 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_16px_70px_-30px_rgba(15,23,42,0.35)] border border-cyan-100/70 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-100/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100/60 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10">
          {!isComplete ? (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-cyan-700 uppercase mb-2">System Setup</p>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Launching Your Customer Messaging Hub</h2>
                  <p className="mt-2 text-sm text-slate-500">Your environment is being provisioned with secure access and integration-ready credentials.</p>
                </div>
                <div className="text-5xl font-light text-slate-900 tracking-tighter tabular-nums flex items-baseline">
                  {Math.round(progressPercentage)}
                  <span className="text-2xl text-slate-400 ml-1">%</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-6 mt-2">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isDone = index < currentStep;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-5 group"
                    >
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-cyan-500 transition-colors group-hover:text-cyan-600" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[15px] transition-colors duration-300 ${isDone ? "text-slate-500" : isActive ? "text-slate-900 font-medium" : "text-slate-300"
                          }`}>
                          {step.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col pt-2 sm:pt-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-cyan-700 text-xs font-semibold tracking-wide uppercase mb-5 w-fit">
                <Sparkles className="w-4 h-4" />
                Go-Live Confirmed
              </div>

              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
                Welcome{welcomeName ? `, ${welcomeName}` : ""}. Your messaging engine is ready.
              </h2>
              <p className="text-slate-600 mt-3 text-[15px] sm:text-base max-w-2xl leading-relaxed">
                {companyName ? `${companyName} is now set up` : "Your workspace is now set up"} with a live subscription, secure API credentials, and integration tooling to launch conversations faster.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide mb-2">
                    <Rocket className="w-4 h-4 text-cyan-600" />
                    Subscription Plan
                  </div>
                  <p className="text-slate-900 text-lg font-semibold">{planName || "Active plan"}</p>
                  <p className="text-slate-600 text-sm mt-1">
                    {planPrice ? `${planPrice}${billingPeriod ? ` ${billingPeriod}` : ""}` : "Plan pricing available in your billing dashboard"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide mb-2">
                    <PlugZap className="w-4 h-4 text-cyan-600" />
                    Integration
                  </div>
                  <p className="text-slate-900 text-lg font-semibold">{integrationName}</p>
                  <p className="text-slate-600 text-sm mt-1">Installation-ready and configured with your generated credentials.</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide mb-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                    Welcome Message
                  </div>
                  <p className="text-slate-900 text-lg font-semibold">You are in</p>
                  <p className="text-slate-600 text-sm mt-1">
                    Confirmation email sent{tenantEmail ? ` to ${tenantEmail}` : " to your registered workspace email"}.
                  </p>
                </div>
              </div>

              <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Your go-live checklist</h3>
                <div className="space-y-2">
                  {integrationChecklist.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 mb-6">
                <div className="flex flex-col gap-1 mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Widget Installation</h3>
                  <p className="text-sm text-slate-500">
                    Reuse the same integration guide used across the portal to copy framework-specific install snippets.
                  </p>
                </div>

                <IntegrationGuideSwitcher apiKey={apiKey || undefined} companyName={companyName || undefined} />
              </div>

              <div className="w-full bg-[#0A0A0A] rounded-2xl p-1.5 sm:pl-5 mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shadow-xl shadow-slate-300/40 border border-gray-800/60 transition-transform hover:scale-[1.01] duration-300">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <KeyRound className="w-4 h-4 text-gray-500 shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={apiKey || "API key unavailable"}
                    className="bg-transparent text-gray-300 font-mono text-[13px] outline-none w-full min-w-0 tracking-wide"
                  />
                </div>
                <button
                  onClick={copyToClipboard}
                  disabled={!apiKey}
                  className={`flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 sm:ml-4 shadow-sm cursor-pointer ${copied
                    ? "bg-emerald-500 text-white"
                    : !apiKey
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                    }`}
                >
                  {copied ? (
                    <>
                      <Check size={15} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      Copy Key
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Launch note: add the API key to your app environment and pass it in the <span className="font-mono">x-api-key</span> header for authenticated requests.
              </p>

              <Link
                to="/login"
                className="w-full sm:w-auto sm:self-start flex items-center justify-center bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white py-3.5 px-8 rounded-xl font-semibold text-[15px] transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
              >
                Continue to Login
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardSetup;