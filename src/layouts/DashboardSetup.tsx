import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Loader2, KeyRound, Server, UserPlus, Check, Copy, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { useSearchParams } from "react-router";
import { motion } from "motion/react";
import Payments from "../services/paymentServices";

const steps = [
  { id: "account", label: "Creating your account...", icon: UserPlus },
  { id: "workspace", label: "Provisioning chat workspace...", icon: Server },
  { id: "apikey", label: "Generating secure API keys...", icon: KeyRound },
];

const MAX_POLL_ATTEMPTS = 50;
const POLL_INTERVAL_MS = 2500;

const DashboardSetup = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attempts, setAttempts] = useState(0);

  const reference = useMemo(
    () =>
      searchParams.get("reference") ||
      searchParams.get("reference_number") ||
      searchParams.get("referenceNumber") ||
      "",
    [searchParams]
  );

  const paymentRequestId = useMemo(
    () =>
      searchParams.get("paymentRequestId") ||
      searchParams.get("payment_request_id") ||
      searchParams.get("payment_id") ||
      "",
    [searchParams]
  );

  useEffect(() => {
    if (!reference && !paymentRequestId) {
      setErrorMessage("No active provisioning session found. Please start checkout first.");
      return;
    }

    let isCancelled = false;

    const pollStatus = async () => {
      try {
        const status = await Payments.getCheckoutStatus({
          reference: reference || undefined,
          paymentRequestId: paymentRequestId || undefined,
        });

        if (isCancelled) {
          return;
        }

        if (status.status === "PENDING") {
          setCurrentStep(1);
        }

        if (status.isProvisioned) {
          setCurrentStep(2);
          setApiKey(status.apiKey || "");
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
  }, [paymentRequestId, reference]);

  useEffect(() => {
    if (attempts >= MAX_POLL_ATTEMPTS && !isComplete) {
      setErrorMessage("Provisioning is taking longer than expected. You can retry checkout.");
    }
  }, [attempts, isComplete]);

  const copyToClipboard = async () => {
    if (!apiKey) {
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(apiKey);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (err) {
      // Fallback for environments with restrictive permissions policies (like iframes)
      const textArea = document.createElement("textarea");
      textArea.value = apiKey;
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_8px_40px_-12px_#00000014] border border-gray-100/80 relative overflow-hidden">
        {/* Subtle modern gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-50/80 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10">
          {!isComplete ? (
            <div className="flex flex-col gap-8">
              {/* Header & Percentage */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-cyan-600 uppercase mb-2">System Setup</p>
                  <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Initializing Workspace</h2>
                </div>
                <div className="text-5xl font-light text-gray-900 tracking-tighter tabular-nums flex items-baseline">
                  {Math.round(((currentStep + 0.5) / steps.length) * 100)}
                  <span className="text-2xl text-gray-400 ml-1">%</span>
                </div>
              </div>

              {/* Sleek Progress Bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 0.5) / steps.length) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Clean Steps List */}
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
                          <CheckCircle2 className="w-5 h-5 text-gray-300 transition-colors group-hover:text-gray-400" />
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[15px] transition-colors duration-300 ${isDone ? 'text-gray-400' : isActive ? 'text-gray-900 font-medium' : 'text-gray-300'
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
              className="flex flex-col items-center text-center pt-4"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-gray-900" />
              </div>

              <h2 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">Workspace Ready</h2>
              <p className="text-gray-500 mb-10 text-[15px] max-w-sm">
                Your integration details have been generated. You can now connect your application.
              </p>

              <div className="w-full bg-[#0A0A0A] rounded-2xl p-1.5 pl-5 mb-10 flex items-center justify-between shadow-xl shadow-gray-200/50 border border-gray-800/60 transition-transform hover:scale-[1.01] duration-300">
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
                  className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ml-4 shadow-sm cursor-pointer ${copied
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

              <Link
                to="/login"
                className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-xl font-medium text-[15px] transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
              >
                Go to Login
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardSetup;