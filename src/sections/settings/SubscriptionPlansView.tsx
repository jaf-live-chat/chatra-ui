import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Crown,
  DollarSign,
  Info,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Autocomplete, TextField, Tooltip } from "@mui/material";

import { useDarkMode } from "../../providers/DarkModeContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/AlertDialog";
import { Alert, AlertDescription, AlertTitle } from "../../components/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/dialog";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlanById,
  updateSubscriptionPlanById,
  useGetSubscriptionPlans,
  type SubscriptionPlanApiModel,
} from "../../services/subscriptionPlanServices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select";
import TitleTag from "../../components/TitleTag";
import { toast } from "../../components/sonner";

type BillingCycle = "daily" | "weekly" | "monthly" | "yearly";

interface PlanFeature {
  id: string;
  text: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: PlanFeature[];
  popular: boolean;
  active: boolean;
  limits: {
    maxAgents: string;
    hasAdvancedAnalytics: boolean;
  };
}

interface ValidationResult {
  valid: boolean;
  message?: string;
}

interface MostPopularPendingState {
  planId: string;
  planName: string;
  nextValue: boolean;
}

const toPeriod = (billingCycle: BillingCycle, interval: number) => {
  if (billingCycle === "monthly" && interval === 1) return "/mo";
  if (billingCycle === "yearly" && interval === 1) return "/yr";

  const unitByCycle: Record<BillingCycle, string> = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  };

  const unit = unitByCycle[billingCycle] || "day";
  return `/${interval} ${interval === 1 ? unit : `${unit}s`}`;
};

const parsePeriod = (period: string): { billingCycle: BillingCycle; interval: number } => {
  if (period === "/mo") return { billingCycle: "monthly", interval: 1 };
  if (period === "/yr") return { billingCycle: "yearly", interval: 1 };

  const normalized = period.replace(/^\//, "").trim();
  const [rawInterval, rawCycle] = normalized.split(" ");
  const interval = Number.parseInt(rawInterval || "1", 10) || 1;

  const cycle = (rawCycle || "monthly").toLowerCase();
  if (cycle.startsWith("day")) return { billingCycle: "daily", interval };
  if (cycle.startsWith("week")) return { billingCycle: "weekly", interval };
  if (cycle.startsWith("year")) return { billingCycle: "yearly", interval };

  return { billingCycle: "monthly", interval };
};

const mapApiPlanToView = (plan: SubscriptionPlanApiModel): SubscriptionPlan => ({
  id: plan._id,
  name: plan.name,
  description: plan.description,
  price: String(plan.price ?? 0),
  period: toPeriod(plan.billingCycle, plan.interval),
  features: (plan.features ?? []).map((feature) => ({
    id: `feature-${feature}-${Math.random().toString(36).slice(2, 8)}`,
    text: feature,
  })),
  popular: Boolean(plan.isMostPopular),
  active: Boolean(plan.isPosted),
  limits: {
    maxAgents: String(plan.limits?.maxAgents ?? 1),
    hasAdvancedAnalytics: Boolean(plan.limits?.hasAdvancedAnalytics),
  },
});

const toApiPayload = (plan: SubscriptionPlan) => {
  const { billingCycle, interval } = parsePeriod(plan.period);
  const parsedMaxAgents = Number.parseInt(plan.limits.maxAgents || "1", 10);

  return {
    name: plan.name.trim(),
    description: plan.description.trim(),
    price: Number(plan.price) || 0,
    billingCycle,
    interval,
    limits: {
      maxAgents: Number.isNaN(parsedMaxAgents) ? 1 : Math.max(1, parsedMaxAgents),
      hasAdvancedAnalytics: Boolean(plan.limits.hasAdvancedAnalytics),
    },
    features: plan.features.map((f) => f.text.trim()).filter(Boolean),
    isMostPopular: plan.popular,
    isPosted: plan.active,
  };
};

const createDefaultPlanDraft = (): SubscriptionPlan => ({
  id: `tmp-plan-${Date.now()}`,
  name: "New Plan",
  description: "Plan description",
  price: "0",
  period: "/mo",
  features: [],
  popular: false,
  active: true,
  limits: {
    maxAgents: "1",
    hasAdvancedAnalytics: false,
  },
});

const clonePlan = (plan: SubscriptionPlan): SubscriptionPlan => ({
  ...plan,
  features: plan.features.map((feature) => ({ ...feature })),
  limits: { ...plan.limits },
});

const validatePlanDraft = (plan: SubscriptionPlan): ValidationResult => {
  if (!plan.name.trim()) return { valid: false, message: "Plan name is required." };
  if (!plan.description.trim()) return { valid: false, message: "Plan description is required." };

  const parsedPrice = Number(plan.price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return { valid: false, message: "Price must be a valid number greater than or equal to 0." };
  }

  const featuresCount = plan.features.map((f) => f.text.trim()).filter(Boolean).length;
  if (featuresCount < 1) {
    return { valid: false, message: "At least one feature is required for every plan." };
  }

  return { valid: true };
};

const SubscriptionPlansView = () => {
  const { plans: fetchedPlans, isLoading, mutate } = useGetSubscriptionPlans();
  const { isDark } = useDarkMode();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [newFeatureTextByPlan, setNewFeatureTextByPlan] = useState<Record<string, string>>({});
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [createPlanDraft, setCreatePlanDraft] = useState<SubscriptionPlan>(createDefaultPlanDraft);
  const [createFeatureText, setCreateFeatureText] = useState("");
  const [createValidationAlert, setCreateValidationAlert] = useState<string | null>(null);
  const [planPendingDelete, setPlanPendingDelete] = useState<SubscriptionPlan | null>(null);
  const [mostPopularPending, setMostPopularPending] = useState<MostPopularPendingState | null>(null);
  const [editSnapshots, setEditSnapshots] = useState<Record<string, SubscriptionPlan>>({});

  useEffect(() => {
    setPlans(fetchedPlans.map(mapApiPlanToView));
    setEditSnapshots({});
  }, [fetchedPlans]);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const openCreateDrawer = () => {
    setCreatePlanDraft(createDefaultPlanDraft());
    setCreateFeatureText("");
    setCreateValidationAlert(null);
    setIsCreateDrawerOpen(true);
  };

  const updatePlan = (planId: string, updates: Partial<SubscriptionPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, ...updates } : p)));
  };

  const startEditPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    setEditSnapshots((prev) => {
      if (prev[planId]) return prev;
      return { ...prev, [planId]: clonePlan(plan) };
    });
    setEditingPlan(planId);
  };

  const cancelEditPlan = (planId: string) => {
    const snapshot = editSnapshots[planId];

    if (snapshot) {
      setPlans((prev) => prev.map((p) => (p.id === planId ? clonePlan(snapshot) : p)));
      setEditSnapshots((prev) => {
        const next = { ...prev };
        delete next[planId];
        return next;
      });
    }

    setEditingPlan(null);
  };

  const toggleMostPopular = (planId: string, checked: boolean) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return { ...p, popular: checked };
        }

        return checked ? { ...p, popular: false } : p;
      })
    );
  };

  const updateFeature = (planId: string, featureId: string, text: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        return {
          ...p,
          features: p.features.map((f) => (f.id === featureId ? { ...f, text } : f)),
        };
      })
    );
  };

  const removeFeature = (planId: string, featureId: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        return {
          ...p,
          features: p.features.filter((f) => f.id !== featureId),
        };
      })
    );
  };

  const addFeature = (planId: string) => {
    addFeatureFromValue(planId, newFeatureTextByPlan[planId] || "");
  };

  const addFeatureFromValue = (planId: string, rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;

        const alreadyExists = p.features.some(
          (feature) => feature.text.trim().toLowerCase() === text.toLowerCase()
        );
        if (alreadyExists) {
          return p;
        }

        return {
          ...p,
          features: [...p.features, { id: `feature-${Date.now()}`, text }],
        };
      })
    );

    setNewFeatureTextByPlan((prev) => ({ ...prev, [planId]: "" }));
  };

  const savePlan = async (plan: SubscriptionPlan) => {
    const currentPlans = plans;
    const validation = validatePlanDraft(plan);

    if (!validation.valid) {
      toast.error(validation.message || "Please check plan details.");
      return;
    }

    try {
      setSavingPlanId(plan.id);
      const payload = toApiPayload(plan);
      const isNew = plan.id.startsWith("tmp-plan-");

      if (isNew) {
        await createSubscriptionPlan(payload);
      } else {
        await updateSubscriptionPlanById(plan.id, payload);
      }

      await mutate();
      setEditSnapshots((prev) => {
        const next = { ...prev };
        delete next[plan.id];
        return next;
      });
      setEditingPlan(null);
      showSaved();
      toast.success(`"${plan.name}" saved successfully.`);
    } catch (error) {
      console.error("Failed to save subscription plan:", error);
      setPlans(currentPlans);
      toast.error("Failed to save subscription plan.");
    } finally {
      setSavingPlanId(null);
    }
  };

  const saveAll = async () => {
    const currentPlans = plans;

    const invalidPlan = plans.find((plan) => !validatePlanDraft(plan).valid);
    if (invalidPlan) {
      const invalidMessage = validatePlanDraft(invalidPlan).message || "Please check plan details.";
      toast.error(`${invalidPlan.name}: ${invalidMessage}`);
      return;
    }

    try {
      setSavingPlanId("ALL");
      await Promise.all(
        plans.map(async (plan) => {
          const payload = toApiPayload(plan);
          if (plan.id.startsWith("tmp-plan-")) {
            return createSubscriptionPlan(payload);
          }
          return updateSubscriptionPlanById(plan.id, payload);
        })
      );
      await mutate();
      setEditSnapshots({});
      setEditingPlan(null);
      showSaved();
      toast.success("All plans saved successfully.");
    } catch (error) {
      console.error("Failed to save all plans:", error);
      setPlans(currentPlans);
      toast.error("Failed to save all plans.");
    } finally {
      setSavingPlanId(null);
    }
  };

  const addNewPlan = () => {
    openCreateDrawer();
  };

  const deletePlan = async (planId: string, planName: string) => {
    const currentPlans = plans;

    try {
      setPlans((prev) => prev.filter((p) => p.id !== planId));

      if (planId.startsWith("tmp-plan-")) {
        toast.success(`"${planName}" removed.`);
        return;
      }

      await deleteSubscriptionPlanById(planId);
      await mutate();
      toast.success(`"${planName}" deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete plan:", error);
      setPlans(currentPlans);
      toast.error("Failed to delete plan.");
    }
  };

  const addFeatureToDraft = () => {
    addFeatureToDraftFromValue(createFeatureText);
  };

  const addFeatureToDraftFromValue = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    setCreatePlanDraft((prev) => {
      const alreadyExists = prev.features.some(
        (feature) => feature.text.trim().toLowerCase() === text.toLowerCase()
      );
      if (alreadyExists) {
        return prev;
      }

      return {
        ...prev,
        features: [...prev.features, { id: `feature-${Date.now()}`, text }],
      };
    });

    setCreateFeatureText("");
    if (createValidationAlert) {
      setCreateValidationAlert(null);
    }
  };

  const removeDraftFeature = (featureId: string) => {
    setCreatePlanDraft((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== featureId),
    }));
  };

  const updateDraftFeature = (featureId: string, text: string) => {
    setCreatePlanDraft((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.id === featureId ? { ...f, text } : f)),
    }));
  };

  const submitNewPlan = async () => {
    const validation = validatePlanDraft(createPlanDraft);
    if (!validation.valid) {
      setCreateValidationAlert(validation.message || "Please review plan details.");
      toast.error(validation.message || "Please review plan details.");
      return;
    }

    try {
      setIsCreatingPlan(true);
      await createSubscriptionPlan(toApiPayload(createPlanDraft));
      await mutate();
      setIsCreateDrawerOpen(false);
      setCreateValidationAlert(null);
      showSaved();
      toast.success(`"${createPlanDraft.name}" created successfully.`);
    } catch (error) {
      console.error("Failed to create plan:", error);
      toast.error("Failed to create subscription plan.");
    } finally {
      setIsCreatingPlan(false);
    }
  };

  const requestDeletePlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setPlanPendingDelete(plan);
  };

  const requestToggleMostPopular = (planId: string, nextValue: boolean) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    setMostPopularPending({
      planId,
      planName: plan.name,
      nextValue,
    });
  };

  const confirmToggleMostPopular = async () => {
    if (!mostPopularPending) return;

    const currentPlans = plans;
    const { planId, planName, nextValue } = mostPopularPending;

    toggleMostPopular(planId, nextValue);
    setMostPopularPending(null);

    try {
      setSavingPlanId(planId);
      await updateSubscriptionPlanById(planId, { isMostPopular: nextValue });
      await mutate();
      toast.success(
        nextValue
          ? `"${planName}" set as Most Popular.`
          : `"${planName}" removed from Most Popular.`
      );
    } catch (error) {
      console.error("Failed to update Most Popular status:", error);
      setPlans(currentPlans);
      toast.error("Failed to update Most Popular status.");
    } finally {
      setSavingPlanId(null);
    }
  };

  const orderedPlans = useMemo(() => {
    const copy = [...plans];
    const popularIndex = copy.findIndex((p) => p.popular);

    if (popularIndex < 0 || copy.length < 3) return copy;

    const centerIndex = Math.floor(copy.length / 2);
    if (popularIndex === centerIndex) return copy;

    const [popular] = copy.splice(popularIndex, 1);
    copy.splice(centerIndex, 0, popular);
    return copy;
  }, [plans]);

  const featureSuggestions = useMemo(() => {
    const uniqueFeatures = new Set<string>();

    fetchedPlans.forEach((plan) => {
      plan.features.forEach((feature) => {
        const normalized = String(feature || "").trim();
        if (normalized) {
          uniqueFeatures.add(normalized);
        }
      });
    });

    plans.forEach((plan) => {
      plan.features.forEach((feature) => {
        const normalized = String(feature.text || "").trim();
        if (normalized) {
          uniqueFeatures.add(normalized);
        }
      });
    });

    createPlanDraft.features.forEach((feature) => {
      const normalized = String(feature.text || "").trim();
      if (normalized) {
        uniqueFeatures.add(normalized);
      }
    });

    return Array.from(uniqueFeatures).sort((a, b) => a.localeCompare(b));
  }, [fetchedPlans, plans, createPlanDraft.features]);

  const getPlanIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("starter") || lower.includes("free") || lower.includes("basic")) return <Users className="w-5 h-5" />;
    if (lower.includes("pro") || lower.includes("business") || lower.includes("growth")) return <Sparkles className="w-5 h-5" />;
    if (lower.includes("enterprise") || lower.includes("custom")) return <Crown className="w-5 h-5" />;
    return <DollarSign className="w-5 h-5" />;
  };

  const inputCls = `w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400
    bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600
    text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500`;
  const periodSelectTriggerCls = `mt-1 h-[42px] w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900
    transition-colors hover:border-cyan-300 focus:ring-2 focus:ring-cyan-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100`;
  const autocompletePopperSlotProps = {
    popper: {
      placement: "top-start" as const,
      modifiers: [
        {
          name: "flip",
          enabled: true,
          options: {
            fallbackPlacements: ["bottom-start", "top-end", "bottom-end"],
          },
        },
      ],
    },
  };

  return (
    <div className={`flex flex-col gap-6${isDark ? " dark" : ""}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <TitleTag
          title="Subscription Plans"
          subtitle="Manage and edit pricing plans displayed on your website."
          icon={<Crown className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
        />
        <div className="flex flex-wrap items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
          <Tooltip title="Add a new subscription plan" arrow>
            <button
              onClick={addNewPlan}
              className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add Plan
            </button>
          </Tooltip>
        </div>
      </div>

      {isLoading && <div className="text-sm text-gray-500 dark:text-slate-400">Loading subscription plans...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {orderedPlans.map((plan) => {
          const isEditing = editingPlan === plan.id;
          const isSavingThis = savingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border ${plan.popular
                ? "border-cyan-300 dark:border-cyan-700 ring-2 ring-cyan-100 dark:ring-cyan-900/40 xl:scale-[1.05] xl:-translate-y-2 xl:z-10"
                : "border-gray-200 dark:border-slate-700"
                } shadow-sm ${isEditing ? "overflow-visible" : "overflow-hidden"} flex flex-col transition-all duration-500 hover:shadow-md dark:hover:shadow-slate-900/50 ${!plan.active ? "opacity-60" : ""
                }`}
            >
              <div
                className={`px-6 pt-6 pb-4 transition-colors duration-300 ${plan.popular
                  ? "bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20"
                  : "bg-gray-50 dark:bg-slate-700/50"
                  }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.popular
                        ? "bg-cyan-100 dark:bg-cyan-800/50 text-cyan-600 dark:text-cyan-400"
                        : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-400"
                        }`}
                    >
                      {getPlanIcon(plan.name)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                    <Tooltip title={plan.popular ? "Remove Most Popular label" : "Set as Most Popular"} arrow>
                      <button
                        type="button"
                        onClick={() => requestToggleMostPopular(plan.id, !plan.popular)}
                        title={plan.popular ? "Remove Most Popular label" : "Set as Most Popular"}
                        aria-label={plan.popular ? "Remove Most Popular label" : "Set as Most Popular"}
                        className={`inline-flex cursor-pointer items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border transition-colors text-xs font-semibold whitespace-nowrap ${plan.popular
                          ? "border-cyan-300 bg-cyan-100 text-cyan-700 dark:border-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                          }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${plan.popular ? "fill-current" : ""}`} />
                        Most Popular
                      </button>
                    </Tooltip>
                    <Tooltip title={isEditing ? "Save changes" : "Edit this plan"} arrow>
                      <button
                        onClick={async () => {
                          if (isEditing) {
                            await savePlan(plan);
                            return;
                          }
                          startEditPlan(plan.id);
                        }}
                        disabled={isSavingThis}
                        className={`flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-300 text-xs font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${isEditing
                          ? "bg-cyan-100 dark:bg-cyan-800/50 text-cyan-700 dark:text-cyan-400"
                          : "bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300"
                          }`}
                      >
                        {isEditing ? <Save className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                        {isEditing ? "Save" : "Edit"}
                      </button>
                    </Tooltip>
                    {isEditing && (
                      <Tooltip title="Cancel editing" arrow>
                        <button
                          type="button"
                          onClick={() => cancelEditPlan(plan.id)}
                          className="flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-300 text-xs font-semibold whitespace-nowrap bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete plan" arrow>
                      <button
                        onClick={() => requestDeletePlan(plan.id)}
                        className="cursor-pointer p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{plan.description}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-slate-100">&#8369;{plan.price}</span>
                  <span className="text-gray-500 dark:text-slate-400 text-sm">{plan.period}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    Max Agents: {plan.limits.maxAgents}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${plan.limits.hasAdvancedAnalytics
                      ? "border-cyan-300 bg-cyan-100 text-cyan-700 dark:border-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                      : "border-gray-200 bg-white text-gray-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                  >
                    Advanced Analytics: {plan.limits.hasAdvancedAnalytics ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {isEditing && (
                  <div className="space-y-3 pt-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Plan Name</label>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                        className={inputCls}
                        placeholder="Starter"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                      <input
                        type="text"
                        value={plan.description}
                        onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
                        className={inputCls}
                        placeholder="Starter plan with basic features"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Price (PHP)</label>
                        <input
                          type="number"
                          min={0}
                          value={plan.price}
                          onChange={(e) => updatePlan(plan.id, { price: e.target.value })}
                          className={inputCls}
                          placeholder="699"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Billing Period</label>
                        <Select value={plan.period} onValueChange={(value) => updatePlan(plan.id, { period: value })}>
                          <SelectTrigger className={`${periodSelectTriggerCls} cursor-pointer`}>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
                            <SelectItem value="/mo">/mo</SelectItem>
                            <SelectItem value="/yr">/yr</SelectItem>
                            <SelectItem value="/1 weekly">/1 weekly</SelectItem>
                            <SelectItem value="/1 day">/1 day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Max Agents</label>
                        <input
                          type="number"
                          min={1}
                          value={plan.limits.maxAgents}
                          onChange={(e) => updatePlan(plan.id, { limits: { ...plan.limits, maxAgents: e.target.value } })}
                          className={inputCls}
                          placeholder="3"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                          <input
                            type="checkbox"
                            checked={plan.limits.hasAdvancedAnalytics}
                            onChange={(e) =>
                              updatePlan(plan.id, {
                                limits: { ...plan.limits, hasAdvancedAnalytics: e.target.checked },
                              })
                            }
                          />
                          Advanced Analytics
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <input type="checkbox" checked={plan.active} onChange={(e) => updatePlan(plan.id, { active: e.target.checked })} />
                        Active
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 flex-1 bg-white dark:bg-slate-800">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Features ({plan.features.length})
                </p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {isEditing ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            value={feature.text}
                            onChange={(e) => updateFeature(plan.id, feature.id, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-200 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                          />
                          <Tooltip title="Remove feature" arrow>
                            <button onClick={() => removeFeature(plan.id, feature.id)} className="cursor-pointer p-1 text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-slate-400">{feature.text}</span>
                      )}
                    </li>
                  ))}
                </ul>

                {isEditing && plan.features.map((feature) => feature.text.trim()).filter(Boolean).length < 1 && (
                  <Alert className="mt-4 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Feature Required</AlertTitle>
                    <AlertDescription>Add at least one feature before saving this plan.</AlertDescription>
                  </Alert>
                )}

                {isEditing && (
                  <div className="mt-4 flex items-center gap-2">
                    <Autocomplete
                      freeSolo
                      options={featureSuggestions}
                      openOnFocus
                      selectOnFocus
                      clearOnBlur={false}
                      handleHomeEndKeys
                      autoHighlight
                      slotProps={autocompletePopperSlotProps}
                      inputValue={newFeatureTextByPlan[plan.id] || ""}
                      onInputChange={(_, value) =>
                        setNewFeatureTextByPlan((prev) => ({ ...prev, [plan.id]: value }))
                      }
                      onChange={(_, value, reason) => {
                        const selected = String(value || "").trim();
                        if ((reason === "selectOption" || reason === "createOption") && selected) {
                          addFeatureFromValue(plan.id, selected);
                          return;
                        }

                        setNewFeatureTextByPlan((prev) => ({ ...prev, [plan.id]: selected }));
                      }}
                      className="flex-1"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Add feature (e.g. Priority Support)"
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "0.5rem",
                              backgroundColor: isDark ? "#334155" : "#ffffff",
                              "& fieldset": {
                                borderColor: isDark ? "#475569" : "#e5e7eb",
                              },
                              "&:hover fieldset": {
                                borderColor: isDark ? "#64748b" : "#cbd5e1",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: "#06b6d4",
                              },
                            },
                            "& .MuiInputBase-input": {
                              color: isDark ? "#f1f5f9" : "#111827",
                              fontSize: "0.875rem",
                              paddingY: "0.5rem",
                            },
                          }}
                        />
                      )}
                    />
                    <Tooltip title="Add feature" arrow>
                      <button onClick={() => addFeature(plan.id)} className="cursor-pointer px-3 py-2 rounded-lg bg-cyan-600 text-white text-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && plans.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
          <Crown className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">No subscription plans yet</h3>
          <Tooltip title="Create your first subscription plan" arrow>
            <button
              onClick={addNewPlan}
              className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Create First Plan
            </button>
          </Tooltip>
        </div>
      )}

      <Dialog open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
        <DialogContent className="w-full max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Create Subscription Plan</DialogTitle>
            <DialogDescription>
              Fill in plan details. A plan must include at least one feature.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-4 max-h-[65vh] overflow-y-auto">
            <div className="space-y-3 pt-2">
              {createValidationAlert && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Unable to Create Plan</AlertTitle>
                  <AlertDescription>{createValidationAlert}</AlertDescription>
                </Alert>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Plan Name</label>
                <input
                  type="text"
                  value={createPlanDraft.name}
                  onChange={(e) => setCreatePlanDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputCls}
                  placeholder="Starter"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={createPlanDraft.description}
                  onChange={(e) => setCreatePlanDraft((prev) => ({ ...prev, description: e.target.value }))}
                  className={inputCls}
                  placeholder="Starter plan with basic features"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Price (PHP)</label>
                  <input
                    type="number"
                    min={0}
                    value={createPlanDraft.price}
                    onChange={(e) => setCreatePlanDraft((prev) => ({ ...prev, price: e.target.value }))}
                    className={inputCls}
                    placeholder="699"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Billing Period</label>
                  <Select
                    value={createPlanDraft.period}
                    onValueChange={(value) => setCreatePlanDraft((prev) => ({ ...prev, period: value }))}
                  >
                    <SelectTrigger className={`${periodSelectTriggerCls} cursor-pointer`}>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
                      <SelectItem value="/mo">/mo</SelectItem>
                      <SelectItem value="/yr">/yr</SelectItem>
                      <SelectItem value="/1 weekly">/1 weekly</SelectItem>
                      <SelectItem value="/1 day">/1 day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Max Agents</label>
                  <input
                    type="number"
                    min={1}
                    value={createPlanDraft.limits.maxAgents}
                    onChange={(e) =>
                      setCreatePlanDraft((prev) => ({
                        ...prev,
                        limits: { ...prev.limits, maxAgents: e.target.value },
                      }))
                    }
                    className={inputCls}
                    placeholder="3"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={createPlanDraft.limits.hasAdvancedAnalytics}
                      onChange={(e) =>
                        setCreatePlanDraft((prev) => ({
                          ...prev,
                          limits: {
                            ...prev.limits,
                            hasAdvancedAnalytics: e.target.checked,
                          },
                        }))
                      }
                    />
                    Advanced Analytics
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Tooltip title="Toggle Most Popular status" arrow>
                  <button
                    type="button"
                    onClick={() =>
                      setCreatePlanDraft((prev) => ({ ...prev, popular: !prev.popular }))
                    }
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${createPlanDraft.popular
                      ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-300"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      }`}
                  >
                    <Star className={`w-4 h-4 ${createPlanDraft.popular ? "fill-current" : ""}`} />
                    Most Popular
                  </button>
                </Tooltip>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={createPlanDraft.active}
                    onChange={(e) =>
                      setCreatePlanDraft((prev) => ({ ...prev, active: e.target.checked }))
                    }
                  />
                  Active
                </label>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Features ({createPlanDraft.features.length})
                </p>

                <ul className="space-y-2">
                  {createPlanDraft.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <div className="flex-1 flex gap-2">
                        <input
                          value={feature.text}
                          onChange={(e) => updateDraftFeature(feature.id, e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-200 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                        />
                        <Tooltip title="Remove feature" arrow>
                          <button onClick={() => removeDraftFeature(feature.id)} className="cursor-pointer p-1 text-red-500" type="button">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center gap-2">
                  <Autocomplete
                    freeSolo
                    disablePortal
                    options={featureSuggestions}
                    openOnFocus
                    selectOnFocus
                    clearOnBlur={false}
                    handleHomeEndKeys
                    autoHighlight
                    slotProps={autocompletePopperSlotProps}
                    inputValue={createFeatureText}
                    onInputChange={(_, value) => setCreateFeatureText(value)}
                    onChange={(_, value, reason) => {
                      const selected = String(value || "").trim();
                      if ((reason === "selectOption" || reason === "createOption") && selected) {
                        addFeatureToDraftFromValue(selected);
                        return;
                      }

                      setCreateFeatureText(selected);
                    }}
                    className="flex-1"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Add feature (e.g. Priority Support)"
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "0.5rem",
                            backgroundColor: isDark ? "#334155" : "#ffffff",
                            "& fieldset": {
                              borderColor: isDark ? "#475569" : "#e5e7eb",
                            },
                            "&:hover fieldset": {
                              borderColor: isDark ? "#64748b" : "#cbd5e1",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#06b6d4",
                            },
                          },
                          "& .MuiInputBase-input": {
                            color: isDark ? "#f1f5f9" : "#111827",
                            fontSize: "0.875rem",
                            paddingY: "0.5rem",
                          },
                        }}
                      />
                    )}
                  />
                  <Tooltip title="Add feature" arrow>
                    <button onClick={addFeatureToDraft} className="cursor-pointer px-3 py-2 rounded-lg bg-cyan-600 text-white text-sm" type="button">
                      <Plus className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 sm:justify-start sm:gap-2">
            <Tooltip title="Create this plan" arrow>
              <button
                onClick={submitNewPlan}
                disabled={isCreatingPlan}
                className="inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed sm:min-w-40"
              >
                <Save className="w-4 h-4" /> {isCreatingPlan ? "Creating..." : "Create Plan"}
              </button>
            </Tooltip>
            <Tooltip title="Close dialog" arrow>
              <button
                type="button"
                onClick={() => setIsCreateDrawerOpen(false)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium sm:min-w-32"
              >
                Cancel
              </button>
            </Tooltip>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(planPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPlanPendingDelete(null);
        }}
      >
        <AlertDialogContent >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Delete subscription plan?</AlertDialogTitle>
            <AlertDialogDescription>
              {planPendingDelete
                ? `This will permanently delete "${planPendingDelete.name}" and cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                if (!planPendingDelete) return;
                await deletePlan(planPendingDelete.id, planPendingDelete.name);
                setPlanPendingDelete(null);
              }}
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(mostPopularPending)}
        onOpenChange={(open) => {
          if (!open) setMostPopularPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              {mostPopularPending?.nextValue ? "Set as Most Popular?" : "Remove Most Popular?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {mostPopularPending?.nextValue
                ? `"${mostPopularPending.planName}" will be marked as Most Popular and moved to the center.`
                : `"${mostPopularPending?.planName}" will no longer be marked as Most Popular.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleMostPopular}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionPlansView;
