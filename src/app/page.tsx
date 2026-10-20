import Link from "next/link";

export default function Home() {
  return (
    <div className="wrap stack-lg">
      <section className="stack">
        <span className="eyebrow">Darmowy audyt procesów · 15 minut</span>
        <h1>Sprawdź, ile godzin pracy Twojej firmy może przejąć AI</h1>
        <p className="lead">
          Odpowiedz na kilka pytań o to, jak dziś pracujecie. Dostaniesz raport z listą procesów do automatyzacji,
          szacunkiem oszczędności w złotówkach i planem pierwszych kroków.
        </p>
        <div className="row">
          <Link className="btn" href="/audyt">
            Zacznij darmowy audyt
          </Link>
        </div>
        <p className="hint">Bez zobowiązań. Raport dostajesz od razu na ekranie.</p>
      </section>
      <section className="steps3">
        <div className="card stack">
          <span className="num">Krok 1</span>
          <h3>Opisz firmę i procesy</h3>
          <p className="hint">Wybierasz obszary, które zabierają najwięcej czasu. AI dopytuje tylko tam, gdzie trzeba.</p>
        </div>
        <div className="card stack">
          <span className="num">Krok 2</span>
          <h3>Dostań raport</h3>
          <p className="hint">Oszczędności w godzinach i złotówkach, mapa szybkich wygranych, 5 rekomendacji.</p>
        </div>
        <div className="card stack">
          <span className="num">Krok 3</span>
          <h3>Porozmawiaj z ekspertem</h3>
          <p className="hint">Bezpłatna 30-minutowa konsultacja, na której układamy plan wdrożenia.</p>
        </div>
      </section>
    </div>
  );
}
