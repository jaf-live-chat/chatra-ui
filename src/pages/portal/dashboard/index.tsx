import {
  MessageSquare,
  Users,
  Clock,
  ListOrdered,
  Eye,
  UserCog,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router";
import Tooltip from "@mui/material/Tooltip";
import ReusableTable, {
  type ReusableTableColumn,
} from "../../../components/ReusableTable";
import useAuth from "../../../hooks/useAuth";

type ActiveSessionRow = {
  id: string;
  visitor: string;
  channelId: string;
  agent: string;
  status: "ACTIVE" | "IN_QUEUE";
  time: string;
};

type AgentStatusRow = {
  id: string;
  name: string;
  code: string;
  status: "Available" | "Away" | "In Chat";
  activeCount: number;
};

type LiveQueueRow = {
  id: string;
  visitor: string;
  queueId: string;
  wait: string;
  priority: "HIGH" | "NORMAL" | "LOW";
};

type FeedbackRow = {
  id: string;
  agent: string;
  rating: number;
  comment: string;
};

const activeSessions: ActiveSessionRow[] = [
  {
    id: "CH-0992",
    visitor: "sarah.j@acme.com",
    channelId: "#CH-0992",
    agent: "sadasdsad",
    status: "ACTIVE",
    time: "04:23",
  },
  {
    id: "CH-0993",
    visitor: "Guest_4419",
    channelId: "#CH-0993",
    agent: "ben robles",
    status: "ACTIVE",
    time: "01:12",
  },
  {
    id: "CH-0994",
    visitor: "mike.w@startup.io",
    channelId: "#CH-0994",
    agent: "Unassigned",
    status: "IN_QUEUE",
    time: "00:45",
  },
  {
    id: "CH-0995",
    visitor: "Guest_9921",
    channelId: "#CH-0995",
    agent: "johndoe",
    status: "ACTIVE",
    time: "12:05",
  },
  {
    id: "CH-0996",
    visitor: "alex.p@gmail.com",
    channelId: "#CH-0996",
    agent: "jane smith",
    status: "ACTIVE",
    time: "08:15",
  },
];

const agentStatuses: AgentStatusRow[] = [
  { id: "1", name: "sadasdsad", code: "692c538a3933d4a09e8a3c54", status: "In Chat", activeCount: 2 },
  { id: "2", name: "ben robles", code: "692c53a83933d4a09e8a3c55", status: "Available", activeCount: 1 },
  { id: "3", name: "johndoe", code: "692c54603933d4a09e8a3c12", status: "Away", activeCount: 0 },
  { id: "4", name: "jane smith", code: "692c546503933d4a09e8a3c16", status: "In Chat", activeCount: 3 },
  { id: "5", name: "mark taylor", code: "692c546f3933d4a09e8a3c17", status: "Away", activeCount: 0 },
];

const liveQueue: LiveQueueRow[] = [
  { id: "Q-102", visitor: "Guest_882", queueId: "#Q-102", wait: "04:12", priority: "HIGH" },
  { id: "Q-103", visitor: "david.c@web.com", queueId: "#Q-103", wait: "02:45", priority: "NORMAL" },
  { id: "Q-104", visitor: "Guest_911", queueId: "#Q-104", wait: "01:30", priority: "NORMAL" },
  { id: "Q-105", visitor: "anna.m@test.com", queueId: "#Q-105", wait: "01:05", priority: "HIGH" },
  { id: "Q-106", visitor: "Guest_223", queueId: "#Q-106", wait: "00:15", priority: "LOW" },
];

const recentFeedback: FeedbackRow[] = [
  { id: "#CH-0881", agent: "sadasdsad", rating: 5, comment: '"Very helpful and fast!"' },
  { id: "#CH-0882", agent: "ben robles", rating: 4, comment: '"Solved my issue."' },
  { id: "#CH-0883", agent: "johndoe", rating: 4, comment: '"Great support experience."' },
  { id: "#CH-0884", agent: "jane smith", rating: 3, comment: '"Took a while to connect."' },
  { id: "#CH-0885", agent: "mark taylor", rating: 5, comment: '"Awesome tool!"' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeSessionsColumns: ReusableTableColumn<ActiveSessionRow>[] = [
    {
      id: "visitor",
      label: "VISITOR",
      width: "40%",
      renderCell: (row) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{row.visitor}</p>
          <p className="text-xs text-slate-500 mt-0.5">{row.channelId}</p>
        </div>
      ),
    },
    {
      id: "agent",
      label: "AGENT",
      width: "28%",
      headerSx: { display: { xs: "none", md: "table-cell" } },
      sx: { display: { xs: "none", md: "table-cell" } },
      renderCell: (row) => <p className="text-sm text-slate-800">{row.agent}</p>,
    },
    {
      id: "status",
      label: "STATUS",
      width: "17%",
      headerSx: { display: { xs: "none", sm: "table-cell" } },
      sx: { display: { xs: "none", sm: "table-cell" } },
      renderCell: (row) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tracking-wide ${
            row.status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {row.status === "ACTIVE" ? "ACTIVE" : "IN QUEUE"}
        </span>
      ),
    },
    {
      id: "time",
      label: "TIME",
      width: "15%",
      align: "right",
      headerAlign: "right",
      headerSx: { display: { xs: "none", sm: "table-cell" } },
      sx: { display: { xs: "none", sm: "table-cell" } },
      renderCell: (row) => <p className="text-sm font-medium text-slate-800">{row.time}</p>,
    },
  ];

  const agentStatusColumns: ReusableTableColumn<AgentStatusRow>[] = [
    {
      id: "agent",
      label: "AGENT",
      width: "60%",
      renderCell: (row) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {row.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{row.name}</p>
            <p className="text-[10px] text-slate-500 font-medium">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      label: "STATUS",
      width: "28%",
      renderCell: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <span
            className={`h-2 w-2 rounded-full ${
              row.status === "Available"
                ? "bg-emerald-500"
                : row.status === "In Chat"
                  ? "bg-blue-500"
                  : "bg-slate-300"
            }`}
          />
          {row.status}
        </span>
      ),
    },
    {
      id: "count",
      label: "#",
      width: "12%",
      align: "right",
      headerAlign: "right",
      renderCell: (row) => (
        <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-900 border border-slate-200">
          {row.activeCount}
        </span>
      ),
    },
  ];

  const liveQueueColumns: ReusableTableColumn<LiveQueueRow>[] = [
    {
      id: "visitor",
      label: "VISITOR",
      width: "52%",
      renderCell: (row) => (
        <div>
          <p className="text-sm font-bold text-slate-900">{row.visitor}</p>
          <p className="text-xs text-slate-500 mt-0.5">{row.queueId}</p>
        </div>
      ),
    },
    {
      id: "wait",
      label: "WAIT",
      width: "22%",
      renderCell: (row) => <span className="text-sm font-medium text-amber-600">{row.wait}</span>,
    },
    {
      id: "prio",
      label: "PRIO",
      width: "26%",
      align: "right",
      headerAlign: "right",
      headerSx: { display: { xs: "none", sm: "table-cell" } },
      sx: { display: { xs: "none", sm: "table-cell" } },
      renderCell: (row) => (
        <span
          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
            row.priority === "HIGH"
              ? "bg-rose-100 text-rose-700"
              : row.priority === "LOW"
                ? "bg-slate-100 text-slate-600"
                : "bg-sky-100 text-sky-700"
          }`}
        >
          {row.priority}
        </span>
      ),
    },
  ];

  const feedbackColumns: ReusableTableColumn<FeedbackRow>[] = [
    {
      id: "id",
      label: "ID",
      width: "20%",
      headerSx: { display: { xs: "none", md: "table-cell" } },
      sx: { display: { xs: "none", md: "table-cell" } },
      renderCell: (row) => (
        <div className="flex flex-col">
          <p className="text-sm text-slate-500 font-medium">{row.id}</p>
          <p className="text-[11px] opacity-0 mt-0.5">spacer</p>
        </div>
      ),
    },
    {
      id: "agent",
      label: "AGENT",
      width: "25%",
      renderCell: (row) => <p className="text-sm font-semibold text-slate-800">{row.agent}</p>,
    },
    {
      id: "rating",
      label: "RATING",
      width: "20%",
      renderCell: (row) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: row.rating }).map((_, idx) => (
            <Star key={`${row.id}-${idx}`} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
      ),
    },
    {
      id: "comment",
      label: "COMMENT",
      width: "35%",
      headerSx: { display: { xs: "none", sm: "table-cell" } },
      sx: { display: { xs: "none", sm: "table-cell" } },
      renderCell: (row) => <p className="text-sm italic text-slate-500">{row.comment}</p>,
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-slate-100">
          Welcome back, Admin
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-[15px]">
          Here&apos;s a quick look at your workspace right now.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">Active Chats</p>
            <p className="text-[28px] font-bold text-slate-900 leading-none dark:text-slate-100">24</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">Visitors Online</p>
            <p className="text-[28px] font-bold text-slate-900 leading-none dark:text-slate-100">148</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <ListOrdered className="w-6 h-6 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">In Queue</p>
            <p className="text-[28px] font-bold text-slate-900 leading-none dark:text-slate-100">7</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <div className="xl:col-span-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl bg-white border border-slate-100 overflow-hidden h-full flex flex-col">
          <ReusableTable
            title="Active Sessions"
            rows={activeSessions}
            columns={activeSessionsColumns}
            getRowKey={(row) => row.id}
            showSearch={false}
            compact={true}
            showTotalBadge={true}
            showPagination={false}
            rowsPerPage={5}
            headerIcon={<MessageSquare className="text-blue-500" size={20} />}
            headerActions={
              <Tooltip title="View all active sessions" placement="top">
                <button
                  onClick={() => navigate("/portal/chat-sessions")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 tracking-wide px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 uppercase"
                >
                  View all
                </button>
              </Tooltip>
            }
          />
        </div>

        <div className="xl:col-span-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl bg-white border border-slate-100 overflow-hidden h-full flex flex-col">
          <ReusableTable
            title="Agent Status"
            rows={agentStatuses}
            columns={agentStatusColumns}
            getRowKey={(row) => row.id}
            compact={true}
            showSearch={false}
            showTotalBadge={true}
            showPagination={false}
            rowsPerPage={5}
            headerIcon={<Users className="text-blue-500" size={20} />}
            headerActions={
              <Tooltip title="Manage agent status" placement="top">
                <button
                  onClick={() => navigate("/portal/agents")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 tracking-wide px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 uppercase"
                >
                  Manage
                </button>
              </Tooltip>
            }
          />
        </div>

        <div className="xl:col-span-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl bg-white border border-slate-100 overflow-hidden h-full flex flex-col">
          <ReusableTable
            title="Live Queue"
            rows={liveQueue}
            columns={liveQueueColumns}
            getRowKey={(row) => row.id}
            compact={true}
            showSearch={false}
            showTotalBadge={true}
            showPagination={false}
            rowsPerPage={5}
            headerIcon={<ListOrdered className="text-amber-500" size={20} />}
            headerActions={
              <Tooltip title="View live queue" placement="top">
                <button
                  onClick={() => navigate("/portal/chats")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 tracking-wide px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 uppercase"
                >
                  View all
                </button>
              </Tooltip>
            }
          />
        </div>

        <div className="xl:col-span-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl bg-white border border-slate-100 overflow-hidden h-full flex flex-col">
          <ReusableTable
            title="Recent Feedback"
            rows={recentFeedback}
            columns={feedbackColumns}
            getRowKey={(row) => row.id}
            compact={true}
            showSearch={false}
            showTotalBadge={true}
            showPagination={false}
            rowsPerPage={5}
            headerIcon={<Star className="text-purple-500" size={20} />}
            headerActions={
              <Tooltip title="View all reviews" placement="top">
                <button
                  onClick={() => navigate("/portal/analytics")}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 tracking-wide px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 uppercase"
                >
                  All reviews
                </button>
              </Tooltip>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
