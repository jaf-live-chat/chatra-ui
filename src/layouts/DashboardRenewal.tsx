import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import Payments from "../services/paymentServices";

const renewalSteps = [
  { id: "verify", label: "Verifying payment...", icon: CheckCircle2 },
  { id: "activate", label: "Activating your new plan...", icon: Zap },
  { id: "complete", label: "Applying configuration...", icon: TrendingUp },
];

const MAX_POLL_ATTEMPTS = 50;
const POLL_INTERVAL_MS = 2500;
const CHECKOUT_RENEWAL_CONTEXT_KEY = "checkoutRenewalContext";

type CheckoutRenewalContext = {
  reference?: string;
  paymentRequestId?: string;
  tenantId?: string;
  subscriptionId?: string;
  companyName?: string;
  welcomeName?: string;
  planName?: string;
  planPrice?: string;
  billingPeriod?: string;
  previousPlanName?: string;
};

const DashboardRenewal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("");
  const [previousPlanName, setPreviousPlanName] = useState("");
  const [previousPlanPrice, setPreviousPlanPrice] = useState("");
  const [previousBillingPeriod, setPreviousBillingPeriod] = useState("");
  const [newPlanFeatures, setNewPlanFeatures] = useState<string[]>([]);
  const [previousPlanFeatures, setPreviousPlanFeatures] = useState<string[]>([]);
  const [addedFeatures, setAddedFeatures] = useState<string[]>([]);
  const [removedFeatures, setRemovedFeatures] = useState<string[]>([]);
  const [unchangedFeatures, setUnchangedFeatures] = useState<string[]>([]);
  const [welcomeName, setWelcomeName] = useState("");

  const savedRenewalContext = useMemo<CheckoutRenewalContext>(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_RENEWAL_CONTEXT_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw) as CheckoutRenewalContext;
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
      savedRenewalContext.reference ||
      "",
    [savedRenewalContext.reference, searchParams]
  );

  const paymentRequestId = useMemo(
    () =>
      searchParams.get("paymentRequestId") ||
      searchParams.get("payment_request_id") ||
      searchParams.get("payment_id") ||
      savedRenewalContext.paymentRequestId ||
      "",
    [savedRenewalContext.paymentRequestId, searchParams]
  );

  const tenantId = useMemo(
    () => searchParams.get("tenantId") || searchParams.get("tenant_id") || savedRenewalContext.tenantId || "",
    [savedRenewalContext.tenantId, searchParams]
  );

  const subscriptionId = useMemo(
    () => searchParams.get("subscriptionId") || searchParams.get("subscription_id") || savedRenewalContext.subscriptionId || "",
    [savedRenewalContext.subscriptionId, searchParams]
  );

  const companyNameFromQuery = useMemo(
    () => searchParams.get("companyName") || savedRenewalContext.companyName || "",
    [savedRenewalContext.companyName, searchParams]
  );

  const welcomeNameFromQuery = useMemo(
    () => searchParams.get("welcomeName") || searchParams.get("fullName") || savedRenewalContext.welcomeName || "",
    [savedRenewalContext.welcomeName, searchParams]
  );

  const planNameFromQuery = useMemo(
    () => searchParams.get("planName") || searchParams.get("plan") || savedRenewalContext.planName || "",
    [savedRenewalContext.planName, searchParams]
  );

  const planPriceFromQuery = useMemo(
    () => searchParams.get("planPrice") || savedRenewalContext.planPrice || "",
    [savedRenewalContext.planPrice, searchParams]
  );

  const billingPeriodFromQuery = useMemo(
    () => searchParams.get("billingPeriod") || savedRenewalContext.billingPeriod || "",
    [savedRenewalContext.billingPeriod, searchParams]
  );

  const previousPlanNameFromQuery = useMemo(
    () => searchParams.get("previousPlanName") || savedRenewalContext.previousPlanName || "",
    [savedRenewalContext.previousPlanName, searchParams]
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

  useEffect(() => {
    if (isCancelledRedirect) {
      window.location.replace(`/renewal/cancelled${window.location.search}`);
      return;
    }

    if (!reference && !paymentRequestId && !(tenantId && subscriptionId)) {
      setErrorMessage("No active renewal session found. Please start checkout first.");
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

        if (status.status === "PENDING") {
          setCurrentStep(1);
        }

        if (status.checkoutState === "CANCELLED" || status.status === "CANCELLED") {
          window.location.assign(`/renewal/cancelled${window.location.search}`);
          return;
        }

        if (status.isProvisioned) {
          setCurrentStep(2);
          setCompanyName(status.companyName || companyNameFromQuery || "");
          setWelcomeName(status.welcomeName || welcomeNameFromQuery || "");
          setPlanName(status.planName || planNameFromQuery || "");
          setPlanPrice(status.planPrice || planPriceFromQuery || "");
          setBillingPeriod(status.billingPeriod || billingPeriodFromQuery || "");
          setPreviousPlanName(status.previousPlanName || previousPlanNameFromQuery || "");
          setPreviousPlanPrice(status.previousPlanPrice || "");
          setPreviousBillingPeriod(status.previousBillingPeriod || "");
          setNewPlanFeatures(Array.isArray(status.newPlanFeatures) ? status.newPlanFeatures : []);
          setPreviousPlanFeatures(Array.isArray(status.previousPlanFeatures) ? status.previousPlanFeatures : []);
          setAddedFeatures(Array.isArray(status.addedFeatures) ? status.addedFeatures : []);
          setRemovedFeatures(Array.isArray(status.removedFeatures) ? status.removedFeatures : []);
          setUnchangedFeatures(Array.isArray(status.unchangedFeatures) ? status.unchangedFeatures : []);
          sessionStorage.removeItem(CHECKOUT_RENEWAL_CONTEXT_KEY);
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
    paymentRequestId,
    planNameFromQuery,
    planPriceFromQuery,
    reference,
    subscriptionId,
    tenantId,
    welcomeNameFromQuery,
    previousPlanNameFromQuery,
    isCancelledRedirect,
    navigate,
  ]);

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
    if (previousPlanNameFromQuery) {
      setPreviousPlanName(previousPlanNameFromQuery);
    }
  }, [
    billingPeriodFromQuery,
    companyNameFromQuery,
    planNameFromQuery,
    planPriceFromQuery,
    welcomeNameFromQuery,
    previousPlanNameFromQuery,
  ]);

  useEffect(() => {
    if (attempts >= MAX_POLL_ATTEMPTS && !isComplete) {
      navigate(`/renewal/cancelled${window.location.search}`, { replace: true });
    }
  }, [attempts, isComplete, navigate]);

  const handleDashboardNav = () => {
    navigate("/portal/tenants");
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
                  <p className="text-xs font-semibold tracking-widest text-cyan-700 uppercase mb-2">Plan Renewal</p>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Upgrading Your Service Plan</h2>
                  <p className="mt-2 text-sm text-slate-500">Your payment is being processed and your new plan is being activated.</p>
                </div>
                <div className="text-5xl font-light text-slate-900 tracking-tighter tabular-nums flex items-baseline">
                  {Math.round(((currentStep + 0.5) / renewalSteps.length) * 100)}
                  <span className="text-2xl text-slate-400 ml-1">%</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((currentStep + 0.5) / renewalSteps.length) * 100}%` }}
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
                {renewalSteps.map((step, index) => {
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
                Renewal Confirmed
              </div>

              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
                Plan upgraded successfully{welcomeName ? `, ${welcomeName}` : ""}.
              </h2>
              <p className="text-slate-600 mt-3 text-[15px] sm:text-base max-w-2xl leading-relaxed">
                Your new plan is now active and all systems have been reconfigured with your upgraded settings and limits.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Previous Plan
                  </div>
                  <p className="text-slate-900 text-lg font-semibold">{previousPlanName || "Previous plan"}</p>
                  <p className="text-slate-600 text-sm mt-1">
                    {previousPlanPrice
                      ? `${previousPlanPrice}${previousBillingPeriod ? ` ${previousBillingPeriod}` : ""}`
                      : "Successfully completed. Thank you for your subscription."}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-cyan-700 text-xs uppercase tracking-wide mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Current Plan
                  </div>
                  <p className="text-slate-900 text-lg font-semibold">{planName || "New plan"}</p>
                  <p className="text-slate-600 text-sm mt-1">
                    {planPrice ? `${planPrice}${billingPeriod ? ` ${billingPeriod}` : ""}` : "Plan pricing available in your billing dashboard"}
                  </p>
                </div>
              </div>

              <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 mb-8">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Feature comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-2">New in this plan</p>
                    {addedFeatures.length > 0 ? (
                      <div className="space-y-1.5">
                        {addedFeatures.map((feature) => (
                          <div key={feature} className="text-sm text-emerald-800">+ {feature}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No new features compared to previous plan.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 mb-2">Not included now</p>
                    {removedFeatures.length > 0 ? (
                      <div className="space-y-1.5">
                        {removedFeatures.map((feature) => (
                          <div key={feature} className="text-sm text-rose-800">- {feature}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">All previous features are still included.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 mb-2">Still included</p>
                    {unchangedFeatures.length > 0 ? (
                      <div className="space-y-1.5">
                        {unchangedFeatures.map((feature) => (
                          <div key={feature} className="text-sm text-cyan-900">• {feature}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No shared features detected.</p>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 mb-2">Plan snapshots</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Previous plan features</p>
                    {previousPlanFeatures.length > 0 ? (
                      <div className="space-y-1.5">
                        {previousPlanFeatures.map((feature) => (
                          <div key={feature} className="text-sm text-slate-700">• {feature}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No feature list available.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-cyan-200 bg-cyan-50/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 mb-2">Current plan features</p>
                    {newPlanFeatures.length > 0 ? (
                      <div className="space-y-1.5">
                        {newPlanFeatures.map((feature) => (
                          <div key={feature} className="text-sm text-cyan-900">• {feature}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No feature list available.</p>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 mb-2">What's next?</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Your new plan limits and features are now in effect</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>All agents and websites have been updated with new tier settings</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Your next billing cycle will reflect the new plan pricing</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Confirmation details have been sent to your account email. You can manage your subscription anytime from the billing settings.
              </p>

              <button
                onClick={handleDashboardNav}
                className="w-full sm:w-auto sm:self-start flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white py-3.5 px-8 rounded-xl font-semibold text-[15px] transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardRenewal;
