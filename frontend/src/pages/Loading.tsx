import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { useAnalysis } from "../hooks/useAnalysis";
import { clearLastTaskId, getLastTaskId, setLastTaskId } from "../utils/taskResume";
import type { TaskData } from "../types";


const TERMINAL_STATUS = new Set(["succeeded", "failed", "cancelled"]);

const STEP_LABELS: Record<string, string> = {
  queued: "Queued",
  generate_chart: "Generating chart",
  llm_marriage_path: "Analyzing marriage path",
  llm_challenges: "Analyzing challenges",
  llm_partner_character: "Analyzing partner profile",
  persist_result: "Saving result",
  done: "Analysis complete",
};


export default function LoadingPage() {
  const { taskId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { pollTask, retry, cancel } = useAnalysis();

  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canRetry = useMemo(() => taskData?.status === "failed", [taskData?.status]);
  const canCancel = useMemo(
    () => taskData?.status === "queued" || taskData?.status === "running",
    [taskData?.status]
  );

  const reusedTask = Boolean((location.state as { reusedTask?: boolean } | null)?.reusedTask);
  const resumedTask = Boolean((location.state as { resumed?: boolean } | null)?.resumed);

  useEffect(() => {
    if (!taskId) {
      const lastTaskId = getLastTaskId();
      if (lastTaskId) {
        navigate(`/loading/${lastTaskId}`, { replace: true });
        return;
      }
    }

    if (!taskId) {
      setError("Invalid task ID.");
      return;
    }

    setLastTaskId(taskId);

    let active = true;
    let timer: number | null = null;

    const run = async () => {
      try {
        const data = await pollTask(taskId);
        if (!active) {
          return;
        }

        setTaskData(data);
        setError(null);

        if (data.status === "succeeded" && data.result_id) {
          clearLastTaskId();
          navigate(`/result/${data.result_id}`, { replace: true });
          return;
        }

        if (TERMINAL_STATUS.has(data.status)) {
          return;
        }
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Polling failed.");
      }

      timer = window.setTimeout(run, 2000);
    };

    run();

    return () => {
      active = false;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [navigate, pollTask, taskId]);

  const onRetry = async () => {
    if (!taskId) {
      return;
    }
    await retry(taskId);
    setTaskData((prev) =>
      prev ? { ...prev, status: "queued", progress: 0, error: null } : prev
    );
  };

  const onCancel = async () => {
    if (!taskId) {
      return;
    }
    await cancel(taskId);
    setTaskData((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
  };

  const progress = taskData?.progress ?? 0;
  const stepLabel = STEP_LABELS[taskData?.step || "queued"] || taskData?.step || "Preparing";

  return (
    <div className="fade-in">
      <InkCard title="Running Analysis">
        <div className="loading-container">
          <LoadingAnimation size="large" />
          <p className="loading-title">Interpreting stellar trajectories</p>

          <div className="progress-bar" aria-label="Analysis progress">
            <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="loading-percent">{progress}%</p>

          <div className="step-info">
            <span className="step-info__label">Current step:</span>
            {stepLabel}
          </div>

          <p className="task-chip">Task ID: {taskId}</p>

          {reusedTask && <p className="step-info">Matching chart input detected. Reusing an existing analysis task.</p>}
          {resumedTask && <p className="step-info">Automatically resumed your last in-progress analysis.</p>}

          {taskData?.error && <p className="error-text">{taskData.error.message}</p>}
          {error && <p className="error-text">{error}</p>}

          {taskData?.status === "cancelled" && <p className="loading-state-text">Task cancelled</p>}

          <div className="actions-row actions-row--center">
            {canRetry && (
              <InkButton type="button" onClick={onRetry}>
                Retry analysis
              </InkButton>
            )}
            {canCancel && (
              <InkButton type="button" kind="secondary" onClick={onCancel}>
                Cancel task
              </InkButton>
            )}
          </div>
        </div>
      </InkCard>
    </div>
  );
}
