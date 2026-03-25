import { useEffect, useMemo, useState } from "react";
import { Check, Crown, DollarSign, Pencil, Plus, Save, Sparkles, Star, Trash2, Users, X } from "lucide-react";

import { useDarkMode } from "../../providers/DarkModeContext";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlanById,
  updateSubscriptionPlanById,
  useGetSubscriptionPlans,
  type SubscriptionPlanApiModel,
} from "../../services/subscriptionPlanServices";

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
    maxWebsites: string;
  };
}

interface ToastState {
  type: "success" | "error";
  message: string;
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
    maxWebsites: String(plan.limits?.maxWebsites ?? 1),
  },
});

const toApiPayload = (plan: SubscriptionPlan) => {
  const { billingCycle, interval } = parsePeriod(plan.period);
  const parsedMaxAgents = Number.parseInt(plan.limits.maxAgents || "1", 10);
  const parsedMaxWebsites = Number.parseInt(plan.limits.maxWebsites || "1", 10);

  return {
    name: plan.name.trim(),
    description: plan.description.trim(),
    price: Number(plan.price) || 0,
    billingCycle,
    interval,
    limits: {
      maxAgents: Number.isNaN(parsedMaxAgents) ? 1 : Math.max(1, parsedMaxAgents),
      maxWebsites: Number.isNaN(parsedMaxWebsites) ? 1 : Math.max(1, parsedMaxWebsites),
    },
    features: plan.features.map((f) => f.text.trim()).filter(Boolean),
    isMostPopular: plan.popular,
    isPosted: plan.active,
  };
};

const SubscriptionPlansView = () => {
  const { plans: fetchedPlans, isLoading, mutate } = useGetSubscriptionPlans();
  const { isDark } = useDarkMode();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [newFeatureTextByPlan, setNewFeatureTextByPlan] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    setPlans(fetchedPlans.map(mapApiPlanToView));
  }, [fetchedPlans]);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const showToast = (type: ToastState["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const updatePlan = (planId: string, updates: Partial<SubscriptionPlan>) => {
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, ...updates } : p)));
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
    const text = (newFeatureTextByPlan[planId] || "").trim();
    if (!text) return;

    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
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
      setEditingPlan(null);
      showSaved();
      showToast("success", `"${plan.name}" saved successfully.`);
    } catch (error) {
      console.error("Failed to save subscription plan:", error);
      setPlans(currentPlans);
      showToast("error", "Failed to save subscription plan.");
    } finally {
      setSavingPlanId(null);
    }
  };

  const saveAll = async () => {
    const currentPlans = plans;

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
      setEditingPlan(null);
      showSaved();
      showToast("success", "All plans saved successfully.");
    } catch (error) {
      console.error("Failed to save all plans:", error);
      setPlans(currentPlans);
      showToast("error", "Failed to save all plans.");
    } finally {
      setSavingPlanId(null);
    }
  };

  const addNewPlan = () => {
    const newPlan: SubscriptionPlan = {
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
        maxWebsites: "1",
      },
    };

    setPlans((prev) => [...prev, newPlan]);
    setEditingPlan(newPlan.id);
  };

  const deletePlan = async (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    if (!window.confirm(`Are you sure you want to delete the "${plan.name}" plan?`)) {
      return;
    }

    const currentPlans = plans;

    try {
      setPlans((prev) => prev.filter((p) => p.id !== planId));

      if (planId.startsWith("tmp-plan-")) {
        showToast("success", `"${plan.name}" removed.`);
        return;
      }

      await deleteSubscriptionPlanById(planId);
      await mutate();
      showToast("success", `"${plan.name}" deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete plan:", error);
      setPlans(currentPlans);
      showToast("error", "Failed to delete plan.");
    }
  };

  const orderedPlans = useMemo(() => {
    const copy = [...plans];
    const popularIndex = copy.findIndex((p) => p.popular);

    if (popularIndex <= 0 || copy.length < 3) return copy;

    const [popular] = copy.splice(popularIndex, 1);
    copy.splice(1, 0, popular);
    return copy;
  }, [plans]);

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

  return (
    <div className={`flex flex-col gap-6${isDark ? " dark" : ""}`}>
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <div
            className={`px-4 py-3 rounded-lg border text-sm font-medium shadow-md ${toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/40 dark:border-green-700 dark:text-green-300"
              : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300"
              }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            Subscription Plans
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 ml-[52px]">
            Manage and edit pricing plans displayed on your website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
          <button
            onClick={addNewPlan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Plan
          </button>
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.popular
                        ? "bg-cyan-100 dark:bg-cyan-800/50 text-cyan-600 dark:text-cyan-400"
                        : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-400"
                        }`}
                    >
                      {getPlanIcon(plan.name)}
                    </div>
                    {plan.popular && (
                      <span className="text-xs font-semibold bg-cyan-600 text-white px-2 py-0.5 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        if (isEditing) {
                          await savePlan(plan);
                          return;
                        }
                        setEditingPlan(plan.id);
                      }}
                      disabled={isSavingThis}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-xs font-semibold disabled:opacity-50 ${isEditing
                        ? "bg-cyan-100 dark:bg-cyan-800/50 text-cyan-700 dark:text-cyan-400"
                        : "bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300"
                        }`}
                    >
                      {isEditing ? <Save className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                      {isEditing ? "Save" : "Edit"}
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{plan.description}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-slate-100">&#8369;{plan.price}</span>
                  <span className="text-gray-500 dark:text-slate-400 text-sm">{plan.period}</span>
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
                        <select value={plan.period} onChange={(e) => updatePlan(plan.id, { period: e.target.value })} className={`${inputCls} cursor-pointer`}>
                          <option value="/mo">/mo</option>
                          <option value="/yr">/yr</option>
                          <option value="/1 weekly">/1 weekly</option>
                          <option value="/1 day">/1 day</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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

                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Max Websites</label>
                        <input
                          type="number"
                          min={1}
                          value={plan.limits.maxWebsites}
                          onChange={(e) => updatePlan(plan.id, { limits: { ...plan.limits, maxWebsites: e.target.value } })}
                          className={inputCls}
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleMostPopular(plan.id, !plan.popular)}
                        title={plan.popular ? "Remove Most Popular label" : "Label as Most Popular"}
                        aria-label={plan.popular ? "Remove Most Popular label" : "Label as Most Popular"}
                        className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${plan.popular
                          ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-300"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                          }`}
                      >
                        <Star className={`w-4 h-4 ${plan.popular ? "fill-current" : ""}`} />
                        Most Popular
                      </button>
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
                            className="flex-1 px-2 py-1 border border-gray-200 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700"
                          />
                          <button onClick={() => removeFeature(plan.id, feature.id)} className="p-1 text-red-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-slate-400">{feature.text}</span>
                      )}
                    </li>
                  ))}
                </ul>

                {isEditing && (
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      value={newFeatureTextByPlan[plan.id] || ""}
                      onChange={(e) => setNewFeatureTextByPlan((prev) => ({ ...prev, [plan.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addFeature(plan.id);
                      }}
                      placeholder="Add feature (e.g. Priority Support)"
                      className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700"
                    />
                    <button onClick={() => addFeature(plan.id)} className="px-3 py-2 rounded-lg bg-cyan-600 text-white text-sm">
                      <Plus className="w-4 h-4" />
                    </button>
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
          <button
            onClick={addNewPlan}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Create First Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlansView;
