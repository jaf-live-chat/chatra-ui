import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Users,
  Clock,
  ListOrdered,
  ArrowRight,
  UserPlus,
  BarChart2,
  History,
  MessagesSquare,
  Settings2,
  Building2,
  CreditCard,
  Zap,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { ConversationsView } from "./ConversationsView";
import { AgentsManagementView } from "./AgentsManagementView";
import { QueueView } from "./QueueView";
import { ActiveChatView } from "./ActiveChatView";
import { ChatHistoryView } from "./ChatHistoryView";
import { BillingView } from "./BillingView";
import { AnalyticsView } from "./AnalyticsView";
import { ChatAssignmentView } from "./ChatAssignmentView";
import { AccountSettingsView } from "./AccountSettingsView";
import { WidgetSettingsView } from "./WidgetSettingsView";
import { CompanyInfoView } from "./CompanyInfoView";
import { SubscriptionPlansView } from "./SubscriptionPlansView";
import { QuickRepliesView } from "./QuickRepliesView";
import { ToolsView } from "./ToolsView";

const initialMockQueue = [
  { id: "Q-1001", name: "Alice Johnson", message: "I need help with upgrading my plan.", status: "Waiting", timeInQueue: "5m 20s" },
  { id: "Q-1002", name: "Michael Smith", message: "Can I connect my own custom domain?", status: "Waiting", timeInQueue: "12m 45s" },
  { id: "Q-1003", name: "Emily Davis", message: "My payment keeps failing. Please help.", status: "Assigned", timeInQueue: "2m 10s" },
  { id: "Q-1004", name: "James Wilson", message: "How do I add more team members?", status: "Waiting", timeInQueue: "8m 05s" },
  { id: "Q-1005", name: "Sarah Brown", message: "I am having trouble logging in.", status: "Waiting", timeInQueue: "15m 30s" },
  { id: "Q-1006", name: "David Lee", message: "What are the limitations of the free tier?", status: "Assigned", timeInQueue: "1m 15s" },
  { id: "Q-1007", name: "Sophia Martinez", message: "Is there a way to export my data?", status: "Waiting", timeInQueue: "4m 50s" },
  { id: "Q-1008", name: "Daniel Taylor", message: "I want to cancel my subscription.", status: "Waiting", timeInQueue: "0m" },
  { id: "Q-1009", name: "Emma Wilson", message: "How do I setup SSO?", status: "Waiting", timeInQueue: "11m 10s" },
  { id: "Q-1010", name: "Oliver Garcia", message: "Can I get a refund for my last invoice?", status: "Waiting", timeInQueue: "6m 30s" },
  { id: "Q-1011", name: "Mia Rodriguez", message: "The dashboard is not loading properly.", status: "Assigned", timeInQueue: "3m 45s" },
  { id: "Q-1012", name: "William Martinez", message: "I need to update my billing address.", status: "Waiting", timeInQueue: "9m 20s" },
  { id: "Q-1013", name: "Ava Hernandez", message: "Where can I find my API keys?", status: "Waiting", timeInQueue: "7m 50s" },
  { id: "Q-1014", name: "Noah Lopez", message: "I forgot my password and the reset link isn't working.", status: "Waiting", timeInQueue: "14m 15s" }
];

const initialMockHistory = [
  { id: "CH-1002", visitor: "Michael Smith", length: "5m 45s", date: "Oct 24, 2026, 11:15", transcript: [{ sender: "Michael", time: "11:15", text: "Does this integrate with Salesforce?" }, { sender: "Agent", time: "11:17", text: "Yes, we have a native Salesforce integration available on the Enterprise tier." }, { sender: "Michael", time: "11:20", text: "Okay, I'll check out the Enterprise pricing." }] },
  { id: "CH-1003", visitor: "Emily Davis", length: "22m 10s", date: "Oct 23, 2026, 09:45", transcript: [{ sender: "Emily", time: "09:45", text: "My card was declined, can you help?" }, { sender: "Agent", time: "09:48", text: "Hi Emily, let me check your account." }, { sender: "Agent", time: "09:50", text: "It looks like the bank rejected the transaction. Could you try updating your payment method?" }, { sender: "Emily", time: "10:05", text: "Done. It went through now." }, { sender: "Agent", time: "10:07", text: "Great! Let me know if you need anything else." }] },
  { id: "CH-1004", visitor: "James Wilson", length: "8m 30s", date: "Oct 22, 2026, 16:20", transcript: [{ sender: "James", time: "16:20", text: "How do I add team members?" }, { sender: "Agent", time: "16:22", text: "You can go to Workspace Settings > Members and click 'Invite'." }, { sender: "James", time: "16:28", text: "Found it, thanks!" }] },
  { id: "CH-1005", visitor: "Sarah Brown", length: "35m 00s", date: "Oct 21, 2026, 13:10", transcript: [{ sender: "Sarah", time: "13:10", text: "Where can I find the API key?" }, { sender: "Agent", time: "13:15", text: "Hi Sarah! You can generate an API key under Settings > API." }, { sender: "Sarah", time: "13:40", text: "Got it, setting it up now." }, { sender: "Agent", time: "13:45", text: "Awesome. Reach out if you hit any roadblocks." }] }
];

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [activeChatVisitor, setActiveChatVisitor] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState("Online");
  const [queueItems, setQueueItems] = useState(initialMockQueue);
  const [historyItems, setHistoryItems] = useState(initialMockHistory);
  const [liveQueueItems, setLiveQueueItems] = useState<any[]>([]);

  const setActiveTab = (tab: string) => {
    if (tab === "overview" || tab === "dashboard") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  // Load live visitor chats from shared localStorage queue
  useEffect(() => {
    const loadLiveQueue = () => {
      try {
        const stored = localStorage.getItem("jaf_live_queue");
        if (stored) {
          const parsed = JSON.parse(stored);
          setLiveQueueItems(parsed);
        } else {
          setLiveQueueItems([]);
        }
      } catch (e) {
        // silently fail
      }
    };

    loadLiveQueue();

    const handleQueueUpdate = () => loadLiveQueue();
    window.addEventListener("jaf_queue_updated", handleQueueUpdate);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "jaf_live_queue") loadLiveQueue();
    };
    window.addEventListener("storage", handleStorage);

    const interval = setInterval(loadLiveQueue, 2000);

    return () => {
      window.removeEventListener("jaf_queue_updated", handleQueueUpdate);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Merge mock queue + live visitor queue
  const mergedQueue = useMemo(() => {
    const liveIds = liveQueueItems.map((l: any) => l.id);
    const mockFiltered = queueItems.filter(q => !liveIds.includes(q.id));
    return [...liveQueueItems, ...mockFiltered];
  }, [queueItems, liveQueueItems]);

  const handleEndChat = (visitor: any, messages: any[], length: string) => {
    setQueueItems(prev => prev.filter(q => q.id !== visitor.id));
    
    if (visitor.sessionId) {
      try {
        const stored = localStorage.getItem("jaf_live_queue");
        if (stored) {
          const queue = JSON.parse(stored);
          const filtered = queue.filter((q: any) => q.sessionId !== visitor.sessionId);
          localStorage.setItem("jaf_live_queue", JSON.stringify(filtered));
          window.dispatchEvent(new Event("jaf_queue_updated"));
        }
      } catch (e) {
        // silently fail
      }
    }
    
    const newHistoryItem = {
      id: `CH-${Date.now()}`,
      visitor: visitor.name,
      length: length || visitor.timeInQueue || "5m 00s",
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }),
      transcript: messages.map(m => ({
        sender: m.sender === 'visitor' ? visitor.name : 'Agent',
        time: m.timestamp,
        text: m.text
      }))
    };
    
    setHistoryItems(prev => [newHistoryItem, ...prev]);
    setActiveTab("queue");
    setAgentStatus("Online");
    setActiveChatVisitor(null);
  };

  return (
    <>
      {activeTab === "active-chat" && activeChatVisitor ? (
        <ActiveChatView 
          visitor={activeChatVisitor} 
          onEndChat={(messages, length) => handleEndChat(activeChatVisitor, messages, length)} 
        />
      ) : activeTab === "conversations" ? (
        <ConversationsView />
      ) : activeTab === "agents" ? (
        <AgentsManagementView />
      ) : activeTab === "queue" ? (
        <QueueView queue={mergedQueue} onStartChat={(visitor) => {
          // ── Move visitor from Waiting → Assigned (Currently Being Served) ──
          // For mock queue items
          setQueueItems(prev =>
            prev.map(q => q.id === visitor.id ? { ...q, status: "Assigned" } : q)
          );
          // For live widget visitors stored in localStorage
          if (visitor.sessionId) {
            try {
              const stored = localStorage.getItem("jaf_live_queue");
              if (stored) {
                const liveQueue = JSON.parse(stored);
                const updated = liveQueue.map((q: any) =>
                  q.id === visitor.id ? { ...q, status: "Assigned" } : q
                );
                localStorage.setItem("jaf_live_queue", JSON.stringify(updated));
                window.dispatchEvent(new Event("jaf_queue_updated"));
              }
            } catch (e) { /* silently fail */ }
          }
          // Navigate to the chat session
          localStorage.setItem("jaf_active_chat_visitor", JSON.stringify(visitor));
          window.dispatchEvent(new Event("jaf_chat_session_start"));
          navigate("/dashboard/chat-sessions");
        }} />
      ) : activeTab === "history" ? (
        <ChatHistoryView history={historyItems} />
      ) : activeTab === "billing" ? (
        <BillingView />
      ) : activeTab === "analytics" ? (
        <AnalyticsView />
      ) : activeTab === "assignment" ? (
        <ChatAssignmentView />
      ) : activeTab === "account-settings" ? (
        <AccountSettingsView />
      ) : activeTab === "widget-settings" ? (
        <WidgetSettingsView />
      ) : activeTab === "company-info" ? (
        <CompanyInfoView />
      ) : activeTab === "tools" ? (
        <ToolsView />
      ) : activeTab === "quick-replies" ? (
        <QuickRepliesView />
      ) : (
        /* ── Simple clean overview ── */
        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Welcome back, Admin</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Here's a quick look at your workspace right now.</p>
          </div>

          {/* Live status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">24</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Visitors Online</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">148</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">In Queue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">7</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm divide-y divide-gray-100 dark:divide-slate-700">
            {[
              { label: "View live queue", sub: "See and pick up waiting visitors", tab: "queue", icon: <ListOrdered className="w-5 h-5 text-gray-400 dark:text-slate-500" /> },
              { label: "Analytics", sub: "Charts, trends and agent performance", tab: "analytics", icon: <BarChart2 className="w-5 h-5 text-gray-400 dark:text-slate-500" /> },
              { label: "Chat history", sub: "Review past conversations and transcripts", tab: "history", icon: <History className="w-5 h-5 text-gray-400 dark:text-slate-500" /> },
              { label: "Agents", sub: "Manage agents, roles and availability", tab: "agents", icon: <Users className="w-5 h-5 text-gray-400 dark:text-slate-500" /> },
              { label: "Chat Sessions", sub: "View active and ongoing conversations", tab: "chat-sessions-nav", icon: <MessagesSquare className="w-5 h-5 text-gray-400 dark:text-slate-500" /> },
              { label: "Widget Settings", sub: "Customize your live chat widget", tab: "widget-settings", icon: <Settings2 className="w-5 h-5 text-gray-400 dark:text-slate-500" /> },
              { label: "Company Info", sub: "Update your company profile and details", tab: "company-info", icon: <Building2 className="w-5 h-5 text-gray-400 dark:text-slate-500" /> },
              { label: "Tools", sub: "Quick replies, queue assignment, and subscription plans", tab: "tools", icon: <Zap className="w-5 h-5 text-gray-400 dark:text-slate-500" /> },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => {
                  if (item.tab === "history") {
                    navigate("/dashboard/chat-sessions?tab=chat-history");
                  } else if (item.tab === "chat-sessions-nav") {
                    navigate("/dashboard/chat-sessions");
                  } else {
                    setActiveTab(item.tab);
                  }
                }}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 group-hover:border-cyan-100 dark:group-hover:border-cyan-800 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{item.sub}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}