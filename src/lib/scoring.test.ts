import { describe, expect, it } from "vitest";
import { computeAudit, scoreLead } from "./scoring";
import type { AuditInput } from "./types";
import { parseAuditInput } from "./validation";

const base: AuditInput = {
  company: "Biuro Rachunkowe Bilans",
  industry: "Biuro rachunkowe",
  size: "10–49",
  hourlyRate: 65,
  areas: ["dokumenty", "obsluga"],
  answers: {
    dokumenty: { hoursPerWeek: 40, tasks: ["ocr", "przepisywanie"], pain: "", followUpQuestion: "", followUpAnswer: "" },
    obsluga: { hoursPerWeek: 12, tasks: ["maile"], pain: "", followUpQuestion: "", followUpAnswer: "" },
  },
  when: "3",
  budget: "20",
  decider: "ja",
  contact: { name: "Anna", email: "anna@example.com", phone: "", consent: true },
};

describe("computeAudit", () => {
  it("dzieli godziny obszaru między zadania i mnoży przez udział automatyzacji", () => {
    const r = computeAudit(base);
    const ocr = r.recommendations.find((x) => x.taskId === "ocr")!;
    // 40 h/tydz. × 4.33 / 2 zadania × 0.7
    expect(ocr.hoursPerMonth).toBeCloseTo(60.62, 1);
    expect(ocr.moneyPerMonth).toBeCloseTo(60.62 * 65, 0);
    const maile = r.recommendations.find((x) => x.taskId === "maile")!;
    expect(maile.hoursPerMonth).toBeCloseTo(12 * 4.33 * 0.5, 5);
  });

  it("sortuje po zysku na jednostkę wysiłku i sumuje wartość projektu z top 5", () => {
    const r = computeAudit(base);
    const ratios = r.recommendations.map((x) => x.moneyPerMonth / x.effort);
    expect([...ratios].sort((a, b) => b - a)).toEqual(ratios);
    expect(r.projectValue).toEqual([5000 + 4000 + 2000, 15000 + 12000 + 6000]);
    expect(r.quickWins).toBe(1);
  });

  it("pomija obszary bez zaznaczonych zadań", () => {
    const r = computeAudit({ ...base, answers: { ...base.answers, obsluga: { ...base.answers.obsluga!, tasks: [] } } });
    expect(r.recommendations.map((x) => x.taskId)).toEqual(["przepisywanie", "ocr"]);
  });
});

describe("scoreLead", () => {
  it("ocenia gorącego, ciepłego i zimnego leada", () => {
    expect(scoreLead(base, 9000).score).toBe("hot"); // 2 + 3 + 2 + 2
    expect(scoreLead({ ...base, when: "6", budget: "5", decider: "zarzad" }, 1000).score).toBe("warm"); // 1 + 2 + 1
    expect(scoreLead({ ...base, when: "?", budget: "?", decider: "" }, 1000).score).toBe("cold");
  });
});

describe("parseAuditInput", () => {
  it("przyjmuje poprawne dane", () => {
    expect(parseAuditInput(base).ok).toBe(true);
  });
  it("odrzuca brak zgody i nieznane zadanie", () => {
    const noConsent = parseAuditInput({ ...base, contact: { ...base.contact, consent: false } });
    expect(noConsent.ok).toBe(false);
    const badTask = parseAuditInput({ ...base, answers: { ...base.answers, obsluga: { ...base.answers.obsluga!, tasks: ["xyz"] } } });
    expect(badTask.ok).toBe(false);
  });
});
