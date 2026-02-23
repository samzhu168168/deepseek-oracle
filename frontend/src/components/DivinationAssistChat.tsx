import { FormEvent, useEffect, useMemo, useState } from "react";

import { oracleChat } from "../api";
import type { EnabledSchool, OracleActionItem } from "../types";
import { InkButton } from "./InkButton";
import { InkCard } from "./InkCard";
import { MarkdownRenderer } from "./MarkdownRenderer";

type DivinationMode = "ziwei" | "meihua";

interface AssistTurn {
  id: string;
  query: string;
  answer: string;
  actionItems: OracleActionItem[];
  followUpQuestions: string[];
  createdAt: string;
}

interface DivinationAssistChatProps {
  mode: DivinationMode;
  sourceTitle: string;
  sourceText: string;
}

const STORAGE_PREFIX = "oracle:divination:assist:v1";

function simpleHash(text: string): string {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function buildProfileSummary(mode: DivinationMode, sourceTitle: string, sourceText: string): string {
  const trimmed = sourceText.replace(/\s+/g, " ").trim();
  const clipped = trimmed.length > 2200 ? `${trimmed.slice(0, 2200)}...` : trimmed;
  const modeLabel = mode === "ziwei" ? "Zi Wei Dou Shu" : "Mei Hua";
  return [
    `This is a ${modeLabel} divination interpretation session. Provide ongoing interpretation based on the reading.`,
    "Answer focus: explain the oracle message first, then give actionable suggestions in a gentle, non-absolute tone.",
    `Reading title: ${sourceTitle}`,
    `Reading content: ${clipped || "None"}`,
  ].join("\n");
}

function buildHistorySummary(turns: AssistTurn[]): string {
  const recent = turns.slice(-4);
  return recent
    .map((turn, index) => {
      const answer = turn.answer.replace(/\s+/g, " ").trim();
      const preview = answer.length > 180 ? `${answer.slice(0, 180)}...` : answer;
      return `${index + 1}. User: ${turn.query}\nOracle assistant: ${preview}`;
    })
    .join("\n\n");
}

/**
 * 解签辅助聊天组件：读取当前求签结果，并支持多轮追问。
 */
export function DivinationAssistChat({ mode, sourceTitle, sourceText }: DivinationAssistChatProps) {
  const storageKey = useMemo(() => {
    return `${STORAGE_PREFIX}:${mode}:${simpleHash(`${sourceTitle}\n${sourceText}`)}`;
  }, [mode, sourceText, sourceTitle]);

  const enabledSchools = useMemo<EnabledSchool[]>(() => {
    if (mode === "ziwei") {
      return ["ziwei", "philosophy", "actionizer"];
    }
    return ["meihua", "philosophy", "actionizer"];
  }, [mode]);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<AssistTurn[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setTurns([]);
        return;
      }
      const parsed = JSON.parse(raw) as AssistTurn[];
      if (!Array.isArray(parsed)) {
        setTurns([]);
        return;
      }
      setTurns(parsed);
    } catch {
      setTurns([]);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(turns));
    } catch {
      // 忽略本地存储异常，保持页面功能可用。
    }
  }, [storageKey, turns]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ask = query.trim();
    if (!ask || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await oracleChat({
        user_query: ask,
        selected_school: "east",
        enabled_schools: enabledSchools,
        user_profile_summary: buildProfileSummary(mode, sourceTitle, sourceText),
        conversation_history_summary: buildHistorySummary(turns) || undefined,
      });
      const data = response.data;
      if (!data) {
        throw new Error("Oracle assistant returned empty data. Please try again later.");
      }
      const nextTurn: AssistTurn = {
        id: `assist_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        query: ask,
        answer: data.answer_text || "",
        actionItems: Array.isArray(data.action_items) ? data.action_items : [],
        followUpQuestions: Array.isArray(data.follow_up_questions) ? data.follow_up_questions : [],
        createdAt: new Date().toISOString(),
      };
      setTurns((prev) => [...prev, nextTurn]);
      setQuery("");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to request the oracle assistant. Please try again later.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InkCard title="Oracle Assistant" icon="A">
      <div className="divination-assist">
        <p className="divination-assist__hint">
          The current {mode === "ziwei" ? "Zi Wei" : "Mei Hua"} reading has been loaded. Ask follow-ups about details, pacing, and cautions.
        </p>

        {!turns.length ? (
          <div className="divination-assist__empty">
            <p className="divination-assist__empty-title">No questions yet</p>
            <p className="divination-assist__empty-text">Example: What should I do first next week? What risks align with this advice?</p>
          </div>
        ) : (
          <div className="divination-assist__turns">
            {turns.map((turn) => (
              <article key={turn.id} className="divination-assist__turn">
                <p className="divination-assist__q">You: {turn.query}</p>
                <div className="divination-assist__a markdown-body">
                  <MarkdownRenderer content={turn.answer} />
                </div>
                {turn.actionItems.length ? (
                  <div className="divination-assist__actions">
                    {turn.actionItems.map((item, index) => (
                      <p key={`${turn.id}-${item.task}-${index}`} className="divination-assist__action-item">
                        {index + 1}. {item.task} ({item.when})
                      </p>
                    ))}
                  </div>
                ) : null}
                {turn.followUpQuestions.length ? (
                  <div className="divination-assist__chips">
                    {turn.followUpQuestions.map((question, index) => (
                      <button
                        key={`${turn.id}-${question}-${index}`}
                        type="button"
                        className="oracle-turn__follow-chip"
                        onClick={() => setQuery(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}

        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label className="field__label" htmlFor={`assist-${mode}-query`}>Ask the oracle assistant</label>
            <textarea
              id={`assist-${mode}-query`}
              className="oracle-chat__textarea"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: Based on my situation, what is the safest plan for next week?"
              rows={3}
            />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <div className="actions-row">
            <InkButton type="submit" disabled={loading}>
              {loading ? "Interpreting..." : "Send to Oracle Assistant"}
            </InkButton>
          </div>
        </form>
      </div>
    </InkCard>
  );
}
