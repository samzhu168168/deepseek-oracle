import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { InkButton } from "../components/InkButton";
import { InkCard } from "../components/InkCard";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { DivinationAssistChat } from "../components/DivinationAssistChat";
import {
  clearZiweiFortuneError,
  getZiweiFortuneSessionState,
  setZiweiFortuneError,
  startZiweiDivinationTask,
  subscribeZiweiFortuneSession,
  updateZiweiFortuneForm,
} from "../stores/ziweiFortuneSession";
import {
  formatBirthPreview,
  formatTrueSolarCorrectionPreview,
  getTrueSolarCityOptions,
  getTrueSolarProvinceOptions,
  toBirthInfo,
  validateBirthForm,
} from "../utils/birthForm";
import type { BirthInfo } from "../types";

export default function ZiweiFortunePage() {
  const [session, setSession] = useState(getZiweiFortuneSessionState());
  const [partnerForm, setPartnerForm] = useState(() => ({
    ...getZiweiFortuneSessionState().form,
    question: "",
    gender: "女" as BirthInfo["gender"],
  }));

  useEffect(() => {
    const unsubscribe = subscribeZiweiFortuneSession((state) => {
      setSession(state);
    });
    return unsubscribe;
  }, []);

  const inputPreview = useMemo(() => {
    return formatBirthPreview(session.form);
  }, [session.form]);
  const partnerPreview = useMemo(() => {
    return formatBirthPreview(partnerForm);
  }, [partnerForm]);
  const provinceOptions = useMemo(() => getTrueSolarProvinceOptions(), []);
  const cityOptions = useMemo(() => getTrueSolarCityOptions(session.form.provinceCode), [session.form.provinceCode]);
  const partnerCityOptions = useMemo(
    () => getTrueSolarCityOptions(partnerForm.provinceCode),
    [partnerForm.provinceCode],
  );
  const trueSolarPreview = useMemo(() => formatTrueSolarCorrectionPreview(session.form), [session.form]);
  const partnerTrueSolarPreview = useMemo(
    () => formatTrueSolarCorrectionPreview(partnerForm),
    [partnerForm],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearZiweiFortuneError();

    const validationError = validateBirthForm(session.form);
    if (validationError) {
      setZiweiFortuneError(validationError);
      return;
    }
    const partnerError = validateBirthForm(partnerForm);
    if (partnerError) {
      setZiweiFortuneError(`Partner info: ${partnerError}`);
      return;
    }

    await startZiweiDivinationTask({
      question: session.form.question.trim() || "Please provide a Zi Wei long-range reading with action guidance.",
      birth_info: toBirthInfo(session.form),
      time_unknown: session.form.timeUnknown,
      partner_birth_info: toBirthInfo(partnerForm),
      partner_time_unknown: partnerForm.timeUnknown,
    });
  };

  return (
    <div className="stack fade-in">
      <InkCard title="Zi Wei Reading" icon="Z">
        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="ziwei-question">Question</label>
            <textarea
              id="ziwei-question"
              className="oracle-chat__textarea"
              value={session.form.question}
              onChange={(event) => updateZiweiFortuneForm({ question: event.target.value })}
              rows={3}
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label className="field__label" htmlFor="ziwei-calendar">Your calendar</label>
              <select
                id="ziwei-calendar"
                value={session.form.calendar}
                onChange={(event) => updateZiweiFortuneForm({ calendar: event.target.value as BirthInfo["calendar"] })}
              >
                <option value="lunar">Lunar (Chinese calendar)</option>
                <option value="solar">Solar (Gregorian)</option>
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-gender">Your gender</label>
              <select
                id="ziwei-gender"
                value={session.form.gender}
                onChange={(event) => updateZiweiFortuneForm({ gender: event.target.value as BirthInfo["gender"] })}
              >
                <option value="男">Male</option>
                <option value="女">Female</option>
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-year">Your birth year</label>
              <input
                id="ziwei-year"
                type="number"
                value={session.form.year}
                onChange={(event) => updateZiweiFortuneForm({ year: event.target.value })}
                min={1900}
                max={2100}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-month">Your birth month</label>
              <input
                id="ziwei-month"
                type="number"
                value={session.form.month}
                onChange={(event) => updateZiweiFortuneForm({ month: event.target.value })}
                min={1}
                max={12}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-day">Your birth day</label>
              <input
                id="ziwei-day"
                type="number"
                value={session.form.day}
                onChange={(event) => updateZiweiFortuneForm({ day: event.target.value })}
                min={1}
                max={session.form.calendar === "lunar" ? 30 : 31}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-hour">Your birth hour (24h)</label>
              <input
                id="ziwei-hour"
                type="number"
                value={session.form.hour}
                onChange={(event) => updateZiweiFortuneForm({ hour: event.target.value })}
                min={0}
                max={23}
                disabled={session.form.timeUnknown}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-minute">Your birth minute</label>
              <input
                id="ziwei-minute"
                type="number"
                value={session.form.minute}
                onChange={(event) => updateZiweiFortuneForm({ minute: event.target.value })}
                min={0}
                max={59}
                disabled={session.form.timeUnknown}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-time-unknown">Time Unknown — I&apos;ll use the Date-Only reading</label>
              <input
                id="ziwei-time-unknown"
                type="checkbox"
                checked={session.form.timeUnknown}
                onChange={(event) => updateZiweiFortuneForm({
                  timeUnknown: event.target.checked,
                  enableTrueSolar: event.target.checked ? false : session.form.enableTrueSolar,
                })}
              />
              {session.form.timeUnknown ? (
                <p className="oracle-chat__tip">
                  We&apos;ll use your elemental profile from birth date only. Some palace-specific readings will be replaced with Five Element compatibility analysis.
                </p>
              ) : null}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-province">Your province</label>
              <select
                id="ziwei-province"
                value={session.form.provinceCode}
                onChange={(event) => {
                  const nextProvinceCode = event.target.value;
                  const nextCities = getTrueSolarCityOptions(nextProvinceCode);
                  updateZiweiFortuneForm({
                    provinceCode: nextProvinceCode,
                    cityCode: nextCities[0]?.code || "",
                  });
                }}
              >
                {provinceOptions.map((item) => (
                  <option key={item.code} value={item.code}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-city">Your city (true solar time)</label>
              <select
                id="ziwei-city"
                value={session.form.cityCode}
                onChange={(event) => updateZiweiFortuneForm({ cityCode: event.target.value })}
              >
                {cityOptions.map((item) => (
                  <option key={item.code} value={item.code}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="ziwei-true-solar">True solar time correction</label>
              <select
                id="ziwei-true-solar"
                value={session.form.enableTrueSolar ? "on" : "off"}
                onChange={(event) => updateZiweiFortuneForm({ enableTrueSolar: event.target.value === "on" })}
                disabled={session.form.timeUnknown}
              >
                <option value="off">Off</option>
                <option value="on">On (longitude + equation of time)</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label className="field__label" htmlFor="partner-calendar">Partner calendar</label>
              <select
                id="partner-calendar"
                value={partnerForm.calendar}
                onChange={(event) => setPartnerForm((prev) => ({ ...prev, calendar: event.target.value as BirthInfo["calendar"] }))}
              >
                <option value="lunar">Lunar (Chinese calendar)</option>
                <option value="solar">Solar (Gregorian)</option>
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-gender">Partner gender</label>
              <select
                id="partner-gender"
                value={partnerForm.gender}
                onChange={(event) => setPartnerForm((prev) => ({ ...prev, gender: event.target.value as BirthInfo["gender"] }))}
              >
                <option value="男">Male</option>
                <option value="女">Female</option>
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-year">Partner birth year</label>
              <input
                id="partner-year"
                type="number"
                value={partnerForm.year}
                onChange={(event) => setPartnerForm((prev) => ({ ...prev, year: event.target.value }))}
                min={1900}
                max={2100}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-month">Partner birth month</label>
              <input
                id="partner-month"
                type="number"
                value={partnerForm.month}
                onChange={(event) => setPartnerForm((prev) => ({ ...prev, month: event.target.value }))}
                min={1}
                max={12}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-day">Partner birth day</label>
              <input
                id="partner-day"
                type="number"
                value={partnerForm.day}
                onChange={(event) => setPartnerForm((prev) => ({ ...prev, day: event.target.value }))}
                min={1}
                max={partnerForm.calendar === "lunar" ? 30 : 31}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-hour">Partner birth hour (24h)</label>
              <input
                id="partner-hour"
                type="number"
                value={partnerForm.hour}
                onChange={(event) => setPartnerForm((prev) => ({ ...prev, hour: event.target.value }))}
                min={0}
                max={23}
                disabled={partnerForm.timeUnknown}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-minute">Partner birth minute</label>
              <input
                id="partner-minute"
                type="number"
                value={partnerForm.minute}
                onChange={(event) => setPartnerForm((prev) => ({ ...prev, minute: event.target.value }))}
                min={0}
                max={59}
                disabled={partnerForm.timeUnknown}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-time-unknown">Time Unknown — I&apos;ll use the Date-Only reading</label>
              <input
                id="partner-time-unknown"
                type="checkbox"
                checked={partnerForm.timeUnknown}
                onChange={(event) => setPartnerForm((prev) => ({
                  ...prev,
                  timeUnknown: event.target.checked,
                  enableTrueSolar: event.target.checked ? false : prev.enableTrueSolar,
                }))}
              />
              {partnerForm.timeUnknown ? (
                <p className="oracle-chat__tip">
                  We&apos;ll use your elemental profile from birth date only. Some palace-specific readings will be replaced with Five Element compatibility analysis.
                </p>
              ) : null}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-province">Partner province</label>
              <select
                id="partner-province"
                value={partnerForm.provinceCode}
                onChange={(event) => {
                  const nextProvinceCode = event.target.value;
                  const nextCities = getTrueSolarCityOptions(nextProvinceCode);
                  setPartnerForm((prev) => ({
                    ...prev,
                    provinceCode: nextProvinceCode,
                    cityCode: nextCities[0]?.code || "",
                  }));
                }}
              >
                {provinceOptions.map((item) => (
                  <option key={item.code} value={item.code}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-city">Partner city (true solar time)</label>
              <select
                id="partner-city"
                value={partnerForm.cityCode}
                onChange={(event) => setPartnerForm((prev) => ({ ...prev, cityCode: event.target.value }))}
              >
                {partnerCityOptions.map((item) => (
                  <option key={item.code} value={item.code}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="partner-true-solar">True solar time correction</label>
              <select
                id="partner-true-solar"
                value={partnerForm.enableTrueSolar ? "on" : "off"}
                onChange={(event) => setPartnerForm((prev) => ({ ...prev, enableTrueSolar: event.target.value === "on" }))}
                disabled={partnerForm.timeUnknown}
              >
                <option value="off">Off</option>
                <option value="on">On (longitude + equation of time)</option>
              </select>
            </div>
          </div>

          <p className="oracle-chat__tip">Your input: {inputPreview}</p>
          <p className="oracle-chat__tip">{trueSolarPreview}</p>
          <p className="oracle-chat__tip">Partner input: {partnerPreview}</p>
          <p className="oracle-chat__tip">{partnerTrueSolarPreview}</p>
          {session.error ? <p className="error-text">{session.error}</p> : null}
          {session.loading ? <p className="oracle-chat__tip">Task in progress. Progress is preserved if you leave and return.</p> : null}

          <div className="actions-row">
            <InkButton type="submit" disabled={session.loading}>
              {session.loading ? "Analyzing..." : "Start Zi Wei Reading"}
            </InkButton>
          </div>
        </form>
      </InkCard>

      {session.result ? (
        <div className="stack fade-in-up">
          <InkCard title="Zi Wei Results" icon="R">
            <div className="meta-grid meta-grid--compact">
              <div className="meta-item">
                <p className="meta-item__label">Generated at</p>
                <p className="meta-item__value">{session.result.generated_at}</p>
              </div>
              <div className="meta-item">
                <p className="meta-item__label">Model</p>
                <p className="meta-item__value">{session.result.provider} / {session.result.model}</p>
              </div>
            </div>
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

          <InkCard title="Chart Summary">
            <pre className="pre-wrap">{session.result.chart_summary}</pre>
          </InkCard>

          <DivinationAssistChat
            mode="ziwei"
            sourceTitle={session.form.question || "Zi Wei Reading"}
            sourceText={`${session.result.reading}\n\nChart summary:\n${session.result.chart_summary}`}
          />
        </div>
      ) : null}
    </div>
  );
}
