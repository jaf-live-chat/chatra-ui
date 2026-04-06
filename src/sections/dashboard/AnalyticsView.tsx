import {
  MessageSquare,
  CheckCircle2,
  Clock,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useDarkMode } from "../../providers/DarkModeContext";
import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import PageTitle from "../../components/common/PageTitle";

// ── Data ─────────────────────────────────────────────────────────────────────

const weeklyVolume = [
  { day: "Mon", total: 120, resolved: 110 },
  { day: "Tue", total: 180, resolved: 165 },
  { day: "Wed", total: 250, resolved: 220 },
  { day: "Thu", total: 210, resolved: 195 },
  { day: "Fri", total: 290, resolved: 270 },
  { day: "Sat", total: 150, resolved: 140 },
  { day: "Sun", total: 90, resolved: 85 },
];

const hourlyLoad = [
  { hour: "8am", chats: 14 },
  { hour: "9am", chats: 28 },
  { hour: "10am", chats: 45 },
  { hour: "11am", chats: 52 },
  { hour: "12pm", chats: 38 },
  { hour: "1pm", chats: 30 },
  { hour: "2pm", chats: 48 },
  { hour: "3pm", chats: 56 },
  { hour: "4pm", chats: 40 },
  { hour: "5pm", chats: 22 },
];

const channelData = [
  { name: "Live Chat", value: 62, color: "#0891b2" },
  { name: "Email", value: 24, color: "#1F2937" },
  { name: "Widget", value: 14, color: "#9CA3AF" },
];

const topAgents = [
  { name: "Sarah J.", resolved: 94, avg: "58s", sat: "98%" },
  { name: "Mark T.", resolved: 81, avg: "1m 12s", sat: "95%" },
  { name: "Lisa M.", resolved: 76, avg: "1m 05s", sat: "96%" },
  { name: "Chris P.", resolved: 68, avg: "1m 30s", sat: "92%" },
  { name: "Dana K.", resolved: 55, avg: "2m 10s", sat: "89%" },
];

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const rowVariant = {
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function niceTicks(max: number, count = 5): number[] {
  const step = Math.ceil(max / (count - 1) / 50) * 50 || 1;
  return Array.from({ length: count }, (_, i) => i * step);
}

// ── SVG Line Chart ────────────────────────────────────────────────────────────

interface LineSeries {
  key: string;
  label: string;
  color: string;
}

function SvgLineChart({
  data,
  xKey,
  lines,
  height = 240,
  gridColor,
  labelColor,
  dotFill,
}: {
  data: Record<string, number | string>[];
  xKey: string;
  lines: LineSeries[];
  height?: number;
  gridColor: string;
  labelColor: string;
  dotFill: string;
}) {
  const VW = 580;
  const ML = 42, MR = 16, MT = 10, MB = 28;
  const cW = VW - ML - MR;
  const cH = height - MT - MB;

  const allVals = data.flatMap((d) => lines.map((l) => Number(d[l.key])));
  const maxVal = Math.max(...allVals);
  const ticks = niceTicks(maxVal);
  const domainMax = ticks[ticks.length - 1];

  const xOf = (i: number) => ML + (i / (data.length - 1)) * cW;
  const yOf = (v: number) => MT + cH - (v / domainMax) * cH;

  // Animate clip rect from 0 → full width
  const [clipW, setClipW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setClipW(cW + MR + 10), 80);
    return () => clearTimeout(t);
  }, [cW, MR]);

  const clipId = `line-clip-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg
      viewBox={`0 0 ${VW} ${height}`}
      width="100%"
      height={height}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={ML}
            y={0}
            width={clipW}
            height={height}
            style={{
              transition: "width 1.1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </clipPath>
      </defs>

      {/* Grid + Y labels */}
      {ticks.map((t) => (
        <g key={`y-${t}`}>
          <line
            x1={ML} y1={yOf(t)} x2={ML + cW} y2={yOf(t)}
            stroke={gridColor} strokeDasharray="3 3"
          />
          <text
            x={ML - 6} y={yOf(t)}
            textAnchor="end" dominantBaseline="middle"
            fontSize={11} fill={labelColor}
          >
            {t}
          </text>
        </g>
      ))}

      {/* X labels */}
      {data.map((d, i) => (
        <text
          key={`x-${i}`}
          x={xOf(i)} y={MT + cH + 16}
          textAnchor="middle" fontSize={11} fill={labelColor}
        >
          {String(d[xKey])}
        </text>
      ))}

      {/* Lines + dots — clipped for draw-in effect */}
      <g clipPath={`url(#${clipId})`}>
        {lines.map((ln) => {
          const pathD = data
            .map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(Number(d[ln.key])).toFixed(1)}`)
            .join(" ");
          return (
            <g key={`line-${ln.key}`}>
              <path
                d={pathD}
                fill="none"
                stroke={ln.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {data.map((d, i) => (
                <circle
                  key={`dot-${ln.key}-${i}`}
                  cx={xOf(i)}
                  cy={yOf(Number(d[ln.key]))}
                  r={3.5}
                  fill={dotFill}
                  stroke={ln.color}
                  strokeWidth={2}
                />
              ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────

function SvgBarChart({
  data,
  xKey,
  yKey,
  color = "#0891b2",
  height = 200,
  gridColor,
  labelColor,
}: {
  data: Record<string, number | string>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  gridColor: string;
  labelColor: string;
}) {
  const VW = 640;
  const ML = 42, MR = 16, MT = 10, MB = 28;
  const cW = VW - ML - MR;
  const cH = height - MT - MB;

  const maxVal = Math.max(...data.map((d) => Number(d[yKey])));
  const ticks = niceTicks(maxVal);
  const domainMax = ticks[ticks.length - 1];

  const slotW = cW / data.length;
  const barW = Math.max(slotW * 0.55, 4);

  const xOf = (i: number) => ML + i * slotW + slotW / 2;
  const yOf = (v: number) => MT + cH - (v / domainMax) * cH;

  // Animate bars growing from bottom
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg
      viewBox={`0 0 ${VW} ${height}`}
      width="100%"
      height={height}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      {/* Grid + Y labels */}
      {ticks.map((t) => (
        <g key={`y-${t}`}>
          <line
            x1={ML} y1={yOf(t)} x2={ML + cW} y2={yOf(t)}
            stroke={gridColor} strokeDasharray="3 3"
          />
          <text
            x={ML - 6} y={yOf(t)}
            textAnchor="end" dominantBaseline="middle"
            fontSize={11} fill={labelColor}
          >
            {t}
          </text>
        </g>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const val = Number(d[yKey]);
        const barH = (val / domainMax) * cH;
        const cx = xOf(i);
        const r = 3;
        const bottomY = MT + cH;

        return (
          <g
            key={`bar-${i}`}
            style={{
              transform: ready ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: `${cx}px ${bottomY}px`,
              transition: `transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1) ${0.05 + i * 0.065}s`,
            }}
          >
            <path
              d={`
                M${(cx - barW / 2).toFixed(1)},${bottomY.toFixed(1)}
                L${(cx - barW / 2).toFixed(1)},${(yOf(val) + r).toFixed(1)}
                Q${(cx - barW / 2).toFixed(1)},${yOf(val).toFixed(1)} ${(cx - barW / 2 + r).toFixed(1)},${yOf(val).toFixed(1)}
                L${(cx + barW / 2 - r).toFixed(1)},${yOf(val).toFixed(1)}
                Q${(cx + barW / 2).toFixed(1)},${yOf(val).toFixed(1)} ${(cx + barW / 2).toFixed(1)},${(yOf(val) + r).toFixed(1)}
                L${(cx + barW / 2).toFixed(1)},${bottomY.toFixed(1)}
                Z
              `}
              fill={barH < 1 ? "none" : color}
              opacity={0.85}
            />
          </g>
        );
      })}

      {/* X labels (outside clip so always visible) */}
      {data.map((d, i) => (
        <text
          key={`xlabel-${i}`}
          x={xOf(i)} y={MT + cH + 16}
          textAnchor="middle" fontSize={10} fill={labelColor}
        >
          {String(d[xKey])}
        </text>
      ))}
    </svg>
  );
}

// ── SVG Donut Chart ───────────────────────────────────────────────────────────

function SvgDonutChart({
  data,
  size = 180,
  centerTextColor,
  legendTextColor,
  legendValueColor,
  strokeColor,
}: {
  data: { name: string; value: number; color: string }[];
  size?: number;
  centerTextColor: string;
  legendTextColor: string;
  legendValueColor: string;
  strokeColor: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.38;
  const r = size * 0.22;

  const total = data.reduce((s, d) => s + d.value, 0);
  let startAngle = -Math.PI / 2;

  const arcs = data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sweep;

    const x1 = cx + R * Math.cos(startAngle);
    const y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle);
    const y2 = cy + R * Math.sin(endAngle);
    const ix1 = cx + r * Math.cos(endAngle);
    const iy1 = cy + r * Math.sin(endAngle);
    const ix2 = cx + r * Math.cos(startAngle);
    const iy2 = cy + r * Math.sin(startAngle);

    const large = sweep > Math.PI ? 1 : 0;

    const path = [
      `M${x1.toFixed(2)},${y1.toFixed(2)}`,
      `A${R},${R} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)}`,
      `L${ix1.toFixed(2)},${iy1.toFixed(2)}`,
      `A${r},${r} 0 ${large},0 ${ix2.toFixed(2)},${iy2.toFixed(2)}`,
      "Z",
    ].join(" ");

    startAngle = endAngle;
    return { ...d, path };
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {arcs.map((arc, i) => (
          <motion.path
            key={`arc-${arc.name}`}
            d={arc.path}
            fill={arc.color}
            stroke={strokeColor}
            strokeWidth={2}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.2 + i * 0.1, ease: "easeOut" }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={13} fontWeight="600" fill={centerTextColor}>
          {total}%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fill={legendTextColor}>
          total
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2 w-full">
        {data.map((d, i) => (
          <motion.div
            key={`leg-${d.name}`}
            className="flex items-center justify-between text-sm"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.35 + i * 0.08 }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span style={{ color: legendTextColor }}>{d.name}</span>
            </div>
            <span style={{ color: legendValueColor, fontWeight: 600 }}>{d.value}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  up: boolean;
}

function StatCard({ icon, label, value, change, up }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 dark:text-slate-500">{icon}</span>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${up
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            }`}
        >
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const AnalyticsView = () => {
  const { isDark } = useDarkMode();

  const gridColor = isDark ? "#334155" : "#E5E7EB";
  const labelColor = isDark ? "#64748b" : "#9CA3AF";
  const dotFill = isDark ? "#1e293b" : "#ffffff";
  const centerTextColor = isDark ? "#f1f5f9" : "#1F2937";
  const legendTextColor = isDark ? "#94a3b8" : "#4B5563";
  const legendValueColor = isDark ? "#f1f5f9" : "#111827";
  const strokeColor = isDark ? "#1e293b" : "#ffffff";

  return (
    <React.Fragment>
        <PageTitle
        title="Analytics"
        description="Performance overview for the last 7 days."
        canonical="/portal/analytics"

      />
    <div className={`space-y-8${isDark ? " dark" : ""}`}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Analytics</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Performance overview for the last 7 days.</p>
      </motion.div>

      {/* ── Stat Cards — staggered ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {[
          { icon: <MessageSquare className="w-5 h-5" />, label: "Total Conversations", value: "1,290", change: "+8.4%", up: true },
          { icon: <CheckCircle2 className="w-5 h-5" />, label: "Resolution Rate", value: "91.5%", change: "+2.1%", up: true },
          { icon: <Clock className="w-5 h-5" />, label: "Avg. Response Time", value: "1m 12s", change: "-15s", up: true },
          { icon: <ThumbsUp className="w-5 h-5" />, label: "Satisfaction Score", value: "94%", change: "-0.5%", up: false },
        ].map((card) => (
          <motion.div key={card.label} variants={fadeUp} transition={{ duration: 0.38, ease: "easeOut" }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Conversation Volume */}
        <motion.div
          className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
        >
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 dark:text-slate-100">Conversation Volume</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Total vs. resolved conversations this week</p>
          </div>
          <div className="flex items-center gap-6 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-600 inline-block rounded" />
              <span className="text-xs text-gray-500 dark:text-slate-400">Total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-gray-900 dark:bg-slate-300 inline-block rounded" />
              <span className="text-xs text-gray-500 dark:text-slate-400">Resolved</span>
            </div>
          </div>
          <SvgLineChart
            data={weeklyVolume}
            xKey="day"
            lines={[
              { key: "total", label: "Total", color: "#0891b2" },
              { key: "resolved", label: "Resolved", color: isDark ? "#cbd5e1" : "#1F2937" },
            ]}
            height={240}
            gridColor={gridColor}
            labelColor={labelColor}
            dotFill={dotFill}
          />
        </motion.div>

        {/* Channel breakdown */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26, ease: "easeOut" }}
        >
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 dark:text-slate-100">Conversations by Channel</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Share of traffic this week</p>
          </div>
          <div className="flex justify-center">
            <SvgDonutChart
              data={channelData}
              size={180}
              centerTextColor={centerTextColor}
              legendTextColor={legendTextColor}
              legendValueColor={legendValueColor}
              strokeColor={strokeColor}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Peak Hours ── */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.32, ease: "easeOut" }}
      >
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 dark:text-slate-100">Peak Chat Hours</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Average concurrent chats by hour (today)</p>
        </div>
        <SvgBarChart
          data={hourlyLoad}
          xKey="hour"
          yKey="chats"
          color="#0891b2"
          height={200}
          gridColor={gridColor}
          labelColor={labelColor}
        />
      </motion.div>

      {/* ── Top Agents ── */}
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.38, ease: "easeOut" }}
      >
        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-slate-100">Top Agents</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Ranked by conversations resolved this week</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Agent</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Resolved</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Avg. Response</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Satisfaction</th>
            </tr>
          </thead>
          <motion.tbody
            className="divide-y divide-gray-100 dark:divide-slate-700"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {topAgents.map((agent, i) => (
              <motion.tr
                key={`agent-${agent.name}`}
                className="hover:bg-gray-50/60 dark:hover:bg-slate-700/40 transition-colors"
                transition={{ duration: 0.3, delay: 0.42 + i * 0.07, ease: "easeOut" }}
              >
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {agent.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-slate-100">{agent.name}</span>
                  {i === 0 && (
                    <span className="ml-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                      Top
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-slate-100">{agent.resolved}</td>
                <td className="px-6 py-4 text-center text-gray-600 dark:text-slate-400">{agent.avg}</td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 rounded-full text-xs">
                    {agent.sat}
                  </span>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </motion.div>
    </div>
    </React.Fragment>
  );
}

export default AnalyticsView;


