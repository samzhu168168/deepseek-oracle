import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { exportReport, getResultItem } from "../api";
import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import type { AnalysisDetailItem } from "../types";


const ANALYSIS_LABEL: Record<string, string> = {
  marriage_path: "Marriage Path",
  challenges: "Challenges",
  partner_character: "Partner Profile",
};


export default function DetailPage() {
  const { id = "", type = "" } = useParams();
  const [item, setItem] = useState<AnalysisDetailItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analysisType =
    type === "marriage_path" || type === "challenges" || type === "partner_character"
      ? type
      : null;

  useEffect(() => {
    if (!id || !analysisType) {
      return;
    }

    (async () => {
      try {
        const response = await getResultItem(Number(id), analysisType);
        if (!response.data) {
          throw new Error("detail not found");
        }
        setItem(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load details.");
      }
    })();
  }, [analysisType, id]);

  const title = ANALYSIS_LABEL[analysisType || ""] || type;

  const onDownload = async () => {
    if (!id || !analysisType) {
      return;
    }
    const response = await exportReport(Number(id), analysisType);
    const blob = new Blob([response.data], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `analysis_${id}_${analysisType}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <InkCard title="Failed to load details">
        <p className="error-text">{error}</p>
      </InkCard>
    );
  }

  if (!analysisType) {
    return (
      <InkCard title="Failed to load details">
        <p className="error-text">Invalid analysis type.</p>
      </InkCard>
    );
  }

  if (!item) {
    return (
      <div className="loading-container loading-container--page">
        <LoadingAnimation size="large" />
        <p className="loading-state-text">Loading analysis details...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Link to={`/result/${id}`} className="back-link">
        Back to overview
      </Link>

      <InkCard title={title}>
        <div className="meta-grid meta-grid--compact">
          <div className="meta-item">
            <div className="meta-item__label">Analysis time</div>
            <div className="meta-item__value">{item.execution_time.toFixed(1)}s</div>
          </div>
          <div className="meta-item">
            <div className="meta-item__label">Total tokens</div>
            <div className="meta-item__value">{item.token_count.toLocaleString()}</div>
          </div>
          <div className="meta-item">
            <div className="meta-item__label">Input tokens</div>
            <div className="meta-item__value">{item.input_tokens.toLocaleString()}</div>
          </div>
          <div className="meta-item">
            <div className="meta-item__label">Output tokens</div>
            <div className="meta-item__value">{item.output_tokens.toLocaleString()}</div>
          </div>
        </div>

        <hr className="ink-divider" />

        <div className="markdown-body">
          <MarkdownRenderer content={item.content} />
        </div>

        <hr className="ink-divider" />

        <div className="actions-row">
          <InkButton type="button" onClick={onDownload}>
            Download this analysis
          </InkButton>
          <Link to={`/result/${id}`}>
            <InkButton type="button" kind="ghost">
              Back to overview
            </InkButton>
          </Link>
        </div>
      </InkCard>
    </div>
  );
}
