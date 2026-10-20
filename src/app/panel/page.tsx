import Link from "next/link";
import { SCORE_LABELS, zl } from "@/lib/format";
import { listAudits } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leady | AuditAI", robots: { index: false } };

export default async function PanelPage() {
  const audits = await listAudits();
  return (
    <div className="wide stack-lg">
      <section className="stack">
        <span className="eyebrow">Panel firmy · leady z audytu</span>
        <h1 style={{ fontSize: 32 }}>Leady</h1>
        <p className="hint">Każdy wypełniony audyt trafia tutaj z oceną i szkicem oferty.</p>
      </section>
      <section className="card" style={{ padding: "8px 0" }}>
        {audits.length === 0 ? (
          <p className="hint" style={{ padding: 24 }}>Nie ma jeszcze żadnych audytów. Pierwszy pojawi się tu, gdy ktoś wypełni formularz na stronie głównej.</p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Firma</th><th>Ocena</th><th>Oszcz./mies.</th><th>Zgłoszenie</th></tr></thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id}>
                    <td><Link href={`/panel/${a.id}`}><b>{a.input.company}</b></Link><br /><span className="hint">{a.input.industry} · {a.input.size} os.</span></td>
                    <td><span className={`pill ${a.result.score}`}>{SCORE_LABELS[a.result.score]}</span></td>
                    <td className="num">{zl(a.result.moneyPerMonth)}</td>
                    <td className="hint">{new Date(a.createdAt).toLocaleDateString("pl-PL")}{a.bookedConsultation && <><br />konsultacja umówiona</>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
