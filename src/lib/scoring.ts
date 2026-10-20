import { getTask } from "./catalog";
import type { AuditInput, AuditResult, LeadScore, Recommendation } from "./types";

const WEEKS_PER_MONTH = 4.33;

/**
 * Liczy oszczędności i ocenę leada wyłącznie z odpowiedzi i katalogu,
 * bez udziału AI, żeby liczby były powtarzalne.
 * Godziny obszaru dzielimy po równo między zaznaczone zadania.
 */
export function computeAudit(input: AuditInput): AuditResult {
  const recommendations: Recommendation[] = [];
  for (const area of input.areas) {
    const answers = input.answers[area];
    if (!answers || answers.tasks.length === 0) continue;
    const hoursPerTask = (answers.hoursPerWeek * WEEKS_PER_MONTH) / answers.tasks.length;
    for (const taskId of answers.tasks) {
      const task = getTask(area, taskId);
      if (!task) continue;
      const hours = hoursPerTask * task.share;
      recommendations.push({
        area,
        taskId,
        label: task.label,
        share: task.share,
        effort: task.effort,
        price: task.price,
        hoursPerMonth: hours,
        moneyPerMonth: hours * input.hourlyRate,
      });
    }
  }
  // Najpierw to, co daje najwięcej przy najmniejszym wysiłku.
  recommendations.sort((a, b) => b.moneyPerMonth / b.effort - a.moneyPerMonth / a.effort);

  const top = recommendations.slice(0, 5);
  const hoursPerMonth = recommendations.reduce((s, r) => s + r.hoursPerMonth, 0);
  const moneyPerMonth = recommendations.reduce((s, r) => s + r.moneyPerMonth, 0);
  const projectValue = top.reduce<[number, number]>((s, r) => [s[0] + r.price[0], s[1] + r.price[1]], [0, 0]);
  const { score, points } = scoreLead(input, moneyPerMonth);

  return {
    recommendations,
    top,
    hoursPerMonth,
    moneyPerMonth,
    quickWins: recommendations.filter((r) => r.effort === 1).length,
    projectValue,
    score,
    points,
  };
}

export function scoreLead(input: AuditInput, moneyPerMonth: number): { score: LeadScore; points: number } {
  let points = { "1": 3, "3": 2, "6": 1, "?": 0, "": 0 }[input.when];
  points += { "50": 3, "20": 3, "5": 2, "1": 1, "?": 0, "": 0 }[input.budget];
  points += { ja: 2, wspolnicy: 1, zarzad: 1, "": 0 }[input.decider];
  if (moneyPerMonth > 5000) points += 2;
  const score: LeadScore = points >= 7 ? "hot" : points >= 4 ? "warm" : "cold";
  return { score, points };
}
