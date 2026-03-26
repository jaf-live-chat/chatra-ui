import {
  MessageSquare,
  Users,
  Clock,
  ListOrdered,
  ArrowRight,
  BarChart2,
  History,
  MessagesSquare,
  Settings2,
} from "lucide-react";
import { useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Welcome back, {user?.fullName}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Here&apos;s a quick look at your workspace right now.
        </p>
      </div>

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

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm divide-y divide-gray-100 dark:divide-slate-700">
        {[
          {
            label: "View live queue",
            sub: "See and pick up waiting visitors",
            path: "/portal/queue",
            icon: <ListOrdered className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
          {
            label: "Analytics",
            sub: "Charts, trends and agent performance",
            path: "/portal/analytics",
            icon: <BarChart2 className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
          {
            label: "Chat history",
            sub: "Review past conversations and transcripts",
            path: "/portal/history",
            icon: <History className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
          {
            label: "Agents",
            sub: "Manage agents, roles and availability",
            path: "/portal/agents",
            icon: <Users className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
          {
            label: "Chat Sessions",
            sub: "View active and ongoing conversations",
            path: "/portal/chat-sessions",
            icon: <MessagesSquare className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
          {
            label: "Widget Settings",
            sub: "Customize your live chat widget",
            path: "/portal/widget-settings",
            icon: <Settings2 className="w-5 h-5 text-gray-400 dark:text-slate-500" />,
          },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group text-left"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 group-hover:border-cyan-100 dark:group-hover:border-cyan-800 transition-colors shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{item.sub}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
