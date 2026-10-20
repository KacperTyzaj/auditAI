import { notFound } from "next/navigation";
import { Matrix } from "@/components/Matrix";
import { EFFORT_LABELS, getArea } from "@/lib/catalog";
import { hrs, num, zl } from "@/lib/format";
import { getAudit } from "@/lib/store";
import { BookButton } from "./BookButton";

export const metadata = { title: "Raport z audytu | AuditAI", robots: { index: false } };

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();
  const { input, result: R, texts } = audit;
  const firm = process.env.NEXT_PUBLIC_FIRM_NAME || "nasza firma";
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "#";

  return (
    <div className="wrap stack-lg">
      <section className="stack">
        <span className="eyebrow">Raport z audytu procesów · {input.company}</span>
        <h1>Automatyzacja może oddać Wam około {hrs(R.hoursPerMonth)} pracy miesięcznie</h1>
        <p className="lead">{texts.summary}</p>
      </section>
      <section className="big">
        <div className="card"><div className="v">{num(R.hoursPerMonth * 0.8)}–{hrs(R.hoursPerMonth * 1.2)}</div><div className="k">godzin do odzyskania miesięcznie</div></div>
        <div className="card"><div className="v">{num(R.moneyPerMonth * 0.8)}–{zl(R.moneyPerMonth * 1.2)}</div><div className="k">oszczędności miesięcznie</div></div>
        <div className="card"><div className="v">{R.quickWins}</div><div className="k">szybkich wygranych do wdrożenia w 1–2 tygodnie</div></div>
      </section>
      {R.recommendations.length > 0 && (
        <section className="card stack">
          <h2>Od czego zacząć</h2>
          <p className="hint">Najmniej pracy przy wdrożeniu, największy zysk. Numery odpowiadają rekomendacjom niżej.</p>
          <Matrix recs={R.recommendations} />
        </section>
      )}
      <section className="card">
        <h2 style={{ marginBottom: 8 }}>Rekomendacje</h2>
        {R.top.map((x, i) => (
          <div className="rec" key={x.area + x.taskId}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <div className="stack" style={{ gap: 6 }}>
              <b>{x.label}</b>
              <span className="hint">{getArea(x.area).name} · AI przejmuje ok. {Math.round(x.share * 100)}% pracy przy tym zadaniu</span>
              <span><span className={`pill ${EFFORT_LABELS[x.effort].tone}`}>{EFFORT_LABELS[x.effort].name}</span> <span className="hint">wdrożenie {EFFORT_LABELS[x.effort].duration}</span></span>
            </div>
            <div className="s">{zl(x.moneyPerMonth)}<small>{hrs(x.hoursPerMonth)} / mies.</small></div>
          </div>
        ))}
      </section>
      <section className="cta">
        <h2>Chcesz to wdrożyć?</h2>
        <p>Na bezpłatnej 30-minutowej konsultacji z {firm} przejdziemy przez raport i ułożymy plan wdrożenia pierwszych automatyzacji.</p>
        <BookButton id={audit.id} bookingUrl={bookingUrl} />
      </section>
      <p className="hint">Oszczędności to szacunek z Waszych odpowiedzi, pokazany jako widełki ±20%.</p>
    </div>
  );
}
