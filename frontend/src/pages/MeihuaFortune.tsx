import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { DivinationAssistChat } from "../components/DivinationAssistChat";
import {
  clearMeihuaFortuneError,
  getMeihuaFortuneSessionState,
  setMeihuaFortuneError,
  startMeihuaDivinationTask,
  subscribeMeihuaFortuneSession,
  updateMeihuaFortuneForm,
} from "../stores/meihuaFortuneSession";

export default function MeihuaFortunePage() {
  const [session, setSession] = useState(getMeihuaFortuneSessionState());

  useEffect(() => {
    const unsubscribe = subscribeMeihuaFortuneSession((state) => {
      setSession(state);
    });
    return unsubscribe;
  }, []);

  const quickTopics = useMemo(
    () => [
      "Is this week good for a critical conversation?",
      "Should I be conservative or proactive about a job change?",
      "How should we handle our relationship in the short term?",
    ],
    []
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMeihuaFortuneError();
    if (!session.form.topic.trim()) {
      setMeihuaFortuneError("Please enter your prompt first.");
      return;
    }

    await startMeihuaDivinationTask({
      topic: session.form.topic.trim(),
    });
  };

  return (
    <div className="meihua-page stack fade-in">
      <InkCard title="Mei Hua Reading" icon="M">
        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="meihua-topic">Prompt</label>
            <textarea
              id="meihua-topic"
              className="oracle-chat__textarea"
              value={session.form.topic}
              onChange={(event) => updateMeihuaFortuneForm({ topic: event.target.value })}
              placeholder="Example: Is this week right for a key decision?"
              rows={3}
            />
            <div className="oracle-chat__prompt-grid" aria-label="Suggested prompts">
              {quickTopics.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  className="oracle-chat__prompt-chip"
                  onClick={() => updateMeihuaFortuneForm({ topic: item })}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <p className="field__hint">
            Casting note: the system uses the current time when you click “Start Mei Hua Reading.”
          </p>

          {session.error ? <p className="error-text">{session.error}</p> : null}
          {session.loading ? <p className="oracle-chat__tip">Task in progress. Progress is preserved if you leave and return.</p> : null}
          <div className="actions-row">
            <InkButton type="submit" disabled={session.loading}>
              {session.loading ? "Analyzing..." : "Start Mei Hua Reading"}
            </InkButton>
          </div>
        </form>
      </InkCard>

      {session.result ? (
        <div className="stack fade-in-up">
          <InkCard title="Casting Details" icon="G">
            <div className="meta-grid">
              <div className="meta-item">
                <p className="meta-item__label">Base hexagram</p>
                <p className="meta-item__value">{session.result.gua.base_gua}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Changed hexagram</p>
                <p className="meta-item__value">{session.result.gua.changed_gua}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Mutual hexagram</p>
                <p className="meta-item__value">{session.result.gua.mutual_gua || "-"}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Moving line</p>
                <p className="meta-item__value">{session.result.gua.moving_line_name}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Body / Use</p>
                <p className="meta-item__value">{session.result.gua.ti_gua || "-"} / {session.result.gua.yong_gua || "-"}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Body/Use relation</p>
                <p className="meta-item__value">{session.result.gua.relation || "-"}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Symbol</p>
                <p className="meta-item__value">{session.result.gua.symbol}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Yin/Yang lines (base)</p>
                <p className="meta-item__value">{session.result.gua.base_line_pattern}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Yin/Yang lines (changed)</p>
                <p className="meta-item__value">{session.result.gua.changed_line_pattern}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">seed</p>
                <p className="meta-item__value">{session.result.gua.seed}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Model</p>
                <p className="meta-item__value">{session.result.provider} / {session.result.model}</p>
              </div>
            </div>
          </InkCard>

          <InkCard title="Mei Hua Results" icon="R">
            <div className="markdown-body">
              <MarkdownRenderer content={session.result.reading} />
            </div>
            <div className="actions-row">
              {session.result.record_id ? (
                <Link to={`/history/divination/${session.result.record_id}`}>
                  <InkButton type="button" kind="ghost">View saved record</InkButton>
                </Link>
              ) : (
                <InkButton type="button" kind="ghost" disabled>Saving record</InkButton>
              )}
              <Link to="/history">
                <InkButton type="button" kind="secondary">Open history archive</InkButton>
              </Link>
            </div>
          </InkCard>

          <DivinationAssistChat
            mode="meihua"
            sourceTitle={session.form.topic || "Mei Hua Reading"}
            sourceText={`${session.result.reading}\n\nCasting details: ${JSON.stringify(session.result.gua, null, 2)}`}
          />
        </div>
      ) : null}
    </div>
  );
}
