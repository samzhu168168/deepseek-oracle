import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getDivinationHistoryDetail } from "../api";
import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import { LoadingAnimation } from "../components/LoadingAnimation";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { DivinationAssistChat } from "../components/DivinationAssistChat";
import type { DivinationHistoryDetail, MeihuaDivinationResponse, ZiweiDivinationResponse } from "../types";

export default function DivinationRecordPage() {
  const { id = "" } = useParams();
  const [detail, setDetail] = useState<DivinationHistoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    (async () => {
      try {
        const response = await getDivinationHistoryDetail(Number(id));
        if (!response.data) {
          throw new Error("divination record not found");
        }
        setDetail(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load divination record.");
      }
    })();
  }, [id]);

  const ziweiResult = useMemo(() => {
    if (!detail || detail.type !== "ziwei") {
      return null;
    }
    return detail.result as unknown as ZiweiDivinationResponse;
  }, [detail]);

  const meihuaResult = useMemo(() => {
    if (!detail || detail.type !== "meihua") {
      return null;
    }
    return detail.result as unknown as MeihuaDivinationResponse;
  }, [detail]);

  if (error) {
    return (
      <InkCard title="Failed to load divination record">
        <p className="error-text">{error}</p>
      </InkCard>
    );
  }

  if (!detail) {
    return (
      <div className="loading-container loading-container--page">
        <LoadingAnimation size="large" />
        <p className="loading-state-text">Loading divination record...</p>
      </div>
    );
  }

  return (
    <div className="stack fade-in">
      <InkCard title={detail.type === "ziwei" ? "Zi Wei Record" : "Mei Hua Record"}>
        <div className="meta-grid meta-grid--compact">
          <div className="meta-item">
            <p className="meta-item__label">Saved at</p>
            <p className="meta-item__value">{detail.created_at}</p>
          </div>
          <div className="meta-item">
            <p className="meta-item__label">Model</p>
            <p className="meta-item__value">{detail.provider} / {detail.model}</p>
          </div>
          <div className="meta-item">
            <p className="meta-item__label">Question</p>
            <p className="meta-item__value">{detail.question_text}</p>
          </div>
        </div>
        <div className="actions-row">
          <Link to="/history">
            <InkButton type="button" kind="ghost">Back to history</InkButton>
          </Link>
        </div>
      </InkCard>

      {detail.type === "ziwei" && ziweiResult ? (
        <>
          <InkCard title="Zi Wei Reading">
            <div className="markdown-body">
              <MarkdownRenderer content={ziweiResult.reading || ""} />
            </div>
          </InkCard>
          <InkCard title="Chart Summary">
            <pre className="pre-wrap">{ziweiResult.chart_summary || ""}</pre>
          </InkCard>
          <DivinationAssistChat
            mode="ziwei"
            sourceTitle={detail.question_text || "Zi Wei Record"}
            sourceText={`${ziweiResult.reading || ""}\n\nChart summary:\n${ziweiResult.chart_summary || ""}`}
          />
        </>
      ) : null}

      {detail.type === "meihua" && meihuaResult ? (
        <>
          <InkCard title="Casting Details">
            <div className="meta-grid">
              <div className="meta-item">
                <p className="meta-item__label">Base hexagram</p>
                <p className="meta-item__value">{meihuaResult.gua?.base_gua || "-"}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Changed hexagram</p>
                <p className="meta-item__value">{meihuaResult.gua?.changed_gua || "-"}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Mutual hexagram</p>
                <p className="meta-item__value">{meihuaResult.gua?.mutual_gua || "-"}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Moving line</p>
                <p className="meta-item__value">{meihuaResult.gua?.moving_line_name || "-"}</p>
              </div>
            </div>
          </InkCard>
          <InkCard title="Mei Hua Reading">
            <div className="markdown-body">
              <MarkdownRenderer content={meihuaResult.reading || ""} />
            </div>
          </InkCard>
          <DivinationAssistChat
            mode="meihua"
            sourceTitle={detail.question_text || "Mei Hua Record"}
            sourceText={`${meihuaResult.reading || ""}\n\nCasting details: ${JSON.stringify(meihuaResult.gua || {}, null, 2)}`}
          />
        </>
      ) : null}
    </div>
  );
}
