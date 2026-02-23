import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  createOracleConversation,
  getOracleConversations,
  getOracleConversationTurns,
} from "../api";
import { OPEN_AUTH_MODAL_EVENT } from "../constants/events";
import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import {
  clearOracleChatSession,
  getOracleChatSessionState,
  hydrateOracleChatSession,
  setOracleChatConversation,
  startOracleChatSession,
  subscribeOracleChatSession,
  type OracleConversationTurn,
  type OracleThinkingItem,
} from "../stores/oracleChatSession";
import type {
  EnabledSchool,
  OracleChatRequest,
  OracleConversationSummary,
  OracleConversationTurnRecord,
} from "../types";
import { getAccessToken, getStoredUser } from "../utils/auth";

const DISCLAIMER_LABELS: Record<"none" | "light" | "strong", string> = {
  none: "Standard Notice",
  light: "Gentle Notice",
  strong: "Strong Notice",
};

const QUICK_PROMPTS = [
  "Are we compatible for a long-term relationship?",
  "What's our biggest communication challenge?",
  "What does 2026 hold for us as a couple?",
];

const ORACLE_QUERY_DRAFT_KEY = "oracle:chat:query_draft";
const ORACLE_AGENT_PREF_KEY = "oracle:chat:enabled_agents";
const AUTO_HISTORY_MAX_TURNS = 4;
const AGENT_OPTIONS: Array<{ id: EnabledSchool; label: string; desc: string }> = [
  { id: "ziwei", label: "Zi Wei Dou Shu", desc: "Long-range trends" },
  { id: "meihua", label: "Mei Hua", desc: "Short-term response" },
  { id: "philosophy", label: "Mindset", desc: "Emotional and action calibration" },
];

const loadEnabledAgents = (): EnabledSchool[] => {
  const fallback: EnabledSchool[] = ["ziwei", "meihua", "philosophy"];
  const raw = window.sessionStorage.getItem(ORACLE_AGENT_PREF_KEY);
  if (!raw) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return fallback;
    }
    const allowed = AGENT_OPTIONS.map((option) => option.id);
    const normalized = parsed
      .map((item) => String(item))
      .filter((item): item is EnabledSchool => allowed.includes(item as EnabledSchool));
    return normalized.length ? normalized : fallback;
  } catch {
    return fallback;
  }
};

const statusLabel = (status: OracleThinkingItem["status"]) => {
  if (status === "running") {
    return "Running";
  }
  if (status === "success") {
    return "Completed";
  }
  return "Failed";
};

const turnStatusLabel = (status: OracleConversationTurn["status"]) => {
  if (status === "running") {
    return "Running";
  }
  if (status === "succeeded") {
    return "Completed";
  }
  return "Failed";
};

const buildAutoHistorySummary = (turns: OracleConversationTurn[]) => {
  const recent = turns.filter((turn) => turn.status === "succeeded").slice(-AUTO_HISTORY_MAX_TURNS);
  if (!recent.length) {
    return "";
  }
  return recent
    .map((turn, index) => {
      const answer = turn.answerText.replace(/\s+/g, " ").trim();
      const answerPreview = answer.length > 200 ? `${answer.slice(0, 200)}...` : answer;
      return `${index + 1}. User: ${turn.query}\nAssistant: ${answerPreview}`;
    })
    .join("\n\n");
};

const formatTurnTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const turnTitle = (query: string) => (query.length > 26 ? `${query.slice(0, 26)}...` : query);
const previewContext = (text: string) => (text.length > 180 ? `${text.slice(0, 180)}...` : text);
const toTimestamp = (value: string) => {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : Date.now();
};
const conversationTitle = (item: OracleConversationSummary) => {
  const title = String(item.title || "").trim();
  if (title) {
    return title;
  }
  const fallback = String(item.last_query || "").trim();
  return fallback ? turnTitle(fallback) : "New Conversation";
};
const mapServerTurn = (turn: OracleConversationTurnRecord): OracleConversationTurn => ({
  id: `turn_${turn.id}`,
  query: turn.user_query,
  contextSummary: turn.context_summary || "",
  createdAt: toTimestamp(turn.created_at),
  status: turn.status === "failed" ? "failed" : "succeeded",
  planSteps: Array.isArray(turn.plan_steps) ? turn.plan_steps : [],
  answerText: turn.answer_text || "",
  actionItems: Array.isArray(turn.action_items) ? turn.action_items : [],
  followUpQuestions: Array.isArray(turn.follow_up_questions) ? turn.follow_up_questions : [],
  safetyDisclaimerLevel: turn.safety_disclaimer_level || "none",
  error: turn.error_message || null,
});

export default function OracleChatPage() {
  const [searchParams] = useSearchParams();
  const isAuthenticated = Boolean(getAccessToken()) && Boolean(getStoredUser());
  const requestedConversationId = useMemo(() => {
    const raw = searchParams.get("conversation_id");
    if (!raw) {
      return null;
    }
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [searchParams]);

  const [chatSession, setChatSession] = useState(getOracleChatSessionState());
  const [conversations, setConversations] = useState<OracleConversationSummary[]>([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    getOracleChatSessionState().conversationId
  );
  const [selectedTurnId, setSelectedTurnId] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState(() => window.sessionStorage.getItem(ORACLE_QUERY_DRAFT_KEY) || "");
  const [guestQuery, setGuestQuery] = useState("");
  const [enabledAgents, setEnabledAgents] = useState<EnabledSchool[]>(() => loadEnabledAgents());
  const [localError, setLocalError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return () => {};
    }
    const unsubscribe = subscribeOracleChatSession((state) => {
      setChatSession(state);
    });
    return unsubscribe;
  }, [isAuthenticated]);

  useEffect(() => {
    setActiveConversationId(chatSession.conversationId);
  }, [chatSession.conversationId]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) {
      return;
    }
    thread.scrollTop = thread.scrollHeight;
  }, [chatSession.turns, chatSession.activeTurnId]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    window.sessionStorage.setItem(ORACLE_QUERY_DRAFT_KEY, userQuery);
  }, [isAuthenticated, userQuery]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    window.sessionStorage.setItem(ORACLE_AGENT_PREF_KEY, JSON.stringify(enabledAgents));
  }, [enabledAgents, isAuthenticated]);

  useEffect(() => {
    if (chatSession.activeTurnId) {
      setSelectedTurnId(chatSession.activeTurnId);
      return;
    }
    if (!chatSession.turns.length) {
      setSelectedTurnId(null);
      return;
    }
    if (!selectedTurnId || !chatSession.turns.some((turn) => turn.id === selectedTurnId)) {
      setSelectedTurnId(chatSession.turns[chatSession.turns.length - 1].id);
    }
  }, [chatSession.activeTurnId, chatSession.turns, selectedTurnId]);

  const selectedTurn = useMemo(
    () => chatSession.turns.find((turn) => turn.id === selectedTurnId) || chatSession.turns[chatSession.turns.length - 1] || null,
    [chatSession.turns, selectedTurnId]
  );

  const loadConversationTurns = async (conversationId: number) => {
    setConversationLoading(true);
    try {
      const response = await getOracleConversationTurns(conversationId);
      const turns = (response.data?.turns || []).map(mapServerTurn);
      hydrateOracleChatSession(conversationId, turns);
      setActiveConversationId(conversationId);
      setLocalError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load conversation. Please try again later.";
      setLocalError(message);
    } finally {
      setConversationLoading(false);
    }
  };

  const reloadConversations = async (preferredConversationId?: number) => {
    try {
      const response = await getOracleConversations(60);
      const list = response.data?.items || [];
      setConversations(list);
      if (!list.length) {
        setActiveConversationId(null);
        clearOracleChatSession();
        return;
      }

      const fallbackId = preferredConversationId || activeConversationId || chatSession.conversationId || list[0].id;
      const matched = list.find((item) => item.id === fallbackId);
      const nextId = matched ? matched.id : list[0].id;
      if (nextId !== activeConversationId || !chatSession.turns.length) {
        await loadConversationTurns(nextId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load conversations. Please try again later.";
      setLocalError(message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    void reloadConversations(requestedConversationId || undefined);
  }, [isAuthenticated, requestedConversationId]);

  useEffect(() => {
    if (!isAuthenticated || !chatSession.conversationId) {
      return;
    }
    if (!conversations.some((item) => item.id === chatSession.conversationId)) {
      void reloadConversations(chatSession.conversationId);
      return;
    }
    setActiveConversationId(chatSession.conversationId);
  }, [chatSession.conversationId, conversations, isAuthenticated]);

  const onGuestSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const draft = guestQuery.trim();
    if (draft) {
      setUserQuery(draft);
      window.sessionStorage.setItem(ORACLE_QUERY_DRAFT_KEY, draft);
    }

    window.dispatchEvent(new Event(OPEN_AUTH_MODAL_EVENT));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const query = userQuery.trim();
    if (!query) {
      setLocalError("Please enter your question first.");
      return;
    }

    if (!enabledAgents.length) {
      setLocalError("Enable at least one agent before sending.");
      return;
    }

    const payload: OracleChatRequest = {
      user_query: query,
      conversation_id: activeConversationId || chatSession.conversationId || undefined,
      conversation_history_summary: buildAutoHistorySummary(chatSession.turns) || undefined,
      selected_school: "east",
      enabled_schools: enabledAgents,
    };

    setUserQuery("");
    await startOracleChatSession(payload);
    if (getOracleChatSessionState().conversationId) {
      void reloadConversations(getOracleChatSessionState().conversationId || undefined);
    }
  };

  const onCreateNewConversation = async () => {
    if (chatSession.loading) {
      return;
    }
    setConversationLoading(true);
    try {
      const created = await createOracleConversation("New Conversation");
      const nextId = created.data?.id;
      if (!nextId) {
        throw new Error("Failed to create conversation");
      }
      setOracleChatConversation(nextId);
      setActiveConversationId(nextId);
      setSelectedTurnId(null);
      setConversations((prev) => {
        const nextItem: OracleConversationSummary = {
          id: nextId,
          title: "New Conversation",
          created_at: created.data?.created_at || new Date().toISOString(),
          updated_at: created.data?.updated_at || new Date().toISOString(),
          turn_count: 0,
          last_query: "",
        };
        return [nextItem, ...prev.filter((item) => item.id !== nextId)];
      });
      setLocalError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create conversation. Please try again later.";
      setLocalError(message);
    } finally {
      setConversationLoading(false);
    }
  };

  const toggleAgent = (agentId: EnabledSchool) => {
    setLocalError(null);
    setEnabledAgents((prev) => {
      if (prev.includes(agentId)) {
        if (prev.length === 1) {
          setLocalError("Keep at least one agent enabled.");
          return prev;
        }
        return prev.filter((item) => item !== agentId);
      }
      return [...prev, agentId];
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="oracle-chat oracle-chat--guest fade-in">
        <InkCard title="Multi-Agent Oracle Desk" icon="Q">
          <section className="oracle-guest">
            <div className="oracle-guest__intro">
              <p className="oracle-guest__desc">
                Input two birth profiles. Our AI engine maps 114 imperial stars across both charts to reveal the hidden architecture of your relationship.
              </p>
            </div>

            <form className="oracle-chat__composer oracle-chat__composer--guest stack" onSubmit={onGuestSubmit}>
              <div className="field oracle-chat__field--guest">
                <label className="field__label" htmlFor="oracle-guest-query">What would you like to ask?</label>
                <textarea
                  id="oracle-guest-query"
                  className="oracle-chat__textarea"
                  placeholder="Enter your question about your relationship, career timing, or 2026 energy forecast..."
                  value={guestQuery}
                  onChange={(event) => setGuestQuery(event.target.value)}
                  rows={5}
                />
              </div>

              {localError ? <p className="error-text">{localError}</p> : null}
              <div className="actions-row actions-row--guest">
                <InkButton type="submit" className="oracle-guest__submit">
                  Analyze
                </InkButton>
              </div>
            </form>

            <div className="oracle-guest__prompt-row" aria-label="Suggested questions">
              {QUICK_PROMPTS.map((prompt, index) => (
                <button
                  key={`${prompt}-${index}`}
                  type="button"
                  className="oracle-turn__follow-chip"
                  onClick={() => setGuestQuery(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>
        </InkCard>
      </div>
    );
  }

  return (
    <div className="oracle-chat oracle-chat--flat fade-in">
      <InkCard title="Multi-Agent Oracle Desk" icon="G">
        <div className="oracle-chat__workspace">
          <aside className="oracle-chat__sidebar" aria-label="Conversation history">
            <div className="oracle-panel__header">
              <h3>Conversation History</h3>
              <span>{conversations.length} total</span>
            </div>

            <div className="oracle-history__list">
              {conversations.length === 0 ? <p className="oracle-history__empty">No conversations yet</p> : null}
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`oracle-history__item ${activeConversationId === conversation.id ? "oracle-history__item--active" : ""}`}
                  onClick={() => {
                    void loadConversationTurns(conversation.id);
                  }}
                  disabled={conversationLoading || chatSession.loading}
                >
                  <p className="oracle-history__title">{conversationTitle(conversation)}</p>
                  <p className="oracle-history__meta">{conversation.turn_count || 0} turns</p>
                </button>
              ))}
            </div>

            <InkButton
              type="button"
              onClick={() => {
                void onCreateNewConversation();
              }}
              disabled={chatSession.loading || conversationLoading}
            >
              Start New Conversation
            </InkButton>
          </aside>

          <section className="oracle-chat__main">
            <div ref={threadRef} className="oracle-chat__thread" aria-live="polite">
              {!chatSession.turns.length ? (
                <div className="oracle-chat__empty">
                  <p className="oracle-chat__empty-title">No conversation records yet</p>
                  <p className="oracle-chat__empty-desc">Ask a question and responses will stream here.</p>
                </div>
              ) : null}

              {chatSession.turns.map((turn) => (
                <article
                  key={turn.id}
                  className={`oracle-turn ${selectedTurn?.id === turn.id ? "oracle-turn--selected" : ""}`}
                  onClick={() => setSelectedTurnId(turn.id)}
                >
                  <div className="oracle-turn__bubble oracle-turn__bubble--user">
                    <p className="oracle-turn__meta">You · {formatTurnTime(turn.createdAt)}</p>
                    <p className="oracle-turn__query">{turn.query}</p>
                  </div>

                  <div className="oracle-turn__bubble oracle-turn__bubble--assistant">
                    <p className="oracle-turn__meta">
                      Oracle · {turn.status === "running" ? "Running plan" : turn.status === "succeeded" ? "Completed" : "Failed"}
                    </p>
                    {turn.contextSummary ? (
                      <p className="oracle-turn__context">Context: {previewContext(turn.contextSummary)}</p>
                    ) : null}

                    {turn.answerText ? (
                      <div className="oracle-turn__answer markdown-body">
                        <MarkdownRenderer content={turn.answerText} />
                      </div>
                    ) : (
                      <p className="oracle-turn__plan-empty">Analyzing; results will return step by step...</p>
                    )}

                    {turn.actionItems.length ? (
                      <div className="oracle-turn__actions">
                        {turn.actionItems.map((item, index) => (
                          <div key={`${turn.id}-${item.task}-${index}`} className="oracle-chat__action-item">
                            <p className="oracle-chat__action-title">{index + 1}. {item.task}</p>
                            <p className="oracle-chat__action-meta">Suggested timing: {item.when}</p>
                            <p className="oracle-chat__action-meta">Reason: {item.reason}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {turn.error ? <p className="error-text">{turn.error}</p> : null}
                  </div>
                </article>
              ))}
            </div>

            <form className="oracle-chat__composer stack" onSubmit={onSubmit}>
              <div className="field">
                <label className="field__label" htmlFor="oracle-query">Follow-up question</label>
                <textarea
                  ref={textareaRef}
                  id="oracle-query"
                  className="oracle-chat__textarea"
                  placeholder="Ask a follow-up, e.g. “Break this week into daily action items.”"
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                  rows={4}
                />
                <div className="oracle-chat__prompt-row" aria-label="Suggested questions">
                  {QUICK_PROMPTS.map((prompt, index) => (
                    <button
                      key={`${prompt}-${index}`}
                      type="button"
                      className="oracle-turn__follow-chip"
                      onClick={() => setUserQuery(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <p className="oracle-chat__agent-toggle-title">Agent configuration (multi-select)</p>
                <div className="oracle-chat__agent-toggle-row" aria-label="Agent configuration">
                  {AGENT_OPTIONS.map((agent) => {
                    const active = enabledAgents.includes(agent.id);
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        className={`oracle-agent-toggle ${active ? "oracle-agent-toggle--active" : ""}`}
                        onClick={() => toggleAgent(agent.id)}
                        aria-pressed={active}
                      >
                        <span className="oracle-agent-toggle__title">{agent.label}</span>
                        <span className="oracle-agent-toggle__desc">{agent.desc}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="oracle-chat__tip">
                  Enabled agents: {enabledAgents.map((item) => AGENT_OPTIONS.find((opt) => opt.id === item)?.label || item).join(", ")}
                </p>
              </div>

              {localError ? <p className="error-text">{localError}</p> : null}
              {!localError && chatSession.error ? <p className="error-text">{chatSession.error}</p> : null}
              {chatSession.loading ? <p className="oracle-chat__tip">Current turn is running. Please wait for the response.</p> : null}

              <div className="actions-row">
                <InkButton type="submit" disabled={chatSession.loading}>
                  {chatSession.loading ? "Running..." : "Analyze"}
                </InkButton>
              </div>
            </form>
          </section>

          <aside className="oracle-chat__inspector" aria-label="Reasoning trace">
            <div className="oracle-panel__header">
              <h3>Reasoning Trace</h3>
              <span>{selectedTurn ? turnStatusLabel(selectedTurn.status) : "Not started"}</span>
            </div>

            {!selectedTurn ? (
              <p className="oracle-history__empty">Select a turn to view the plan steps</p>
            ) : (
              <div className="oracle-inspector__content">
                <p className="oracle-inspector__meta">Time: {formatTurnTime(selectedTurn.createdAt)}</p>
                <p className="oracle-inspector__meta">Safety: {DISCLAIMER_LABELS[selectedTurn.safetyDisclaimerLevel]}</p>

                <div className="oracle-turn__plan">
                  <p className="oracle-turn__section-title">Tool Execution Plan</p>
                  {selectedTurn.planSteps.length ? (
                    <div className="oracle-turn__plan-list">
                      {selectedTurn.planSteps.map((step, index) => (
                        <div key={`${selectedTurn.id}-${step.tool_name}-${index}`} className="oracle-turn__plan-item">
                          <span>{step.display_name}</span>
                          <span className={`oracle-turn__status oracle-turn__status--${step.status}`}>
                            {statusLabel(step.status)}
                            {typeof step.elapsed_ms === "number" ? ` · ${step.elapsed_ms}ms` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="oracle-turn__plan-empty">No tool steps for this turn.</p>
                  )}
                </div>

                {selectedTurn.followUpQuestions.length ? (
                  <div className="oracle-turn__follow-grid">
                    {selectedTurn.followUpQuestions.map((question, index) => (
                      <button
                        key={`${selectedTurn.id}-${question}-${index}`}
                        type="button"
                        className="oracle-turn__follow-chip"
                        onClick={() => {
                          setUserQuery(question);
                          textareaRef.current?.focus();
                        }}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </aside>
        </div>
      </InkCard>
    </div>
  );
}
