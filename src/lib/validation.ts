import { z } from "zod";
import { AREA_IDS, getTask } from "./catalog";
import type { AreaId, AuditInput } from "./types";

const areaId = z.enum(AREA_IDS as [AreaId, ...AreaId[]]);
const text = (max: number) => z.string().trim().max(max);

const areaAnswers = z.object({
  hoursPerWeek: z.number().min(1).max(200),
  tasks: z.array(z.string()).min(1).max(10),
  pain: text(2000),
  followUpQuestion: text(500),
  followUpAnswer: text(2000),
});

export const auditInputSchema = z
  .object({
    company: text(200).min(1, "Podaj nazwę firmy."),
    industry: text(100).min(1, "Wybierz branżę."),
    size: text(20),
    hourlyRate: z.number().min(20).max(1000),
    areas: z.array(areaId).min(1, "Zaznacz co najmniej jeden obszar.").max(4, "Zaznacz najwyżej 4 obszary."),
    answers: z.partialRecord(areaId, areaAnswers),
    when: z.enum(["1", "3", "6", "?", ""]),
    budget: z.enum(["1", "5", "20", "50", "?", ""]),
    decider: z.enum(["ja", "wspolnicy", "zarzad", ""]),
    contact: z.object({
      name: text(200).min(1, "Podaj imię i nazwisko."),
      email: z.email("Podaj poprawny adres e-mail."),
      phone: text(40),
      consent: z.literal(true, "Zgoda na kontakt jest wymagana."),
    }),
  })
  .superRefine((input, ctx) => {
    for (const area of input.areas) {
      const a = input.answers[area];
      if (!a) {
        ctx.addIssue({ code: "custom", message: `Brak odpowiedzi dla obszaru ${area}.`, path: ["answers", area] });
        continue;
      }
      for (const t of a.tasks) {
        if (!getTask(area, t)) ctx.addIssue({ code: "custom", message: `Nieznane zadanie ${t}.`, path: ["answers", area] });
      }
    }
  });

export function parseAuditInput(data: unknown): { ok: true; input: AuditInput } | { ok: false; error: string } {
  const r = auditInputSchema.safeParse(data);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Niepoprawne dane." };
  return { ok: true, input: r.data as AuditInput };
}
