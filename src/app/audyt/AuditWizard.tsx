"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BUDGET_LABELS, CATALOG, DECIDER_LABELS, getArea, INDUSTRIES, SIZES, WHEN_LABELS } from "@/lib/catalog";
import type { AreaAnswers, AreaId, AuditInput } from "@/lib/types";

const empty = (): AuditInput => ({
  company: "",
  industry: "",
  size: "",
  hourlyRate: 60,
  areas: [],
  answers: {},
  when: "",
  budget: "",
  decider: "",
  contact: { name: "", email: "", phone: "", consent: false },
});

const emptyAnswers = (): AreaAnswers => ({ hoursPerWeek: 8, tasks: [], pain: "", followUpQuestion: "", followUpAnswer: "" });

type Step = "firma" | "obszary" | `area:${AreaId}` | "plany" | "kontakt";

export function AuditWizard() {
  const router = useRouter();
  const [s, setS] = useState<AuditInput>(empty);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Obszary, w których AI już zdecydowało o pytaniu doprecyzowującym.
  const [asked, setAsked] = useState<Partial<Record<AreaId, boolean>>>({});

  const steps: Step[] = ["firma", "obszary", ...s.areas.map((a) => `area:${a}` as const), "plany", "kontakt"];
  const key = steps[Math.min(step, steps.length - 1)];
  const last = step === steps.length - 1;
  const pct = Math.round((step / steps.length) * 100);

  const set = (patch: Partial<AuditInput>) => setS((p) => ({ ...p, ...patch }));
  const setAnswers = (area: AreaId, patch: Partial<AreaAnswers>) =>
    setS((p) => ({ ...p, answers: { ...p.answers, [area]: { ...(p.answers[area] ?? emptyAnswers()), ...patch } } }));

  function check(): string {
    if (key === "firma" && (!s.company.trim() || !s.industry)) return "Podaj nazwę firmy i branżę.";
    if (key === "obszary" && (s.areas.length < 1 || s.areas.length > 4)) return "Zaznacz od 1 do 4 obszarów.";
    if (key.startsWith("area:") && !s.answers[key.slice(5) as AreaId]?.tasks.length)
      return "Zaznacz przynajmniej jedno zadanie, które robicie ręcznie.";
    if (key === "kontakt" && (!s.contact.name.trim() || !/^\S+@\S+\.\S+$/.test(s.contact.email)))
      return "Podaj imię i poprawny adres e-mail.";
    if (key === "kontakt" && !s.contact.consent) return "Zaznacz zgodę na kontakt, żebyśmy mogli wysłać raport.";
    return "";
  }

  async function next(e: React.FormEvent) {
    e.preventDefault();
    const msg = check();
    setError(msg);
    if (msg) return;

    if (key.startsWith("area:")) {
      const area = key.slice(5) as AreaId;
      const a = s.answers[area]!;
      if (!asked[area]) {
        setBusy(true);
        try {
          const res = await fetch("/api/followup", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ area, pain: a.pain, tasks: a.tasks.map((t) => getArea(area).tasks.find((x) => x.id === t)?.label ?? t) }),
          });
          const data = res.ok ? ((await res.json()) as { needed: boolean; question: string }) : { needed: false, question: "" };
          setAsked((p) => ({ ...p, [area]: true }));
          if (data.needed) {
            setAnswers(area, { followUpQuestion: data.question });
            return;
          }
        } finally {
          setBusy(false);
        }
      }
    }

    if (last) return submit();
    setStep(step + 1);
    window.scrollTo(0, 0);
  }

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...s, answers: Object.fromEntries(s.areas.map((a) => [a, s.answers[a]])) }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error ?? "Nie udało się zapisać audytu. Spróbuj ponownie.");
        return;
      }
      router.push(`/raport/${data.id}`);
    } catch {
      setError("Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.");
    } finally {
      setBusy(false);
    }
  }

  function back() {
    setError("");
    if (step === 0) router.push("/");
    else setStep(step - 1);
  }

  return (
    <div className="wrap stack-lg">
      <div className="stack" style={{ gap: 8 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="stepmeta">Krok {step + 1} z {steps.length}</span>
          <span className="stepmeta">{pct}%</span>
        </div>
        <div className="progress"><i style={{ width: `${pct}%` }} /></div>
      </div>
      <form className="card stack" onSubmit={next}>
        {key === "firma" && (
          <>
            <h2>Twoja firma</h2>
            <div className="grid2">
              <label className="f">Nazwa firmy
                <input id="company" type="text" value={s.company} placeholder="np. Kowalski i Wspólnicy" onChange={(e) => set({ company: e.target.value })} />
              </label>
              <label className="f">Branża
                <select id="industry" value={s.industry} onChange={(e) => set({ industry: e.target.value })}>
                  <option value="">Wybierz…</option>
                  {INDUSTRIES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className="f">Liczba pracowników
                <select id="size" value={s.size} onChange={(e) => set({ size: e.target.value })}>
                  <option value="">Wybierz…</option>
                  {SIZES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
              <label className="f">Średni koszt godziny pracy (zł)
                <input id="rate" type="number" min={20} max={1000} value={s.hourlyRate} onChange={(e) => set({ hourlyRate: Math.max(20, Number(e.target.value) || 60) })} />
                <span className="hint">Szacunek z pensją i narzutami. Służy tylko do policzenia oszczędności.</span>
              </label>
            </div>
          </>
        )}

        {key === "obszary" && (
          <>
            <h2>Które obszary zabierają najwięcej czasu?</h2>
            <p className="hint">Zaznacz od 1 do 4. Zapytamy tylko o wybrane.</p>
            <div className="tiles">
              {CATALOG.map((a) => (
                <label className="tile" key={a.id}>
                  <input
                    type="checkbox"
                    checked={s.areas.includes(a.id)}
                    onChange={(e) => {
                      const areas = e.target.checked ? [...s.areas, a.id] : s.areas.filter((x) => x !== a.id);
                      setS((p) => ({ ...p, areas, answers: { ...p.answers, [a.id]: p.answers[a.id] ?? emptyAnswers() } }));
                    }}
                  />
                  <span><b>{a.name}</b><small>{a.desc}</small></span>
                </label>
              ))}
            </div>
          </>
        )}

        {key.startsWith("area:") && <AreaStep area={key.slice(5) as AreaId} answers={s.answers[key.slice(5) as AreaId] ?? emptyAnswers()} onChange={(p) => setAnswers(key.slice(5) as AreaId, p)} />}

        {key === "plany" && (
          <>
            <h2>Plany i decyzje</h2>
            <p className="hint">Dzięki temu dopasujemy rekomendacje do Twojego tempa i możliwości.</p>
            <div className="grid2">
              <label className="f">Kiedy chcesz wprowadzić zmiany?
                <select id="when" value={s.when} onChange={(e) => set({ when: e.target.value as AuditInput["when"] })}>
                  <option value="">Wybierz…</option>
                  {Object.entries(WHEN_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              <label className="f">Orientacyjny budżet
                <select id="budget" value={s.budget} onChange={(e) => set({ budget: e.target.value as AuditInput["budget"] })}>
                  <option value="">Wybierz…</option>
                  {Object.entries(BUDGET_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              <label className="f">Kto podejmuje decyzję?
                <select id="decider" value={s.decider} onChange={(e) => set({ decider: e.target.value as AuditInput["decider"] })}>
                  <option value="">Wybierz…</option>
                  {Object.entries(DECIDER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            </div>
          </>
        )}

        {key === "kontakt" && (
          <>
            <h2>Gdzie wysłać raport?</h2>
            <div className="grid2">
              <label className="f">Imię i nazwisko
                <input id="name" type="text" value={s.contact.name} onChange={(e) => set({ contact: { ...s.contact, name: e.target.value } })} />
              </label>
              <label className="f">E-mail służbowy
                <input id="email" type="email" value={s.contact.email} onChange={(e) => set({ contact: { ...s.contact, email: e.target.value } })} />
              </label>
              <label className="f">Telefon (opcjonalnie)
                <input id="phone" type="tel" value={s.contact.phone} onChange={(e) => set({ contact: { ...s.contact, phone: e.target.value } })} />
              </label>
            </div>
            <label className="tile">
              <input id="consent" type="checkbox" checked={s.contact.consent} onChange={(e) => set({ contact: { ...s.contact, consent: e.target.checked } })} />
              <span>Zgadzam się na kontakt w sprawie wyników audytu.<small>Dane przetwarzamy zgodnie z polityką prywatności.</small></span>
            </label>
          </>
        )}

        {error && <p className="note" role="alert">{error}</p>}
        <div className="row" style={{ justifyContent: "space-between" }}>
          <button type="button" className="btn link" onClick={back}>{step ? "Wstecz" : "Strona główna"}</button>
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Chwileczkę…" : last ? "Pokaż mój raport" : "Dalej"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AreaStep({ area, answers, onChange }: { area: AreaId; answers: AreaAnswers; onChange: (p: Partial<AreaAnswers>) => void }) {
  const A = getArea(area);
  return (
    <>
      <span className="eyebrow">{A.name}</span>
      <h2>Jak to dziś wygląda?</h2>
      <label className="f">Ile godzin tygodniowo cały zespół spędza na tym obszarze?
        <div className="range">
          <input id={`hours-${area}`} type="range" min={1} max={80} value={answers.hoursPerWeek} onChange={(e) => onChange({ hoursPerWeek: Number(e.target.value) })} />
          <output>{answers.hoursPerWeek} h/tydz.</output>
        </div>
      </label>
      <div className="stack">
        <b>Które z tych zadań robicie dziś ręcznie?</b>
        <div className="tiles">
          {A.tasks.map((t) => (
            <label className="tile" key={t.id}>
              <input
                type="checkbox"
                checked={answers.tasks.includes(t.id)}
                onChange={(e) => onChange({ tasks: e.target.checked ? [...answers.tasks, t.id] : answers.tasks.filter((x) => x !== t.id) })}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </div>
      <label className="f">Co w tym obszarze najbardziej przeszkadza?
        <textarea id={`pain-${area}`} value={answers.pain} placeholder="Opisz własnymi słowami, np. czego się nie lubi robić albo gdzie są błędy" onChange={(e) => onChange({ pain: e.target.value })} />
      </label>
      {answers.followUpQuestion && (
        <div className="ai">
          <div className="badge">AI</div>
          <div className="body">
            <p><b>Dopytam o szczegół, żeby lepiej policzyć oszczędność:</b> {answers.followUpQuestion}</p>
            <input id={`follow-${area}`} type="text" value={answers.followUpAnswer} placeholder="Twoja odpowiedź" onChange={(e) => onChange({ followUpAnswer: e.target.value })} />
          </div>
        </div>
      )}
    </>
  );
}
