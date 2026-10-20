import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { getArea } from "./catalog";
import { zl } from "./format";
import type { AiTexts, AreaId, AuditInput, AuditResult } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

function client(): Anthropic | null {
  return process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
}

const FollowUp = z.object({
  needed: z.boolean(),
  question: z.string(),
});

/**
 * Decyduje, czy odpowiedź klienta o danym obszarze jest zbyt ogólna, i jeśli tak,
 * układa jedno pytanie doprecyzowujące. Bez klucza API zwraca pytanie z katalogu.
 */
export async function followUpQuestion(area: AreaId, pain: string, tasks: string[]): Promise<{ needed: boolean; question: string }> {
  const a = getArea(area);
  const fallback = { needed: pain.trim().length < 40, question: a.ask };
  const c = client();
  if (!c) return fallback;

  try {
    const response = await c.messages.parse({
      model: MODEL,
      max_tokens: 2000,
      output_config: { effort: "low", format: zodOutputFormat(FollowUp) },
      system:
        "Prowadzisz krótki wywiad z właścicielem małej firmy w ramach audytu procesów pod kątem automatyzacji AI. " +
        "Oceń, czy jego opis problemu wystarczy, żeby oszacować, ile czasu zajmuje ten proces i co da się zautomatyzować. " +
        "Jeśli brakuje konkretów (liczby powtórzeń, czasu, narzędzi, kanałów), ustaw needed na true i zadaj JEDNO krótkie, " +
        "konkretne pytanie po polsku, w formie \"Ty\", bez wstępów. Jeśli opis jest wystarczający, ustaw needed na false i zostaw pusty question.",
      messages: [
        {
          role: "user",
          content:
            `Obszar: ${a.name}\n` +
            `Zadania robione ręcznie: ${tasks.join(", ") || "brak"}\n` +
            `Opis problemu od klienta: """${pain.slice(0, 2000)}"""`,
        },
      ],
    });
    const out = response.parsed_output;
    if (response.stop_reason === "refusal" || !out) return fallback;
    return { needed: out.needed, question: out.needed ? out.question || a.ask : "" };
  } catch (err) {
    console.error("followUpQuestion:", err);
    return fallback;
  }
}

const Texts = z.object({
  summary: z.string(),
  salesOpener: z.string(),
});

function templateTexts(input: AuditInput, result: AuditResult): AiTexts {
  const first = result.top[0];
  return {
    summary: first
      ? `Największy potencjał widzimy w obszarze „${getArea(first.area).name}”. Na start polecamy: ${first.label.toLowerCase()}.`
      : "Nie zaznaczono zadań do automatyzacji, więc nie mamy jeszcze rekomendacji.",
    salesOpener: first
      ? `Zacznij od „${first.label.toLowerCase()}”: to około ${zl(first.moneyPerMonth)} miesięcznie przy małym wysiłku. ` +
        (input.when === "1"
          ? "Klient chce działać szybko, zaproponuj pilotaż w 2 tygodnie."
          : input.budget === "?"
            ? "Klient nie zna budżetu, pokaż zwrot z inwestycji na liczbach z raportu."
            : "Zaproponuj pilotaż jednej automatyzacji przed większym projektem.")
      : "Dopytaj, które procesy zajmują najwięcej czasu.",
    source: "template",
  };
}

/**
 * Pisze podsumowanie dla klienta i wskazówkę dla handlowca na podstawie
 * policzonych już liczb. Liczby pochodzą z katalogu, AI ich nie zmienia.
 */
export async function auditTexts(input: AuditInput, result: AuditResult): Promise<AiTexts> {
  const fallback = templateTexts(input, result);
  const c = client();
  if (!c || result.top.length === 0) return fallback;

  const facts = {
    firma: { branza: input.industry, wielkosc: input.size },
    plany: { termin: input.when, budzet: input.budget, decyzja: input.decider },
    oszczednosc_miesieczna: { godziny: Math.round(result.hoursPerMonth), zl: Math.round(result.moneyPerMonth) },
    rekomendacje: result.top.map((r) => ({
      obszar: getArea(r.area).name,
      zadanie: r.label,
      zl_miesiecznie: Math.round(r.moneyPerMonth),
      wysilek: r.effort,
    })),
    slowami_klienta: input.areas.map((a) => {
      const ans = input.answers[a];
      return { obszar: getArea(a).name, problem: ans?.pain ?? "", doprecyzowanie: ans?.followUpAnswer ?? "" };
    }),
  };

  try {
    const response = await c.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: "low", format: zodOutputFormat(Texts) },
      system:
        "Piszesz po polsku dla firmy wdrażającej automatyzacje AI w małych i średnich firmach. Dostajesz wyniki audytu procesów. " +
        "summary: 2–3 zdania do klienta (forma \"Wy\"), konkretne, odwołujące się do jego słów, bez obietnic ponad podane liczby i bez nowych liczb. " +
        "salesOpener: 2–3 zdania dla handlowca: od czego zacząć rozmowę i co zaproponować jako pierwszy krok, z uwzględnieniem terminu i budżetu. " +
        "Używaj wyłącznie liczb z danych.",
      messages: [{ role: "user", content: JSON.stringify(facts) }],
    });
    const out = response.parsed_output;
    if (response.stop_reason === "refusal" || !out) return fallback;
    return { summary: out.summary, salesOpener: out.salesOpener, source: "ai" };
  } catch (err) {
    console.error("auditTexts:", err);
    return fallback;
  }
}
