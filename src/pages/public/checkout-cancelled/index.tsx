import { useMemo } from "react";
import { ArrowLeft, Home, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router";

type CheckoutContext = {
  companyName?: string;
  welcomeName?: string;
  planName?: string;
  planPrice?: string;
  billingPeriod?: string;
};

const setupContextKey = "checkoutSetupContext";
const renewalContextKey = "checkoutRenewalContext";

const CheckoutCancelledPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isRenewal = location.pathname.includes("renewal");
  const contextKey = isRenewal ? renewalContextKey : setupContextKey;

  const savedContext = useMemo<CheckoutContext>(() => {
    try {
      const raw = sessionStorage.getItem(contextKey);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw) as CheckoutContext;
      return parsed || {};
    } catch (_error) {
      return {};
    }
  }, [contextKey]);

  const companyName = searchParams.get("companyName") || savedContext.companyName || "There's no workspace created.";
  const welcomeName = searchParams.get("welcomeName") || savedContext.welcomeName || "";
  const planName = searchParams.get("planName") || savedContext.planName || "-";
  const planPrice = searchParams.get("planPrice") || savedContext.planPrice || "";
  const billingPeriod = searchParams.get("billingPeriod") || savedContext.billingPeriod || "";

  const title = isRenewal ? "Your renewal was cancelled" : "Your checkout was cancelled";
  const subtitle = isRenewal
    ? "No subscription changes were applied. You can restart the renewal whenever you are ready."
    : "No charges were captured. You can restart checkout whenever you are ready.";

  const nextStepLabel = isRenewal ? "Resume renewal" : "Review plans";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,#fff7ed_0,#fffbeb_28%,#f8fafc_58%,#f1f5f9_100%)] flex items-center justify-center p-4 sm:p-6">
      <div className="relative max-w-3xl w-full overflow-hidden rounded-[2rem] border border-amber-100 bg-white/92 p-6 sm:p-8 md:p-10 shadow-[0_20px_80px_-36px_rgba(15,23,42,0.38)] backdrop-blur">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-amber-100/70 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-28 h-64 w-64 rounded-full bg-orange-100/60 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            <ShieldCheck className="h-4 w-4" />
            Session closed safely
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-slate-600">{subtitle}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Sparkles className="h-4 w-4 text-amber-600" />
                What happened
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <span>The payment session ended before HitPay captured any charge.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <span>Your workspace has not been provisioned from this attempt.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <span>You can safely restart when you are ready.</span>
                </li>
              </ul>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{companyName}</div>
                {welcomeName ? <div className="mt-1 text-sm text-slate-500">Hello {welcomeName}</div> : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{planName}</div>
                {planPrice ? (
                  <div className="mt-1 text-sm text-slate-500">
                    {planPrice}
                    {billingPeriod ? ` ${billingPeriod}` : ""}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              <Home className="h-4 w-4" />
              Back to home
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              {nextStepLabel}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition-all hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelledPage;