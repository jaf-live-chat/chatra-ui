import { useState } from "react";
import { Zap, Bot, CreditCard, HelpCircle } from "lucide-react";
import { QuickRepliesView } from "./QuickRepliesView";
import { QueueAssignmentSettingsPage } from "./QueueAssignmentSettingsPage";
import { SubscriptionPlansView } from "./SubscriptionPlansView";
import { FaqEditorView } from "./FaqEditorView";

const tabs = [
  { id: "quick-replies",      label: "Quick Replies",      icon: Zap        },
  { id: "queue-assignment",   label: "Queue Assignment",   icon: Bot        },
  { id: "subscription-plans", label: "Subscription Plans", icon: CreditCard },
  { id: "faq-editor",         label: "Homepage FAQs",      icon: HelpCircle },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ToolsView() {
  const [activeTab, setActiveTab] = useState<TabId>("quick-replies");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">
            Tools
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-5">
            Manage quick replies, queue assignment, subscription plans, and homepage FAQs.
          </p>
          <div className="flex gap-1 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                    isActive
                      ? "border-cyan-600 text-cyan-700 dark:text-cyan-400 dark:border-cyan-400"
                      : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "quick-replies" ? (
        <QuickRepliesView />
      ) : activeTab === "queue-assignment" ? (
        <QueueAssignmentSettingsPage />
      ) : activeTab === "faq-editor" ? (
        <FaqEditorView />
      ) : (
        <SubscriptionPlansView />
      )}
    </div>
  );
}