import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getDivinationHistory, getHistory, getOracleConversations } from "../api";
import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import { LoadingAnimation } from "../components/LoadingAnimation";
import type { DivinationHistoryData, HistoryResponseData, OracleConversationSummary } from "../types";


const CALENDAR_LABEL: Record<string, string> = {
  solar: "Solar",
  lunar: "Lunar",
};


export default function HistoryPage() {
  const [bucket, setBucket] = useState<"analysis" | "divination">("analysis");
  const [page, setPage] = useState(1);
  const [analysisData, setAnalysisData] = useState<HistoryResponseData | null>(null);
  const [conversationData, setConversationData] = useState<OracleConversationSummary[] | null>(null);
  const [divinationData, setDivinationData] = useState<DivinationHistoryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (bucket === "analysis") {
          const [historyResponse, conversationResponse] = await Promise.all([
            getHistory(page, 20),
            getOracleConversations(60),
          ]);
          if (!historyResponse.data) {
            throw new Error("history is empty");
          }
          setAnalysisData(historyResponse.data);
          setConversationData(conversationResponse.data?.items || []);
          return;
        }
        const response = await getDivinationHistory(page, 20, "all");
        if (!response.data) {
          throw new Error("divination history is empty");
        }
        setDivinationData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history.");
      }
    })();
  }, [bucket, page]);

  useEffect(() => {
    setPage(1);
    setError(null);
  }, [bucket]);

  if (error) {
    return (
      <InkCard title="History">
        <p className="error-text">{error}</p>
      </InkCard>
    );
  }

  return (
    <div className="history-page fade-in">
      <InkCard title="History">
        <div className="insights-segmented" role="tablist" aria-label="History buckets">
          <button
            type="button"
            className={bucket === "analysis" ? "active" : ""}
            onClick={() => setBucket("analysis")}
          >
            Analysis records
          </button>
          <button
            type="button"
            className={bucket === "divination" ? "active" : ""}
            onClick={() => setBucket("divination")}
          >
            Divination archive
          </button>
        </div>

        {(bucket === "analysis" && (!analysisData || !conversationData)) || (bucket === "divination" && !divinationData) ? (
          <div className="loading-container">
            <LoadingAnimation size="large" />
            <p className="loading-state-text">Loading...</p>
          </div>
        ) : bucket === "analysis" && analysisData && conversationData && analysisData.items.length === 0 && conversationData.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">No history yet</p>
            <p className="empty-state__text">Complete an analysis or consultation to see history here.</p>
            <Link to="/" className="empty-state__action">
              <InkButton type="button">Start your first analysis</InkButton>
            </Link>
          </div>
        ) : bucket === "divination" && divinationData && divinationData.items.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">No divination records yet</p>
            <p className="empty-state__text">After a Mei Hua or Zi Wei reading, it will appear here for review.</p>
            <div className="actions-row">
              <Link to="/ziwei" className="empty-state__action">
                <InkButton type="button">Go to Zi Wei reading</InkButton>
              </Link>
              <Link to="/meihua" className="empty-state__action">
                <InkButton type="button" kind="ghost">Go to Mei Hua reading</InkButton>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="history-list">
              {bucket === "analysis" && analysisData
                ? analysisData.items.map((item) => (
                    <article key={`analysis-${item.id}`} className="history-item">
                      <div className="history-item__info">
                        <div className="history-item__date">{item.date}</div>
                        <div className="history-item__tags">
                          <span className="tag tag--primary">{item.gender === "男" ? "Male" : item.gender === "女" ? "Female" : item.gender}</span>
                          <span className="tag">{CALENDAR_LABEL[item.calendar] || item.calendar}</span>
                        </div>
                        <div className="history-item__meta">
                          Hour {item.timezone} · {item.provider} / {item.model} · {item.created_at}
                        </div>
                      </div>
                      <div className="history-item__action">
                        <Link to={`/result/${item.id}`}>
                          <InkButton type="button" kind="ghost">
                            View result
                          </InkButton>
                        </Link>
                      </div>
                    </article>
                  ))
                : null}
              {bucket === "analysis" && conversationData
                ? conversationData.map((conversation) => (
                    <article key={`conversation-${conversation.id}`} className="history-item">
                      <div className="history-item__info">
                        <div className="history-item__date">{conversation.title || "Oracle chat"}</div>
                        <div className="history-item__tags">
                          <span className="tag tag--primary">Oracle chat</span>
                          <span className="tag">{conversation.turn_count || 0} turns</span>
                        </div>
                        <div className="history-item__meta">
                          Updated {conversation.updated_at} · Latest question {conversation.last_query || "None"}
                        </div>
                      </div>
                      <div className="history-item__action">
                        <Link to={`/oracle-chat?conversation_id=${conversation.id}`}>
                          <InkButton type="button" kind="ghost">
                            Continue chat
                          </InkButton>
                        </Link>
                      </div>
                    </article>
                  ))
                : null}

              {bucket === "divination" && divinationData
                ? divinationData.items.map((item) => (
                    <article key={`divination-${item.id}`} className="history-item">
                      <div className="history-item__info">
                        <div className="history-item__date">{item.title}</div>
                        <div className="history-item__tags">
                          <span className="tag tag--primary">{item.type === "ziwei" ? "Zi Wei Dou Shu" : "Mei Hua Yi"}</span>
                          {item.occurred_at ? <span className="tag">{item.occurred_at}</span> : null}
                        </div>
                        <div className="history-item__meta">
                          {item.provider} / {item.model} · {item.created_at}
                        </div>
                      </div>
                      <div className="history-item__action">
                        <Link to={`/history/divination/${item.id}`}>
                          <InkButton type="button" kind="ghost">
                            View reading
                          </InkButton>
                        </Link>
                      </div>
                    </article>
                  ))
                : null}
            </div>

            <div className="pagination">
              <InkButton
                type="button"
                kind="secondary"
                disabled={page <= 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </InkButton>
              <span className="pagination__info">
                {bucket === "analysis" && analysisData
                  ? `Page ${analysisData.pagination.page} · ${analysisData.pagination.total} analyses`
                  : null}
                {bucket === "analysis" && conversationData
                  ? ` · ${conversationData.length} chats`
                  : null}
                {bucket === "divination" && divinationData
                  ? `Page ${divinationData.pagination.page} · ${divinationData.pagination.total} total`
                  : null}
              </span>
              <InkButton
                type="button"
                kind="secondary"
                disabled={
                  bucket === "analysis"
                    ? !(analysisData?.pagination.has_next)
                    : !(divinationData?.pagination.has_next)
                }
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </InkButton>
            </div>
          </>
        )}
      </InkCard>
    </div>
  );
}
