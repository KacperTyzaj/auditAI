import Link from "next/link";
import { notFound } from "next/navigation";
import { BUDGET_LABELS, DECIDER_LABELS, EFFORT_LABELS, getArea, WHEN_LABELS } from "@/lib/catalog";
import { hrs, SCORE_LABELS, zl, zlRange } from "@/lib/format";
import { getAudit } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Brief leada | AuditAI", robots: { index: false } };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();
  const { input: st, result: R, texts } = audit;

  return (
    <div className="wrap stack-lg">
      <Link href="/panel" className="hint">← Wszystkie leady</Link>
      <section className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2>{st.company}</h2>
          <span className={`pill ${R.score}`}>{SCORE_LABELS[R.score]} lead</span>
        </div>
        <dl>
          <dt>Kontakt</dt><dd>{st.contact.name}<br />{st.contact.email}{st.contact.phone && <><br />{st.contact.phone}</>}</dd>
          <dt>Firma</dt><dd>{st.industry}, {st.size} os.</dd>
          <dt>Termin</dt><dd>{st.when ? WHEN_LABELS[st.when] : "brak odpowiedzi"}</dd>
          <dt>Budżet</dt><dd>{st.budget ? BUDGET_LABELS[st.budget] : "brak odpowiedzi"}</dd>
          <dt>Decyzja</dt><dd>{st.decider ? DECIDER_LABELS[st.decider] : "brak odpowiedzi"}</dd>
          <dt>Oszczędność</dt><dd>{hrs(R.hoursPerMonth)} i {zl(R.moneyPerMonth)} / mies.</dd>
          <dt>Konsultacja</dt><dd>{audit.bookedConsultation ? "kliknął „Umów konsultację”" : "jeszcze nie"}</dd>
        </dl>
        <div className="stack" style={{ gap: 8 }}>
          <h3>Szkic oferty</h3>
          <p className="hint">Szacowana wartość projektu: <b style={{ color: "var(--ink)" }}>{zlRange(R.projectValue[0], R.projectValue[1])}</b></p>
          {R.top.map((x) => (
            <div className="row" key={x.area + x.taskId} style={{ justifyContent: "space-between", gap: 8 }}>
              <span style={{ minWidth: 0, flex: 1 }}>{x.label}</span>
              <span className={`pill ${EFFORT_LABELS[x.effort].tone}`}>{EFFORT_LABELS[x.effort].duration}</span>
            </div>
          ))}
        </div>
        <div className="ai">
          <div className="badge">AI</div>
          <div className="body"><b>Jak zacząć rozmowę</b><p>{texts.salesOpener}</p></div>
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <h3>Słowami klienta</h3>
          {st.areas.map((a) => {
            const ans = st.answers[a];
            if (!ans || (!ans.pain && !ans.followUpAnswer)) return null;
            return (
              <div key={a} className="stack" style={{ gap: 4 }}>
                <span className="hint">{getArea(a).name} · {ans.hoursPerWeek} h/tydz.</span>
                {ans.pain && <p className="quote">{ans.pain}</p>}
                {ans.followUpAnswer && <p className="quote">{ans.followUpQuestion} {ans.followUpAnswer}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
