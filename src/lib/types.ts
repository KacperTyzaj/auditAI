export type AreaId =
  | "obsluga"
  | "sprzedaz"
  | "dokumenty"
  | "finanse"
  | "marketing"
  | "zarzadzanie"
  | "hr"
  | "zamowienia";

export type Effort = 1 | 2 | 3;

export interface CatalogTask {
  id: string;
  label: string;
  /** Udział pracy przy zadaniu, który przejmuje automatyzacja (0–1). */
  share: number;
  effort: Effort;
  /** Orientacyjna cena wdrożenia w zł: [od, do]. */
  price: [number, number];
}

export interface CatalogArea {
  id: AreaId;
  name: string;
  desc: string;
  /** Pytanie doprecyzowujące, gdy AI jest niedostępne. */
  ask: string;
  tasks: CatalogTask[];
}

export interface AreaAnswers {
  hoursPerWeek: number;
  tasks: string[];
  pain: string;
  followUpQuestion: string;
  followUpAnswer: string;
}

export type When = "1" | "3" | "6" | "?";
export type Budget = "1" | "5" | "20" | "50" | "?";
export type Decider = "ja" | "wspolnicy" | "zarzad";

export interface AuditInput {
  company: string;
  industry: string;
  size: string;
  hourlyRate: number;
  areas: AreaId[];
  answers: Partial<Record<AreaId, AreaAnswers>>;
  when: When | "";
  budget: Budget | "";
  decider: Decider | "";
  contact: { name: string; email: string; phone: string; consent: boolean };
}

export interface Recommendation {
  area: AreaId;
  taskId: string;
  label: string;
  share: number;
  effort: Effort;
  price: [number, number];
  hoursPerMonth: number;
  moneyPerMonth: number;
}

export type LeadScore = "hot" | "warm" | "cold";

export interface AuditResult {
  recommendations: Recommendation[];
  top: Recommendation[];
  hoursPerMonth: number;
  moneyPerMonth: number;
  quickWins: number;
  projectValue: [number, number];
  score: LeadScore;
  points: number;
}

export interface AiTexts {
  /** Krótkie podsumowanie dla klienta na górze raportu. */
  summary: string;
  /** Wskazówka dla handlowca: jak zacząć rozmowę. */
  salesOpener: string;
  source: "ai" | "template";
}

export interface AuditRecord {
  id: string;
  createdAt: string;
  input: AuditInput;
  result: AuditResult;
  texts: AiTexts;
  bookedConsultation: boolean;
}
