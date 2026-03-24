import { useState, useEffect } from "react";
import { Crown, Save, Plus, Trash2, GripVertical, Check, X, DollarSign, Users, Clock, Sparkles, Library, Tag, Pencil } from "lucide-react";
import { useDarkMode } from "../../providers/DarkModeContext";

// ─── Feature Library Types ────────────────────────────────────────────────────

export interface FeatureLibraryItem {
  id: string;
  name: string;
  category: string;
  createdAt: string;
}

// ─── Seed Features ────────────────────────────────────────────────────────────

export const SEED_FEATURES: FeatureLibraryItem[] = [
  { id: "feat-1", name: "1 Agent Seat", category: "Seats", createdAt: "2026-03-01" },
  { id: "feat-2", name: "Up to 5 Agent Seats", category: "Seats", createdAt: "2026-03-01" },
  { id: "feat-3", name: "Unlimited Agent Seats", category: "Seats", createdAt: "2026-03-01" },
  { id: "feat-4", name: "14-day chat history", category: "Storage", createdAt: "2026-03-01" },
  { id: "feat-5", name: "Unlimited chat history", category: "Storage", createdAt: "2026-03-01" },
  { id: "feat-6", name: "Basic widget customization", category: "Customization", createdAt: "2026-03-01" },
  { id: "feat-7", name: "Advanced widget customization", category: "Customization", createdAt: "2026-03-01" },
  { id: "feat-8", name: "Remove \"Powered by\" branding", category: "Customization", createdAt: "2026-03-01" },
  { id: "feat-9", name: "Community support", category: "Support", createdAt: "2026-03-01" },
  { id: "feat-10", name: "Email support", category: "Support", createdAt: "2026-03-01" },
  { id: "feat-11", name: "Priority email support", category: "Support", createdAt: "2026-03-01" },
  { id: "feat-12", name: "Dedicated success manager", category: "Support", createdAt: "2026-03-01" },
  { id: "feat-13", name: "AI-Powered Drafts", category: "Features", createdAt: "2026-03-02" },
  { id: "feat-14", name: "Advanced routing rules", category: "Features", createdAt: "2026-03-02" },
  { id: "feat-15", name: "Custom SSO integration", category: "Features", createdAt: "2026-03-02" },
  { id: "feat-16", name: "SLA guarantees", category: "Features", createdAt: "2026-03-02" },
  { id: "feat-17", name: "Advanced Analytics API", category: "Features", createdAt: "2026-03-02" },
];

const FEATURE_CATEGORIES = ["All", "Seats", "Storage", "Customization", "Support", "Features"];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Seats: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  Storage: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  Customization: { bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
  Support: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  Features: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
};

// ─── Helper Component ─────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] ?? { bg: "bg-gray-100 dark:bg-slate-700", text: "text-gray-600 dark:text-slate-300", border: "border-gray-200 dark:border-slate-600" };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      <Tag className="w-3 h-3" />
      {category}
    </span>
  );
}

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
}

const defaultPlans: SubscriptionPlan[] = [
  {
    id: "free-trial",
    name: "Free Trial",
    description: "Try JAF Chatra free for 14 days, no credit card required.",
    price: "0",
    period: "/14 days",
    features: [
      { id: "feat-1", text: "1 Agent Seat" },
      { id: "feat-4", text: "14-day chat history" },
      { id: "feat-6", text: "Basic widget customization" },
      { id: "feat-9", text: "Community support" },
    ],
    popular: false,
    active: true,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small projects and personal sites.",
    price: "12",
    period: "/mo",
    features: [
      { id: "feat-1", text: "1 Agent Seat" },
      { id: "feat-4", text: "14-day chat history" },
      { id: "feat-6", text: "Basic widget customization" },
      { id: "feat-9", text: "Community support" },
    ],
    popular: false,
    active: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses that need AI power.",
    price: "29",
    period: "/mo",
    features: [
      { id: "feat-2", text: "Up to 5 Agent Seats" },
      { id: "feat-5", text: "Unlimited chat history" },
      { id: "feat-13", text: "AI-Powered Drafts" },
      { id: "feat-14", text: "Advanced routing rules" },
      { id: "feat-8", text: 'Remove "Powered by" branding' },
    ],
    popular: true,
    active: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large support teams.",
    price: "99",
    period: "/mo",
    features: [
      { id: "feat-3", text: "Unlimited Agent Seats" },
      { id: "feat-12", text: "Dedicated success manager" },
      { id: "feat-15", text: "Custom SSO integration" },
      { id: "feat-16", text: "SLA guarantees" },
      { id: "feat-17", text: "Advanced Analytics API" },
    ],
    popular: false,
    active: true,
  },
];

const SubscriptionPlansView = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { isDark } = useDarkMode();

  // ─── Feature Library State ────────────────────────────────────────────────────
  const [featureLibrary, setFeatureLibrary] = useState<FeatureLibraryItem[]>([]);
  const [showFeatureLibrary, setShowFeatureLibrary] = useState(false);
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState("All");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureCategory, setNewFeatureCategory] = useState("Features");
  const [editingFeatureName, setEditingFeatureName] = useState<Record<string, string>>({});
  const [editingFeatureCategory, setEditingFeatureCategory] = useState<Record<string, string>>({});
  const [featureModalPlanId, setFeatureModalPlanId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("jaf_subscription_plans");
    if (stored) {
      try {
        setPlans(JSON.parse(stored));
      } catch {
        setPlans(defaultPlans);
      }
    } else {
      setPlans(defaultPlans);
    }

    // Load feature library
    const storedFeatures = localStorage.getItem("jaf_feature_library");
    if (storedFeatures) {
      try {
        setFeatureLibrary(JSON.parse(storedFeatures));
      } catch {
        setFeatureLibrary(SEED_FEATURES);
      }
    } else {
      setFeatureLibrary(SEED_FEATURES);
    }
  }, []);

  const savePlans = (updatedPlans: SubscriptionPlan[]) => {
    setPlans(updatedPlans);
    localStorage.setItem("jaf_subscription_plans", JSON.stringify(updatedPlans));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updatePlan = (planId: string, updates: Partial<SubscriptionPlan>) => {
    const updated = plans.map((p) => (p.id === planId ? { ...p, ...updates } : p));
    savePlans(updated);
  };

  const saveAll = () => {
    savePlans(plans);
  };

  // ─── Feature Library Functions ────────────────────────────────────────────────

  const saveFeatureLibrary = (updated: FeatureLibraryItem[]) => {
    setFeatureLibrary(updated);
    localStorage.setItem("jaf_feature_library", JSON.stringify(updated));
  };

  const addFeatureToLibrary = () => {
    if (!newFeatureName.trim()) return;
    const newFeature: FeatureLibraryItem = {
      id: `feat-${Date.now()}`,
      name: newFeatureName.trim(),
      category: newFeatureCategory,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [...featureLibrary, newFeature];
    saveFeatureLibrary(updated);
    setNewFeatureName("");
  };

  const deleteFeatureFromLibrary = (featureId: string) => {
    const updated = featureLibrary.filter((f) => f.id !== featureId);
    saveFeatureLibrary(updated);
  };

  const updateFeatureInLibrary = (featureId: string, name: string, category: string) => {
    const updated = featureLibrary.map((f) =>
      f.id === featureId ? { ...f, name, category } : f
    );
    saveFeatureLibrary(updated);
  };

  const addFeatureFromLibrary = (planId: string, libraryFeature: FeatureLibraryItem) => {
    const updated = plans.map((p) => {
      if (p.id === planId) {
        const exists = p.features.some((f) => f.id === libraryFeature.id);
        if (exists) return p;
        return {
          ...p,
          features: [...p.features, { id: libraryFeature.id, text: libraryFeature.name }],
        };
      }
      return p;
    });
    savePlans(updated);
  };

  const filteredFeatures =
    featureCategoryFilter === "All"
      ? featureLibrary
      : featureLibrary.filter((f) => f.category === featureCategoryFilter);

  const modalPlan = plans.find((p) => p.id === featureModalPlanId) ?? null;

  const removeFeature = (planId: string, featureId: string) => {
    const updated = plans.map((p) => {
      if (p.id === planId) {
        return { ...p, features: p.features.filter((f) => f.id !== featureId) };
      }
      return p;
    });
    savePlans(updated);
  };

  const addNewPlan = () => {
    const newPlan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      name: "New Plan",
      description: "Plan description",
      price: "0",
      period: "/mo",
      features: [],
      popular: false,
      active: true,
    };
    savePlans([...plans, newPlan]);
    setEditingPlan(newPlan.id);
  };

  const deletePlan = (planId: string) => {
    const updated = plans.filter((p) => p.id !== planId);
    savePlans(updated);
  };

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
      {/* Header */}
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
            onClick={() => setShowFeatureLibrary(!showFeatureLibrary)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <Library className="w-4 h-4" /> Feature Library
          </button>
          <button
            onClick={addNewPlan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Plan
          </button>
          <button
            onClick={saveAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Save className="w-4 h-4" /> Save All Changes
          </button>
        </div>
      </div>

      {/* Feature Library Section */}
      {showFeatureLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <Library className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Feature Library
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  Create features here, then select them when editing plans.
                </p>
              </div>
              <button
                onClick={() => setShowFeatureLibrary(false)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Feature */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="Feature name..."
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFeatureToLibrary()}
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
              <select
                value={newFeatureCategory}
                onChange={(e) => setNewFeatureCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 cursor-pointer"
              >
                {FEATURE_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                onClick={addFeatureToLibrary}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {FEATURE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFeatureCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${featureCategoryFilter === cat
                      ? "bg-cyan-600 text-white"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Feature List */}
            <div className="space-y-2 max-h-96 overflow-y-auto flex-1 min-h-0">
              {filteredFeatures.map((feature) => {
                const isEditing = editingFeature === feature.id;
                return (
                  <div
                    key={feature.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600"
                  >
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editingFeatureName[feature.id] ?? feature.name}
                          onChange={(e) =>
                            setEditingFeatureName((prev) => ({ ...prev, [feature.id]: e.target.value }))
                          }
                          className="flex-1 px-2 py-1 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-300"
                        />
                        <select
                          value={editingFeatureCategory[feature.id] ?? feature.category}
                          onChange={(e) =>
                            setEditingFeatureCategory((prev) => ({ ...prev, [feature.id]: e.target.value }))
                          }
                          className="px-2 py-1 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-300 cursor-pointer"
                        >
                          {FEATURE_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            updateFeatureInLibrary(
                              feature.id,
                              editingFeatureName[feature.id] ?? feature.name,
                              editingFeatureCategory[feature.id] ?? feature.category
                            );
                            setEditingFeature(null);
                            setEditingFeatureName((prev) => {
                              const copy = { ...prev };
                              delete copy[feature.id];
                              return copy;
                            });
                            setEditingFeatureCategory((prev) => {
                              const copy = { ...prev };
                              delete copy[feature.id];
                              return copy;
                            });
                          }}
                          className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingFeature(null);
                            setEditingFeatureName((prev) => {
                              const copy = { ...prev };
                              delete copy[feature.id];
                              return copy;
                            });
                            setEditingFeatureCategory((prev) => {
                              const copy = { ...prev };
                              delete copy[feature.id];
                              return copy;
                            });
                          }}
                          className="p-1.5 text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-slate-100">
                          {feature.name}
                        </span>
                        <CategoryBadge category={feature.category} />
                        <button
                          onClick={() => {
                            setEditingFeature(feature.id);
                            setEditingFeatureName((prev) => ({ ...prev, [feature.id]: feature.name }));
                            setEditingFeatureCategory((prev) => ({ ...prev, [feature.id]: feature.category }));
                          }}
                          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${feature.name}"?`)) {
                              deleteFeatureFromLibrary(feature.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredFeatures.length === 0 && (
              <div className="text-center py-8">
                <Library className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  No features in this category yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isEditing = editingPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border ${plan.popular
                  ? "border-cyan-300 dark:border-cyan-700 ring-2 ring-cyan-100 dark:ring-cyan-900/40"
                  : "border-gray-200 dark:border-slate-700"
                } shadow-sm ${isEditing ? "overflow-visible" : "overflow-hidden"} flex flex-col transition-all duration-500 hover:shadow-md dark:hover:shadow-slate-900/50 ${!plan.active ? "opacity-60" : ""
                }`}
            >
              {/* Plan Header */}
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
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingPlan(isEditing ? null : plan.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ease-out active:scale-95 hover:-translate-y-[1px] text-xs font-semibold ${isEditing
                          ? "bg-cyan-100 dark:bg-cyan-800/50 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-800 shadow-sm"
                          : "bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-500 hover:shadow-sm"
                        }`}
                      title={isEditing ? "Close editor" : "Edit plan"}
                    >
                      <div className="relative w-3.5 h-3.5 flex-shrink-0">
                        <Save className={`absolute inset-0 w-3.5 h-3.5 transition-all duration-300 transform ${isEditing ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 -rotate-90"}`} />
                        <Pencil className={`absolute inset-0 w-3.5 h-3.5 transition-all duration-300 transform ${!isEditing ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 rotate-90"}`} />
                      </div>
                      <div className="relative grid items-center">
                        <span className={`col-start-1 row-start-1 transition-all duration-300 transform ${isEditing ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                          Save
                        </span>
                        <span className={`col-start-1 row-start-1 transition-all duration-300 transform ${!isEditing ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}>
                          Edit
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete the "${plan.name}" plan?`)) {
                          deletePlan(plan.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  {/* View Mode */}
                  <div className={`grid transition-all duration-300 ease-in-out ${!isEditing ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="pb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{plan.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{plan.description}</p>
                        <div className="mt-3 flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900 dark:text-slate-100">${plan.price}</span>
                          <span className="text-gray-500 dark:text-slate-400 text-sm">{plan.period}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Mode */}
                  <div className={`grid transition-all duration-300 ease-in-out ${isEditing ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <div className="space-y-3 pt-2 pb-1">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Plan Name</label>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                            className={`${inputCls} font-semibold`}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                          <input
                            type="text"
                            value={plan.description}
                            onChange={(e) => updatePlan(plan.id, { description: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Price ($)</label>
                            <input
                              type="text"
                              value={plan.price}
                              onChange={(e) => updatePlan(plan.id, { price: e.target.value })}
                              className={inputCls}
                            />
                          </div>
                          <div className="w-24">
                            <label className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Period</label>
                            <select
                              value={plan.period}
                              onChange={(e) => updatePlan(plan.id, { period: e.target.value })}
                              className={`${inputCls} cursor-pointer`}
                            >
                              <option value="/mo">/mo</option>
                              <option value="/yr">/yr</option>
                              <option value="/14 days">/14 days</option>
                              <option value="">(one-time)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={plan.popular}
                              onChange={(e) => updatePlan(plan.id, { popular: e.target.checked })}
                              className="w-4 h-4 text-cyan-600 border-gray-300 dark:border-slate-600 rounded focus:ring-cyan-500 transition-colors"
                            />
                            <span className="text-sm text-gray-600 dark:text-slate-400">Popular badge</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={plan.active}
                              onChange={(e) => updatePlan(plan.id, { active: e.target.checked })}
                              className="w-4 h-4 text-cyan-600 border-gray-300 dark:border-slate-600 rounded focus:ring-cyan-500 transition-colors"
                            />
                            <span className="text-sm text-gray-600 dark:text-slate-400">Active</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="px-6 py-4 flex-1 bg-white dark:bg-slate-800 transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider transition-colors duration-300">
                    Features ({plan.features.length})
                  </p>
                </div>
                <ul className="space-y-2 relative">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-2 group relative">
                      <Check className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                      <div className="flex-1 flex items-start justify-between gap-1">
                        <span className={`text-sm transition-colors duration-300 ${isEditing ? "text-gray-700 dark:text-slate-300" : "text-gray-600 dark:text-slate-400"}`}>
                          {feature.text}
                        </span>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center justify-end ${isEditing ? "w-6 opacity-100 scale-100" : "w-0 opacity-0 scale-50"}`}>
                          <button
                            onClick={() => removeFeature(plan.id, feature.id)}
                            className="p-1 text-gray-300 dark:text-slate-600 hover:text-red-500 transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Add Feature Dropdown */}
                <div className={`grid transition-all duration-300 ease-in-out ${isEditing ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="mt-4 pb-1">
                      <button
                        onClick={() => {
                          setFeatureCategoryFilter("All");
                          setFeatureModalPlanId(plan.id);
                        }}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border bg-white dark:bg-slate-700/60 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-cyan-400 dark:hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/10"
                      >
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Feature
                        </span>
                        <Library className="w-4 h-4 opacity-50" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 bg-white dark:bg-slate-800 transition-colors duration-300">
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{plan.active ? "Currently live on pricing page" : "Hidden from pricing page"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {plans.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
          <Crown className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">No subscription plans yet</h3>
          <p className="text-gray-500 dark:text-slate-400 mb-6">Create your first plan to start offering subscriptions.</p>
          <button
            onClick={addNewPlan}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Create First Plan
          </button>
        </div>
      )}

      {/* ── Add Feature Modal ───────────────────────────────────────────── */}
      {featureModalPlanId && modalPlan && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setFeatureModalPlanId(null); }}
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-gray-100 dark:border-slate-700"
            style={{ maxHeight: "80vh" }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <Library className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Add Feature
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  Adding to <span className="font-medium text-cyan-600 dark:text-cyan-400">{modalPlan.name}</span> plan
                </p>
              </div>
              <button
                onClick={() => setFeatureModalPlanId(null)}
                className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Pills */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-slate-700">
              <div className="flex flex-wrap gap-2">
                {FEATURE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFeatureCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${featureCategoryFilter === cat
                        ? "bg-cyan-600 text-white shadow-sm shadow-cyan-200 dark:shadow-cyan-900/40"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature List */}
            <div className="overflow-y-auto flex-1">
              {filteredFeatures.length > 0 ? (
                <ul className="divide-y divide-gray-50 dark:divide-slate-700/60">
                  {filteredFeatures.map((libFeature) => {
                    const alreadyAdded = modalPlan.features.some((f) => f.id === libFeature.id);
                    return (
                      <li key={libFeature.id}>
                        <button
                          onClick={() => {
                            if (!alreadyAdded) {
                              addFeatureFromLibrary(modalPlan.id, libFeature);
                            }
                          }}
                          disabled={alreadyAdded}
                          className={`w-full text-left px-5 py-3.5 flex items-center gap-4 transition-colors ${alreadyAdded
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-cyan-50 dark:hover:bg-cyan-900/10 cursor-pointer"
                            }`}
                        >
                          {/* Icon dot */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alreadyAdded
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-gray-100 dark:bg-slate-700"
                            }`}>
                            {alreadyAdded
                              ? <Check className="w-4 h-4 text-green-500 dark:text-green-400" />
                              : <Plus className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                            }
                          </div>

                          {/* Name + badge */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${alreadyAdded
                                ? "text-gray-400 dark:text-slate-500"
                                : "text-gray-800 dark:text-slate-100"
                              }`}>
                              {libFeature.name}
                            </p>
                            <div className="mt-1">
                              <CategoryBadge category={libFeature.category} />
                            </div>
                          </div>

                          {alreadyAdded && (
                            <span className="text-xs text-green-500 dark:text-green-400 font-medium shrink-0">
                              Added
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Library className="w-7 h-7 text-gray-300 dark:text-slate-500" />
                  </div>
                  <p className="font-medium text-gray-700 dark:text-slate-300">No features here yet</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    Add features in the Feature Library first.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-800/80">
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {modalPlan.features.length} feature{modalPlan.features.length !== 1 ? "s" : ""} added
              </span>
              <button
                onClick={() => setFeatureModalPlanId(null)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionPlansView;


