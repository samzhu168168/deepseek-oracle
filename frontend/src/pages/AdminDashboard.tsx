import { useEffect, useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";

import { getAdminDashboard, getAdminLogs, getAdminUsers } from "../api";
import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import type { AdminDashboardData, SystemLogItem, UserProfile } from "../types";


interface TrendMetricConfig {
  key: keyof AdminDashboardData["trend"][number];
  label: string;
  color: string;
}

const TREND_METRICS: TrendMetricConfig[] = [
  { key: "analysis_tasks", label: "Analysis Tasks", color: "#b75843" },
  { key: "chat_turns", label: "Chat Turns", color: "#cb8b49" },
  { key: "kline_updates", label: "Life K-Line", color: "#67813f" },
  { key: "calendar_updates", label: "Calendar Updates", color: "#4f8a8c" },
  { key: "ziwei_runs", label: "Zi Wei Readings", color: "#8d73b8" },
  { key: "meihua_runs", label: "Mei Hua Readings", color: "#b9668f" },
];
const RANGE_OPTIONS: Array<{ id: "24h" | "7d" | "30d"; label: string }> = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
];

/**
 * 把数值格式化为千分位字符串，提升大屏可读性。
 */
const fmt = (value: number) => value.toLocaleString("en-US");

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [trendRange, setTrendRange] = useState<"24h" | "7d" | "30d">("24h");

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, logsRes, usersRes] = await Promise.all([
        getAdminDashboard(trendRange),
        getAdminLogs(1, 20),
        getAdminUsers(1, 20),
      ]);

      setDashboard(dashboardRes.data || null);
      setLogs(logsRes.data?.items || []);
      setUsers(usersRes.data?.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, [trendRange]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadAll();
    }, 30_000);
    return () => {
      window.clearInterval(timer);
    };
  }, [trendRange]);

  const trendChartOption = useMemo<EChartsOption | null>(() => {
    if (!dashboard) {
      return null;
    }
    const labels = dashboard.trend.map((point) => point.label);
    const series = TREND_METRICS.map((metric) => ({
      ...(() => {
        const values = dashboard.trend.map((point) => Number(point[metric.key]) || 0);
        const avg = values.reduce((sum, current) => sum + current, 0) / Math.max(values.length, 1);
        const threshold = Math.max(3, Math.ceil(avg * 1.8));
        return {
          markLine: {
            symbol: "none",
            silent: true,
            lineStyle: {
              type: "dashed" as const,
              color: "rgba(157, 43, 29, 0.45)",
              width: 1,
            },
            label: {
              formatter: `${metric.label} threshold`,
              color: "#8b655b",
            },
            data: [{ yAxis: threshold }],
          },
        };
      })(),
      name: metric.label,
      type: "line" as const,
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: metric.color },
      itemStyle: { color: metric.color },
      areaStyle: {
        opacity: 0.12,
        color: metric.color,
      },
      data: dashboard.trend.map((point) => Number(point[metric.key]) || 0),
    }));

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(37, 29, 26, 0.9)",
        borderColor: "rgba(204, 169, 140, 0.45)",
        textStyle: { color: "#f6e9db" },
      },
      legend: {
        top: 4,
        textStyle: { color: "#6f574d", fontSize: 12 },
      },
      grid: {
        left: 12,
        right: 12,
        bottom: 14,
        top: 34,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels,
        axisLabel: { color: "#8a7268", fontSize: 11 },
        axisLine: { lineStyle: { color: "rgba(157, 43, 29, 0.2)" } },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { color: "#8a7268", fontSize: 11 },
        splitLine: { lineStyle: { color: "rgba(157, 43, 29, 0.12)" } },
      },
      series,
    };
  }, [dashboard]);

  const runtimePieOption = useMemo<EChartsOption | null>(() => {
    if (!dashboard) {
      return null;
    }
    const data = [
      { name: "Chat Turns", value: dashboard.runtime_metrics.chat.turns_last_24h, itemStyle: { color: "#cb8b49" } },
      {
        name: "Life K-Line",
        value: dashboard.runtime_metrics.insight.kline_updates_last_24h,
        itemStyle: { color: "#67813f" },
      },
      {
        name: "Calendar Updates",
        value: dashboard.runtime_metrics.insight.calendar_updates_last_24h,
        itemStyle: { color: "#4f8a8c" },
      },
      {
        name: "Zi Wei Readings",
        value: dashboard.runtime_metrics.divination.ziwei_runs_last_24h,
        itemStyle: { color: "#8d73b8" },
      },
      {
        name: "Mei Hua Readings",
        value: dashboard.runtime_metrics.divination.meihua_runs_last_24h,
        itemStyle: { color: "#b9668f" },
      },
    ];

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}<br/>24h: {c} ({d}%)",
        backgroundColor: "rgba(37, 29, 26, 0.9)",
        borderColor: "rgba(204, 169, 140, 0.45)",
        textStyle: { color: "#f6e9db" },
      },
      legend: {
        orient: "vertical",
        right: 8,
        top: "middle",
        textStyle: { color: "#6f574d", fontSize: 12 },
      },
      series: [
        {
          name: "Runtime Share",
          type: "pie",
          radius: ["44%", "70%"],
          center: ["34%", "50%"],
          label: { color: "#6f574d", formatter: "{b}\n{c}" },
          labelLine: { lineStyle: { color: "rgba(157, 43, 29, 0.25)" } },
          data,
        },
      ],
    };
  }, [dashboard]);

  return (
    <div className="admin-page admin-page--screen fade-in">
      <InkCard title="Admin Dashboard" icon="A">
        {loading ? <p className="loading-state-text">Loading admin data...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="actions-row admin-screen__toolbar">
          <span className="admin-screen__realtime">Auto refresh: 30s</span>
          <div className="insights-segmented" role="tablist" aria-label="Trend range">
            {RANGE_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={trendRange === item.id ? "active" : ""}
                onClick={() => setTrendRange(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <InkButton type="button" kind="ghost" onClick={() => void loadAll()} disabled={loading}>
            Refresh dashboard
          </InkButton>
        </div>
      </InkCard>

      {dashboard ? (
        <>
          <InkCard title="Core Metrics" icon="K">
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <p className="admin-kpi-card__label">Tokens Issued (24h)</p>
                <p className="admin-kpi-card__value">{fmt(dashboard.token_metrics.issued_last_24h)}</p>
                <p className="admin-kpi-card__meta">
                  Invalid 401: {fmt(dashboard.token_metrics.invalid_last_24h)} · Logout: {fmt(dashboard.token_metrics.logout_last_24h)}
                </p>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-card__label">Active Users (24h)</p>
                <p className="admin-kpi-card__value">{fmt(dashboard.user_metrics.active_users_last_24h)}</p>
                <p className="admin-kpi-card__meta">
                  Total: {fmt(dashboard.user_metrics.total_users)} · Admins: {fmt(dashboard.user_metrics.admin_users)}
                </p>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-card__label">Tasks Running</p>
                <p className="admin-kpi-card__value">{fmt(dashboard.analysis_metrics.total_tasks)}</p>
                <p className="admin-kpi-card__meta">
                  queued {fmt(dashboard.analysis_metrics.queued_tasks)} · running {fmt(dashboard.analysis_metrics.running_tasks)}
                </p>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-card__label">Total Model Tokens</p>
                <p className="admin-kpi-card__value">{fmt(dashboard.analysis_metrics.total_tokens)}</p>
                <p className="admin-kpi-card__meta">Added in 24h: {fmt(dashboard.analysis_metrics.tokens_last_24h)}</p>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-card__label">Chat Activity</p>
                <p className="admin-kpi-card__value">{fmt(dashboard.runtime_metrics.chat.turns_last_24h)}</p>
                <p className="admin-kpi-card__meta">
                  Total turns: {fmt(dashboard.runtime_metrics.chat.total_turns)} · Conversations: {fmt(dashboard.runtime_metrics.chat.total_conversations)}
                </p>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-card__label">Life K-Line / Calendar (24h)</p>
                <p className="admin-kpi-card__value">
                  {fmt(dashboard.runtime_metrics.insight.kline_updates_last_24h + dashboard.runtime_metrics.insight.calendar_updates_last_24h)}
                </p>
                <p className="admin-kpi-card__meta">
                  K-Line {fmt(dashboard.runtime_metrics.insight.kline_updates_last_24h)} · Calendar {fmt(dashboard.runtime_metrics.insight.calendar_updates_last_24h)}
                </p>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-card__label">Zi Wei Readings (24h)</p>
                <p className="admin-kpi-card__value">{fmt(dashboard.runtime_metrics.divination.ziwei_runs_last_24h)}</p>
                <p className="admin-kpi-card__meta">Total: {fmt(dashboard.runtime_metrics.divination.total_ziwei_runs)}</p>
              </div>
              <div className="admin-kpi-card">
                <p className="admin-kpi-card__label">Mei Hua Readings (24h)</p>
                <p className="admin-kpi-card__value">{fmt(dashboard.runtime_metrics.divination.meihua_runs_last_24h)}</p>
                <p className="admin-kpi-card__meta">Total: {fmt(dashboard.runtime_metrics.divination.total_meihua_runs)}</p>
              </div>
            </div>
          </InkCard>

          <InkCard title="24h Runtime Trends" icon="T">
            <div className="admin-chart-grid">
              <div className="admin-chart-panel admin-chart-panel--wide">
                {trendChartOption ? (
                  <ReactECharts
                    option={trendChartOption}
                    style={{ height: 320, width: "100%" }}
                    notMerge
                    lazyUpdate
                  />
                ) : null}
              </div>
              <div className="admin-chart-panel">
                {runtimePieOption ? (
                  <ReactECharts
                    option={runtimePieOption}
                    style={{ height: 320, width: "100%" }}
                    notMerge
                    lazyUpdate
                  />
                ) : null}
              </div>
            </div>
            {dashboard ? (
              <div className="admin-alert-row">
                {TREND_METRICS.map((metric) => {
                  const values = dashboard.trend.map((point) => Number(point[metric.key]) || 0);
                  const latest = values[values.length - 1] || 0;
                  const avg = values.reduce((sum, current) => sum + current, 0) / Math.max(values.length, 1);
                  const threshold = Math.max(3, Math.ceil(avg * 1.8));
                  const isAlert = latest >= threshold;
                  return (
                    <span key={`alert-${metric.key}`} className={`admin-alert-chip ${isAlert ? "admin-alert-chip--hot" : ""}`}>
                      {metric.label}: current {latest} / threshold {threshold}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </InkCard>
        </>
      ) : null}

      {dashboard ? (
        <InkCard title="System Overview" icon="S">
          <div className="meta-grid">
            <div className="meta-item">
              <p className="meta-item__label">Task success rate</p>
              <p className="meta-item__value">
                {dashboard.analysis_metrics.total_tasks > 0
                  ? `${Math.round((dashboard.analysis_metrics.succeeded_tasks / dashboard.analysis_metrics.total_tasks) * 100)}%`
                  : "0%"}
              </p>
            </div>
            <div className="meta-item">
              <p className="meta-item__label">Failed tasks</p>
              <p className="meta-item__value">{fmt(dashboard.analysis_metrics.failed_tasks)}</p>
            </div>
            <div className="meta-item">
              <p className="meta-item__label">Analysis results (24h)</p>
              <p className="meta-item__value">{fmt(dashboard.analysis_metrics.results_last_24h)}</p>
            </div>
            <div className="meta-item">
              <p className="meta-item__label">Total logs</p>
              <p className="meta-item__value">{fmt(dashboard.log_metrics.total_logs)}</p>
            </div>
            <div className="meta-item">
              <p className="meta-item__label">Error logs (24h)</p>
              <p className="meta-item__value">{fmt(dashboard.log_metrics.error_logs)}</p>
            </div>
            <div className="meta-item">
              <p className="meta-item__label">Logs (24h)</p>
              <p className="meta-item__value">{fmt(dashboard.log_metrics.logs_last_24h)}</p>
            </div>
          </div>
          <div className="admin-top-paths">
            <p className="admin-top-paths__title">Top API paths</p>
            <div className="admin-top-paths__list">
              {(dashboard.log_metrics.top_paths || []).slice(0, 6).map((item) => (
                <div key={`${item.path}-${item.total}`} className="admin-top-paths__item">
                  <span>{item.path || "-"}</span>
                  <strong>{fmt(item.total)}</strong>
                </div>
              ))}
            </div>
          </div>
        </InkCard>
      ) : null}

      <InkCard title="Recent System Logs" icon="L">
        <div className="admin-log-list">
          {logs.length === 0 ? <p className="loading-state-text">No log data yet.</p> : null}
          {logs.map((log) => (
            <div key={log.id} className="admin-log-item">
              <p className="admin-log-item__title">
                [{log.level}] {log.method || "-"} {log.path || "-"} · {log.status_code ?? "-"}
              </p>
              <p className="admin-log-item__meta">
                {log.created_at} · {log.duration_ms ?? "-"}ms · {log.user_email || "anonymous"} · {log.ip || "-"}
              </p>
              <p className="admin-log-item__meta">{log.message || "-"}</p>
            </div>
          ))}
        </div>
      </InkCard>

      <InkCard title="Recent Sign-ins" icon="U">
        <div className="admin-user-list">
          {users.length === 0 ? <p className="loading-state-text">No user data yet.</p> : null}
          {users.map((user) => (
            <div key={user.id} className="admin-user-item">
              <p className="admin-user-item__title">{user.email}</p>
              <p className="admin-user-item__meta">
                role={user.role} · active={String(user.is_active)} · created={user.created_at}
              </p>
              <p className="admin-user-item__meta">last_login={user.last_login_at || "-"}</p>
            </div>
          ))}
        </div>
      </InkCard>
    </div>
  );
}
